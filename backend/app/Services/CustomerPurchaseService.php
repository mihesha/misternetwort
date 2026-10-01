<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Network;
use App\Models\Transaction;
use App\Models\AppDeposit;
use App\Models\SystemSetting;
use App\Models\WalletRecharge;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerPurchaseService
{
    /**
     * Handle the customer card purchase process
     */
    public function purchaseCard($user, array $data)
    {
        $network = Network::where('network_code', $data['network_code'])->first();
        if (!$network) {
            throw new \Exception('الشبكة غير موجودة.');
        }

        $items = $this->normalizeItems($data);
        
        [$overallTotalPrice, $processedCategories] = $this->validateStockAndCalculateTotals($network, $items);
        
        [$isInternalWallet, $deposit, $overpayment] = $this->validatePayment($user, $data, $overallTotalPrice);

        DB::beginTransaction();
        try {
            // 1. Process Items (Extract Cards, Deduct Stock, Calc Commission)
            [$allPurchasedCards, $totalCommission] = $this->processCategories($network, $processedCategories, $user, $data);

            // 2. Update Network Financials
            $totalNetEarnings = $overallTotalPrice - $totalCommission;
            $network->increment('balance', (float)$totalNetEarnings);
            $network->increment('total_sales', (float)$overallTotalPrice);

            // 3. Reward the Agent
            $this->distributeAgentCommission($network, $totalCommission);

            // 4. Handle Payment Deduction / Overpayment
            $this->handlePaymentDeduction($isInternalWallet, $user, $overallTotalPrice, $deposit, $overpayment, $allPurchasedCards);

            DB::commit();

            return [
                'cards' => $allPurchasedCards,
                'network' => $network->name,
                'network_link' => $network->external_link,
                'new_wallet_balance' => $user ? $user->fresh()->wallet_balance : null
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            throw $e;
        }
    }

    protected function normalizeItems(array $data): array
    {
        if (!empty($data['items']) && is_array($data['items'])) {
            return $data['items'];
        }
        
        if (empty($data['category_id'])) {
            throw new \Exception('السلة فارغة.');
        }

        return [
            [
                'category_id' => $data['category_id'],
                'quantity' => $data['quantity'] ?? 1
            ]
        ];
    }

    protected function validateStockAndCalculateTotals(Network $network, array $items): array
    {
        $overallTotalPrice = 0;
        $processedCategories = [];

        foreach ($items as $item) {
            $quantity = (int)($item['quantity'] ?? 1);
            if ($quantity <= 0) continue;

            $category = $network->cardCategories()->where('id', $item['category_id'])->first();
            
            if (!$category) {
                throw new \Exception('إحدى الفئات المطلوبة غير موجودة في هذه الشبكة.');
            }
            if ($category->stock < $quantity) {
                throw new \Exception("عذراً، الكروت المطلوبة لفئة ({$category->name}) غير متوفرة بالكمية الكافية");
            }
            
            $itemTotalPrice = $category->price * $quantity;
            $overallTotalPrice += $itemTotalPrice;
            
            $processedCategories[] = [
                'category' => $category,
                'quantity' => $quantity,
                'item_total_price' => $itemTotalPrice
            ];
        }

        if ($overallTotalPrice <= 0 || empty($processedCategories)) {
            throw new \Exception('لم يتم تحديد أي كروت صالحة للشراء.');
        }

        return [$overallTotalPrice, $processedCategories];
    }

    protected function validatePayment($user, array $data, float $overallTotalPrice): array
    {
        $isInternalWallet = strtolower($data['wallet_type']) === 'internal_wallet';
        $deposit = null;
        $overpayment = 0;

        if ($isInternalWallet) {
            if (!$user) {
                throw new \Exception('يجب تسجيل الدخول لاستخدام رصيد المحفظة.', 401);
            }
            if ($user->wallet_balance < $overallTotalPrice) {
                throw new \Exception('رصيد محفظتك غير كافٍ لإتمام العملية.');
            }
        } else {
            $deposit = $this->findDeposit($data);
            
            if (!$deposit) {
                throw new \Exception('لم يتم العثور على عملية الإيداع. تأكد من صحة رقم المرجع والمحفظة.');
            }
            if ($deposit->status === 'used') {
                throw new \Exception('عذراً، رقم المرجع هذا تم استخدامه مسبقاً لشراء كروت أخرى.');
            }
            if ($deposit->amount < $overallTotalPrice) {
                throw new \Exception('عذراً، مبلغ الإيداع أقل من إجمالي سعر الكروت المطلوبة.');
            }

            $overpayment = $deposit->amount - $overallTotalPrice;

            if ($overpayment > 0 && empty($data['confirm_overpayment'])) {
                $errorInfo = json_encode([
                    'error' => 'overpayment_warning',
                    'deposited_amount' => $deposit->amount,
                    'card_price' => $overallTotalPrice,
                    'remaining_amount' => $overpayment,
                    'is_guest' => !$user
                ]);
                throw new \Exception($errorInfo, 400);
            }
        }

        return [$isInternalWallet, $deposit, $overpayment];
    }

    protected function findDeposit(array $data)
    {
        return AppDeposit::where('reference_number', $data['transaction_ref'])
            ->where(function ($query) use ($data) {
                $walletType = strtolower($data['wallet_type']);
                
                $wallet = \App\Models\BankWallet::with('sources')->find($data['wallet_type']);
                
                if ($wallet && $wallet->sources->isNotEmpty()) {
                    foreach ($wallet->sources as $source) {
                        $query->orWhere('wallet_name', 'LIKE', '%' . $source->source_name . '%');
                    }
                } else {
                    $walletMapAr = [
                        'jaib' => 'جيب', 'jeeb' => 'جيب', 'jawali' => 'جوالي',
                        'saba_cash' => 'سبأ', 'one_cash' => 'ون كاش', 'pyes' => 'بيس',
                        'floosak' => 'فلوسك', 'easy' => 'ايزي', 'cash_wallet' => 'كاش',
                        'jawwal' => 'جوال'
                    ];
                    
                    $walletSearchAr = $walletMapAr[$walletType] ?? $walletType;

                    $query->where('wallet_name', 'LIKE', "%{$walletType}%")
                          ->orWhere('wallet_name', 'LIKE', "%{$walletSearchAr}%");
                          
                    if (in_array($walletType, ['jaib', 'jeeb'])) {
                        $query->orWhere('wallet_name', 'LIKE', "%jaib%")
                              ->orWhere('wallet_name', 'LIKE', "%jeeb%");
                    }
                }
            })
            ->first();
    }

    protected function processCategories(Network $network, array $processedCategories, $user, array $data): array
    {
        $allPurchasedCards = collect();
        $totalCommission = 0;
        
        $commissionType = SystemSetting::where('key', 'platformCommissionType')->value('value') ?? 'fixed';
        $commissionValue = (float) (SystemSetting::where('key', 'platformCommissionRate')->value('value') ?? 5);

        foreach ($processedCategories as $proc) {
            $cat = $proc['category'];
            $qty = $proc['quantity'];
            $itemTotal = $proc['item_total_price'];

            // Deduct Category Stock
            $cat->decrement('stock', $qty);

            // Calculate Commission for this item
            $itemCommission = ($commissionType === 'fixed') 
                ? ($commissionValue * $qty) 
                : ($itemTotal * ($commissionValue / 100));
            $totalCommission += $itemCommission;

            // Extract Cards Locking for Update
            $cards = Card::where('card_category_id', $cat->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->limit($qty)
                ->get();

            if ($cards->count() < $qty) {
                throw new \Exception("نعتذر، لقد نفدت كروت الفئة {$cat->name} بشكل فعلي أثناء المعالجة.");
            }

            $cardIds = $cards->pluck('id')->toArray();
            Card::whereIn('id', $cardIds)->update([
                'customer_phone' => $user ? $user->phone : ($data['customer_phone'] ?? null),
                'status' => 'sold',
                'purchased_at' => now(),
                'price_at_purchase' => $cat->price,
                'pos_price_at_purchase' => $cat->pos_price ?? $cat->price,
            ]);

            $allPurchasedCards = $allPurchasedCards->merge($cards);

            Transaction::create([
                'network_id' => $network->id,
                'type' => 'sale',
                'amount' => $itemTotal,
                'description' => "فئة {$cat->name} - شراء عدد {$qty} كرت عبر محفظة {$data['wallet_type']} (عمولة: {$itemCommission})",
                'reference_number' => $data['transaction_ref'] ?? 'WALLET-' . time()
            ]);
        }

        return [$allPurchasedCards, $totalCommission];
    }

    protected function distributeAgentCommission(Network $network, float $totalCommission): void
    {
        if ($totalCommission <= 0 || !$network->agent_id) return;

        $agent = \App\Models\User::find($network->agent_id);
        if (!$agent) return;

        $agentCommissionRate = $agent->custom_commission_rate ?? (float) (SystemSetting::where('key', 'agentCommissionRate')->value('value') ?? 50);
        $agentCommission = $totalCommission * ($agentCommissionRate / 100);
        
        if ($agentCommission > 0) {
            $agent->increment('wallet_balance', $agentCommission);
            
            \App\Models\AgentTransaction::create([
                'agent_id' => $agent->id,
                'network_id' => $network->id,
                'amount' => $agentCommission,
                'type' => 'commission',
                'description' => "عمولة مبيعات شبكة ({$network->name}) - شراء مباشر للعميل",
                'reference_number' => 'AGT-COM-' . time() . '-' . rand(100, 999)
            ]);
        }
    }

    protected function handlePaymentDeduction(bool $isInternalWallet, $user, float $overallTotalPrice, $deposit, float $overpayment, $allPurchasedCards): void
    {
        if ($isInternalWallet) {
            $user->decrement('wallet_balance', $overallTotalPrice);
            return;
        } 

        $deposit->status = 'used';
        $deposit->used_for_card_id = $allPurchasedCards->first()->id; 
        $deposit->save();

        if ($overpayment > 0 && $user) {
            $user->increment('wallet_balance', $overpayment);
            WalletRecharge::create([
                'user_id' => $user->id,
                'amount' => $overpayment,
                'bank_name' => $deposit->wallet_name,
                'receipt_image' => 'automated_overpayment',
                'status' => 'approved'
            ]);
        }
    }
}


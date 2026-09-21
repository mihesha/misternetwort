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

        // Normalize data to support both single purchase and cart items array
        $items = [];
        if (!empty($data['items']) && is_array($data['items'])) {
            $items = $data['items'];
        } else {
            $items[] = [
                'category_id' => $data['category_id'],
                'quantity' => $data['quantity'] ?? 1
            ];
        }

        if (empty($items)) {
            throw new \Exception('السلة فارغة.');
        }

        $overallTotalPrice = 0;
        $processedCategories = [];

        // 1. Validate Stock & Calculate Totals for All Items
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

        $isInternalWallet = strtolower($data['wallet_type']) === 'internal_wallet';
        $deposit = null;
        $overpayment = 0;

        // 2. Validate Payment
        if ($isInternalWallet) {
            if (!$user) {
                throw new \Exception('يجب تسجيل الدخول لاستخدام رصيد المحفظة.', 401);
            }
            if ($user->wallet_balance < $overallTotalPrice) {
                throw new \Exception('رصيد محفظتك غير كافٍ لإتمام العملية.');
            }
        } else {
            $deposit = AppDeposit::where('reference_number', $data['transaction_ref'])
                ->where(function ($query) use ($data) {
                    $walletType = strtolower($data['wallet_type']);
                    
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
                })
                ->first();

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

        // 3. Process Transaction Core
        DB::beginTransaction();
        try {
            $allPurchasedCards = collect();
            $totalCommission = 0;
            
            $commissionType = SystemSetting::where('key', 'platformCommissionType')->value('value') ?? 'fixed';
            $commissionValue = (float) (SystemSetting::where('key', 'platformCommissionRate')->value('value') ?? 5);

            foreach ($processedCategories as $proc) {
                /** @var \App\Models\CardCategory $cat */
                $cat = $proc['category'];
                $qty = $proc['quantity'];
                $itemTotal = $proc['item_total_price'];

                // Deduct Category Stock
                $cat->decrement('stock', $qty);

                // Calculate Commission for this item
                if ($commissionType === 'fixed') {
                    $itemCommission = $commissionValue * $qty; 
                } else {
                    $itemCommission = $itemTotal * ($commissionValue / 100); 
                }
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
                ]);

                // Track all extracted cards
                $allPurchasedCards = $allPurchasedCards->merge($cards);

                // Create Individual Transaction Record for Clear Accounting
                Transaction::create([
                    'network_id' => $network->id,
                    'type' => 'sale',
                    'amount' => $itemTotal,
                    'description' => "فئة {$cat->name} - شراء عدد {$qty} كرت عبر محفظة {$data['wallet_type']} (عمولة: {$itemCommission})",
                    'reference_number' => $data['transaction_ref'] ?? 'WALLET-' . time()
                ]);
            }

            // Update Network Balance & Sales once with totals
            $totalNetEarnings = $overallTotalPrice - $totalCommission;
            $network->increment('balance', (float)$totalNetEarnings);
            $network->increment('total_sales', (float)$overallTotalPrice);

            // Handle Payment Deduction / Overpayment processing
            if ($isInternalWallet) {
                $user->decrement('wallet_balance', $overallTotalPrice);
            } else {
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

            DB::commit();

            return [
                'cards' => $allPurchasedCards,
                'network' => $network->name,
                'network_link' => $network->external_link,
                'new_wallet_balance' => $user ? $user->fresh()->wallet_balance : null
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            throw $e;
        }
    }
}

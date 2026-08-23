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
        $quantity = $data['quantity'] ?? 1;

        $network = Network::where('network_code', $data['network_code'])->first();
        if (!$network) {
            throw new \Exception('الشبكة غير موجودة.');
        }

        /** @var \App\Models\CardCategory $category */
        $category = $network->cardCategories()->where('id', $data['category_id'])->first();

        if (!$category || $category->stock < $quantity) {
            throw new \Exception('عذراً، الكروت المطلوبة لهذه الفئة غير متوفرة بالكمية الكافية');
        }

        $totalPrice = $category->price * $quantity;
        $isInternalWallet = strtolower($data['wallet_type']) === 'internal_wallet';
        
        $deposit = null;
        $overpayment = 0;

        if ($isInternalWallet) {
            if (!$user) {
                throw new \Exception('يجب تسجيل الدخول لاستخدام رصيد المحفظة.', 401);
            }
            if ($user->wallet_balance < $totalPrice) {
                throw new \Exception('رصيد محفظتك غير كافٍ لإتمام العملية.');
            }
        } else {
            $deposit = AppDeposit::where('reference_number', $data['transaction_ref'])
                ->where(function ($query) use ($data) {
                    $walletType = strtolower($data['wallet_type']);
                    
                    $walletMapAr = [
                        'jaib' => 'جيب',
                        'jeeb' => 'جيب',
                        'jawali' => 'جوالي',
                        'saba_cash' => 'سبأ',
                        'one_cash' => 'ون كاش',
                        'pyes' => 'بيس',
                        'floosak' => 'فلوسك',
                        'easy' => 'ايزي',
                        'cash_wallet' => 'كاش',
                        'jawwal' => 'جوال'
                    ];
                    
                    $walletSearchAr = $walletMapAr[$walletType] ?? $walletType;

                    $query->where('wallet_name', 'LIKE', "%{$walletType}%")
                          ->orWhere('wallet_name', 'LIKE', "%{$walletSearchAr}%");
                          
                    if ($walletType === 'jaib' || $walletType === 'jeeb') {
                        $query->orWhere('wallet_name', 'LIKE', "%jaib%")
                              ->orWhere('wallet_name', 'LIKE', "%jeeb%");
                    }
                })
                ->first();

            if (!$deposit) {
                throw new \Exception('لم يتم العثور على عملية الإيداع. تأكد من صحة رقم المرجع والمحفظة.');
            }

            if ($deposit->status === 'used') {
                throw new \Exception('عذراً، رقم المرجع هذا تم استخدامه مسبقاً لشراء كرت آخر.');
            }

            if ($deposit->amount < $totalPrice) {
                throw new \Exception('عذراً، مبلغ الإيداع أقل من إجمالي سعر الكروت المطلوبة.');
            }

            $overpayment = $deposit->amount - $totalPrice;

            if ($overpayment > 0 && empty($data['confirm_overpayment'])) {
                $errorInfo = json_encode([
                    'error' => 'overpayment_warning',
                    'deposited_amount' => $deposit->amount,
                    'card_price' => $totalPrice,
                    'remaining_amount' => $overpayment,
                    'is_guest' => !$user
                ]);
                throw new \Exception($errorInfo, 400); // 400 will be caught by controller to send structured response
            }
        }

        DB::beginTransaction();
        try {
            $category->decrement('stock', $quantity);

            $commissionType = SystemSetting::where('key', 'platformCommissionType')->value('value') ?? 'fixed';
            $commissionValue = (float) (SystemSetting::where('key', 'platformCommissionRate')->value('value') ?? 5);

            if ($commissionType === 'fixed') {
                $commission = $commissionValue * $quantity; 
            } else {
                $commission = $totalPrice * ($commissionValue / 100); 
            }
            $netEarnings = $totalPrice - $commission;
            
            $network->increment('balance', (float)$netEarnings);
            $network->increment('total_sales', (float)$totalPrice);

            $cards = Card::where('card_category_id', $category->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->limit($quantity)
                ->get();

            if ($cards->count() < $quantity) {
                DB::rollBack();
                throw new \Exception('نعتذر، لقد نفدت كروت هذه الفئة بشكل فعلي.');
            }

            $cardIds = $cards->pluck('id')->toArray();
            Card::whereIn('id', $cardIds)->update([
                'customer_phone' => $user ? $user->phone : ($data['customer_phone'] ?? null),
                'status' => 'sold',
                'purchased_at' => now(),
            ]);

            if ($isInternalWallet) {
                $user->decrement('wallet_balance', $totalPrice);
            } else {
                $deposit->status = 'used';
                $deposit->used_for_card_id = $cards->first()->id; 
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

            Transaction::create([
                'network_id' => $network->id,
                'type' => 'sale',
                'amount' => $totalPrice,
                'description' => "فئة {$category->name} - شراء عدد $quantity كرت عبر محفظة {$data['wallet_type']} (عمولة: {$commission})",
                'reference_number' => $data['transaction_ref'] ?? 'WALLET-' . time()
            ]);

            DB::commit();

            return [
                'cards' => $cards,
                'network' => $network->name,
                'new_wallet_balance' => $user ? $user->fresh()->wallet_balance : null
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            throw $e;
        }
    }
}

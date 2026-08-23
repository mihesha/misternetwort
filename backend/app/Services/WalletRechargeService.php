<?php

namespace App\Services;

use App\Models\AppDeposit;
use App\Models\WalletRecharge;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class WalletRechargeService
{
    /**
     * Handle automated or manual wallet recharge
     *
     * @param User $user
     * @param array $data
     * @param \Illuminate\Http\UploadedFile|null $receiptImage
     * @return array
     * @throws \Exception
     */
    public function rechargeWallet(User $user, array $data, $receiptImage = null)
    {
        // 1. Automated flow (using reference number)
        if (!empty($data['reference_number'])) {
            $deposit = AppDeposit::where('reference_number', $data['reference_number'])
                ->where('status', 'pending')
                ->where(function ($query) use ($data) {
                    $walletType = strtolower($data['bank_name']);
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

            // Validate that the provided amount matches the actual deposit amount
            if (!empty($data['amount']) && (float)$data['amount'] != (float)$deposit->amount) {
                throw new \Exception('المبلغ المدخل غير مطابق لمبلغ السند');
            }

            // Valid automated deposit
            $deposit->status = 'used';
            $deposit->save();

            $user->increment('wallet_balance', $deposit->amount);

            $recharge = WalletRecharge::create([
                'user_id' => $user->id,
                'amount' => $deposit->amount,
                'bank_name' => $deposit->wallet_name,
                'receipt_image' => 'automated_deposit',
                'status' => 'approved'
            ]);

            return [
                'type' => 'automated',
                'message' => 'تم تغذية محفظتك بنجاح بشكل آلي!',
                'recharge' => $recharge
            ];
        }

        // 2. Manual flow (using receipt image)
        if (!$receiptImage) {
            throw new \Exception('يجب إدخال الرقم المرجعي للعملية');
        }

        if (empty($data['amount'])) {
            throw new \Exception('يجب تحديد المبلغ');
        }

        $path = $receiptImage->store('receipts', 'public');

        $recharge = WalletRecharge::create([
            'user_id' => $user->id,
            'amount' => $data['amount'],
            'bank_name' => $data['bank_name'],
            'receipt_image' => $path,
            'status' => 'pending'
        ]);

        return [
            'type' => 'manual',
            'message' => 'تم إرسال طلب الشحن بنجاح وبانتظار المراجعة',
            'recharge' => $recharge
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Network;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CardController extends Controller
{
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'network_code' => 'required|string|exists:networks,network_code',
            'category_id' => 'required|exists:card_categories,id',
            'customer_phone' => 'nullable|string',
            'wallet_type' => 'required|string',
            'transaction_ref' => 'nullable|string',
            'quantity' => 'nullable|integer|min:1'
        ]);

        $quantity = $validated['quantity'] ?? 1;

        $network = Network::where('network_code', $validated['network_code'])->first();
        /** @var \App\Models\CardCategory $category */
        $category = $network->cardCategories()->where('id', $validated['category_id'])->first();

        if (!$category || $category->stock < $quantity) {
            return response()->json(['error' => 'عذراً، الكروت المطلوبة لهذه الفئة غير متوفرة بالكمية الكافية'], 400);
        }

        $totalPrice = $category->price * $quantity;
        $user = $request->user('sanctum');

        $isInternalWallet = strtolower($validated['wallet_type']) === 'internal_wallet';
        
        $deposit = null;
        $overpayment = 0;

        if ($isInternalWallet) {
            if (!$user) {
                return response()->json(['error' => 'يجب تسجيل الدخول لاستخدام رصيد المحفظة.'], 401);
            }
            if ($user->wallet_balance < $totalPrice) {
                return response()->json(['error' => 'رصيد محفظتك غير كافٍ لإتمام العملية.'], 400);
            }
        } else {
            // Verify deposit with flexible wallet name matching
            $deposit = \App\Models\AppDeposit::where('reference_number', $validated['transaction_ref'])
                ->where(function ($query) use ($validated) {
                    $walletType = strtolower($validated['wallet_type']);
                    
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
                })
                ->first();

            if (!$deposit) {
                return response()->json(['error' => 'لم يتم العثور على عملية الإيداع. تأكد من صحة رقم المرجع والمحفظة.'], 400);
            }

            if ($deposit->status === 'used') {
                return response()->json(['error' => 'عذراً، رقم المرجع هذا تم استخدامه مسبقاً لشراء كرت آخر.'], 400);
            }

            if ($deposit->amount < $totalPrice) {
                return response()->json(['error' => 'عذراً، مبلغ الإيداع أقل من إجمالي سعر الكروت المطلوبة.'], 400);
            }

            $overpayment = $deposit->amount - $totalPrice;

            if ($overpayment > 0 && !$request->confirm_overpayment) {
                return response()->json([
                    'error' => 'overpayment_warning',
                    'deposited_amount' => $deposit->amount,
                    'card_price' => $totalPrice,
                    'remaining_amount' => $overpayment,
                    'is_guest' => !$user
                ], 400);
            }
        }



        DB::beginTransaction();
        try {
            // Deduct stock
            $category->decrement('stock', $quantity);

            // Financial math
            $commissionType = \App\Models\SystemSetting::where('key', 'platformCommissionType')->value('value') ?? 'fixed';
            $commissionValue = (float) (\App\Models\SystemSetting::where('key', 'platformCommissionRate')->value('value') ?? 5);

            if ($commissionType === 'fixed') {
                $commission = $commissionValue * $quantity; // Fixed amount per card
            } else {
                $commission = $totalPrice * ($commissionValue / 100); // Percentage
            }
            $netEarnings = $totalPrice - $commission;
            
            // Add to network balance
            $network->increment('balance', (float)$netEarnings);
            $network->increment('total_sales', (float)$totalPrice);

            // Get available cards from stock with row lock
            $cards = Card::where('card_category_id', $category->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->limit($quantity)
                ->get();

            if ($cards->count() < $quantity) {
                DB::rollBack();
                return response()->json(['error' => 'نعتذر، لقد نفدت كروت هذه الفئة بشكل فعلي.'], 400);
            }

            // Mark cards as sold
            $cardIds = $cards->pluck('id')->toArray();
            Card::whereIn('id', $cardIds)->update([
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'sold',
                'purchased_at' => now(),
            ]);

            if ($isInternalWallet) {
                $user->decrement('wallet_balance', $totalPrice);
            } else {
                // Mark deposit as used
                $deposit->status = 'used';
                $deposit->used_for_card_id = $cards->first()->id; // link to the first card
                $deposit->save();

                if ($overpayment > 0 && $user) {
                    $user->increment('wallet_balance', $overpayment);
                    \App\Models\WalletRecharge::create([
                        'user_id' => $user->id,
                        'amount' => $overpayment,
                        'bank_name' => $deposit->wallet_name,
                        'receipt_image' => 'automated_overpayment',
                        'status' => 'approved'
                    ]);
                }
            }

            // Log Transaction
            Transaction::create([
                'network_id' => $network->id,
                'type' => 'sale',
                'amount' => $totalPrice,
                'description' => "شراء عدد $quantity كرت عبر محفظة {$validated['wallet_type']} (عمولة: {$commission})",
                'reference_number' => $validated['transaction_ref']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'تمت عملية الشراء بنجاح',
                'cards' => $cards,
                'network' => $network->name
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'حدث خطأ أثناء الشراء'], 500);
        }
    }
}

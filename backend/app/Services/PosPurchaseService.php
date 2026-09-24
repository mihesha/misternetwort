<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Network;
use App\Models\NetworkPosMembership;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PosPurchaseService
{
    /**
     * Handle the voucher purchase process for POS
     */
    public function purchaseVoucher($user, $networkId, $packageId, $quantity = 1, $customerPhone = null, $requestedPaymentMethod = null)
    {
        $network = Network::find($networkId);
        if (!$network) {
            throw new \Exception('الشبكة غير موجودة');
        }

        /** @var \App\Models\CardCategory $category */
        $category = $network->cardCategories()->where('id', $packageId)->first();

        if (!$category || $category->stock < $quantity) {
            throw new \Exception('عذراً، الكروت المطلوبة غير متوفرة بالكمية الكافية');
        }

        $unitPrice = $category->pos_price ?? $category->price;
        $totalPrice = $unitPrice * $quantity;

        $membership = NetworkPosMembership::where('user_id', $user->id)
            ->where('network_id', $network->id)
            ->where('status', 'active')
            ->first();

        $availableCredit = $membership ? ($membership->credit_limit - $membership->current_debt) : 0;
        
        $useWallet = false;
        $useCredit = false;

        if ($requestedPaymentMethod === 'wallet') {
            if ((float)$user->wallet_balance < (float)$totalPrice) {
                throw new \Exception('رصيد المحفظة غير كافٍ لإتمام العملية');
            }
            $useWallet = true;
        } elseif ($requestedPaymentMethod === 'network_credit') {
            if ((float)$availableCredit < (float)$totalPrice) {
                throw new \Exception('السقف المالي المتبقي لا يكفي لإتمام العملية');
            }
            $useCredit = true;
        } else {
            // Auto fallback (old behavior)
            if ((float)$availableCredit >= (float)$totalPrice) {
                $useCredit = true;
            } elseif ((float)$user->wallet_balance >= (float)$totalPrice) {
                $useWallet = true;
            } else {
                throw new \Exception('عذراً، السقف المالي المتبقي ورصيد المحفظة لا يكفيان لإتمام العملية (لا يمكن تجزئة الدفع)');
            }
        }

        DB::beginTransaction();
        try {
            if ($useCredit) {
                $amountOnCredit = $totalPrice;
                $amountFromWallet = 0;
                $paymentMethodToSave = 'network_credit';
            } else {
                $amountOnCredit = 0;
                $amountFromWallet = $totalPrice;
                $paymentMethodToSave = 'wallet';
            }

            if ($amountOnCredit > 0 && $membership) {
                $membership->increment('current_debt', $amountOnCredit);
            }

            if ($amountFromWallet > 0) {
                $user->decrement('wallet_balance', $amountFromWallet);
            }

            // Deduct stock
            $category->decrement('stock', $quantity);

            // Financial math
            $commissionType = \App\Models\SystemSetting::where('key', 'posCommissionType')->value('value') ?? 'fixed';
            $commissionValue = (float) (\App\Models\SystemSetting::where('key', 'posCommissionRate')->value('value') ?? 5);

            if ($commissionType === 'fixed') {
                $commission = $commissionValue * $quantity;
            } else {
                $commission = $totalPrice * ($commissionValue / 100);
            }
            
            // Calculate agent commission (percentage of platform's commission)
            $agentCommission = 0;
            if ($network->agent_id) {
                $agentCommissionRate = (float) (\App\Models\SystemSetting::where('key', 'agentCommissionRate')->value('value') ?? 50); // Default 50% of platform commission
                $agentCommission = $commission * ($agentCommissionRate / 100);
            }

            $platformOwesNetwork = $amountFromWallet - $commission;
            
            // Add to network balance (platform debt to network)
            $network->increment('balance', (float)$platformOwesNetwork);
            $network->increment('total_sales', (float)$totalPrice);

            // Reward the Agent
            if ($agentCommission > 0 && $network->agent_id) {
                $agent = \App\Models\User::find($network->agent_id);
                if ($agent) {
                    $agent->increment('wallet_balance', $agentCommission);
                    
                    \App\Models\AgentTransaction::create([
                        'agent_id' => $agent->id,
                        'network_id' => $network->id,
                        'amount' => $agentCommission,
                        'type' => 'commission',
                        'description' => "عمولة مبيعات شبكة ({$network->name}) - نقطة بيع - فئة {$category->name} - كمية {$quantity}",
                        'reference_number' => 'AGT-COM-' . time() . '-' . rand(100, 999)
                    ]);
                }
            }

            // Get cards
            $cards = Card::where('card_category_id', $category->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->limit($quantity)
                ->get();

            if ($cards->count() < $quantity) {
                DB::rollBack();
                throw new \Exception('نعتذر، نفدت الكروت بشكل فعلي.');
            }

            // Mark cards as sold
            $cardIds = $cards->pluck('id')->toArray();
            Card::whereIn('id', $cardIds)->update([
                'customer_phone' => $customerPhone,
                'status' => 'sold',
                'purchased_at' => now(),
                'sold_by' => $user->id,
                'payment_method' => $paymentMethodToSave,
            ]);

            // Queue SMS if customer_phone is provided
            if (!empty($customerPhone)) {
                foreach ($cards as $c) {
                    $pinCode = $c->password ?? $c->serial_number ?? 'بدون كود';
                    $msg = "تم الشراء من كارد بوكس:\nالشبكة: {$network->name}\nالفئة: {$category->name}\nرقم الدخول: {$pinCode}";
                    
                    \App\Models\CardSmsTask::create([
                        'phone_number' => $customerPhone,
                        'card_category' => $category->name,
                        'card_code' => $pinCode,
                        'custom_message' => $msg
                    ]);
                }
            }

            // Add POS Transaction
            Transaction::create([
                'network_id' => $network->id,
                'type' => 'sale',
                'amount' => $totalPrice,
                'description' => "فئة {$category->name} - مبيعات لنقطة بيع ({$user->name})" . ($amountOnCredit > 0 ? " (آجل: $amountOnCredit)" : "") . " (عمولة: {$commission})",
                'reference_number' => 'POS-' . time()
            ]);

            DB::commit();

            return [
                'success' => true,
                'cards' => $cards,
                'category' => $category,
                'network_name' => $network->name,
                'total_deducted' => $totalPrice
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            throw $e;
        }
    }
}

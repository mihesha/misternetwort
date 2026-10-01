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

        [$useWallet, $useCredit, $availableCredit, $membership] = $this->determinePaymentMethod($user, $network, $totalPrice, $requestedPaymentMethod);

        DB::beginTransaction();
        try {
            $amountOnCredit = $useCredit ? $totalPrice : 0;
            $amountFromWallet = $useCredit ? 0 : $totalPrice;
            $paymentMethodToSave = $useCredit ? 'network_credit' : 'wallet';

            // 1. Deduct Balances
            $this->deductBalances($user, $membership, $amountOnCredit, $amountFromWallet);

            // 2. Deduct Stock
            $category->decrement('stock', $quantity);

            // 3. Financial Math & Network Updates
            $commission = $this->calculateCommission($quantity, $totalPrice);
            $this->updateNetworkFinancials($network, $amountFromWallet, $commission, $totalPrice);

            // 4. Reward the Agent
            $this->distributeAgentCommission($network, $category, $commission, $quantity);

            // 5. Extract and Mark Cards
            $cards = $this->extractAndMarkCards($network, $category, $quantity, $customerPhone, $user, $paymentMethodToSave, $unitPrice);

            // 6. Record POS Transaction
            $this->recordTransaction($network, $category, $user, $totalPrice, $amountOnCredit, $commission);

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
            Log::error('POS Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            throw $e;
        }
    }

    protected function determinePaymentMethod($user, Network $network, float $totalPrice, ?string $requestedPaymentMethod): array
    {
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

        return [$useWallet, $useCredit, $availableCredit, $membership];
    }

    protected function deductBalances($user, $membership, float $amountOnCredit, float $amountFromWallet): void
    {
        if ($amountOnCredit > 0 && $membership) {
            $membership->increment('current_debt', $amountOnCredit);
        }

        if ($amountFromWallet > 0) {
            $user->decrement('wallet_balance', $amountFromWallet);
        }
    }

    protected function calculateCommission(int $quantity, float $totalPrice): float
    {
        $commissionType = \App\Models\SystemSetting::where('key', 'posCommissionType')->value('value') ?? 'fixed';
        $commissionValue = (float) (\App\Models\SystemSetting::where('key', 'posCommissionRate')->value('value') ?? 5);

        if ($commissionType === 'fixed') {
            return $commissionValue * $quantity;
        } 
        
        return $totalPrice * ($commissionValue / 100);
    }

    protected function updateNetworkFinancials(Network $network, float $amountFromWallet, float $commission, float $totalPrice): void
    {
        $platformOwesNetwork = $amountFromWallet - $commission;
        $network->increment('balance', (float)$platformOwesNetwork);
        $network->increment('total_sales', (float)$totalPrice);
    }

    protected function distributeAgentCommission(Network $network, $category, float $commission, int $quantity): void
    {
        if ($commission <= 0 || !$network->agent_id) return;

        $agent = \App\Models\User::find($network->agent_id);
        if (!$agent) return;

        $agentCommissionRate = $agent->custom_commission_rate ?? (float) (\App\Models\SystemSetting::where('key', 'agentCommissionRate')->value('value') ?? 50);
        $agentCommission = $commission * ($agentCommissionRate / 100);
        
        if ($agentCommission > 0) {
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

    protected function extractAndMarkCards($network, $category, int $quantity, ?string $customerPhone, $user, string $paymentMethodToSave, float $unitPrice)
    {
        $cards = Card::where('card_category_id', $category->id)
            ->where('status', 'available')
            ->lockForUpdate()
            ->limit($quantity)
            ->get();

        if ($cards->count() < $quantity) {
            throw new \Exception('نعتذر، نفدت الكروت بشكل فعلي أثناء المعالجة.');
        }

        $cardIds = $cards->pluck('id')->toArray();
        Card::whereIn('id', $cardIds)->update([
            'customer_phone' => $customerPhone,
            'status' => 'sold',
            'purchased_at' => now(),
            'sold_by' => $user->id,
            'payment_method' => $paymentMethodToSave,
            'price_at_purchase' => $category->price,
            'pos_price_at_purchase' => $unitPrice,
        ]);

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

        return $cards;
    }

    protected function recordTransaction(Network $network, $category, $user, float $totalPrice, float $amountOnCredit, float $commission): void
    {
        $creditText = $amountOnCredit > 0 ? " (آجل: $amountOnCredit)" : "";
        
        Transaction::create([
            'network_id' => $network->id,
            'type' => 'sale',
            'amount' => $totalPrice,
            'description' => "فئة {$category->name} - مبيعات لنقطة بيع ({$user->name}){$creditText} (عمولة: {$commission})",
            'reference_number' => 'POS-' . time()
        ]);
    }
}


<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\NetworkPosMembership;
use App\Models\WalletRecharge;
use Carbon\Carbon;

class PosReportingService
{
    /**
     * Get details for the Admin dashboard POS view
     */
    public function getAdminPosDetails($user, $dateFilter = 'all')
    {
        $networks = $this->getPosNetworksDetails($user->id);

        $query = Card::where('sold_by', $user->id)
            ->where('status', 'sold')
            ->with(['cardCategory.network']);

        $this->applyDateFilter($query, $dateFilter, 'purchased_at');

        $cards = $query->orderBy('purchased_at', 'desc')->get();
        
        $totalSales = 0;
        $totalProfit = 0;

        $operations = $cards->map(function (Card $c) use (&$totalSales, &$totalProfit, $user) {
            return $this->mapAdminPosOperation($c, $totalSales, $totalProfit, $user);
        });

        $totalDebt = $networks->sum('current_debt');
        $recharges = $this->getPosRechargesDetails($user->id);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'shop_name' => $user->posProfile->shop_name ?? '',
                'wallet_balance' => $user->wallet_balance,
                'status' => $user->posProfile->status ?? 'active',
                'created_at' => $user->created_at,
                'total_debt' => $totalDebt
            ],
            'networks' => $networks,
            'stats' => [
                'total_sales' => $totalSales,
                'total_profit' => $totalProfit,
                'operations_count' => $operations->count()
            ],
            'operations' => $operations,
            'recharges' => $recharges
        ];
    }

    /**
     * Get details for the Network Owner dashboard POS view
     */
    public function getOwnerPosDetails($user, $membership, $networkId, $dateFilter = 'all')
    {
        $query = Card::where('sold_by', $user->id)
            ->where('status', 'sold')
            ->whereHas('cardCategory', function ($q) use ($networkId) {
                $q->where('network_id', $networkId);
            })
            ->with(['cardCategory.network']);

        $this->applyDateFilter($query, $dateFilter, 'purchased_at');

        $cards = $query->orderBy('purchased_at', 'desc')->get();
        
        $totalSales = 0;
        $totalProfit = 0;

        $operations = $cards->map(function (Card $c) use (&$totalSales, &$totalProfit, $user, $networkId) {
            $price = $c->cardCategory->price ?? 0;
            $posPrice = $c->cardCategory->pos_price ?? $price; 
            $profit = max(0, $price - $posPrice);
            
            $totalSales += $posPrice; 
            $totalProfit += 0;

            $tx = Transaction::where('network_id', $networkId)
                ->where('type', 'sale')
                ->where('created_at', '>=', Carbon::parse($c->purchased_at)->subSeconds(5))
                ->where('created_at', '<=', Carbon::parse($c->purchased_at)->addSeconds(5))
                ->where('description', 'like', "%{$user->name}%")
                ->first();
                
            $paymentMethod = 'رصيد المحفظة';
            if ($tx && str_contains($tx->description, 'آجل:')) {
                $paymentMethod = 'دين (آجل)';
            }

            return [
                'id' => $c->id,
                'card_code' => $c->serial_number,
                'category_name' => $c->cardCategory->name ?? '',
                'price' => (float)$price,
                'pos_price' => (float)$posPrice,
                'customer_phone' => $c->customer_phone ?? 'لم يدخل',
                'purchased_at' => $c->purchased_at,
                'payment_method' => $paymentMethod,
                'reference_number' => $tx->reference_number ?? 'بدون مرجع'
            ];
        });

        $settlements = Transaction::where('network_id', $networkId)
            ->where('type', 'debt_settlement')
            ->where('description', 'like', "%{$user->name}%")
            ->orderBy('created_at', 'desc');
            
        $this->applyDateFilter($settlements, $dateFilter, 'created_at');
        
        $settlements = $settlements->get()->map(function($tx) {
            return [
                'id' => $tx->id,
                'amount' => (float)$tx->amount,
                'reference_number' => $tx->reference_number,
                'created_at' => $tx->created_at
            ];
        });

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'shop_name' => $user->posProfile->shop_name ?? '',
            ],
            'membership' => [
                'id' => $membership->id,
                'credit_limit' => $membership->credit_limit,
                'current_debt' => $membership->current_debt,
                'status' => $membership->status,
                'joined_at' => $membership->created_at,
            ],
            'stats' => [
                'total_owner_sales' => $totalSales,
                'operations_count' => $operations->count()
            ],
            'operations' => $operations,
            'settlements' => $settlements
        ];
    }

    private function applyDateFilter($query, $dateFilter, $column)
    {
        if ($dateFilter === 'today') {
            $query->whereDate($column, today());
        } elseif ($dateFilter === 'week') {
            $query->where($column, '>=', now()->subDays(7));
        } elseif ($dateFilter === 'month') {
            $query->where($column, '>=', now()->subDays(30));
        }
    }

    private function getPosNetworksDetails($userId)
    {
        return NetworkPosMembership::where('user_id', $userId)
            ->with('network')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->network->id,
                    'name' => $m->network->name,
                    'credit_limit' => $m->credit_limit,
                    'current_debt' => $m->current_debt,
                    'status' => $m->status,
                    'joined_at' => $m->created_at
                ];
            });
    }

    private function getPosRechargesDetails($userId)
    {
        return WalletRecharge::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return $this->mapAdminPosRecharge($r);
            });
    }

    private function mapAdminPosOperation($c, &$totalSales, &$totalProfit, $user)
    {
        $price = $c->cardCategory->price ?? 0;
        $posPrice = $c->cardCategory->pos_price ?? $price; 
        $profit = max(0, $price - $posPrice);
        
        $totalSales += $price;
        $totalProfit += $profit;

        $tx = Transaction::where('network_id', $c->cardCategory->network_id)
            ->where('type', 'sale')
            ->where('created_at', '>=', Carbon::parse($c->purchased_at)->subSeconds(5))
            ->where('created_at', '<=', Carbon::parse($c->purchased_at)->addSeconds(5))
            ->where('description', 'like', "%{$user->name}%")
            ->first();
            
        $paymentMethod = 'رصيد المحفظة';
        if ($tx && str_contains($tx->description, 'آجل:')) {
            $paymentMethod = 'دين (آجل)';
        }

        return [
            'id' => $c->id,
            'card_code' => $c->serial_number,
            'network_name' => $c->cardCategory->network->name ?? 'غير معروف',
            'category_name' => $c->cardCategory->name ?? '',
            'price' => (float)$price,
            'pos_price' => (float)$posPrice,
            'profit' => (float)$profit,
            'customer_phone' => $c->customer_phone ?? 'لم يدخل',
            'purchased_at' => $c->purchased_at,
            'payment_method' => $paymentMethod,
            'reference_number' => $tx->reference_number ?? 'بدون مرجع'
        ];
    }

    private function mapAdminPosRecharge($r)
    {
        $refNumber = 'يدوي (إيصال)';
        if ($r->receipt_image === 'automated_deposit') {
            $deposit = \App\Models\AppDeposit::where('amount', $r->amount)
                ->where('status', 'used')
                ->where('updated_at', '>=', $r->created_at->copy()->subSeconds(5))
                ->where('updated_at', '<=', $r->created_at->copy()->addSeconds(5))
                ->first();
            if ($deposit) {
                $refNumber = $deposit->reference_number;
            } else {
                $refNumber = 'آلي (غير محدد)';
            }
        }

        return [
            'id' => $r->id,
            'amount' => (float) $r->amount,
            'bank_name' => $r->bank_name,
            'status' => $r->status,
            'reference_number' => $refNumber,
            'created_at' => $r->created_at,
            'receipt_image' => $r->receipt_image !== 'automated_deposit' ? $r->receipt_image : null
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Card;
use App\Models\WalletRecharge;
use App\Models\AppDeposit;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function getCustomers()
    {
        return response()->json(User::where('role', 'customer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'phone' => $u->phone,
                    'wallet_balance' => $u->wallet_balance,
                    'otp_code' => $u->otp_code,
                    'phone_verified_at' => $u->phone_verified_at,
                    'created_at' => $u->created_at,
                ];
            }));
    }

    public function getCustomerDetails($id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        
        $recharges = WalletRecharge::where('user_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $purchases = Card::where('customer_phone', $customer->phone)
            ->where('status', 'sold')
            ->with('cardCategory.network')
            ->orderBy('purchased_at', 'desc')
            ->get()
            ->map(function ($card) {
                $deposit = AppDeposit::where('used_for_card_id', $card->id)->first();
                return [
                    'id' => $card->id,
                    'serial_number' => $card->serial_number,
                    'pin_code' => $card->pin_code,
                    'purchased_at' => $card->purchased_at,
                    'package_name' => $card->cardCategory->name ?? 'غير معروف',
                    'network_name' => $card->cardCategory->network->name ?? 'غير معروف',
                    'price' => $card->cardCategory->price ?? 0,
                    'reference_number' => $deposit ? $deposit->reference_number : 'دفع من المحفظة',
                ];
            });

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'wallet_balance' => $customer->wallet_balance,
                'otp_code' => $customer->otp_code,
                'is_active' => $customer->phone_verified_at !== null,
                'joined_at' => $customer->created_at,
            ],
            'recharges' => $recharges,
            'purchases' => $purchases,
        ]);
    }
}
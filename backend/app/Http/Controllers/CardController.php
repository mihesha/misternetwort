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
            'quantity' => 'nullable|integer|min:1',
            'confirm_overpayment' => 'nullable|boolean'
        ]);

        $user = $request->user('sanctum');
        $service = app(\App\Services\CustomerPurchaseService::class);

        try {
            $result = $service->purchaseCard($user, $validated);

            return response()->json([
                'message' => 'تمت عملية الشراء بنجاح',
                'cards' => $result['cards'],
                'network' => $result['network'],
                'new_wallet_balance' => $result['new_wallet_balance']
            ], 201);
            
        } catch (\Exception $e) {
            $code = $e->getCode() > 0 ? $e->getCode() : 400;
            
            // Check if error is JSON (for overpayment warning)
            $decoded = json_decode($e->getMessage(), true);
            if (is_array($decoded) && isset($decoded['error'])) {
                return response()->json($decoded, $code);
            }
            
            return response()->json(['error' => $e->getMessage()], $code);
        }
    }

    public function myPurchases(Request $request)
    {
        $user = $request->user('sanctum');
        if (!$user) {
            return response()->json(['error' => 'غير مصرح'], 401);
        }

        // Fetch cards belonging to this user
        // The frontend expects the format of "GeneratedCard":
        // packageId, packageName, serialNumber, pinCode, dataSize, duration, expireDate, date
        $cards = Card::with(['category', 'category.network'])
            ->where('customer_phone', $user->phone)
            ->where('status', 'sold')
            ->orderBy('purchased_at', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'packageId' => $c->category->id,
                    'packageName' => $c->category->name,
                    'networkName' => optional($c->category->network)->name ?? 'غير معروف',
                    'serialNumber' => $c->serial_number,
                    'pinCode' => $c->password,
                    'dataSize' => $c->category->volume ?? '',
                    'duration' => $c->category->duration ?? '',
                    'expireDate' => $c->category->validity ?? '',
                    'date' => $c->purchased_at ? $c->purchased_at->format('Y-m-d H:i') : null,
                ];
            });

        return response()->json([
            'purchases' => $cards
        ]);
    }
}

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
        // Support using english_name (slug) instead of network_code
        if ($request->has('network_code')) {
            $network = Network::where('network_code', $request->network_code)
                ->orWhere('english_name', $request->network_code)
                ->first();
            if ($network) {
                $request->merge(['network_code' => $network->network_code]);
            }
        }
        $validated = $request->validate([
            'network_code' => 'required|string|exists:networks,network_code',
            'category_id' => 'nullable|exists:card_categories,id', // Make nullable if using items
            'quantity' => 'nullable|integer|min:1',
            'items' => 'nullable|array',
            'items.*.category_id' => 'required_with:items|exists:card_categories,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'customer_phone' => 'nullable|string',
            'wallet_type' => 'required|string',
            'transaction_ref' => 'nullable|string',
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
                'network_link' => $result['network_link'],
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
        $cards = Card::with(['cardCategory', 'cardCategory.network'])
            ->where('customer_phone', $user->phone)
            ->where('status', 'sold')
            ->orderBy('purchased_at', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'packageId' => optional($c->cardCategory)->id ?? '',
                    'packageName' => optional($c->cardCategory)->name ?? 'باقة محذوفة',
                    'networkName' => optional(optional($c->cardCategory)->network)->name ?? 'غير معروف',
                    'networkCode' => optional(optional($c->cardCategory)->network)->network_code ?? '',
                    'englishName' => optional(optional($c->cardCategory)->network)->english_name ?? '',
                    'serialNumber' => $c->serial_number,
                    'pinCode' => $c->card_code ?? $c->password,
                    'dataSize' => optional($c->cardCategory)->mega ? optional($c->cardCategory)->mega . ' ميجا' : '',
                    'duration' => optional($c->cardCategory)->hours ? optional($c->cardCategory)->hours . ' ساعة' : '',
                    'expireDate' => optional($c->cardCategory)->validity_days ? optional($c->cardCategory)->validity_days . ' أيام' : '',
                    'date' => $c->purchased_at ? $c->purchased_at->format('Y-m-d H:i') : null,
                ];
            });

        return response()->json([
            'purchases' => $cards
        ]);
    }
}

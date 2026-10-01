<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Network;
use App\Models\Transaction;
use App\Models\WalletRecharge;
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

    public function getCustomerWalletTransactions(Request $request)
    {
        $user = $request->user('sanctum');
        if (!$user) {
            return response()->json(['error' => 'غير مصرح'], 401);
        }

        $depositsQuery = DB::table('wallet_recharges')
            ->selectRaw("'deposit' as type, amount, status, created_at as date, id as ref_id")
            ->where('user_id', $user->id);

        $purchasesQuery = DB::table('cards')
            ->selectRaw("'purchase' as type, SUM(price_at_purchase) as amount, 'approved' as status, purchased_at as date, MIN(id) as ref_id")
            ->where('customer_phone', $user->phone)
            ->where('status', 'sold')
            ->whereNotNull('purchased_at')
            ->groupBy('purchased_at');

        $combined = $depositsQuery->unionAll($purchasesQuery);

        $query = DB::table(DB::raw("({$combined->toSql()}) as combined"))
            ->mergeBindings($combined)
            ->orderBy('date', 'desc');

        $paginated = $query->paginate(10);

        $walletNamesAr = [
            'internal' => 'رصيدي',
            'internal_wallet' => 'رصيدي',
            'jaib' => 'محفظة جيب',
            'jawali' => 'محفظة جوالي',
            'floosak' => 'محفظة فلوسك',
            'one_cash' => 'محفظة ون كاش',
            'saba_cash' => 'محفظة سبأ كاش',
            'pyes' => 'محفظة بيس',
            'easy' => 'محفظة ايزي',
            'cash_wallet' => 'محفظة كاش',
            'kuraimi' => 'ام فلوس'
        ];

        $transactions = collect();
        foreach ($paginated->items() as $item) {
            if ($item->type === 'deposit') {
                $r = WalletRecharge::find($item->ref_id);
                if (!$r) continue;
                
                $bName = $walletNamesAr[$r->bank_name] ?? $r->bank_name;
                
                $transactions->push([
                    'id' => 'DEP-' . $r->id,
                    'type' => 'deposit',
                    'amount' => (float)$r->amount,
                    'status' => $r->status,
                    'title' => 'إيداع عبر ' . $bName,
                    'subtitle' => $r->reference_number ?? 'لا يوجد مرجع',
                    'date' => $r->created_at->format('Y-m-d H:i:s'),
                    'timestamp' => $r->created_at->timestamp,
                    'details' => null
                ]);
            } else {
                $cardsGroup = Card::with(['cardCategory', 'cardCategory.network'])
                    ->where('customer_phone', $user->phone)
                    ->where('purchased_at', clone \Carbon\Carbon::parse($item->date))
                    ->get();
                    
                if ($cardsGroup->isEmpty()) continue;

                $cardsCount = $cardsGroup->count();
                $title = $cardsCount > 1 
                    ? "شراء كروت متعددة ({$cardsCount} كروت)"
                    : "شراء بطاقة " . optional(optional($cardsGroup->first()->cardCategory)->network)->name;

                $subtitle = $cardsCount > 1 
                    ? "طلب موحد" 
                    : $cardsGroup->first()->serial_number;

                $transaction = Transaction::where('amount', $item->amount)
                    ->where('type', 'sale')
                    ->whereBetween('created_at', [
                        \Carbon\Carbon::parse($item->date)->subSeconds(5), 
                        \Carbon\Carbon::parse($item->date)->addSeconds(5)
                    ])->first();

                $walletSource = 'رصيدي';
                if ($transaction && preg_match('/عبر محفظة (.*?) \(/', $transaction->description, $matches)) {
                    $sourceKey = trim($matches[1]);
                    $walletSource = $walletNamesAr[$sourceKey] ?? $sourceKey;
                }

                $transactions->push([
                    'id' => 'PUR-' . strtotime($item->date) . '-' . $cardsGroup->first()->id,
                    'type' => 'purchase',
                    'amount' => (float)$item->amount,
                    'status' => 'approved',
                    'title' => $title,
                    'subtitle' => $subtitle,
                    'wallet_source' => $walletSource,
                    'date' => \Carbon\Carbon::parse($item->date)->format('Y-m-d H:i:s'),
                    'timestamp' => strtotime($item->date),
                    'details' => $cardsGroup->map(function($c) {
                        return [
                            'network' => optional(optional($c->cardCategory)->network)->name,
                            'package' => optional($c->cardCategory)->name,
                            'serial' => $c->serial_number,
                            'pin' => $c->card_code ?? $c->password,
                            'price' => (float)$c->price_at_purchase
                        ];
                    })
                ]);
            }
        }

        return response()->json([
            'transactions' => $transactions,
            'balance' => (float)($user->wallet_balance ?? 0),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
            'has_more' => $paginated->hasMorePages()
        ]);
    }

    public function customerRechargeWallet(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string',
            'amount' => 'nullable|numeric|min:1',
            'receipt_image' => 'nullable|image|max:5120',
            'reference_number' => 'nullable|string',
        ]);

        $user = $request->user('sanctum');
        $service = app(\App\Services\WalletRechargeService::class);

        try {
            $result = $service->rechargeWallet(
                $user, 
                $validated, 
                $request->file('receipt_image')
            );
            
            $statusCode = $result['type'] === 'automated' ? 200 : 201;
            
            return response()->json([
                'message' => $result['message'],
                'recharge' => $result['recharge']
            ], $statusCode);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Network;
use App\Models\WalletRecharge;
use App\Models\Transaction;
use App\Models\NetworkPosMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PosController extends Controller
{
    public function getNetworks(Request $request)
    {
        $networks = Network::where('status', 'active')->get();
        return response()->json($networks->map(function ($net) {
            return [
                'id' => $net->id,
                'name' => $net->name,
                'network_code' => $net->network_code,
                'governorate' => $net->governorate,
                'city' => $net->city,
                'status' => $net->status,
                'image_url' => null, // Placeholder for image if added later
            ];
        }));
    }

    public function getMyNetworks(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $memberships = NetworkPosMembership::where('user_id', $user->id)
            ->with('network')
            ->get();

        return response()->json($memberships->map(function ($m) {
            return [
                'network_id' => $m->network->id,
                'name' => $m->network->name,
                'network_code' => $m->network->network_code,
                'status' => $m->status,
                'credit_limit' => (float)$m->credit_limit,
                'current_debt' => (float)$m->current_debt,
                'available_balance' => max(0, (float)$m->credit_limit - (float)$m->current_debt)
            ];
        }));
    }

    public function joinNetwork(Request $request)
    {
        $validated = $request->validate([
            'network_id' => 'required|exists:networks,id'
        ]);

        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $existing = NetworkPosMembership::where('user_id', $user->id)
            ->where('network_id', $validated['network_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'أنت منضم أو لديك طلب معلق لهذه الشبكة مسبقاً', 'status' => $existing->status], 400);
        }

        $membership = NetworkPosMembership::create([
            'network_id' => $validated['network_id'],
            'user_id' => $user->id,
            'credit_limit' => 0,
            'current_debt' => 0,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'تم إرسال طلب الانضمام بنجاح', 'status' => 'pending']);
    }

    public function getNetworkPackages($network_id)
    {
        $network = Network::find($network_id);
        if (!$network) return response()->json(['message' => 'الشبكة غير موجودة'], 404);

        $packages = $network->cardCategories()->where('status', '!=', 'inactive')
                            ->where('stock', '>', 0)
                            ->get();

        return response()->json($packages->map(function($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => (float)$p->price, // السعر للعميل النهائي
                'pos_price' => $p->pos_price ? (float)$p->pos_price : (float)$p->price, // السعر الخاص بنقطة البيع (تكلفة الشراء)
                'validity' => $p->validity_days,
                'description' => "سعة: {$p->mega} ميجا، مدة: {$p->hours} ساعة",
                'stock' => $p->stock,
            ];
        }));
    }

    public function purchaseVoucher(Request $request)
    {
        $validated = $request->validate([
            'network_id' => 'required|exists:networks,id',
            'package_id' => 'required|exists:card_categories,id',
            'quantity' => 'nullable|integer|min:1',
            'customer_phone' => 'nullable|string'
        ]);

        $quantity = $validated['quantity'] ?? 1;
        $user = $request->user();

        $service = app(\App\Services\PosPurchaseService::class);

        try {
            $result = $service->purchaseVoucher(
                $user, 
                $validated['network_id'], 
                $validated['package_id'], 
                $quantity, 
                $validated['customer_phone'] ?? null
            );

            return response()->json([
                'message' => 'تم شراء الكرت بنجاح',
                'vouchers' => $result['cards']->map(function ($c) use ($result) {
                    return [
                        'voucher_code' => $c->serial_number,
                        'pin' => $c->password,
                        'price' => $result['category']->price,
                        'expiry_date' => $result['category']->validity_days ? now()->addDays($result['category']->validity_days)->format('Y-m-d') : null,
                        'transaction_id' => 'TXN-'.$c->id
                    ];
                }),
                'network_name' => $result['network_name'],
                'total_deducted' => $result['total_deducted'],
                'sms_sent' => !empty($validated['customer_phone']),
                'sms_message' => !empty($validated['customer_phone']) ? "تم الشراء من كارد بوكس:\nالشبكة: {$result['network_name']}\nالفئة: {$result['category']->name}" : null
            ], 201);
            
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'داخلي') ? 500 : 400;
            return response()->json(['message' => $e->getMessage()], $statusCode);
        }
    }

    public function getWalletBalance(Request $request)
    {
        $user = $request->user();
        
        $recharges = WalletRecharge::where('user_id', $user->id)
                                    ->orderBy('created_at', 'desc')
                                    ->limit(10)
                                    ->get();

        return response()->json([
            'balance' => $user->wallet_balance,
            'recent_transactions' => $recharges->map(function ($r) {
                return [
                    'id' => $r->id,
                    'amount' => $r->amount,
                    'status' => $r->status,
                    'bank_name' => $r->bank_name,
                    'date' => $r->created_at->format('Y-m-d H:i')
                ];
            })
        ]);
    }

    public function rechargeWallet(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string',
            'amount' => 'nullable|numeric|min:1',
            'receipt_image' => 'nullable|image|max:5120',
            'reference_number' => 'nullable|string',
        ]);

        $user = $request->user();
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
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }



    public function getSalesHistory(Request $request)
    {
        $user = $request->user();
        $dateFilter = $request->query('filter'); // 'today', 'week', 'month'

        $query = Card::where('sold_by', $user->id)
                     ->where('status', 'sold')
                     ->with(['cardCategory.network']);

        if ($dateFilter == 'today') {
            $query->whereDate('purchased_at', today());
        } elseif ($dateFilter == 'week') {
            $query->where('purchased_at', '>=', now()->subDays(7));
        } elseif ($dateFilter == 'month') {
            $query->where('purchased_at', '>=', now()->subDays(30));
        }

        $cards = $query->orderBy('purchased_at', 'desc')->get();

        return response()->json($cards->map(function ($c) {
            return [
                'id' => $c->id,
                'voucher_code' => $c->serial_number,
                'pin' => $c->password,
                'network_name' => $c->cardCategory->network->name ?? 'غير معروف',
                'package_name' => $c->cardCategory->name ?? '',
                'price' => $c->cardCategory->price ?? 0,
                'purchased_at' => \Carbon\Carbon::parse($c->purchased_at)->format('Y-m-d H:i')
            ];
        }));
    }

    /**
     * @param int|string $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdminPosDetails($id, Request $request): \Illuminate\Http\JsonResponse
    {
        $user = \App\Models\User::where('role', 'pos')->with('posProfile')->findOrFail($id);
        $dateFilter = $request->query('filter', 'all');
        
        $service = app(\App\Services\PosReportingService::class);
        $details = $service->getAdminPosDetails($user, $dateFilter);
        
        return response()->json($details);
    }

    /**
     * @param int|string $networkId
     * @param int|string $userId
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOwnerPosDetails($networkId, $userId, Request $request): \Illuminate\Http\JsonResponse
    {
        $user = \App\Models\User::where('role', 'pos')->with('posProfile')->findOrFail($userId);
        $membership = NetworkPosMembership::where('network_id', $networkId)->where('user_id', $userId)->firstOrFail();
        $dateFilter = $request->query('filter', 'all');
        
        $service = app(\App\Services\PosReportingService::class);
        $details = $service->getOwnerPosDetails($user, $membership, $networkId, $dateFilter);
        
        return response()->json($details);
    }
}

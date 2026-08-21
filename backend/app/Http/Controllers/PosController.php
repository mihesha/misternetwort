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

        $network = Network::find($validated['network_id']);
        /** @var \App\Models\CardCategory $category */
        $category = $network->cardCategories()->where('id', $validated['package_id'])->first();

        if (!$category || $category->stock < $quantity) {
            return response()->json(['message' => 'عذراً، الكروت المطلوبة غير متوفرة بالكمية الكافية'], 400);
        }

        $unitPrice = $category->pos_price ?? $category->price;
        $totalPrice = $unitPrice * $quantity;

        $membership = NetworkPosMembership::where('user_id', $user->id)
                                          ->where('network_id', $network->id)
                                          ->where('status', 'active')
                                          ->first();

        $availableCredit = $membership ? ($membership->credit_limit - $membership->current_debt) : 0;
        if ($availableCredit < $totalPrice && $user->wallet_balance < $totalPrice) {
            return response()->json(['message' => 'عذراً، السقف المالي المتبقي ورصيد المحفظة لا يكفيان لإتمام العملية (لا يمكن تجزئة الدفع)'], 400);
        }

        DB::beginTransaction();
        try {
            // 1. Check if credit alone is enough
            if ($availableCredit >= $totalPrice) {
                $amountOnCredit = $totalPrice;
                $amountFromWallet = 0;
            } else {
                // 2. Otherwise, pay fully from Wallet (No splitting)
                $amountOnCredit = 0;
                $amountFromWallet = $totalPrice;
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
            $commissionType = \App\Models\SystemSetting::where('key', 'platformCommissionType')->value('value') ?? 'fixed';
            $commissionValue = (float) (\App\Models\SystemSetting::where('key', 'platformCommissionRate')->value('value') ?? 5);

            if ($commissionType === 'fixed') {
                $commission = $commissionValue * $quantity; // Fixed amount per card
            } else {
                $commission = $totalPrice * ($commissionValue / 100); // Percentage
            }
            // Platform only owes the network owner for the portion paid from wallet. 
            // Credit portion is owed directly to owner by POS.
            $platformOwesNetwork = $amountFromWallet - $commission;
            
            // Add to network balance (platform debt to network)
            $network->increment('balance', (float)$platformOwesNetwork);
            $network->increment('total_sales', (float)$totalPrice);

            // Get cards
            $cards = Card::where('card_category_id', $category->id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->limit($quantity)
                ->get();

            if ($cards->count() < $quantity) {
                DB::rollBack();
                return response()->json(['message' => 'نعتذر، نفدت الكروت بشكل فعلي.'], 400);
            }

            // Mark cards as sold
            $cardIds = $cards->pluck('id')->toArray();
            Card::whereIn('id', $cardIds)->update([
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'sold',
                'purchased_at' => now(),
                'sold_by' => $user->id, // track pos user
            ]);

            // Queue SMS if customer_phone is provided
            if (!empty($validated['customer_phone'])) {
                foreach ($cards as $c) {
                    $pinCode = $c->password ?? $c->serial_number ?? 'بدون كود';
                    $msg = "تم الشراء من كارد بوكس:\n";
                    $msg .= "الشبكة: {$network->name}\n";
                    $msg .= "الفئة: {$category->name}\n";
                    $msg .= "رقم الدخول: {$pinCode}";
                    
                    \App\Models\CardSmsTask::create([
                        'phone_number' => $validated['customer_phone'],
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

            return response()->json([
                'message' => 'تم شراء الكرت بنجاح',
                'vouchers' => $cards->map(function ($c) use ($category) {
                    return [
                        'voucher_code' => $c->serial_number, // or code
                        'pin' => $c->password,
                        'price' => $category->price,
                        'expiry_date' => $category->validity_days ? now()->addDays($category->validity_days)->format('Y-m-d') : null,
                        'transaction_id' => 'TXN-'.$c->id
                    ];
                }),
                'network_name' => $network->name,
                'total_deducted' => $totalPrice,
                'sms_sent' => !empty($validated['customer_phone']),
                'sms_message' => !empty($validated['customer_phone']) ? "تم الشراء من كارد بوكس:\nالشبكة: {$network->name}\nالفئة: {$category->name}" : null
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Purchase error: ' . $e->getMessage() . ' at line ' . $e->getLine());
            return response()->json(['message' => 'حدث خطأ داخلي أثناء الشراء: ' . $e->getMessage()], 500);
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

        // 1. Automated flow (using reference number)
        if (!empty($validated['reference_number'])) {
            // Flexible matching for wallet name just like in purchase
            $deposit = \App\Models\AppDeposit::where('reference_number', $validated['reference_number'])
                ->where('status', 'pending')
                ->where(function ($query) use ($validated) {
                    $walletType = strtolower($validated['bank_name']);
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
                return response()->json(['message' => 'لم يتم العثور على عملية الإيداع. تأكد من صحة رقم المرجع والمحفظة.'], 400);
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

            return response()->json([
                'message' => 'تم تغذية محفظتك بنجاح بشكل آلي!',
                'recharge' => $recharge
            ], 200);
        }

        // 2. Manual flow (using receipt image)
        if (!$request->hasFile('receipt_image')) {
            return response()->json(['message' => 'يجب إدخال الرقم المرجعي للعملية'], 400);
        }

        if (empty($validated['amount'])) {
            return response()->json(['message' => 'يجب تحديد المبلغ'], 400);
        }

        $path = $request->file('receipt_image')->store('receipts', 'public');

        $recharge = WalletRecharge::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'receipt_image' => $path,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب الشحن بنجاح وبانتظار المراجعة',
            'recharge' => $recharge
        ], 201);
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

    public function getAdminPosDetails($id, Request $request)
    {
        $user = \App\Models\User::where('role', 'pos')->with('posProfile')->findOrFail($id);
        
        // Networks POS is joined in
        $networks = NetworkPosMembership::where('user_id', $user->id)
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

        // Date filtering
        $dateFilter = $request->query('filter', 'all');
        $query = Card::where('sold_by', $user->id)->where('status', 'sold')->with(['cardCategory.network']);

        if ($dateFilter === 'today') {
            $query->whereDate('purchased_at', today());
        } elseif ($dateFilter === 'week') {
            $query->where('purchased_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === 'month') {
            $query->where('purchased_at', '>=', now()->subDays(30));
        }

        $cards = $query->orderBy('purchased_at', 'desc')->get();
        
        $totalSales = 0;
        $totalProfit = 0;

        $operations = $cards->map(function ($c) use (&$totalSales, &$totalProfit, $user) {
            return $this->mapAdminPosOperation($c, $totalSales, $totalProfit, $user);
        });

        $totalDebt = $networks->sum('current_debt');

        // Fetch Wallet Recharges / Deposits for this POS
        $recharges = WalletRecharge::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return $this->mapAdminPosRecharge($r);
            });

        return response()->json([
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
        ]);
    }

    private function mapAdminPosOperation($c, &$totalSales, &$totalProfit, $user)
    {
        $price = $c->cardCategory->price ?? 0;
        $posPrice = $c->cardCategory->pos_price ?? $price; // POS buy price
        $profit = max(0, $price - $posPrice);
        
        $totalSales += $price;
        $totalProfit += $profit;

        // Try to find the related transaction to see if it was on credit (debt) or wallet
        $tx = Transaction::where('network_id', $c->cardCategory->network_id)
            ->where('type', 'sale')
            ->where('created_at', '>=', \Carbon\Carbon::parse($c->purchased_at)->subSeconds(5))
            ->where('created_at', '<=', \Carbon\Carbon::parse($c->purchased_at)->addSeconds(5))
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
            // Try to find the related AppDeposit
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

    public function getOwnerPosDetails($networkId, $userId, Request $request)
    {
        $user = \App\Models\User::where('role', 'pos')->with('posProfile')->findOrFail($userId);
        $membership = NetworkPosMembership::where('network_id', $networkId)->where('user_id', $userId)->firstOrFail();
        
        // Date filtering
        $dateFilter = $request->query('filter', 'all');
        
        // Only cards belonging to this network
        $query = Card::where('sold_by', $user->id)
            ->where('status', 'sold')
            ->whereHas('cardCategory', function ($q) use ($networkId) {
                $q->where('network_id', $networkId);
            })
            ->with(['cardCategory.network']);

        if ($dateFilter === 'today') {
            $query->whereDate('purchased_at', today());
        } elseif ($dateFilter === 'week') {
            $query->where('purchased_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === 'month') {
            $query->where('purchased_at', '>=', now()->subDays(30));
        }

        $cards = $query->orderBy('purchased_at', 'desc')->get();
        
        $totalSales = 0;
        $totalProfit = 0;

        $operations = $cards->map(function ($c) use (&$totalSales, &$totalProfit, $user, $networkId) {
            $price = $c->cardCategory->price ?? 0;
            $posPrice = $c->cardCategory->pos_price ?? $price; // POS buy price
            $profit = max(0, $price - $posPrice);
            
            $totalSales += $posPrice; // For the owner, the sales are based on posPrice (what they received)
            $totalProfit += 0; // Not really applicable for owner in the same way, but we can return 0

            // Try to find the related transaction
            $tx = Transaction::where('network_id', $networkId)
                ->where('type', 'sale')
                ->where('created_at', '>=', \Carbon\Carbon::parse($c->purchased_at)->subSeconds(5))
                ->where('created_at', '<=', \Carbon\Carbon::parse($c->purchased_at)->addSeconds(5))
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

        // Get debt payments (debt settlements) by this POS to this owner
        $settlements = Transaction::where('network_id', $networkId)
            ->where('type', 'debt_settlement')
            ->where('description', 'like', "%{$user->name}%")
            ->orderBy('created_at', 'desc');
            
        if ($dateFilter === 'today') {
            $settlements->whereDate('created_at', today());
        } elseif ($dateFilter === 'week') {
            $settlements->where('created_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === 'month') {
            $settlements->where('created_at', '>=', now()->subDays(30));
        }
        
        $settlements = $settlements->get()->map(function($tx) {
            return [
                'id' => $tx->id,
                'amount' => (float)$tx->amount,
                'reference_number' => $tx->reference_number,
                'created_at' => $tx->created_at
            ];
        });

        return response()->json([
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
                'total_owner_sales' => $totalSales, // Total money the POS owes/paid to owner for these cards
                'operations_count' => $operations->count()
            ],
            'operations' => $operations,
            'settlements' => $settlements
        ]);
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\PosController;

// Public Wallet / Purchase Endpoints
Route::get('/wallet/network/{networkCode}', [NetworkController::class, 'getByCode']);

Route::get('/networks/{network_id}/pos-memberships', function (Request $request, $network_id) {
    return \App\Models\NetworkPosMembership::where('network_id', $network_id)
        ->with('user')
        ->orderBy('created_at', 'desc')
        ->get();
});

Route::post('/networks/{network_id}/pos-memberships', function (Request $request, $network_id) {
    $validated = $request->validate(['phone' => 'required|string']);
    $user = \App\Models\User::where('phone', $validated['phone'])->where('role', 'pos')->first();
    if (!$user) return response()->json(['error' => 'لا يوجد نقطة بيع بهذا الرقم'], 404);

    $exists = \App\Models\NetworkPosMembership::where('network_id', $network_id)->where('user_id', $user->id)->first();
    if ($exists) return response()->json(['error' => 'نقطة البيع منضمة مسبقاً لهذه الشبكة'], 400);

    $membership = \App\Models\NetworkPosMembership::create([
        'network_id' => $network_id,
        'user_id' => $user->id,
        'credit_limit' => 0,
        'current_debt' => 0,
        'status' => 'active'
    ]);
    return response()->json($membership, 201);
});

Route::patch('/networks/{network_id}/pos-memberships/{id}', function (Request $request, $network_id, $id) {
    $membership = \App\Models\NetworkPosMembership::where('network_id', $network_id)->findOrFail($id);
    if ($request->has('credit_limit')) {
        $membership->credit_limit = $request->credit_limit;
    }
    if ($request->has('status')) {
        $membership->status = $request->status;
    }
    $membership->save();
    return response()->json($membership);
});

Route::post('/networks/{network_id}/pos-memberships/{id}/pay-debt', function (Request $request, $network_id, $id) {
    $validated = $request->validate(['amount' => 'required|numeric|min:1']);
    $membership = \App\Models\NetworkPosMembership::where('network_id', $network_id)->findOrFail($id);
    
    if ($membership->current_debt < $validated['amount']) {
        return response()->json(['error' => 'المبلغ المدخل أكبر من الدين الحالي'], 400);
    }

    $membership->decrement('current_debt', $validated['amount']);
    return response()->json(['message' => 'تم السداد بنجاح', 'current_debt' => $membership->current_debt]);
});

Route::post('/cards/generate-batch', [CardController::class, 'generateBatch']);
Route::post('/wallet/purchase-card', [CardController::class, 'purchase']);

// App Deposits API
Route::post('/app/deposits', function (Request $request) {
    // In a real app, protect this with API Key or Sanctum.
    // Assuming simple secret or just open for now based on requirements.
    if ($request->header('X-App-Secret') !== 'mobile-app-secret-123') {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    $validated = $request->validate([
        'reference_number' => 'required|string|unique:app_deposits,reference_number',
        'amount' => 'required|numeric|min:0',
        'wallet_name' => 'required|string'
    ]);

    $deposit = \App\Models\AppDeposit::create($validated);
    
    return response()->json(['message' => 'Deposit received', 'data' => $deposit], 201);
});

Route::get('/networks/search', function (Request $request) {
    $q = $request->query('q');
    if (!$q) return response()->json([]);
    
    $networks = \App\Models\Network::where('status', 'active')
        ->where(function($query) use ($q) {
            $query->where('name', 'LIKE', "%{$q}%")
                  ->orWhere('network_code', 'LIKE', "%{$q}%");
        })
        ->get();
        
    return response()->json($networks);
});

Route::get('/networks/{code}', function ($code) {
    $network = \App\Models\Network::where('network_code', $code)->where('status', 'active')->first();
    if (!$network) return response()->json(['error' => 'Not found'], 404);
    return response()->json($network);
});

Route::get('/networks/{code}/packages', function ($code) {
    $network = \App\Models\Network::where('network_code', $code)->where('status', 'active')->first();
    if (!$network) return response()->json(['error' => 'Not found'], 404);
    
    $packages = \App\Models\CardCategory::where('network_id', $network->id)
        ->where('status', '!=', 'inactive')
        ->where('stock', '>', 0) // Hide out of stock cards completely from the store
        ->get();
        
    return response()->json($packages->map(function($p) {
        return [
            'id' => (string)$p->id,
            'name' => $p->name,
            'price' => (float)$p->price,
            'dataSize' => $p->mega . ' MB',
            'duration' => $p->hours . ' ساعات',
            'validity' => $p->validity_days . ' أيام',
            'available' => true,
        ];
    }));
});

// Auth Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Customer Auth Endpoints
Route::post('/customer/register', [AuthController::class, 'customerRegister']);
Route::post('/customer/login', [AuthController::class, 'customerLogin']);

Route::get('/admin/customers', function () {
    return response()->json(\App\Models\User::where('role', 'customer')->get());
});

// Public Requests (Joining Form)
Route::post('/requests', [NetworkController::class, 'submitApplication']);
Route::get('/requests', function () {
    $apps = \App\Models\NetworkApplication::orderBy('created_at', 'desc')->get()->map(function ($app) {
        return [
            'id' => $app->id,
            'referenceNumber' => $app->reference_number,
            'createdAt' => $app->created_at,
            'status' => $app->status,
            'formData' => [
                'owner' => [
                    'ownerName' => $app->owner_name, 
                    'ownerId' => $app->owner_identity,
                    'contactNumber' => $app->owner_phone
                ],
                'network' => [
                    'networkName' => $app->network_name, 
                    'networkPhone' => $app->network_phone,
                    'governorate' => $app->governorate, 
                    'city' => $app->city,
                    'neighborhood' => $app->neighborhood
                ],
                'jaibWalletNumber' => $app->jaib_wallet,
                'cardCategories' => json_decode($app->card_categories_json, true) ?? []
            ]
        ];
    });
    return response()->json($apps);
});
Route::patch('/requests/{id}/status', function ($id, Request $request) {
    $app = \App\Models\NetworkApplication::findOrFail($id);
    $app->update(['status' => $request->status]);

    if ($request->status === 'approved') {
        // Create or get existing User (Owner)
        $user = \App\Models\User::firstOrCreate(
            ['phone' => $app->owner_phone],
            [
                'name' => $app->owner_name,
                'email' => $app->owner_phone . '@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make($request->tempPassword ?? '12345678'),
                'role' => 'network_owner',
                'must_change_password' => true
            ]
        );

        // Ensure Network is created only ONCE per user
        $network = \App\Models\Network::where('user_id', $user->id)->first();
        
        if (!$network) {
            $network = clone \App\Models\Network::create([
                'user_id' => $user->id,
                'name' => $app->network_name,
                'network_code' => '8' . rand(1000, 9999), // Always starts with 8
                'governorate' => $app->governorate,
                'city' => $app->city ?? null,
                'neighborhood' => $app->neighborhood ?? null,
                'jaib_wallet' => $app->jaib_wallet ?? null,
                'owner_phone' => $app->owner_phone,
                'balance' => 0,
                'total_sales' => 0,
                'status' => 'active'
            ]);

            // Create Card Categories ONLY ONCE upon creation
            $categories = json_decode($app->card_categories_json, true) ?? [];
            foreach ($categories as $cat) {
                \App\Models\CardCategory::create([
                    'network_id' => $network->id,
                    'name' => (string)($cat['name'] ?? $cat['value'] ?? $cat['price'] ?? 0), // Removed "فئة"
                    'price' => $cat['price'] ?? $cat['value'] ?? 0,
                    'mega' => $cat['mega'] ?? 0,
                    'hours' => $cat['hours'] ?? 0,
                    'validity_days' => $cat['validityDays'] ?? 0,
                    'card_type' => $cat['cardType'] ?? 'مستخدم فقط',
                    'stock' => 0,
                ]);
            }
        }
        
        return response()->json([
            'message' => 'Status updated successfully',
            'network_code' => $network->network_code
        ]);
    }

    return response()->json(['message' => 'Status updated successfully']);
});

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::post('/change-password', function (Request $request) {
        $validated = $request->validate([
            'password' => 'required|string|min:6'
        ]);
        
        $user = $request->user();
        $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $user->must_change_password = false;
        $user->save();
        
        return response()->json(['message' => 'Password updated successfully']);
    });
    
    Route::get('/networks', [NetworkController::class, 'index']);
    Route::get('/networks/{network}', [NetworkController::class, 'show']);

    Route::patch('/categories/{id}/settings', function ($id, Request $request) {
        $validated = $request->validate([
            'min_threshold' => 'nullable|integer',
            'prefix' => 'nullable|string',
            'suffix' => 'nullable|string'
        ]);
        
        $cat = \App\Models\CardCategory::findOrFail($id);
        $network = \App\Models\Network::where('user_id', $request->user()->id)->where('id', $cat->network_id)->firstOrFail();
        
        if (isset($validated['min_threshold'])) $cat->min_threshold = $validated['min_threshold'];
        if (array_key_exists('prefix', $validated)) $cat->prefix = $validated['prefix'];
        if (array_key_exists('suffix', $validated)) $cat->suffix = $validated['suffix'];
        
        $cat->save();
        return response()->json(['message' => 'Settings updated successfully']);
    });

    Route::patch('/networks/{network_code}/settings', function ($network_code, Request $request) {
        $validated = $request->validate([
            'notif_out_of_stock' => 'nullable|boolean',
            'notif_low_stock' => 'nullable|boolean'
        ]);
        
        $network = \App\Models\Network::where('user_id', $request->user()->id)->where('network_code', $network_code)->firstOrFail();
        
        if (isset($validated['notif_out_of_stock'])) $network->notif_out_of_stock = $validated['notif_out_of_stock'];
        if (isset($validated['notif_low_stock'])) $network->notif_low_stock = $validated['notif_low_stock'];
        
        $network->save();
        return response()->json(['message' => 'Network settings updated successfully']);
    });



    // Data Edit Requests
    Route::post('/edit-requests', function (Request $request) {
        $validated = $request->validate([
            'referenceNumber' => 'required|string',
            'networkCode' => 'required|string',
            'networkName' => 'required|string',
            'ownerName' => 'required|string',
            'contactPhone' => 'required|string',
            'governorate' => 'required|string',
            'city' => 'required|string',
            'district' => 'nullable|string',
            'jaibWallet' => 'required|string',
            'adminNotes' => 'nullable|string',
            'categories' => 'required|array',
            'previousData' => 'nullable|array',
        ]);

        $editReq = \App\Models\NetworkDataEditRequest::create([
            'user_id' => $request->user()->id,
            'reference_number' => $validated['referenceNumber'],
            'network_code' => $validated['networkCode'],
            'network_name' => $validated['networkName'],
            'owner_name' => $validated['ownerName'],
            'contact_phone' => $validated['contactPhone'],
            'governorate' => $validated['governorate'],
            'city' => $validated['city'],
            'district' => $validated['district'] ?? null,
            'jaib_wallet' => $validated['jaibWallet'],
            'admin_notes' => $validated['adminNotes'] ?? null,
            'categories' => $validated['categories'],
            'previous_data' => $validated['previousData'] ?? null,
            'status' => 'pending'
        ]);

        return response()->json($editReq, 201);
    });

    Route::get('/edit-requests', function (Request $request) {
        // Admin gets all, user gets theirs
        // For now, since admin dashboard relies on open endpoints without auth, we might need a public one or check role.
        // Wait, AdminDashboard doesn't use Sanctum! It relies on open endpoints!
        // We will move the GET to outside of auth:sanctum for the admin to see them.
        return response()->json(\App\Models\NetworkDataEditRequest::where('user_id', $request->user()->id)->get());
    });

    // POS Endpoints
    Route::prefix('pos')->group(function () {
        Route::get('/networks', [PosController::class, 'getNetworks']);
        Route::get('/networks/my-networks', [PosController::class, 'getMyNetworks']);
        Route::post('/networks/join', [PosController::class, 'joinNetwork']);
        Route::get('/networks/{id}/packages', [PosController::class, 'getNetworkPackages']);
        Route::post('/vouchers/purchase', [PosController::class, 'purchaseVoucher']);
        Route::get('/wallet/balance', [PosController::class, 'getWalletBalance']);
        Route::post('/wallet/recharge', [PosController::class, 'rechargeWallet']);
        Route::get('/sales/history', [PosController::class, 'getSalesHistory']);
    });
});

// Admin endpoints (Mocking to support simulator UI without auth)
Route::get('/admin/app-deposits', function () {
    return response()->json(\App\Models\AppDeposit::orderBy('created_at', 'desc')->get());
});
Route::patch('/admin/app-deposits/{id}/status', function ($id, Request $request) {
    $request->validate(['status' => 'required|in:confirmed,pending']);
    $deposit = \App\Models\AppDeposit::findOrFail($id);
    if ($deposit->status !== 'used') {
        $deposit->status = $request->status;
        $deposit->save();
    }
    return response()->json(['message' => 'Status updated']);
});

Route::get('/admin/edit-requests', function () {
    return response()->json(\App\Models\NetworkDataEditRequest::all());
});
Route::patch('/admin/edit-requests/{id}/status', function ($id, Request $request) {
    $editReq = \App\Models\NetworkDataEditRequest::findOrFail($id);
    $editReq->status = $request->status;
    $editReq->save();

    if ($request->status === 'approved') {
        $network = \App\Models\Network::where('network_code', $editReq->network_code)->first();
        if ($network) {
            // Update network info
            $network->update([
                'name' => $editReq->network_name,
                'governorate' => $editReq->governorate,
                'city' => $editReq->city,
                'neighborhood' => $editReq->district,
                'jaib_wallet' => $editReq->jaib_wallet,
                'owner_phone' => $editReq->contact_phone,
            ]);

            // Update user name/phone if needed
            $user = \App\Models\User::find($network->user_id);
            if ($user) {
                $user->update([
                    'name' => $editReq->owner_name,
                    'phone' => $editReq->contact_phone,
                    'email' => $editReq->contact_phone . '@example.com'
                ]);
            }

            // Sync categories (update existing, create new, delete removed)
            $categories = $editReq->categories ?? [];
            
            $existingIds = [];
            foreach ($categories as $cat) {
                if (isset($cat['id']) && is_numeric($cat['id'])) {
                    // Try to update existing
                    $category = \App\Models\CardCategory::where('network_id', $network->id)->where('id', $cat['id'])->first();
                    if ($category) {
                        $category->update([
                            'name' => (string)($cat['name'] ?? $cat['price'] ?? 0),
                            'price' => $cat['price'] ?: 0,
                            'mega' => (int)($cat['mb'] ?: ($cat['mega'] ?? 0)),
                            'hours' => (int)($cat['hours'] ?: 0),
                            'validity_days' => (int)($cat['validityDays'] ?: 0),
                            'card_type' => $cat['cardType'] ?? 'مستخدم فقط',
                        ]);
                        $existingIds[] = $category->id;
                        continue; // Successfully updated, skip to next
                    }
                }
                
                // Create new (if not found or no ID)
                $newCat = \App\Models\CardCategory::create([
                    'network_id' => $network->id,
                    'name' => (string)($cat['name'] ?? $cat['price'] ?? 0),
                    'price' => $cat['price'] ?: 0,
                    'mega' => (int)($cat['mb'] ?: ($cat['mega'] ?? 0)),
                    'hours' => (int)($cat['hours'] ?: 0),
                    'validity_days' => (int)($cat['validityDays'] ?: 0),
                    'card_type' => $cat['cardType'] ?? 'مستخدم فقط',
                    'stock' => 0,
                ]);
                $existingIds[] = $newCat->id;
            }

            // Delete removed categories
            \App\Models\CardCategory::where('network_id', $network->id)->whereNotIn('id', $existingIds)->delete();
        }
    }

    return response()->json(['message' => 'Status updated and data applied if approved']);
});

// Admin endpoints (Mocking to support simulator UI)
Route::get('/admin/stats', function () {
    return response()->json([
        'totalApplications' => \App\Models\NetworkApplication::count() ?? 0,
        'pendingApplications' => \App\Models\NetworkApplication::where('status', 'pending')->count() ?? 0,
        'approvedNetworks' => \App\Models\Network::count() ?? 0,
        'activeNetworksCount' => \App\Models\Network::where('status', 'active')->count() ?? 0,
        'totalSystemBalance' => \App\Models\Network::sum('balance') ?? 0,
        'totalSalesVolume' => \App\Models\Network::sum('total_sales') ?? 0,
        'totalWithdrawalsCompleted' => \App\Models\Withdrawal::where('status', 'completed')->count() ?? 0,
        'pendingWithdrawalsCount' => \App\Models\Withdrawal::where('status', 'pending')->count() ?? 0,
        'pendingWithdrawalsAmount' => \App\Models\Withdrawal::where('status', 'pending')->sum('amount') ?? 0,
        'totalPlatformCommissions' => (\App\Models\Network::sum('total_sales') * 0.025) ?? 0,
    ]);
});
Route::get('/admin/networks', function () {
    return response()->json(\App\Models\Network::with(['cardCategories', 'user'])->get());
});
Route::post('/admin/networks', function (Request $request) {
    $validated = $request->validate([
        'networkName' => 'required|string',
        'ownerName' => 'required|string',
        'contactNumber' => 'required|string',
        'governorate' => 'required|string',
        'city' => 'required|string',
        'jaibWalletNumber' => 'nullable|string'
    ]);

    $user = \App\Models\User::firstOrCreate(
        ['phone' => $validated['contactNumber']],
        [
            'name' => $validated['ownerName'],
            'email' => $validated['contactNumber'] . '@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('12345678'),
            'role' => 'network_owner',
            'must_change_password' => true
        ]
    );

    $network = clone \App\Models\Network::create([
        'user_id' => $user->id,
        'name' => $validated['networkName'],
        'network_code' => '8' . rand(1000, 9999),
        'governorate' => $validated['governorate'],
        'city' => $validated['city'],
        'jaib_wallet' => $validated['jaibWalletNumber'],
        'owner_phone' => $validated['contactNumber'],
        'balance' => 0,
        'total_sales' => 0,
        'status' => 'active'
    ]);

    // Create Default Categories
    $defaultCats = [
        ['name' => '100', 'price' => 100, 'mega' => 100, 'hours' => 2],
        ['name' => '200', 'price' => 250, 'mega' => 300, 'hours' => 6],
        ['name' => '500', 'price' => 500, 'mega' => 1000, 'hours' => 24]
    ];

    foreach ($defaultCats as $cat) {
        \App\Models\CardCategory::create([
            'network_id' => $network->id,
            'name' => $cat['name'],
            'price' => $cat['price'],
            'mega' => $cat['mega'],
            'hours' => $cat['hours'],
            'validity_days' => 0,
            'card_type' => 'مستخدم فقط',
            'stock' => 0,
        ]);
    }

    return response()->json($network->load('cardCategories', 'user'));
});
Route::post('/networks/{id}/import-cards', function ($id, Request $request) {
    $network = \App\Models\Network::findOrFail($id);
    $validated = $request->validate([
        'category_id' => 'required|exists:card_categories,id',
        'cards' => 'required|array',
        'cards.*.code' => 'required|string|min:6',
        'cards.*.password' => 'nullable|string',
        'file_type' => 'nullable|string',
        'uploaded_by' => 'nullable|string'
    ]);

    $category = \App\Models\CardCategory::findOrFail($validated['category_id']);
    
    $validCards = [];
    $duplicateErrors = [];
    
    foreach ($validated['cards'] as $index => $cardData) {
        $exists = \App\Models\Card::where('serial_number', $cardData['code'])
            ->whereHas('cardCategory', function($q) use ($network) {
                $q->where('network_id', $network->id);
            })->exists();
            
        if ($exists) {
            $duplicateErrors[] = "الكرت رقم '{$cardData['code']}' موجود مسبقاً في شبكتك وتم تجاهله.";
        } else {
            $validCards[] = $cardData;
        }
    }

    if (count($validCards) === 0) {
        return response()->json([
            'error' => 'تم رفض الملف: جميع الكروت مكررة وموجودة مسبقاً في النظام.',
            'duplicates' => $duplicateErrors
        ], 400);
    }
    
    $batch = \App\Models\CardBatch::create([
        'network_id' => $network->id,
        'card_category_id' => $category->id,
        'uploaded_by' => $validated['uploaded_by'] ?? 'صاحب الشبكة',
        'addition_method' => 'يدوي',
        'file_type' => $validated['file_type'] ?? 'EXCEL',
        'cards_count' => count($validCards)
    ]);

    foreach ($validCards as $cardData) {
        \App\Models\Card::create([
            'card_category_id' => $category->id,
            'card_batch_id' => $batch->id,
            'serial_number' => $cardData['code'],
            'card_code' => $cardData['code'],
            'password' => $cardData['password'] ?? null,
            'status' => 'available'
        ]);
    }

    $category->increment('stock', count($validCards));

    return response()->json([
        'message' => 'Cards imported successfully', 
        'count' => count($validCards), 
        'batch_id' => $batch->id,
        'errors' => $duplicateErrors
    ]);
});
Route::get('/admin/networks/{id}/cards', function ($id) {
    return response()->json(\App\Models\Card::whereHas('cardCategory', function($q) use ($id) {
        $q->where('network_id', $id);
    })->with('cardCategory')->orderBy('created_at', 'desc')->get());
});

Route::get('/admin/networks/{id}/card-batches', function ($id) {
    return response()->json(\App\Models\CardBatch::where('network_id', $id)
        ->with('cardCategory')
        ->orderBy('created_at', 'desc')
        ->get());
});

Route::delete('/admin/networks/{id}/card-batches/{batch_id}', function ($id, $batch_id) {
    $batch = \App\Models\CardBatch::where('network_id', $id)->findOrFail($batch_id);
    
    // Check if any card in this batch is sold
    $soldCardsCount = \App\Models\Card::where('card_batch_id', $batch_id)->where('status', '!=', 'available')->count();
    if ($soldCardsCount > 0) {
        return response()->json(['error' => 'لا يمكن حذف هذه الدفعة لأنه تم بيع كروت منها'], 400);
    }
    
    // Decrease stock for the category
    $category = \App\Models\CardCategory::find($batch->card_category_id);
    if ($category) {
        $category->decrement('stock', $batch->cards_count);
    }

    $batch->delete(); // This will cascade delete the cards since we added onDelete('cascade') in migration. Wait, the cards migration has cascade on card_batch_id.
    
    return response()->json(['message' => 'Batch deleted successfully']);
});

Route::delete('/admin/networks/{id}/cards/{card_id}', function ($id, $card_id) {
    $card = \App\Models\Card::whereHas('cardCategory', function($q) use ($id) {
        $q->where('network_id', $id);
    })->findOrFail($card_id);

    if ($card->status !== 'available') {
        return response()->json(['error' => 'لا يمكن حذف هذا الكرت لأنه ليس متاحاً'], 400);
    }

    $category = \App\Models\CardCategory::find($card->card_category_id);
    if ($category) {
        $category->decrement('stock', 1);
    }

    if ($card->card_batch_id) {
        $batch = \App\Models\CardBatch::find($card->card_batch_id);
        if ($batch) {
            $batch->decrement('cards_count', 1);
        }
    }

    $card->delete();

    return response()->json(['message' => 'Card deleted successfully']);
});
Route::patch('/admin/networks/{id}', function ($id, Request $request) {
    $network = \App\Models\Network::findOrFail($id);
    $validated = $request->validate([
        'networkName' => 'required|string',
        'governorate' => 'required|string',
        'city' => 'required|string',
        'ownerName' => 'required|string',
        'contactNumber' => 'required|string',
        'jaibWalletNumber' => 'nullable|string'
    ]);
    
    $network->name = $validated['networkName'];
    $network->governorate = $validated['governorate'];
    $network->city = $validated['city'];
    $network->owner_phone = $validated['contactNumber'];
    $network->jaib_wallet = $validated['jaibWalletNumber'];
    $network->save();
    
    $user = \App\Models\User::find($network->user_id);
    if ($user) {
        $user->name = $validated['ownerName'];
        $user->phone = $validated['contactNumber'];
        $user->save();
    }
    
    return response()->json(['message' => 'Network updated successfully']);
});
Route::post('/admin/networks/{id}/reset-password', function ($id, Request $request) {
    $network = \App\Models\Network::findOrFail($id);
    $user = \App\Models\User::find($network->user_id);
    
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }
    
    $newPassword = $request->password ?? (string) rand(100000, 999999);
    
    $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
    $user->must_change_password = true;
    $user->save();
    
    return response()->json([
        'message' => 'Password reset successfully',
        'tempPassword' => $newPassword
    ]);
});
Route::patch('/admin/networks/{id}/balance', function ($id, Request $request) {
    $network = \App\Models\Network::findOrFail($id);
    $validated = $request->validate([
        'balance' => 'required|numeric|min:0'
    ]);
    
    $network->balance = $validated['balance'];
    $network->save();
    
    // Also save transaction
    \App\Models\Transaction::create([
        'network_id' => $network->id,
        'type' => 'balance_adjustment',
        'amount' => $request->amount_delta ?? 0,
        'description' => $request->note ?? 'تعديل رصيد',
        'reference_number' => 'ADJ-' . time(),
    ]);

    return response()->json(['message' => 'Balance updated successfully', 'balance' => $network->balance]);
});
    // Card generation system has been disabled per user request.
Route::get('/networks/{id}/transactions', function ($id) {
    $network = \App\Models\Network::find($id);
    $currentBalance = $network ? $network->balance : 0;
    
    $transactions = \App\Models\Transaction::where('network_id', $id)->orderBy('created_at', 'desc')->get();
    
    $runningBalance = $currentBalance;
    $result = [];
    
    // We want to calculate the running balance exactly.
    // If we go backwards from newest to oldest, we subtract the delta to find the balance BEFORE that transaction.
    
    foreach ($transactions as $t) {
        $typeLabel = 'معاملة';
        $creditAmount = 0;
        $cashAmount = 0;
        $commissionAmount = 0;
        $balanceDelta = 0; // Amount added to or subtracted from the network balance
        
        $provider = 'النظام';
        $categoryName = null;
        
        if (str_contains($t->description, 'جيب') || stripos($t->description, 'jaib') !== false) $provider = 'جيب';
        elseif (str_contains($t->description, 'تداولات') || stripos($t->description, 'tadawulat') !== false) $provider = 'تداولات';
        elseif (str_contains($t->description, 'POS') || str_contains($t->description, 'نقطة بيع')) $provider = 'POS';

        if ($t->type === 'sale') {
            $typeLabel = 'مبيعات كروت';
            
            // Check for credit sale in description (POS)
            if (preg_match('/\(آجل:\s*([0-9.]+)\)/u', $t->description, $matches)) {
                $creditAmount = (float) $matches[1];
            }
            
            $cashAmount = $t->amount - $creditAmount;
            
            if (preg_match('/\(عمولة:\s*([0-9.]+)\)/u', $t->description, $matches)) {
                $commissionAmount = (float) $matches[1];
            } else {
                $commissionAmount = $t->amount * 0.025; // Legacy support
            }
            
            // Balance increases only by the wallet portion minus commission
            $balanceDelta = $cashAmount - $commissionAmount;

            if (preg_match('/فئة (.+?) -/u', $t->description, $matches) || preg_match('/فئة (.*)/u', $t->description, $matches)) {
                $categoryName = trim($matches[1]);
            } else {
                $categoryName = 'مبيعات كروت';
            }
        }
        elseif ($t->type === 'credit_sale') {
            $typeLabel = 'مبيعات آجلة';
            $creditAmount = $t->amount;
            $balanceDelta = 0; // Pure credit sale doesn't increase platform cash balance
            if (preg_match('/فئة (.+?) \(/u', $t->description, $matches)) {
                $categoryName = trim($matches[1]);
            }
        }
        elseif ($t->type === 'debt_settlement') {
            $typeLabel = 'سداد مديونية (نقداً)';
            $balanceDelta = 0; // Hand-to-hand cash does not affect the platform's electronic balance
            $cashAmount = $t->amount;
        }
        elseif ($t->type === 'withdrawal') {
            $typeLabel = 'سحب مالي';
            $balanceDelta = -abs($t->amount);
        }
        elseif ($t->type === 'balance_adjustment') {
            $typeLabel = 'تعديل رصيد';
            $balanceDelta = $t->amount; 
        }
        elseif ($t->type === 'commission') {
            $typeLabel = 'عمولة منصة';
            $balanceDelta = -abs($t->amount);
        }

        $result[] = [
            'id' => (string) $t->id,
            'date' => $t->created_at->format('Y-m-d'),
            'time' => $t->created_at->format('h:i A'),
            'type' => $t->type,
            'typeLabel' => $typeLabel,
            'provider' => $provider,
            'category' => $categoryName,
            'reference' => $t->reference_number ?? '',
            'amount' => (float) $t->amount,
            'creditAmount' => $creditAmount,
            'cashAmount' => $cashAmount,
            'commissionAmount' => $commissionAmount,
            'balanceDelta' => $balanceDelta,
            'balanceAfter' => $runningBalance,
            'status' => 'completed',
            'statusLabel' => 'ناجح'
        ];
        
        // Go back in time: subtract the delta to find the balance BEFORE this transaction
        $runningBalance -= $balanceDelta;
    }
    
    return response()->json($result);
});
Route::get('/admin/transactions', function () {
    $transactions = \App\Models\Transaction::with('network.user')->orderBy('created_at', 'desc')->take(20)->get();
    return response()->json($transactions->map(function($t) {
        return [
            'id' => (string) $t->id,
            'timestamp' => $t->created_at->toISOString(),
            'networkName' => $t->network ? $t->network->name : 'Unknown',
            'type' => $t->type,
            'typeLabel' => $t->type === 'sale' ? 'بيع كرت' : ($t->type === 'withdrawal' ? 'سحب رصيد' : 'تعديل رصيد'),
            'amount' => (float) $t->amount,
            'description' => $t->description ?? '',
            'reference' => $t->reference_number ?? '',
            'performedBy' => $t->network ? $t->network->owner_phone : 'Admin',
        ];
    }));
});
Route::get('/withdrawals', function () {
    $withdrawals = \App\Models\Withdrawal::with('network.user')->orderBy('created_at', 'desc')->get();
    return response()->json($withdrawals->map(function($w) {
        return [
            'id' => (string) $w->id,
            'requestNumber' => $w->request_number,
            'networkId' => (string) $w->network_id,
            'networkName' => $w->network ? $w->network->name : 'Unknown',
            'ownerName' => $w->network && $w->network->user ? $w->network->user->name : 'Unknown',
            'contactNumber' => $w->network ? $w->network->owner_phone : '',
            'payoutMethod' => $w->payout_method,
            'accountNumber' => $w->account_number,
            'recipientName' => $w->network && $w->network->user ? $w->network->user->name : '',
            'amount' => (float) $w->amount,
            'status' => $w->status,
            'requestedAt' => $w->created_at->toISOString(),
            'transactionRef' => $w->transaction_ref ?? '',
            'notes' => $w->notes ?? ''
        ];
    }));
});
Route::post('/withdrawals', function (Request $request) {
    // Attempt to get user from Sanctum if authenticated
    $user = $request->user();
    
    // If not authenticated (or token missing), fallback to network name lookup
    if (!$user) {
        $network = \App\Models\Network::where('name', $request->networkName)->first();
        if ($network) {
            $user = $network->user;
        }
    }
    
    if (!$user) {
        return response()->json(['error' => 'Network/User not found'], 404);
    }
    
    $network = \App\Models\Network::where('user_id', $user->id)->first();
    
    $validated = $request->validate([
        'amount' => 'required|numeric|min:1000',
        'provider' => 'required|string',
        'notes' => 'nullable|string'
    ]);

    if ($network->balance < $validated['amount']) {
        return response()->json(['error' => 'Insufficient balance'], 400);
    }

    $wd = \App\Models\Withdrawal::create([
        'network_id' => $network->id,
        'request_number' => 'WD-' . rand(1000, 9999) . '-' . time(),
        'payout_method' => $validated['provider'],
        'account_number' => $network->jaib_wallet ?? $network->owner_phone, // fallback to phone
        'amount' => $validated['amount'],
        'status' => 'pending',
        'notes' => $validated['notes'] ?? null
    ]);

    return response()->json($wd);
});
Route::patch('/withdrawals/{id}/status', function ($id, Request $request) {
    $validated = $request->validate([
        'status' => 'required|in:completed,rejected',
        'transactionRef' => 'nullable|string',
        'notes' => 'nullable|string'
    ]);
    
    $withdrawal = \App\Models\Withdrawal::findOrFail($id);
    $withdrawal->status = $validated['status'];
    if (isset($validated['transactionRef'])) $withdrawal->transaction_ref = $validated['transactionRef'];
    
    $withdrawal->save();
    
    if ($validated['status'] === 'completed') {
        \App\Models\Transaction::create([
            'network_id' => $withdrawal->network_id,
            'type' => 'withdrawal',
            'amount' => -$withdrawal->amount,
            'description' => $validated['notes'] ?? 'تم تحويل مبلغ السحب بنجاح',
            'reference_number' => $validated['transactionRef'] ?? 'WD-' . time(),
        ]);
    }
    
    return response()->json(['message' => 'Withdrawal updated successfully']);
});

Route::post('/edit-requests', function (Request $request) {
    // Assuming auth:sanctum is not fully applied to all routes in this quick prototype
    // we fetch user via networkCode or phone if not authenticated
    $user = $request->user();
    if (!$user) {
        $network = \App\Models\Network::where('network_code', $request->networkCode)->first();
        if ($network) $user = $network->user;
    }
    
    if (!$user) return response()->json(['error' => 'User not found'], 404);

    $req = \App\Models\NetworkDataEditRequest::create([
        'user_id' => $user->id,
        'reference_number' => $request->referenceNumber ?? 'MOD-' . time(),
        'network_code' => $request->networkCode,
        'network_name' => $request->networkName,
        'owner_name' => $request->ownerName,
        'contact_phone' => $request->contactPhone,
        'governorate' => $request->governorate,
        'city' => $request->city,
        'district' => $request->district,
        'jaib_wallet' => $request->jaibWallet,
        'admin_notes' => $request->adminNotes,
        'categories' => json_encode($request->categories ?? []),
        'previous_data' => json_encode($request->previousData ?? []),
        'status' => 'pending'
    ]);

    return response()->json($req);
});

Route::get('/admin/edit-requests', function () {
    $requests = \App\Models\NetworkDataEditRequest::orderBy('created_at', 'desc')->get();
    return response()->json($requests->map(function($r) {
        return [
            'id' => (string) $r->id,
            'referenceNumber' => $r->reference_number,
            'networkCode' => $r->network_code,
            'networkName' => $r->network_name,
            'ownerName' => $r->owner_name,
            'contactPhone' => $r->contact_phone,
            'governorate' => $r->governorate,
            'city' => $r->city,
            'district' => $r->district ?? '',
            'jaibWallet' => $r->jaib_wallet,
            'adminNotes' => $r->admin_notes ?? '',
            'categories' => is_string($r->categories) ? json_decode($r->categories, true) : ($r->categories ?? []),
            'previousData' => is_string($r->previous_data) ? json_decode($r->previous_data, true) : ($r->previous_data ?? []),
            'status' => $r->status,
            'createdAt' => $r->created_at->toISOString()
        ];
    }));
});

Route::patch('/admin/edit-requests/{id}/status', function ($id, Request $request) {
    $req = \App\Models\NetworkDataEditRequest::findOrFail($id);
    $req->status = $request->status;
    $req->save();

    if ($request->status === 'approved') {
        $network = \App\Models\Network::where('network_code', $req->network_code)->first();
        if ($network) {
            $network->name = $req->network_name;
            $network->governorate = $req->governorate;
            $network->city = $req->city;
            $network->neighborhood = $req->district;
            $network->owner_phone = $req->contact_phone;
            $network->jaib_wallet = $req->jaib_wallet;
            $network->save();
            
            if ($network->user) {
                $network->user->name = $req->owner_name;
                $network->user->phone = $req->contact_phone;
                $network->user->save();
            }

            // Update categories logic
            $rawCategories = $req->categories ?? [];
            $categoriesData = is_string($rawCategories) ? json_decode($rawCategories, true) : $rawCategories;
            
            // Just basic loop for categories
            foreach ($categoriesData as $catData) {
                $existing = \App\Models\CardCategory::where('network_id', $network->id)->where('name', $catData['name'])->first();
                if ($existing) {
                    $existing->price = $catData['price'];
                    $existing->mega = $catData['mb'] ?? 0;
                    $existing->hours = $catData['hours'] ?? 0;
                    $existing->validity_days = $catData['validityDays'] ?? 0;
                    $existing->card_type = $catData['cardType'] ?? 'مستخدم فقط';
                    $existing->save();
                } else {
                    \App\Models\CardCategory::create([
                        'network_id' => $network->id,
                        'name' => $catData['name'],
                        'price' => $catData['price'],
                        'mega' => $catData['mb'] ?? 0,
                        'hours' => $catData['hours'] ?? 0,
                        'validity_days' => $catData['validityDays'] ?? 0,
                        'card_type' => $catData['cardType'] ?? 'مستخدم فقط',
                        'stock' => 0,
                    ]);
                }
            }
        }
    }
    
    return response()->json(['message' => 'Status updated']);
});

Route::get('/admin/users', function () {
    $users = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->get();
    if ($users->isEmpty()) {
        return response()->json([
            [
                'id' => 'usr-1', 'name' => 'المدير العام المركز', 'email' => 'admin@karoot.ye', 
                'role' => 'الآدمن الرئيسي', 'phone' => '775945393', 'status' => 'نشط'
            ]
        ]);
    }
    return response()->json($users->map(function($u) {
        return [
            'id' => (string) $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role === 'super_admin' ? 'الآدمن الرئيسي' : 'مشرف حسابات',
            'phone' => $u->phone ?? 'غير متوفر',
            'status' => 'نشط'
        ];
    }));
});
Route::post('/admin/users', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string',
        'email' => 'required|email',
        'role' => 'required|string',
    ]);
    $role = str_contains($validated['role'], 'الآدمن الرئيسي') ? 'super_admin' : 'admin';
    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        'role' => $role,
        'must_change_password' => true
    ]);
    return response()->json([
        'id' => (string) $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $validated['role'],
        'phone' => 'غير متوفر',
        'status' => 'نشط'
    ]);
});
Route::get('/admin/settings', function () {
    $settings = \App\Models\SystemSetting::all()->pluck('value', 'key');
    return response()->json([
        'platformCommissionType' => $settings['platformCommissionType'] ?? 'fixed',
        'platformCommissionRate' => (float) ($settings['platformCommissionRate'] ?? 5),
        'supportPhone' => $settings['supportPhone'] ?? '784999804',
        'maintenanceMode' => filter_var($settings['maintenanceMode'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
        'autoApproveApplications' => filter_var($settings['autoApproveApplications'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
        'mikrotikGlobalPort' => $settings['mikrotikGlobalPort'] ?? '8728',
    ]);
});
Route::post('/admin/settings', function (Request $request) {
    $data = $request->all();
    foreach ($data as $key => $value) {
        if (in_array($key, ['platformCommissionType', 'platformCommissionRate', 'supportPhone', 'maintenanceMode', 'autoApproveApplications', 'mikrotikGlobalPort'])) {
            $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
            \App\Models\SystemSetting::updateOrCreate(['key' => $key], ['value' => $valStr]);
        }
    }
    return response()->json(['message' => 'Settings updated successfully']);
});

// Admin POS Management Endpoints
Route::get('/admin/pos', function () {
    $posUsers = \App\Models\User::where('role', 'pos')->with('posProfile')->get();
    return response()->json($posUsers->map(function ($u) {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'phone' => $u->phone,
            'wallet_balance' => $u->wallet_balance,
            'shop_name' => $u->posProfile ? $u->posProfile->shop_name : null,
            'otp_code' => $u->posProfile ? $u->posProfile->otp_code : null,
            'status' => $u->posProfile ? $u->posProfile->status : 'active',
            'created_at' => $u->created_at,
        ];
    }));
});
Route::patch('/admin/pos/{id}/balance', function ($id, Request $request) {
    $validated = $request->validate(['balance' => 'required|numeric|min:0']);
    $user = \App\Models\User::where('role', 'pos')->findOrFail($id);
    $user->wallet_balance = $validated['balance'];
    $user->save();
    return response()->json(['message' => 'تم تحديث رصيد المحفظة', 'balance' => $user->wallet_balance]);
});
Route::get('/admin/pos-recharges', function () {
    return response()->json(\App\Models\WalletRecharge::with('user')->orderBy('created_at', 'desc')->get());
});
Route::patch('/admin/pos-recharges/{id}/status', function ($id, Request $request) {
    $validated = $request->validate(['status' => 'required|in:approved,rejected']);
    $recharge = \App\Models\WalletRecharge::findOrFail($id);
    if ($recharge->status !== 'pending') return response()->json(['error' => 'تم التعامل مع هذا الطلب مسبقاً'], 400);
    
    $recharge->status = $validated['status'];
    $recharge->save();

    if ($validated['status'] === 'approved') {
        $user = clone $recharge->user;
        $user->increment('wallet_balance', $recharge->amount);
    }
    return response()->json(['message' => 'تم تحديث حالة الطلب']);
});

// Network Owner POS Memberships Endpoints
Route::get('/networks/{id}/pos-memberships', function ($id) {
    $memberships = \App\Models\NetworkPosMembership::where('network_id', $id)->with('user')->get();
    return response()->json($memberships);
});

Route::get('/networks/{id}/pos-packages', function ($id) {
    $packages = \App\Models\CardCategory::where('network_id', $id)->get();
    return response()->json($packages);
});

Route::patch('/networks/{id}/pos-packages/{package_id}/price', function ($id, $package_id, Request $request) {
    $package = \App\Models\CardCategory::where('network_id', $id)->findOrFail($package_id);
    $package->pos_price = $request->pos_price;
    $package->save();
    return response()->json(['message' => 'تم تحديث السعر الخاص بنقاط البيع بنجاح']);
});
Route::post('/networks/{id}/pos-memberships', function ($id, Request $request) {
    $validated = $request->validate([
        'phone' => 'required|string',
    ]);
    $user = \App\Models\User::where('phone', $validated['phone'])->where('role', 'pos')->first();
    if (!$user) return response()->json(['error' => 'لم يتم العثور على نقطة البيع بهذا الرقم'], 404);

    $membership = \App\Models\NetworkPosMembership::firstOrCreate([
        'network_id' => $id,
        'user_id' => $user->id
    ], [
        'credit_limit' => 0,
        'current_debt' => 0,
        'status' => 'active'
    ]);
    return response()->json(['message' => 'تم إضافة نقطة البيع', 'membership' => $membership->load('user')]);
});
Route::patch('/networks/{id}/pos-memberships/{membership_id}', function ($id, $membership_id, Request $request) {
    $membership = \App\Models\NetworkPosMembership::where('network_id', $id)->findOrFail($membership_id);
    if ($request->has('credit_limit')) $membership->credit_limit = $request->credit_limit;
    if ($request->has('status')) $membership->status = $request->status;
    $membership->save();
    return response()->json(['message' => 'تم تحديث بيانات نقطة البيع']);
});
Route::post('/networks/{id}/pos-memberships/{membership_id}/pay-debt', function ($id, $membership_id, Request $request) {
    $validated = $request->validate(['amount' => 'required|numeric|min:1']);
    $membership = \App\Models\NetworkPosMembership::where('network_id', $id)->findOrFail($membership_id);
    
    if ($membership->current_debt < $validated['amount']) {
        return response()->json(['error' => 'المبلغ المدفوع أكبر من الديون الحالية'], 400);
    }
    
    $membership->decrement('current_debt', $validated['amount']);

    $userName = $membership->user ? $membership->user->name : 'غير معروف';

    // إنشاء قيد محاسبي يوثق العملية (سداد ديون يداً بيد)
    \App\Models\Transaction::create([
        'network_id' => $id,
        'type' => 'debt_settlement',
        'amount' => $validated['amount'],
        'description' => "تسديد مديونية نقداً (يداً بيد) من نقطة البيع: {$userName}",
        'reference_number' => 'SETTLEMENT-' . time(),
    ]);

    return response()->json(['message' => 'تم سداد الدفعة بنجاح', 'current_debt' => $membership->current_debt]);
});

// POS Auth Endpoints
Route::post('/pos/auth/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string',
        'phone' => 'required|string|unique:users',
        'password' => 'required|string|min:6',
        'shop_name' => 'required|string',
        'address' => 'nullable|string',
    ]);

    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'phone' => $validated['phone'],
        'email' => 'pos_' . $validated['phone'] . '@misternetwork.local', // Dummy email to satisfy DB constraints
        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        'role' => 'pos',
    ]);

    $otpCode = (string) rand(100000, 999999);

    \App\Models\PosProfile::create([
        'user_id' => $user->id,
        'shop_name' => $validated['shop_name'],
        'address' => $validated['address'],
        'status' => 'pending',
        'otp_code' => $otpCode,
    ]);

    // Return OTP in response temporarily to help the mobile dev during testing
    return response()->json([
        'message' => 'تم إنشاء الحساب، يرجى إدخال رمز التحقق OTP.',
        'test_otp_code' => $otpCode, // Only for testing phase
        'user' => $user
    ]);
});

Route::post('/pos/auth/verify-otp', function (Request $request) {
    $validated = $request->validate([
        'phone' => 'required|string',
        'otp_code' => 'required|string'
    ]);

    $user = \App\Models\User::where('phone', $validated['phone'])->where('role', 'pos')->first();
    if (!$user) return response()->json(['error' => 'حساب غير موجود'], 404);

    $profile = \App\Models\PosProfile::where('user_id', $user->id)->first();
    if (!$profile || $profile->otp_code !== $validated['otp_code']) {
        return response()->json(['error' => 'رمز التحقق غير صحيح'], 400);
    }

    $profile->status = 'active';
    $profile->otp_code = null; // clear OTP after success
    $profile->save();

    $token = $user->createToken('pos-token')->plainTextToken;
    return response()->json(['message' => 'تم التحقق بنجاح', 'token' => $token, 'user' => $user]);
});

Route::post('/pos/auth/login', function (Request $request) {
    $validated = $request->validate([
        'phone' => 'required|string',
        'password' => 'required|string',
    ]);

    $user = \App\Models\User::where('phone', $validated['phone'])->where('role', 'pos')->first();

    if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
        return response()->json(['error' => 'رقم الهاتف أو كلمة المرور غير صحيحة'], 401);
    }

    $token = $user->createToken('pos-token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => $user]);
});

Route::post('/pos/auth/forgot-password', function (Request $request) {
    $request->validate(['phone' => 'required|string']);
    $user = \App\Models\User::where('phone', $request->phone)->where('role', 'pos')->first();
    if (!$user) return response()->json(['error' => 'الحساب غير موجود'], 404);
    
    // In production, send SMS. For now, generate and return test OTP.
    $otp = (string) rand(100000, 999999);
    $profile = $user->posProfile;
    if($profile) {
        $profile->otp_code = $otp;
        $profile->save();
    }
    return response()->json(['message' => 'تم إرسال كود الاستعادة', 'test_otp_code' => $otp]);
});

Route::post('/pos/auth/reset-password', function (Request $request) {
    $request->validate(['phone' => 'required|string', 'otp_code' => 'required|string', 'new_password' => 'required|string|min:6']);
    $user = \App\Models\User::where('phone', $request->phone)->where('role', 'pos')->first();
    if (!$user) return response()->json(['error' => 'الحساب غير موجود'], 404);
    
    $profile = $user->posProfile;
    if (!$profile || $profile->otp_code !== $request->otp_code) {
        return response()->json(['error' => 'كود التحقق غير صحيح'], 400);
    }
    
    $user->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
    $user->save();
    $profile->otp_code = null;
    $profile->save();
    
    return response()->json(['message' => 'تم إعادة تعيين كلمة المرور بنجاح']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/pos/auth/change-password', function (Request $request) {
        $request->validate(['current_password' => 'required', 'new_password' => 'required|min:6']);
        $user = $request->user();
        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'كلمة المرور الحالية غير صحيحة'], 400);
        }
        $user->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
        $user->save();
        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح']);
    });

    Route::get('/pos/profile', function (Request $request) {
        $user = $request->user()->load('posProfile');
        return response()->json([
            'name' => $user->name,
            'phone' => $user->phone,
            'shop_name' => $user->posProfile->shop_name ?? '',
            'address' => $user->posProfile->address ?? '',
            'commercial_reg' => $user->posProfile->commercial_reg ?? ''
        ]);
    });

    Route::post('/pos/profile', function (Request $request) {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'nullable|string',
            'shop_name' => 'nullable|string',
            'address' => 'nullable|string',
            'commercial_reg' => 'nullable|string'
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
            $user->save();
        }

        if ($user->posProfile) {
            $user->posProfile->update($request->only(['shop_name', 'address', 'commercial_reg']));
        }
        
        return response()->json(['message' => 'تم تحديث الملف الشخصي بنجاح']);
    });
});



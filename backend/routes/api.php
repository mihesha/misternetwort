<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\AdminNetworkApplicationController;

use App\Http\Controllers\CardController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminNetworkController;
use App\Http\Controllers\AdminCardManagementController;
use App\Http\Controllers\AdminWithdrawalController;
use App\Http\Controllers\AdminEditRequestController;
use App\Http\Controllers\AdminPosMembershipController;

use App\Http\Controllers\PosAuthController;
use App\Http\Controllers\MobileAppIntegrationController;


// Public Wallet / Purchase Endpoints
Route::get('/wallet/network/{networkCode}', [NetworkController::class, 'getByCode']);


Route::post('/cards/generate-batch', [CardController::class, 'generateBatch']);
Route::post('/wallet/purchase-card', [CardController::class, 'purchase']);

// App Deposits API
Route::post('/app/deposits', [MobileAppIntegrationController::class, 'storeDeposit']);

// App OTP Gateway API
Route::get('/app/otp-tasks', [MobileAppIntegrationController::class, 'getOtpTasks']);
Route::post('/app/otp-tasks/callback', [MobileAppIntegrationController::class, 'updateOtpTask']);

// App Card Dispatcher API
Route::get('/app/card-tasks', [MobileAppIntegrationController::class, 'getCardTasks']);
Route::post('/app/card-tasks/callback', [MobileAppIntegrationController::class, 'updateCardTask']);

Route::get('/networks/search', [NetworkController::class, 'searchNetworks']);

Route::get('/networks/{code}', [NetworkController::class, 'getNetworkByCode']);

Route::get('/networks/{code}/packages', [NetworkController::class, 'getNetworkPackagesByCode']);

// Auth Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Customer Auth Endpoints
Route::post('/customer/register', [AuthController::class, 'customerRegister']);
Route::post('/customer/login', [AuthController::class, 'customerLogin']);
Route::post('/customer/auth/verify-otp', [AuthController::class, 'customerVerifyOtp']);
Route::post('/customer/auth/resend-otp', [AuthController::class, 'customerResendOtp']);
Route::post('/customer/auth/forgot-password', [AuthController::class, 'customerForgotPassword']);
Route::post('/customer/auth/check-otp', [AuthController::class, 'customerCheckOtp']);
Route::post('/customer/auth/reset-password', [AuthController::class, 'customerResetPassword']);
Route::get('/customer/purchases', [CardController::class, 'myPurchases'])->middleware('auth:sanctum');

Route::get('/admin/customers', [AdminCustomerController::class, 'getCustomers']);

Route::get('/admin/customers/{id}/details', [AdminCustomerController::class, 'getCustomerDetails']);

// Public Requests (Joining Form)
Route::post('/requests', [NetworkController::class, 'submitApplication']);
Route::get('/requests', [AdminNetworkApplicationController::class, 'getApplications']);
Route::patch('/requests/{id}/status', [AdminNetworkApplicationController::class, 'updateApplicationStatus']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
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


// Admin Dashboard Endpoints
Route::get('/admin/app-deposits', [AdminDashboardController::class, 'getAppDeposits']);
Route::patch('/admin/app-deposits/{id}/status', [AdminDashboardController::class, 'updateAppDepositStatus']);
Route::get('/admin/stats', [AdminDashboardController::class, 'getStats']);
Route::get('/admin/transactions', [AdminDashboardController::class, 'getTransactions']);
Route::get('/admin/users', [AdminDashboardController::class, 'getUsers']);
Route::post('/admin/users', [AdminDashboardController::class, 'storeUser']);
Route::get('/admin/settings', [AdminDashboardController::class, 'getSettings']);
Route::post('/admin/settings', [AdminDashboardController::class, 'updateSettings']);
Route::get('/admin/pos', [AdminDashboardController::class, 'getPosUsers']);
Route::patch('/admin/pos/{id}/balance', [AdminDashboardController::class, 'updatePosBalance']);
Route::get('/admin/pos-recharges', [AdminDashboardController::class, 'getPosRecharges']);
Route::patch('/admin/pos-recharges/{id}/status', [AdminDashboardController::class, 'updatePosRechargeStatus']);

// Admin Network Endpoints
Route::get('/admin/networks', [AdminNetworkController::class, 'index']);
Route::post('/admin/networks', [AdminNetworkController::class, 'store']);
Route::post('/networks/{id}/import-cards', [AdminCardManagementController::class, 'importCards']);
Route::get('/admin/networks/{id}/cards', [AdminCardManagementController::class, 'getCards']);
Route::get('/admin/networks/{id}/card-batches', [AdminCardManagementController::class, 'getCardBatches']);
Route::delete('/admin/networks/{id}/card-batches/{batch_id}', [AdminCardManagementController::class, 'destroyCardBatch']);
Route::delete('/admin/networks/{id}/cards/{card_id}', [AdminCardManagementController::class, 'destroyCard']);
Route::patch('/admin/networks/{id}', [AdminNetworkController::class, 'updateNetwork']);
Route::post('/admin/networks/{id}/reset-password', [AdminNetworkController::class, 'resetPassword']);
Route::patch('/admin/networks/{id}/balance', [AdminNetworkController::class, 'updateBalance']);
Route::get('/networks/{id}/transactions', [AdminNetworkController::class, 'getTransactions']);
Route::get('/withdrawals', [AdminWithdrawalController::class, 'getWithdrawals']);
Route::post('/withdrawals', [AdminWithdrawalController::class, 'storeWithdrawal']);
Route::patch('/withdrawals/{id}/status', [AdminWithdrawalController::class, 'updateWithdrawalStatus']);
Route::post('/edit-requests', [AdminEditRequestController::class, 'storeEditRequest']);
Route::get('/admin/edit-requests', [AdminEditRequestController::class, 'getEditRequests']);
Route::patch('/admin/edit-requests/{id}/status', [AdminEditRequestController::class, 'updateEditRequestStatus']);
Route::get('/networks/{id}/pos-memberships', [AdminPosMembershipController::class, 'getPosMemberships']);
Route::post('/networks/{id}/pos-memberships', [AdminPosMembershipController::class, 'storePosMembership']);
Route::patch('/networks/{id}/pos-memberships/{membership_id}', [AdminPosMembershipController::class, 'updatePosMembership']);
Route::post('/networks/{id}/pos-memberships/{membership_id}/pay-debt', [AdminPosMembershipController::class, 'payDebtPosMembership']);
Route::get('/networks/{id}/pos-packages', [AdminPosMembershipController::class, 'getPosPackages']);
Route::patch('/networks/{id}/pos-packages/{package_id}/price', [AdminPosMembershipController::class, 'updatePosPackagePrice']);

Route::get('/admin/pos/{id}/details', [PosController::class, 'getAdminPosDetails']);
Route::get('/networks/{id}/pos-memberships/{user_id}/details', [PosController::class, 'getOwnerPosDetails']);

// POS Auth Endpoints
Route::post('/pos/auth/register', [PosAuthController::class, 'register']);
Route::post('/pos/auth/verify-otp', [PosAuthController::class, 'verifyOtp']);
Route::post('/pos/auth/login', [PosAuthController::class, 'login']);
Route::post('/pos/auth/forgot-password', [PosAuthController::class, 'forgotPassword']);
Route::post('/pos/auth/reset-password', [PosAuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/pos/auth/change-password', [PosAuthController::class, 'changePassword']);
    Route::get('/pos/profile', [PosAuthController::class, 'getProfile']);
    Route::post('/pos/profile', [PosAuthController::class, 'updateProfile']);
});



<?php

namespace App\Http\Controllers;

use App\Models\AppDeposit;
use App\Models\NetworkApplication;
use App\Models\Network;
use App\Models\Withdrawal;
use App\Models\Transaction;
use App\Models\User;
use App\Models\SystemSetting;
use App\Models\WalletRecharge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminDashboardController extends Controller
{
    public function getAppDeposits()
    {
        return response()->json(AppDeposit::orderBy('created_at', 'desc')->get());
    }

    public function updateAppDepositStatus($id, Request $request)
    {
        $request->validate(['status' => 'required|in:confirmed,pending']);
        $deposit = AppDeposit::findOrFail($id);
        
        if ($deposit->status !== 'used') {
            $deposit->status = $request->status;
            $deposit->save();
        }
        
        return response()->json(['message' => 'Status updated']);
    }

    public function getStats()
    {
        return response()->json([
            'totalApplications' => NetworkApplication::count() ?? 0,
            'pendingApplications' => NetworkApplication::where('status', 'pending')->count() ?? 0,
            'approvedNetworks' => Network::count() ?? 0,
            'activeNetworksCount' => Network::where('status', 'active')->count() ?? 0,
            'totalSystemBalance' => Network::sum('balance') ?? 0,
            'totalSalesVolume' => Network::sum('total_sales') ?? 0,
            'totalWithdrawalsCompleted' => Withdrawal::where('status', 'completed')->count() ?? 0,
            'pendingWithdrawalsCount' => Withdrawal::where('status', 'pending')->count() ?? 0,
            'pendingWithdrawalsAmount' => Withdrawal::where('status', 'pending')->sum('amount') ?? 0,
            'totalPlatformCommissions' => (Network::sum('total_sales') * 0.025) ?? 0,
        ]);
    }

    public function getTransactions()
    {
        $transactions = Transaction::with('network.user')->orderBy('created_at', 'desc')->take(20)->get();
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
    }

    public function getUsers()
    {
        $users = User::whereIn('role', ['admin', 'super_admin'])->get();
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
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'role' => 'required|string',
        ]);
        
        $role = str_contains($validated['role'], 'الآدمن الرئيسي') ? 'super_admin' : 'admin';
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password123'),
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
    }

    public function getSettings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        return response()->json([
            'platformCommissionType' => $settings['platformCommissionType'] ?? 'fixed',
            'platformCommissionRate' => (float) ($settings['platformCommissionRate'] ?? 5),
            'supportPhone' => $settings['supportPhone'] ?? '784999804',
            'maintenanceMode' => filter_var($settings['maintenanceMode'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
            'autoApproveApplications' => filter_var($settings['autoApproveApplications'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
            'mikrotikGlobalPort' => $settings['mikrotikGlobalPort'] ?? '8728',
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();
        foreach ($data as $key => $value) {
            if (in_array($key, ['platformCommissionType', 'platformCommissionRate', 'supportPhone', 'maintenanceMode', 'autoApproveApplications', 'mikrotikGlobalPort'])) {
                $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
                SystemSetting::updateOrCreate(['key' => $key], ['value' => $valStr]);
            }
        }
        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getPosUsers()
    {
        $posUsers = User::where('role', 'pos')->with('posProfile')->get();
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
    }

    public function updatePosBalance($id, Request $request)
    {
        $validated = $request->validate(['balance' => 'required|numeric|min:0']);
        $user = User::where('role', 'pos')->findOrFail($id);
        $user->wallet_balance = $validated['balance'];
        $user->save();
        return response()->json(['message' => 'تم تحديث رصيد المحفظة', 'balance' => $user->wallet_balance]);
    }

    public function getPosRecharges()
    {
        return response()->json(WalletRecharge::with('user')->orderBy('created_at', 'desc')->get());
    }

    public function updatePosRechargeStatus($id, Request $request)
    {
        $validated = $request->validate(['status' => 'required|in:approved,rejected']);
        $recharge = WalletRecharge::findOrFail($id);
        
        if ($recharge->status !== 'pending') {
            return response()->json(['error' => 'تم التعامل مع هذا الطلب مسبقاً'], 400);
        }
        
        $recharge->status = $validated['status'];
        $recharge->save();

        if ($validated['status'] === 'approved') {
            $user = clone $recharge->user;
            $user->increment('wallet_balance', $recharge->amount);
        }
        
        return response()->json(['message' => 'تم تحديث حالة الطلب']);
    }
}

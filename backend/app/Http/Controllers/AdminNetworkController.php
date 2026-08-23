<?php

namespace App\Http\Controllers;

use App\Models\Network;
use App\Models\User;
use App\Models\CardCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminNetworkController extends Controller
{
    public function index()
    {
        return response()->json(Network::with(['cardCategories', 'user'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'networkName' => 'required|string',
            'ownerName' => 'required|string',
            'contactNumber' => 'required|string',
            'governorate' => 'required|string',
            'city' => 'required|string',
            'jaibWalletNumber' => 'nullable|string'
        ]);

        $user = User::firstOrCreate(
            ['phone' => $validated['contactNumber']],
            [
                'name' => $validated['ownerName'],
                'email' => $validated['contactNumber'] . '@example.com',
                'password' => Hash::make('12345678'),
                'role' => 'network_owner',
                'must_change_password' => true
            ]
        );

        $network = clone Network::create([
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

        $defaultCats = [
            ['name' => '100', 'price' => 100, 'mega' => 100, 'hours' => 2],
            ['name' => '200', 'price' => 250, 'mega' => 300, 'hours' => 6],
            ['name' => '500', 'price' => 500, 'mega' => 1000, 'hours' => 24]
        ];

        foreach ($defaultCats as $cat) {
            CardCategory::create([
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
    }

    public function updateNetwork($id, Request $request)
    {
        $network = Network::findOrFail($id);
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
        
        $user = User::find($network->user_id);
        if ($user) {
            $user->name = $validated['ownerName'];
            $user->phone = $validated['contactNumber'];
            $user->save();
        }
        
        return response()->json(['message' => 'Network updated successfully']);
    }

    public function resetPassword($id, Request $request)
    {
        $network = Network::findOrFail($id);
        $user = User::find($network->user_id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        $newPassword = $request->password ?? (string) rand(100000, 999999);
        
        $user->password = Hash::make($newPassword);
        $user->must_change_password = true;
        $user->save();
        
        return response()->json([
            'message' => 'Password reset successfully',
            'tempPassword' => $newPassword
        ]);
    }

    public function updateBalance($id, Request $request)
    {
        $network = Network::findOrFail($id);
        $validated = $request->validate([
            'balance' => 'required|numeric|min:0'
        ]);
        
        $network->balance = $validated['balance'];
        $network->save();
        
        Transaction::create([
            'network_id' => $network->id,
            'type' => 'balance_adjustment',
            'amount' => $request->amount_delta ?? 0,
            'description' => $request->note ?? 'تعديل رصيد',
            'reference_number' => 'ADJ-' . time(),
        ]);

        return response()->json(['message' => 'Balance updated successfully', 'balance' => $network->balance]);
    }

    public function getTransactions($id)
    {
        $network = Network::find($id);
        $currentBalance = $network ? $network->balance : 0;
        
        $transactions = Transaction::where('network_id', $id)->orderBy('created_at', 'desc')->get();
        
        $runningBalance = $currentBalance;
        $result = [];
        
        foreach ($transactions as $t) {
            $typeLabel = 'معاملة';
            $creditAmount = 0;
            $cashAmount = 0;
            $commissionAmount = 0;
            $balanceDelta = 0; 
            
            $provider = 'النظام';
            $categoryName = null;
            
            if (str_contains($t->description, 'جيب') || stripos($t->description, 'jaib') !== false) $provider = 'جيب';
            elseif (str_contains($t->description, 'تداولات') || stripos($t->description, 'tadawulat') !== false) $provider = 'تداولات';
            elseif (str_contains($t->description, 'POS') || str_contains($t->description, 'نقطة بيع')) $provider = 'POS';

            if ($t->type === 'sale') {
                $typeLabel = 'مبيعات كروت';
                
                if (preg_match('/\(آجل:\s*([0-9.]+)\)/u', $t->description, $matches)) {
                    $creditAmount = (float) $matches[1];
                }
                
                $cashAmount = $t->amount - $creditAmount;
                
                if (preg_match('/\(عمولة:\s*([0-9.]+)\)/u', $t->description, $matches)) {
                    $commissionAmount = (float) $matches[1];
                } else {
                    $commissionAmount = $t->amount * 0.025;
                }
                
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
                $balanceDelta = 0; 
                if (preg_match('/فئة (.+?) \(/u', $t->description, $matches)) {
                    $categoryName = trim($matches[1]);
                }
            }
            elseif ($t->type === 'debt_settlement') {
                $typeLabel = 'سداد مديونية (نقداً)';
                $balanceDelta = 0; 
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
                'date' => $t->created_at->setTimezone('Asia/Aden')->format('Y-m-d'),
                'time' => $t->created_at->setTimezone('Asia/Aden')->format('h:i A'),
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
            
            $runningBalance -= $balanceDelta;
        }
        
        return response()->json($result);
    }
}
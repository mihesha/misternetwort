<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\Transaction;
use App\Models\Network;
use Illuminate\Http\Request;

class AdminWithdrawalController extends Controller
{
    public function getWithdrawals(Request $request)
    {
        $query = Withdrawal::with(['network.user', 'user'])->orderBy('created_at', 'desc');

        if ($request->has('network_id')) {
            $query->where('network_id', $request->network_id);
        }

        $withdrawals = $query->get();
        return response()->json($withdrawals->map(function($w) {
            return [
                'id' => (string) $w->id,
                'requestNumber' => $w->request_number,
                'networkId' => $w->network_id ? (string) $w->network_id : null,
                'userId' => $w->user_id ? (string) $w->user_id : null,
                'networkName' => $w->network ? $w->network->name : ($w->user ? 'وكيل: ' . $w->user->name : 'Unknown'),
                'ownerName' => $w->network && $w->network->user ? $w->network->user->name : ($w->user ? $w->user->name : 'Unknown'),
                'contactNumber' => $w->network ? $w->network->owner_phone : ($w->user ? $w->user->phone : ''),
                'payoutMethod' => $w->payout_method,
                'accountNumber' => $w->account_number,
                'recipientName' => $w->network && $w->network->user ? $w->network->user->name : ($w->user ? $w->user->name : ''),
                'gateway' => $w->network ? ($w->network->gateway ?? 'north') : 'north',
                'amount' => (float) $w->amount,
                'status' => $w->status,
                'requestedAt' => $w->created_at->toISOString(),
                'transactionRef' => $w->transaction_ref ?? '',
                'notes' => $w->notes ?? ''
            ];
        }));
    }

    public function storeWithdrawal(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            $network = Network::where('name', $request->networkName)->first();
            if ($network) {
                $user = $network->user;
            }
        }
        
        if (!$user) {
            return response()->json(['error' => 'Network/User not found'], 404);
        }
        
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'provider' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        if ($user->role === 'agent') {
            if ($user->wallet_balance < $validated['amount']) {
                return response()->json(['error' => 'Insufficient balance'], 400);
            }
            $wd = Withdrawal::create([
                'user_id' => $user->id,
                'request_number' => 'WD-A-' . rand(1000, 9999) . '-' . time(),
                'payout_method' => $validated['provider'],
                'account_number' => $user->jaib_wallet ?? $user->phone,
                'amount' => $validated['amount'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null
            ]);
            
            // Deduct immediately
            $user->wallet_balance -= $validated['amount'];
            $user->save();
            
            return response()->json($wd);
        } else {
            $netId = $request->network_id ?? $request->networkId;
            $netCode = $request->networkCode ?? $request->network_code;
            $netName = $request->networkName;

            $network = null;
            if ($netId) {
                $network = $user->networks()->where('id', $netId)->first();
            } elseif ($netCode) {
                $network = $user->networks()->where('network_code', $netCode)->first();
            } elseif ($netName) {
                $network = $user->networks()->where('name', $netName)->first();
            } else {
                $network = $user->networks()->first();
            }

            if (!$network) return response()->json(['error' => 'الشبكة غير موجودة أو غير تابعة لك'], 404);
            if ($network->balance < $validated['amount']) {
                return response()->json(['error' => 'الرصيد المتاح في هذه الشبكة غير كافٍ لإتمام طلب السحب'], 400);
            }

            // Enforce gateway specific provider rules
            $normalizedProvider = strtolower(trim($validated['provider']));
            $isShilin = in_array($normalizedProvider, ['shilin', 'شلن', 'محفظة شلن']);
            $isJaib = in_array($normalizedProvider, ['jaib', 'جيب', 'محفظة جيب']);

            if ($network->gateway === 'south' && !$isShilin) {
                return response()->json([
                    'error' => 'هذه الشبكة مسجلة في بوابة الجنوب، مزود السحب المعتمد هو محفظة شلن حصراً ولا يمكن اختيار مزود آخر.'
                ], 422);
            }
            if (($network->gateway === 'north' || empty($network->gateway)) && !$isJaib) {
                return response()->json([
                    'error' => 'هذه الشبكة مسجلة في بوابة الشمال، مزود السحب المعتمد هو محفظة جيب حصراً ولا يمكن اختيار مزود آخر.'
                ], 422);
            }

            $payoutMethodFormatted = ($network->gateway === 'south') ? 'محفظة شلن' : 'محفظة جيب';

            $wd = Withdrawal::create([
                'network_id' => $network->id,
                'request_number' => 'WD-' . rand(1000, 9999) . '-' . time(),
                'payout_method' => $payoutMethodFormatted,
                'account_number' => $network->jaib_wallet ?? $network->owner_phone,
                'amount' => $validated['amount'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null
            ]);
            
            // Deduct immediately from the specific network balance
            $network->balance -= $validated['amount'];
            $network->save();
            
            return response()->json($wd);
        }
    }

    public function updateWithdrawalStatus($id, Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,rejected',
            'transactionRef' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);
        
        $withdrawal = Withdrawal::findOrFail($id);
        $withdrawal->status = $validated['status'];
        if (isset($validated['transactionRef'])) $withdrawal->transaction_ref = $validated['transactionRef'];
        
        $withdrawal->save();
        
        if ($validated['status'] === 'completed') {
            if ($withdrawal->network_id) {
                Transaction::create([
                    'network_id' => $withdrawal->network_id,
                    'type' => 'withdrawal',
                    'amount' => -$withdrawal->amount,
                    'description' => $validated['notes'] ?? 'تم تحويل مبلغ السحب بنجاح',
                    'reference_number' => $validated['transactionRef'] ?? 'WD-' . time(),
                ]);
            } elseif ($withdrawal->user_id) {
                \App\Models\AgentTransaction::create([
                    'agent_id' => $withdrawal->user_id,
                    'network_id' => null,
                    'type' => 'withdrawal',
                    'amount' => $withdrawal->amount,
                    'description' => $validated['notes'] ?? 'تم تحويل مبلغ السحب بنجاح'
                ]);
            }
        } elseif ($validated['status'] === 'rejected') {
            // Refund the balance
            if ($withdrawal->network_id) {
                $net = Network::find($withdrawal->network_id);
                if($net) {
                    $net->balance += $withdrawal->amount;
                    $net->save();
                }
            } elseif ($withdrawal->user_id) {
                $usr = \App\Models\User::find($withdrawal->user_id);
                if($usr) {
                    $usr->wallet_balance += $withdrawal->amount;
                    $usr->save();
                }
            }
        }
        
        return response()->json(['message' => 'Withdrawal updated successfully']);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\Transaction;
use App\Models\Network;
use Illuminate\Http\Request;

class AdminWithdrawalController extends Controller
{
    public function getWithdrawals()
    {
        $withdrawals = Withdrawal::with(['network.user', 'user'])->orderBy('created_at', 'desc')->get();
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
            $network = Network::where('user_id', $user->id)->first();
            if (!$network) return response()->json(['error' => 'Network not found'], 404);
            if ($network->balance < $validated['amount']) {
                return response()->json(['error' => 'Insufficient balance'], 400);
            }

            $wd = Withdrawal::create([
                'network_id' => $network->id,
                'request_number' => 'WD-' . rand(1000, 9999) . '-' . time(),
                'payout_method' => $validated['provider'],
                'account_number' => $network->jaib_wallet ?? $network->owner_phone,
                'amount' => $validated['amount'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null
            ]);
            
            // Deduct immediately
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
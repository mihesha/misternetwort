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
        $withdrawals = Withdrawal::with('network.user')->orderBy('created_at', 'desc')->get();
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
        
        $network = Network::where('user_id', $user->id)->first();
        
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'provider' => 'required|string',
            'notes' => 'nullable|string'
        ]);

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

        return response()->json($wd);
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
            Transaction::create([
                'network_id' => $withdrawal->network_id,
                'type' => 'withdrawal',
                'amount' => -$withdrawal->amount,
                'description' => $validated['notes'] ?? 'تم تحويل مبلغ السحب بنجاح',
                'reference_number' => $validated['transactionRef'] ?? 'WD-' . time(),
            ]);
        }
        
        return response()->json(['message' => 'Withdrawal updated successfully']);
    }
}
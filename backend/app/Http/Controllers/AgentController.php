<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Network;
use App\Models\AgentTransaction;
use App\Models\Withdrawal;

class AgentController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'agent') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $totalNetworks = Network::where('agent_id', $user->id)->count();
        $totalEarnings = AgentTransaction::where('agent_id', $user->id)->where('type', 'commission')->sum('amount');
        
        return response()->json([
            'balance' => (float) $user->wallet_balance,
            'total_networks' => $totalNetworks,
            'total_earnings' => (float) $totalEarnings
        ]);
    }

    public function getNetworks(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'agent') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $networks = Network::where('agent_id', $user->id)
            ->get()->map(function($net) {
                return [
                    'id' => $net->id,
                    'name' => $net->name,
                    'network_code' => $net->network_code,
                    'status' => $net->status,
                    'total_sales' => (float) $net->total_sales,
                    'created_at' => $net->created_at,
                ];
            });
            
        return response()->json($networks);
    }

    public function getTransactions(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'agent') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $transactions = AgentTransaction::where('agent_id', $user->id)
            ->with('network')
            ->orderBy('created_at', 'desc')
            ->get()->map(function($t) {
                return [
                    'id' => $t->id,
                    'amount' => (float) $t->amount,
                    'type' => $t->type, // commission or withdrawal
                    'description' => $t->description,
                    'reference_number' => $t->reference_number,
                    'created_at' => $t->created_at,
                    'network_name' => $t->network ? $t->network->name : null,
                ];
            });
            
        return response()->json($transactions);
    }

    public function getWithdrawals(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'agent') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()->map(function($w) {
                return [
                    'id' => (string) $w->id,
                    'requestNumber' => $w->request_number,
                    'amount' => (float) $w->amount,
                    'status' => $w->status,
                    'payoutMethod' => $w->payout_method,
                    'accountNumber' => $w->account_number,
                    'requestedAt' => $w->created_at->toISOString(),
                    'notes' => $w->notes
                ];
            });
            
        return response()->json($withdrawals);
    }
}

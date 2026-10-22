<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BankWallet;

class BankWalletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = BankWallet::where('is_active', true);

        // Filter by network if provided
        if ($request->has('network')) {
            $networkCodeOrSlug = $request->query('network');
            $network = \App\Models\Network::where('english_name', $networkCodeOrSlug)
                ->orWhere('network_code', $networkCodeOrSlug)
                ->first();

            if ($network && !empty($network->gateway)) {
                $targetGateway = $network->gateway;
                $query->where(function ($q) use ($targetGateway) {
                    $q->where('gateway', $targetGateway)
                      ->orWhere('gateway', 'all')
                      ->orWhereNull('gateway');
                });
            }
        } elseif ($request->has('gateway') && in_array($request->query('gateway'), ['north', 'south'])) {
            $targetGateway = $request->query('gateway');
            $query->where(function ($q) use ($targetGateway) {
                $q->where('gateway', $targetGateway)
                  ->orWhere('gateway', 'all')
                  ->orWhereNull('gateway');
            });
        }

        // Only return active wallets and we don't necessarily need sources for the frontend
        $wallets = $query->get();
        
        // Transform the collection to ensure frontend gets full URL for logo
        $wallets->transform(function ($wallet) {
            if ($wallet->logo_path) {
                $wallet->logo_url = '/storage/' . $wallet->logo_path;
            } else {
                $wallet->logo_url = null;
            }
            return $wallet;
        });

        return response()->json($wallets);
    }
}

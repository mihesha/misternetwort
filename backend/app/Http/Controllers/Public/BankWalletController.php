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
    public function index()
    {
        // Only return active wallets and we don't necessarily need sources for the frontend
        $wallets = BankWallet::where('is_active', true)->get();
        
        // Transform the collection to ensure frontend gets full URL for logo
        $wallets->transform(function ($wallet) {
            if ($wallet->logo_path) {
                $wallet->logo_url = asset('storage/' . $wallet->logo_path);
            } else {
                $wallet->logo_url = null;
            }
            return $wallet;
        });

        return response()->json($wallets);
    }
}

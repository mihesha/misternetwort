<?php

namespace App\Http\Controllers\Admin;

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
        $wallets = BankWallet::with('sources')->latest()->get();
        
        $wallets->transform(function ($wallet) {
            if ($wallet->logo_path) {
                $wallet->logo_url = '/storage/' . $wallet->logo_path;
            }
            return $wallet;
        });

        return response()->json($wallets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pos_number' => 'nullable|string|max:255',
            'pos_name' => 'nullable|string|max:255',
            'input_label' => 'nullable|string|max:255',
            'steps' => 'nullable|array',
            'is_active' => 'boolean',
            'sources' => 'nullable|array',
            'sources.*' => 'string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('bank_wallets', 'public');
        }

        if (empty($validated['input_label'])) {
            $validated['input_label'] = 'الرقم المرجعي';
        }

        $wallet = BankWallet::create($validated);

        if (!empty($validated['sources'])) {
            foreach ($validated['sources'] as $sourceName) {
                $wallet->sources()->create(['source_name' => $sourceName]);
            }
        }

        $wallet->load('sources');
        if ($wallet->logo_path) {
            $wallet->logo_url = '/storage/' . $wallet->logo_path;
        }

        return response()->json($wallet, 201);
    }

    public function show(string $id)
    {
        $wallet = BankWallet::with('sources')->findOrFail($id);
        return response()->json($wallet);
    }

    public function update(Request $request, string $id)
    {
        $wallet = BankWallet::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pos_number' => 'nullable|string|max:255',
            'pos_name' => 'nullable|string|max:255',
            'input_label' => 'nullable|string|max:255',
            'steps' => 'nullable|array',
            'is_active' => 'boolean',
            'sources' => 'nullable|array',
            'sources.*' => 'string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if necessary
            if ($wallet->logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($wallet->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('bank_wallets', 'public');
        }

        $wallet->update($validated);

        if (isset($validated['sources'])) {
            $wallet->sources()->delete();
            foreach ($validated['sources'] as $sourceName) {
                $wallet->sources()->create(['source_name' => $sourceName]);
            }
        }

        $wallet->load('sources');
        if ($wallet->logo_path) {
            $wallet->logo_url = '/storage/' . $wallet->logo_path;
        }

        return response()->json($wallet);
    }

    public function destroy(string $id)
    {
        $wallet = BankWallet::findOrFail($id);
        if ($wallet->logo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($wallet->logo_path);
        }
        $wallet->delete();
        
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function toggleActive(string $id)
    {
        $wallet = BankWallet::findOrFail($id);
        $wallet->is_active = !$wallet->is_active;
        $wallet->save();

        return response()->json(['is_active' => $wallet->is_active]);
    }
}

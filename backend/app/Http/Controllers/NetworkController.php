<?php

namespace App\Http\Controllers;

use App\Models\Network;
use App\Models\NetworkApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NetworkController extends Controller
{
    public function submitApplication(Request $request)
    {
        $validated = $request->validate([
            'owner.ownerName' => 'required|string',
            'owner.ownerId' => 'required|string',
            'owner.contactNumber' => 'required|string',
            'network.networkName' => 'required|string',
            'network.networkPhone' => 'required|string',
            'network.governorate' => 'required|string',
            'network.city' => 'required|string',
            'network.neighborhood' => 'nullable|string',
            'jaibWalletNumber' => 'required|string',
            'cardCategories' => 'required|array',
        ]);

        $application = NetworkApplication::create([
            'reference_number' => 'REQ-' . date('Y') . '-' . rand(1000, 9999),
            'owner_name' => $validated['owner']['ownerName'],
            'owner_identity' => $validated['owner']['ownerId'],
            'owner_phone' => $validated['owner']['contactNumber'],
            'network_name' => $validated['network']['networkName'],
            'network_phone' => $validated['network']['networkPhone'],
            'governorate' => $validated['network']['governorate'],
            'city' => $validated['network']['city'],
            'neighborhood' => $validated['network']['neighborhood'] ?? null,
            'jaib_wallet' => $validated['jaibWalletNumber'],
            'card_categories_json' => json_encode($validated['cardCategories']),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب الانضمام بنجاح قيد المراجعة',
            'application' => [
                'id' => $application->id,
                'referenceNumber' => $application->reference_number,
                'createdAt' => $application->created_at,
                'status' => $application->status,
                'formData' => $validated
            ]
        ], 201);
    }

    public function index(Request $request)
    {
        // For admin: return all, for owner: return their own
        if ($request->user()->role === 'admin') {
            return response()->json(Network::with('cardCategories')->get());
        }
        
        return response()->json($request->user()->networks()->with('cardCategories')->get());
    }

    public function show(Network $network)
    {
        $network->load('cardCategories');
        return response()->json($network);
    }

    public function getByCode($networkCode)
    {
        $network = Network::with('cardCategories')->where('network_code', $networkCode)->firstOrFail();
        
        if ($network->status !== 'active') {
            return response()->json(['error' => 'الشبكة غير نشطة'], 403);
        }

        return response()->json([
            'network_code' => $network->network_code,
            'network_name' => $network->name,
            'governorate' => $network->governorate,
            'packages' => $network->cardCategories->where('status', '!==', 'inactive')->values(),
        ]);
    }
}

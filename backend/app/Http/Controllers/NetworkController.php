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
            'network.networkPhone' => 'nullable|string',
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

    public function searchNetworks(Request $request)
    {
        $q = $request->query('q');
        if (!$q) return response()->json([]);
        
        $networks = Network::where('status', 'active')
            ->where(function($query) use ($q) {
                $query->where('name', 'LIKE', "%{$q}%")
                      ->orWhere('network_code', 'LIKE', "%{$q}%");
            })
            ->get();
            
        return response()->json($networks);
    }

    public function getNetworkByCode($code)
    {
        $network = Network::where('network_code', $code)->where('status', 'active')->first();
        if (!$network) return response()->json(['error' => 'Not found'], 404);
        return response()->json($network);
    }

    public function getNetworkPackagesByCode($code)
    {
        $network = Network::where('network_code', $code)->where('status', 'active')->first();
        if (!$network) return response()->json(['error' => 'Not found'], 404);
        
        $packages = \App\Models\CardCategory::where('network_id', $network->id)
            ->where('status', '!=', 'inactive')
            ->where('stock', '>', 0)
            ->get();
            
        return response()->json($packages->map(function($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'validity' => $p->validity_days,
                'description' => "سعة: {$p->mega} ميجا، مدة: {$p->hours} ساعة",
                'stock' => $p->stock,
            ];
        }));
    }

    public function updateCategorySettings($id, Request $request)
    {
        $cat = \App\Models\CardCategory::findOrFail($id);
        
        $network = Network::findOrFail($cat->network_id);
        if ($network->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($request->has('status')) $cat->status = $request->status;
        $cat->save();

        return response()->json(['message' => 'Category updated successfully']);
    }

    public function updateNetworkSettings($network_code, Request $request)
    {
        $network = Network::where('network_code', $network_code)->firstOrFail();
        
        if ($network->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($request->has('status')) $network->status = $request->status;
        $network->save();

        return response()->json(['message' => 'Network updated successfully']);
    }

    public function storeEditRequest(Request $request)
    {
        $user = $request->user();
        $network = Network::where('user_id', $user->id)->first();
        if (!$network) return response()->json(['error' => 'Network not found'], 404);

        $existing = \App\Models\NetworkDataEditRequest::where('network_code', $network->network_code)
            ->where('status', 'pending')
            ->exists();
            
        if ($existing) {
            return response()->json(['error' => 'لديك طلب تعديل قيد المراجعة مسبقاً، يرجى الانتظار حتى يتم البت فيه.'], 400);
        }

        $req = \App\Models\NetworkDataEditRequest::create([
            'user_id' => $user->id,
            'reference_number' => 'MOD-' . time(),
            'network_code' => $network->network_code,
            'network_name' => $request->networkName,
            'owner_name' => $request->ownerName,
            'contact_phone' => $request->contactPhone,
            'governorate' => $request->governorate,
            'city' => $request->city,
            'district' => $request->district,
            'jaib_wallet' => $request->jaibWallet,
            'categories' => json_encode($request->categories ?? []),
            'previous_data' => json_encode($request->previousData ?? []),
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'تم إرسال طلب التعديل بنجاح وسيتم مراجعته من قبل الإدارة', 'request' => $req], 201);
    }

    public function getEditRequests(Request $request)
    {
        $user = $request->user();
        $requests = \App\Models\NetworkDataEditRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($r) {
                return [
                    'id' => (string) $r->id,
                    'referenceNumber' => $r->reference_number,
                    'status' => $r->status,
                    'adminNotes' => $r->admin_notes ?? '',
                    'createdAt' => $r->created_at->toISOString()
                ];
            });
            
        return response()->json($requests);
    }
}

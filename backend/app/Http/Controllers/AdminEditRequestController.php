<?php

namespace App\Http\Controllers;

use App\Models\NetworkDataEditRequest;
use App\Models\Network;
use App\Models\CardCategory;
use Illuminate\Http\Request;

class AdminEditRequestController extends Controller
{
    public function storeEditRequest(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $network = Network::where('network_code', $request->networkCode)->first();
            if ($network) $user = $network->user;
        }
        
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $req = NetworkDataEditRequest::create([
            'user_id' => $user->id,
            'reference_number' => $request->referenceNumber ?? 'MOD-' . time(),
            'network_code' => $request->networkCode,
            'network_name' => $request->networkName,
            'owner_name' => $request->ownerName,
            'contact_phone' => $request->contactPhone,
            'governorate' => $request->governorate,
            'city' => $request->city,
            'district' => $request->district,
            'jaib_wallet' => $request->jaibWallet,
            'admin_notes' => $request->adminNotes,
            'categories' => json_encode($request->categories ?? []),
            'previous_data' => json_encode($request->previousData ?? []),
            'status' => 'pending'
        ]);

        return response()->json($req);
    }

    public function getEditRequests()
    {
        $requests = NetworkDataEditRequest::orderBy('created_at', 'desc')->get();
        return response()->json($requests->map(function($r) {
            return [
                'id' => (string) $r->id,
                'referenceNumber' => $r->reference_number,
                'networkCode' => $r->network_code,
                'networkName' => $r->network_name,
                'ownerName' => $r->owner_name,
                'contactPhone' => $r->contact_phone,
                'governorate' => $r->governorate,
                'city' => $r->city,
                'district' => $r->district ?? '',
                'jaibWallet' => $r->jaib_wallet,
                'adminNotes' => $r->admin_notes ?? '',
                'categories' => is_string($r->categories) ? json_decode($r->categories, true) : ($r->categories ?? []),
                'previousData' => is_string($r->previous_data) ? json_decode($r->previous_data, true) : ($r->previous_data ?? []),
                'status' => $r->status,
                'createdAt' => $r->created_at->toISOString()
            ];
        }));
    }

    public function updateEditRequestStatus($id, Request $request)
    {
        $req = NetworkDataEditRequest::findOrFail($id);
        $req->status = $request->status;
        $req->save();

        if ($request->status === 'approved') {
            $network = Network::where('network_code', $req->network_code)->first();
            if ($network) {
                $network->name = $req->network_name;
                $network->governorate = $req->governorate;
                $network->city = $req->city;
                $network->neighborhood = $req->district;
                $network->owner_phone = $req->contact_phone;
                $network->jaib_wallet = $req->jaib_wallet;
                $network->save();
                
                if ($network->user) {
                    $network->user->name = $req->owner_name;
                    $network->user->save();
                }

                $rawCategories = $req->categories ?? [];
                $categoriesData = is_string($rawCategories) ? json_decode($rawCategories, true) : $rawCategories;
                
                foreach ($categoriesData as $catData) {
                    $existing = CardCategory::where('network_id', $network->id)->where('name', $catData['name'])->first();
                    if ($existing) {
                        $existing->price = $catData['price'];
                        $existing->mega = $catData['mb'] ?? 0;
                        $existing->hours = $catData['hours'] ?? 0;
                        $existing->validity_days = $catData['validityDays'] ?? 0;
                        $existing->card_type = $catData['cardType'] ?? 'مستخدم فقط';
                        $existing->save();
                    } else {
                        CardCategory::create([
                            'network_id' => $network->id,
                            'name' => $catData['name'],
                            'price' => $catData['price'],
                            'mega' => $catData['mb'] ?? 0,
                            'hours' => $catData['hours'] ?? 0,
                            'validity_days' => $catData['validityDays'] ?? 0,
                            'card_type' => $catData['cardType'] ?? 'مستخدم فقط',
                            'stock' => 0,
                        ]);
                    }
                }
            }
        }
        
        return response()->json(['message' => 'Status updated']);
    }
}
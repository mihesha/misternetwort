<?php

namespace App\Http\Controllers;

use App\Models\NetworkApplication;
use App\Models\Network;
use App\Models\CardCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminNetworkApplicationController extends Controller
{
    public function getApplications()
    {
        $apps = NetworkApplication::orderBy('created_at', 'desc')->get()->map(function ($app) {
            return [
                'id' => $app->id,
                'referenceNumber' => $app->reference_number,
                'createdAt' => $app->created_at,
                'status' => $app->status,
                'formData' => [
                    'owner' => [
                        'ownerName' => $app->owner_name, 
                        'ownerId' => $app->owner_identity,
                        'contactNumber' => $app->owner_phone
                    ],
                    'network' => [
                        'networkName' => $app->network_name, 
                        'networkPhone' => $app->network_phone,
                        'governorate' => $app->governorate, 
                        'city' => $app->city,
                        'neighborhood' => $app->neighborhood
                    ],
                    'jaibWalletNumber' => $app->jaib_wallet,
                    'cardCategories' => json_decode($app->card_categories_json, true) ?? []
                ]
            ];
        });
        return response()->json($apps);
    }

    public function updateApplicationStatus($id, Request $request)
    {
        $app = NetworkApplication::findOrFail($id);
        $app->update(['status' => $request->status]);

        if ($request->status === 'approved') {
            $user = User::firstOrCreate(
                ['phone' => $app->owner_identity],
                [
                    'name' => $app->owner_name,
                    'email' => $app->owner_identity . '@example.com',
                    'password' => Hash::make($request->tempPassword ?? '12345678'),
                    'role' => 'network_owner',
                    'must_change_password' => true
                ]
            );

            $network = Network::where('user_id', $user->id)->first();
            
            if (!$network) {
                $network = clone Network::create([
                    'user_id' => $user->id,
                    'name' => $app->network_name,
                    'network_code' => '8' . rand(1000, 9999), 
                    'governorate' => $app->governorate,
                    'city' => $app->city ?? null,
                    'neighborhood' => $app->neighborhood ?? null,
                    'jaib_wallet' => $app->jaib_wallet ?? null,
                    'owner_phone' => $app->owner_phone,
                    'balance' => 0,
                    'total_sales' => 0,
                    'status' => 'active'
                ]);

                $categories = json_decode($app->card_categories_json, true) ?? [];
                foreach ($categories as $cat) {
                    CardCategory::create([
                        'network_id' => $network->id,
                        'name' => (string)($cat['name'] ?? $cat['value'] ?? $cat['price'] ?? 0),
                        'price' => $cat['price'] ?? $cat['value'] ?? 0,
                        'mega' => $cat['mega'] ?? 0,
                        'hours' => $cat['hours'] ?? 0,
                        'validity_days' => $cat['validityDays'] ?? 0,
                        'card_type' => $cat['cardType'] ?? 'مستخدم فقط',
                        'stock' => 0,
                    ]);
                }
            }
            
            return response()->json([
                'message' => 'Status updated successfully',
                'network_code' => $network->network_code
            ]);
        }

        return response()->json(['message' => 'Status updated successfully']);
    }
}
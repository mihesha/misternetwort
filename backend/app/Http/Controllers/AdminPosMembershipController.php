<?php

namespace App\Http\Controllers;

use App\Models\NetworkPosMembership;
use App\Models\User;
use App\Models\Transaction;
use App\Models\CardCategory;
use Illuminate\Http\Request;

class AdminPosMembershipController extends Controller
{
    public function getPosMemberships($id)
    {
        $memberships = NetworkPosMembership::where('network_id', $id)->with('user')->get();
        return response()->json($memberships);
    }

    public function storePosMembership($id, Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
        ]);
        
        $user = User::where('phone', $validated['phone'])->where('role', 'pos')->first();
        if (!$user) return response()->json(['error' => 'لم يتم العثور على نقطة البيع بهذا الرقم'], 404);

        $membership = NetworkPosMembership::firstOrCreate([
            'network_id' => $id,
            'user_id' => $user->id
        ], [
            'credit_limit' => 0,
            'current_debt' => 0,
            'status' => 'active'
        ]);
        
        return response()->json(['message' => 'تم إضافة نقطة البيع', 'membership' => $membership->load('user')]);
    }

    public function updatePosMembership($id, $membership_id, Request $request)
    {
        $membership = NetworkPosMembership::where('network_id', $id)->findOrFail($membership_id);
        if ($request->has('credit_limit')) $membership->credit_limit = $request->credit_limit;
        if ($request->has('status')) $membership->status = $request->status;
        $membership->save();
        return response()->json(['message' => 'تم تحديث بيانات نقطة البيع']);
    }

    public function payDebtPosMembership($id, $membership_id, Request $request)
    {
        $validated = $request->validate(['amount' => 'required|numeric|min:1']);
        $membership = NetworkPosMembership::where('network_id', $id)->findOrFail($membership_id);
        
        if ($membership->current_debt < $validated['amount']) {
            return response()->json(['error' => 'المبلغ المدفوع أكبر من الديون الحالية'], 400);
        }
        
        $membership->decrement('current_debt', $validated['amount']);

        $userName = $membership->user ? $membership->user->name : 'غير معروف';

        Transaction::create([
            'network_id' => $id,
            'type' => 'debt_settlement',
            'amount' => $validated['amount'],
            'description' => "تسديد مديونية نقداً (يداً بيد) من نقطة البيع: {$userName}",
            'reference_number' => 'SETTLEMENT-' . time(),
        ]);

        return response()->json(['message' => 'تم سداد الدفعة بنجاح', 'current_debt' => $membership->current_debt]);
    }

    public function getPosPackages($id)
    {
        $packages = CardCategory::where('network_id', $id)->get();
        return response()->json($packages);
    }

    public function updatePosPackagePrice($id, $package_id, Request $request)
    {
        $package = CardCategory::where('network_id', $id)->findOrFail($package_id);
        $package->pos_price = $request->pos_price;
        $package->save();
        return response()->json(['message' => 'تم تحديث سعر البيع لنقاط البيع بنجاح']);
    }
}
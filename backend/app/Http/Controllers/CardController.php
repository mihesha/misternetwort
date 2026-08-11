<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Network;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CardController extends Controller
{
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'network_code' => 'required|string|exists:networks,network_code',
            'category_id' => 'required|exists:card_categories,id',
            'customer_phone' => 'nullable|string',
            'wallet_type' => 'required|string|in:jaib,jawali',
            'transaction_ref' => 'required|string'
        ]);

        $network = Network::where('network_code', $validated['network_code'])->first();
        $category = $network->cardCategories()->where('id', $validated['category_id'])->first();

        if (!$category || $category->stock <= 0) {
            return response()->json(['error' => 'عذراً، نفذت كروت هذه الفئة'], 400);
        }

        DB::beginTransaction();
        try {
            // Deduct stock
            $category->decrement('stock');

            // Financial math
            $commission = $category->price * 0.025; // 2.5% platform fee
            $netEarnings = $category->price - $commission;
            
            // Add to network balance
            $network->increment('balance', $netEarnings);
            $network->increment('total_sales', $category->price);

            // Generate Card Details
            $card = Card::create([
                'card_category_id' => $category->id,
                'serial_number' => 'SN-' . date('Ymd') . '-' . rand(10000, 99999),
                'card_code' => rand(10000000, 99999999),
                'password' => $category->card_type === 'user_password' ? rand(1000, 9999) : null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'sold',
                'purchased_at' => now(),
            ]);

            // Log Transaction
            Transaction::create([
                'network_id' => $network->id,
                'type' => 'sale',
                'amount' => $category->price,
                'description' => "شراء كرت عبر محفظة {$validated['wallet_type']}",
                'reference_number' => $validated['transaction_ref']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'تمت عملية الشراء بنجاح',
                'card' => $card,
                'network' => $network->name
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'حدث خطأ أثناء الشراء'], 500);
        }
    }
}

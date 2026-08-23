<?php

namespace App\Http\Controllers;

use App\Models\Network;
use App\Models\CardCategory;
use App\Models\Card;
use App\Models\CardBatch;
use Illuminate\Http\Request;

class AdminCardManagementController extends Controller
{
    public function importCards($id, Request $request)
    {
        $network = Network::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'required|exists:card_categories,id',
            'cards' => 'required|array',
            'cards.*.code' => 'required|string|min:6',
            'cards.*.password' => 'nullable|string',
            'file_type' => 'nullable|string',
            'uploaded_by' => 'nullable|string'
        ]);

        $category = CardCategory::findOrFail($validated['category_id']);
        
        $validCards = [];
        $duplicateErrors = [];
        
        foreach ($validated['cards'] as $index => $cardData) {
            $exists = Card::where('serial_number', $cardData['code'])
                ->whereHas('cardCategory', function($q) use ($network) {
                    $q->where('network_id', $network->id);
                })->exists();
                
            if ($exists) {
                $duplicateErrors[] = "الكرت رقم '{$cardData['code']}' موجود مسبقاً في شبكتك وتم تجاهله.";
            } else {
                $validCards[] = $cardData;
            }
        }

        if (count($validCards) === 0) {
            return response()->json([
                'error' => 'تم رفض الملف: جميع الكروت مكررة وموجودة مسبقاً في النظام.',
                'duplicates' => $duplicateErrors
            ], 400);
        }
        
        $batch = CardBatch::create([
            'network_id' => $network->id,
            'card_category_id' => $category->id,
            'uploaded_by' => $validated['uploaded_by'] ?? 'صاحب الشبكة',
            'addition_method' => 'يدوي',
            'file_type' => $validated['file_type'] ?? 'EXCEL',
            'cards_count' => count($validCards)
        ]);

        foreach ($validCards as $cardData) {
            Card::create([
                'card_category_id' => $category->id,
                'card_batch_id' => $batch->id,
                'serial_number' => $cardData['code'],
                'card_code' => $cardData['code'],
                'password' => $cardData['password'] ?? null,
                'status' => 'available'
            ]);
        }

        $category->increment('stock', count($validCards));

        return response()->json([
            'message' => 'Cards imported successfully', 
            'count' => count($validCards), 
            'batch_id' => $batch->id,
            'errors' => $duplicateErrors
        ]);
    }

    public function getCards($id)
    {
        return response()->json(Card::whereHas('cardCategory', function($q) use ($id) {
            $q->where('network_id', $id);
        })->with('cardCategory')->orderBy('created_at', 'desc')->get());
    }

    public function getCardBatches($id)
    {
        return response()->json(CardBatch::where('network_id', $id)
            ->with('cardCategory')
            ->orderBy('created_at', 'desc')
            ->get());
    }

    public function destroyCardBatch($id, $batch_id)
    {
        $batch = CardBatch::where('network_id', $id)->findOrFail($batch_id);
        
        $soldCardsCount = Card::where('card_batch_id', $batch_id)->where('status', '!=', 'available')->count();
        if ($soldCardsCount > 0) {
            return response()->json(['error' => 'لا يمكن حذف هذه الدفعة لأنه تم بيع كروت منها'], 400);
        }
        
        $category = CardCategory::find($batch->card_category_id);
        if ($category) {
            $category->decrement('stock', $batch->cards_count);
        }

        $batch->delete();
        
        return response()->json(['message' => 'Batch deleted successfully']);
    }

    public function destroyCard($id, $card_id)
    {
        $card = Card::whereHas('cardCategory', function($q) use ($id) {
            $q->where('network_id', $id);
        })->findOrFail($card_id);

        if ($card->status !== 'available') {
            return response()->json(['error' => 'لا يمكن حذف هذا الكرت لأنه ليس متاحاً'], 400);
        }

        $category = CardCategory::find($card->card_category_id);
        if ($category) {
            $category->decrement('stock', 1);
        }

        if ($card->card_batch_id) {
            $batch = CardBatch::find($card->card_batch_id);
            if ($batch) {
                $batch->decrement('cards_count', 1);
            }
        }

        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }
}
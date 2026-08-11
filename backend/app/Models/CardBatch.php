<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardBatch extends Model
{
    protected $fillable = [
        'network_id',
        'card_category_id',
        'uploaded_by',
        'addition_method',
        'file_type',
        'cards_count'
    ];

    public function network()
    {
        return $this->belongsTo(Network::class);
    }

    public function cardCategory()
    {
        return $this->belongsTo(CardCategory::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}

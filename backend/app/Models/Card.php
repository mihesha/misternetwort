<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'purchased_at' => 'datetime',
    ];

    public function cardCategory(): BelongsTo
    {
        return $this->belongsTo(CardCategory::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CardBatch::class, 'card_batch_id');
    }
}

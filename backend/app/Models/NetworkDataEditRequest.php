<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id', 'reference_number', 'network_code', 'network_name', 'owner_name',
    'contact_phone', 'governorate', 'city', 'district', 'jaib_wallet',
    'admin_notes', 'categories', 'previous_data', 'status'
])]
class NetworkDataEditRequest extends Model
{
    protected $casts = [
        'categories' => 'array',
        'previous_data' => 'array',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

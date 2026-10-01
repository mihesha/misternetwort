<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletRecharge extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'bank_name',
        'receipt_image',
        'status',
        'reference_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

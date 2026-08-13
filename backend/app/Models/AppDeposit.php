<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppDeposit extends Model
{
    protected $fillable = [
        'reference_number',
        'amount',
        'wallet_name',
        'status',
        'used_for_card_id',
    ];
}

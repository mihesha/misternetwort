<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardSmsTask extends Model
{
    protected $fillable = [
        'phone_number',
        'card_category',
        'card_code',
        'custom_message',
        'status',
        'sent_at',
        'error_message'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpTask extends Model
{
    protected $fillable = [
        'phone_number',
        'otp_code',
        'custom_message',
        'status',
        'sent_at',
        'error_message'
    ];
}

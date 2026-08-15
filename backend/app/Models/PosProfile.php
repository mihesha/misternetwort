<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosProfile extends Model
{
    protected $fillable = ['user_id', 'shop_name', 'commercial_reg', 'address', 'status', 'otp_code'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NetworkPosMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'network_id',
        'user_id',
        'credit_limit',
        'current_debt',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function network()
    {
        return $this->belongsTo(Network::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankWallet extends Model
{
    protected $fillable = [
        'name',
        'logo_path',
        'pos_number',
        'pos_name',
        'input_label',
        'steps',
        'is_active',
    ];

    protected $casts = [
        'steps' => 'array',
        'is_active' => 'boolean',
    ];

    public function sources()
    {
        return $this->hasMany(BankWalletSource::class);
    }
}

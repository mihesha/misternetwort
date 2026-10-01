<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankWalletSource extends Model
{
    protected $fillable = [
        'bank_wallet_id',
        'source_name',
    ];

    public function bankWallet()
    {
        return $this->belongsTo(BankWallet::class);
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'role', 'must_change_password', 'password', 'wallet_balance', 'otp_code', 'jaib_wallet', 'governorate', 'city', 'referral_code', 'agent_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function generateReferralCode(): string
    {
        do {
            $code = 'AGT-' . rand(1000, 9999);
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    public function networks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Network::class);
    }

    public function networkApplications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NetworkApplication::class);
    }

    public function posProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(PosProfile::class);
    }

    public function agentTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AgentTransaction::class, 'agent_id');
    }

    public function agentNetworks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Network::class, 'agent_id');
    }

    public function referrerAgent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function referredUsers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'agent_id');
    }
}

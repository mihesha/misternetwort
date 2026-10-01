<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_wallet_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_wallet_id')->constrained('bank_wallets')->cascadeOnDelete();
            $table->string('source_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_wallet_sources');
    }
};

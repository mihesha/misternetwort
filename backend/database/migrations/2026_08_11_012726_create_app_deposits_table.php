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
        Schema::create('app_deposits', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('wallet_name');
            $table->enum('status', ['pending', 'confirmed', 'used'])->default('pending');
            $table->unsignedBigInteger('used_for_card_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_deposits');
    }
};

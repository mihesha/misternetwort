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
        Schema::create('card_sms_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->string('card_category');
            $table->string('card_code');
            $table->text('custom_message')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, SENT, FAILED
            $table->timestamp('sent_at')->nullable();
            $table->string('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_sms_tasks');
    }
};

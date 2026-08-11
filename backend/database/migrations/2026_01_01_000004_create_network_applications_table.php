<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->unique();
            $table->string('owner_name')->nullable();
            $table->string('owner_phone')->nullable();
            $table->string('network_name');
            $table->string('governorate');
            $table->string('city');
            $table->string('neighborhood')->nullable();
            $table->string('jaib_wallet');
            $table->json('card_categories_json')->nullable();
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_applications');
    }
};

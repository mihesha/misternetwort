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
        Schema::create('network_data_edit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->unique();
            $table->string('network_code');
            $table->string('network_name');
            $table->string('owner_name');
            $table->string('contact_phone');
            $table->string('governorate');
            $table->string('city');
            $table->string('district')->nullable();
            $table->string('jaib_wallet');
            $table->text('admin_notes')->nullable();
            $table->json('categories');
            $table->json('previous_data')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('network_data_edit_requests');
    }
};

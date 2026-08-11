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
        Schema::create('card_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('network_id')->constrained()->onDelete('cascade');
            $table->foreignId('card_category_id')->constrained()->onDelete('cascade');
            $table->string('uploaded_by');
            $table->string('addition_method');
            $table->string('file_type');
            $table->integer('cards_count')->default(0);
            $table->timestamps();
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->foreignId('card_batch_id')->nullable()->constrained('card_batches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropForeign(['card_batch_id']);
            $table->dropColumn('card_batch_id');
        });

        Schema::dropIfExists('card_batches');
    }
};

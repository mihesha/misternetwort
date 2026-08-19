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
        Schema::table('card_categories', function (Blueprint $table) {
            $table->integer('min_threshold')->default(10);
            $table->string('prefix')->nullable();
            $table->string('suffix')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_categories', function (Blueprint $table) {
            $table->dropColumn(['min_threshold', 'prefix', 'suffix']);
        });
    }
};

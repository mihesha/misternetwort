<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('networks', function (Blueprint $table) {
            $table->string('city')->nullable()->after('governorate');
            $table->string('neighborhood')->nullable()->after('city');
            $table->string('jaib_wallet')->nullable()->after('neighborhood');
            $table->string('owner_phone')->nullable()->after('jaib_wallet');
        });
    }

    public function down(): void
    {
        Schema::table('networks', function (Blueprint $table) {
            $table->dropColumn(['city', 'neighborhood', 'jaib_wallet', 'owner_phone']);
        });
    }
};

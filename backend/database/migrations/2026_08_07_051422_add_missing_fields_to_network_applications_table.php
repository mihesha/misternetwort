<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('network_applications', function (Blueprint $table) {
            $table->string('owner_identity')->nullable()->after('owner_name');
            $table->string('network_phone')->nullable()->after('network_name');
        });
    }

    public function down(): void
    {
        Schema::table('network_applications', function (Blueprint $table) {
            $table->dropColumn(['owner_identity', 'network_phone']);
        });
    }
};

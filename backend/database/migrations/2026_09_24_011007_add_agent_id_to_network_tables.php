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
        Schema::table('network_applications', function (Blueprint $table) {
            $table->string('application_type')->default('network');
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('networks', function (Blueprint $table) {
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('network_applications', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
            $table->dropColumn(['application_type', 'agent_id']);
        });

        Schema::table('networks', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
            $table->dropColumn(['agent_id']);
        });
    }
};

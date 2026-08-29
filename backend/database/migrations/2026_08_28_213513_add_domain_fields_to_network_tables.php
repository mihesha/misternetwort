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
        Schema::table('networks', function (Blueprint $table) {
            if (!Schema::hasColumn('networks', 'english_name')) {
                $table->string('english_name')->nullable()->unique()->after('network_code');
            }
            if (!Schema::hasColumn('networks', 'external_link')) {
                $table->string('external_link')->nullable()->after('english_name');
            }
        });

        Schema::table('network_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('network_applications', 'english_name')) {
                $table->string('english_name')->nullable()->after('network_name');
            }
            if (!Schema::hasColumn('network_applications', 'external_link')) {
                $table->string('external_link')->nullable()->after('english_name');
            }
        });

        Schema::table('network_data_edit_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('network_data_edit_requests', 'english_name')) {
                $table->string('english_name')->nullable()->after('network_name');
            }
            if (!Schema::hasColumn('network_data_edit_requests', 'external_link')) {
                $table->string('external_link')->nullable()->after('english_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('networks', function (Blueprint $table) {
            $table->dropColumn(['english_name', 'external_link']);
        });

        Schema::table('network_applications', function (Blueprint $table) {
            $table->dropColumn(['english_name', 'external_link']);
        });

        Schema::table('network_data_edit_requests', function (Blueprint $table) {
            $table->dropColumn(['english_name', 'external_link']);
        });
    }
};

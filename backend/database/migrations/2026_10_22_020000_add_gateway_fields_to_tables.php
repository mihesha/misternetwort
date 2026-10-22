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
        // 1. Add gateway to networks table
        if (Schema::hasTable('networks') && !Schema::hasColumn('networks', 'gateway')) {
            Schema::table('networks', function (Blueprint $table) {
                $table->string('gateway')->default('north')->after('governorate');
            });
        }

        // 2. Add gateway to network_applications table
        if (Schema::hasTable('network_applications') && !Schema::hasColumn('network_applications', 'gateway')) {
            Schema::table('network_applications', function (Blueprint $table) {
                $table->string('gateway')->default('north')->after('governorate');
            });
        }

        // 3. Add gateway to network_data_edit_requests table
        if (Schema::hasTable('network_data_edit_requests') && !Schema::hasColumn('network_data_edit_requests', 'gateway')) {
            Schema::table('network_data_edit_requests', function (Blueprint $table) {
                $table->string('gateway')->default('north')->after('governorate');
            });
        }

        // 4. Add gateway to bank_wallets table
        if (Schema::hasTable('bank_wallets') && !Schema::hasColumn('bank_wallets', 'gateway')) {
            Schema::table('bank_wallets', function (Blueprint $table) {
                $table->string('gateway')->default('north')->after('is_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('networks') && Schema::hasColumn('networks', 'gateway')) {
            Schema::table('networks', function (Blueprint $table) {
                $table->dropColumn('gateway');
            });
        }

        if (Schema::hasTable('network_applications') && Schema::hasColumn('network_applications', 'gateway')) {
            Schema::table('network_applications', function (Blueprint $table) {
                $table->dropColumn('gateway');
            });
        }

        if (Schema::hasTable('network_data_edit_requests') && Schema::hasColumn('network_data_edit_requests', 'gateway')) {
            Schema::table('network_data_edit_requests', function (Blueprint $table) {
                $table->dropColumn('gateway');
            });
        }

        if (Schema::hasTable('bank_wallets') && Schema::hasColumn('bank_wallets', 'gateway')) {
            Schema::table('bank_wallets', function (Blueprint $table) {
                $table->dropColumn('gateway');
            });
        }
    }
};

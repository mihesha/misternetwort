<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 50)->nullable()->unique()->after('role');
            $table->foreignId('agent_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
        });

        // Backfill existing agents with a unique referral code
        $agents = DB::table('users')->where('role', 'agent')->get();
        foreach ($agents as $agent) {
            $code = 'AGT-' . rand(1000, 9999);
            while (DB::table('users')->where('referral_code', $code)->exists()) {
                $code = 'AGT-' . rand(1000, 9999);
            }
            DB::table('users')->where('id', $agent->id)->update(['referral_code' => $code]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
            $table->dropColumn(['referral_code', 'agent_id']);
        });
    }
};

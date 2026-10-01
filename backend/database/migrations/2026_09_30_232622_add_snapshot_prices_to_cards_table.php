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
        Schema::table('cards', function (Blueprint $table) {
            if (!Schema::hasColumn('cards', 'price_at_purchase')) {
                $table->decimal('price_at_purchase', 10, 2)->nullable()->after('status')->comment('السعر الفعلي للعميل وقت الشراء');
            }
            if (!Schema::hasColumn('cards', 'pos_price_at_purchase')) {
                $table->decimal('pos_price_at_purchase', 10, 2)->nullable()->after('price_at_purchase')->comment('التكلفة الفعلية على نقطة البيع وقت الشراء');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            if (Schema::hasColumn('cards', 'price_at_purchase')) {
                $table->dropColumn('price_at_purchase');
            }
            if (Schema::hasColumn('cards', 'pos_price_at_purchase')) {
                $table->dropColumn('pos_price_at_purchase');
            }
        });
    }
};

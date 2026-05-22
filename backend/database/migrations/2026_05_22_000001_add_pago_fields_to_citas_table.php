<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->boolean('pagado')->default(false)->after('estado');
            $table->string('pago_metodo')->nullable()->after('pagado');
            $table->timestamp('pago_fecha')->nullable()->after('pago_metodo');
        });
    }

    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn(['pagado', 'pago_metodo', 'pago_fecha']);
        });
    }
};

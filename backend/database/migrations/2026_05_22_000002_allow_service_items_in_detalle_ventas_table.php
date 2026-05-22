<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_ventas', function (Blueprint $table) {
            $table->dropForeign(['idVariante']);
        });

        Schema::table('detalle_ventas', function (Blueprint $table) {
            $table->foreignId('idVariante')->nullable()->change();
            $table->enum('tipo', ['producto', 'servicio'])->default('producto')->after('idVariante');
            $table->string('descripcion')->nullable()->after('tipo');
            $table->foreign('idVariante')->references('idVariante')->on('variante_productos');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_ventas', function (Blueprint $table) {
            $table->dropForeign(['idVariante']);
            $table->dropColumn(['tipo', 'descripcion']);
        });

        Schema::table('detalle_ventas', function (Blueprint $table) {
            $table->foreignId('idVariante')->nullable(false)->change();
            $table->foreign('idVariante')->references('idVariante')->on('variante_productos');
        });
    }
};

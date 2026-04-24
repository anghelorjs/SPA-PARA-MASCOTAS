<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id('idDetalleVenta');
            $table->foreignId('idVenta')->constrained('ventas', 'idVenta');
            $table->foreignId('idVariante')->constrained('variante_productos', 'idVariante');
            $table->integer('cantidad');
            $table->decimal('precioUnitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ventas');
    }
};
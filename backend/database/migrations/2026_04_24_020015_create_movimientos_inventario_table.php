<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id('idMovimiento');
            $table->foreignId('idProducto')->constrained('productos', 'idProducto');
            $table->enum('tipoMovimiento', ['entrada', 'salida', 'ajuste']);
            $table->integer('cantidad');
            $table->timestamp('fecha')->useCurrent();
            $table->text('motivo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};
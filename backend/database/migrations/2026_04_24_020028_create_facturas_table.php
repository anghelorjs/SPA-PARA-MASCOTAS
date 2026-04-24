<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id('idFactura');
            $table->foreignId('idVenta')->constrained('ventas', 'idVenta')->unique();
            $table->string('numeroFactura')->unique();
            $table->timestamp('fechaEmision')->useCurrent();
            $table->decimal('montoTotal', 10, 2);
            $table->enum('estado', ['emitida', 'cancelada'])->default('emitida');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
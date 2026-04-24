<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('idVenta');
            $table->foreignId('idCliente')->nullable()->constrained('clientes', 'idCliente')->nullOnDelete();
            $table->foreignId('idRecepcionista')->nullable()->constrained('recepcionistas', 'idRecepcionista')->nullOnDelete();
            $table->timestamp('fecha')->useCurrent();
            $table->decimal('total', 10, 2);
            $table->enum('medioPago', ['efectivo', 'qr', 'transferencia'])->default('efectivo');
            $table->enum('estado', ['pendiente', 'pagado', 'cancelado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
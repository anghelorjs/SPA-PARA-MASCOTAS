<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id('idPago');
            $table->foreignId('idFactura')->constrained('facturas', 'idFactura');
            $table->decimal('monto', 10, 2);
            $table->enum('metodo', ['efectivo', 'qr', 'transferencia']);
            $table->timestamp('fechaPago')->useCurrent();
            $table->string('referencia')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
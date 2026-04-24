<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos_whatsapp', function (Blueprint $table) {
            $table->id('idPedido');
            $table->foreignId('idCliente')->constrained('clientes', 'idCliente');
            $table->timestamp('fecha')->useCurrent();
            $table->enum('estado', ['pendiente', 'enviado', 'confirmado', 'pagado'])->default('pendiente');
            $table->decimal('subtotal', 10, 2);
            $table->text('mensajeGenerado')->nullable();
            $table->enum('canal', ['whatsapp', 'telegram'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos_whatsapp');
    }
};
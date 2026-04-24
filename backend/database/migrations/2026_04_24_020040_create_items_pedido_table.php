<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items_pedido', function (Blueprint $table) {
            $table->id('idItemPedido');
            $table->foreignId('idPedido')->constrained('pedidos_whatsapp', 'idPedido');
            $table->foreignId('idVariante')->constrained('variante_productos', 'idVariante');
            $table->integer('cantidad');
            $table->decimal('precioUnitario', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items_pedido');
    }
};
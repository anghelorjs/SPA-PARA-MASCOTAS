<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_insumos', function (Blueprint $table) {
            $table->id('idDetalleInsumo');
            $table->foreignId('idFicha')->constrained('fichas_grooming', 'idFicha');
            $table->foreignId('idInsumo')->constrained('insumos', 'idInsumo');
            $table->decimal('cantidadUsada', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_insumos');
    }
};
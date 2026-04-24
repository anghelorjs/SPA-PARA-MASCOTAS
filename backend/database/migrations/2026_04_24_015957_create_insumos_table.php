<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insumos', function (Blueprint $table) {
            $table->id('idInsumo');
            $table->foreignId('idCategoria')->constrained('categorias', 'idCategoria');
            $table->string('nombre');
            $table->string('unidadMedida');
            $table->decimal('stockActual', 10, 2)->default(0);
            $table->decimal('stockMinimo', 10, 2)->default(0);
            $table->decimal('costoUnitario', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insumos');
    }
};
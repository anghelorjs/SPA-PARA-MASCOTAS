<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicio_rango', function (Blueprint $table) {
            $table->id('idServicioRango');
            $table->foreignId('idServicio')->constrained('servicios', 'idServicio')->onDelete('cascade');
            $table->foreignId('idRango')->constrained('rangos_peso', 'idRango')->onDelete('cascade');
            $table->integer('duracionAjustadaMin');
            $table->decimal('precioAjustado', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicio_rango');
    }
};
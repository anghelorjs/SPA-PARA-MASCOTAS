<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id('idReporte');
            $table->foreignId('idAdministrador')->constrained('administradores', 'idAdministrador');
            $table->string('tipoReporte');
            $table->date('fechaDesde');
            $table->date('fechaHasta');
            $table->unsignedBigInteger('idGroomerFiltro')->nullable();
            $table->timestamp('generadoEn')->useCurrent();
            $table->json('resultadoJson')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
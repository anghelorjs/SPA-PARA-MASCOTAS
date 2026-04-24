<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disponibilidades', function (Blueprint $table) {
            $table->id('idDisponibilidad');
            $table->foreignId('idGroomer')->constrained('groomers', 'idGroomer')->onDelete('cascade');
            $table->tinyInteger('diaSemana');
            $table->time('horaInicio');
            $table->time('horaFin');
            $table->boolean('esBloqueo')->default(false);
            $table->string('motivoBloqueo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilidades');
    }
};
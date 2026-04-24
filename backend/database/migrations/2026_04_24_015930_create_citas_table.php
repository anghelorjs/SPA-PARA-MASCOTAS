<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id('idCita');
            $table->foreignId('idMascota')->constrained('mascotas', 'idMascota');
            $table->foreignId('idGroomer')->constrained('groomers', 'idGroomer');
            $table->foreignId('idServicio')->constrained('servicios', 'idServicio');
            $table->foreignId('idRecepcionista')->nullable()->constrained('recepcionistas', 'idRecepcionista')->nullOnDelete();
            $table->dateTime('fechaHoraInicio');
            $table->dateTime('fechaHoraFin');
            $table->integer('duracionCalculadaMin');
            $table->enum('estado', ['programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'])->default('programada');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
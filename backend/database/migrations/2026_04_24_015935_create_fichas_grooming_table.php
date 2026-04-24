<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fichas_grooming', function (Blueprint $table) {
            $table->id('idFicha');
            $table->foreignId('idCita')->constrained('citas', 'idCita')->unique();
            $table->foreignId('idGroomer')->constrained('groomers', 'idGroomer');
            $table->foreignId('idMascota')->constrained('mascotas', 'idMascota');
            $table->text('estadoIngreso')->nullable();
            $table->boolean('nudos')->default(false);
            $table->boolean('tienePulgas')->default(false);
            $table->boolean('tieneHeridas')->default(false);
            $table->text('observaciones')->nullable();
            $table->text('recomendaciones')->nullable();
            $table->dateTime('fechaApertura');
            $table->dateTime('fechaCierre')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fichas_grooming');
    }
};
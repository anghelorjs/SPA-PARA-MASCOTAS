<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id('idServicio');
            $table->foreignId('idAdministrador')->constrained('administradores', 'idAdministrador')->onDelete('cascade');
            $table->string('nombre');
            $table->integer('duracionMinutos');
            $table->decimal('precioBase', 10, 2);
            $table->boolean('admiteDobleBooking')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
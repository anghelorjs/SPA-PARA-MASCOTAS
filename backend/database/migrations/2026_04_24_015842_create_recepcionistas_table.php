<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recepcionistas', function (Blueprint $table) {
            $table->id('idRecepcionista');
            $table->foreignId('idUsuario')->constrained('users', 'idUsuario')->onDelete('cascade');
            $table->enum('turno', ['matutino', 'vespertino', 'completo'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recepcionistas');
    }
};
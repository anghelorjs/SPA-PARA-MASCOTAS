<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotos', function (Blueprint $table) {
            $table->id('idFoto');
            $table->foreignId('idMascota')->constrained('mascotas', 'idMascota')->onDelete('cascade');
            $table->foreignId('idFicha')->nullable()->constrained('fichas_grooming', 'idFicha')->nullOnDelete();
            $table->string('urlFoto');
            $table->enum('tipo', ['antes', 'despues', 'perfil'])->default('antes');
            $table->timestamp('fechaCarga')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotos');
    }
};
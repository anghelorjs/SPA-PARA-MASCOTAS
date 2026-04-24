<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mascotas', function (Blueprint $table) {
            $table->id('idMascota');
            $table->foreignId('idCliente')->constrained('clientes', 'idCliente')->onDelete('cascade');
            $table->foreignId('idRango')->nullable()->constrained('rangos_peso', 'idRango')->nullOnDelete();
            $table->string('nombre');
            $table->string('especie')->default('perro');
            $table->string('raza')->nullable();
            $table->string('tamanio')->nullable();
            $table->decimal('pesoKg', 8, 2)->nullable();
            $table->date('fechaNacimiento')->nullable();
            $table->text('temperamento')->nullable();
            $table->text('alergias')->nullable();
            $table->text('restricciones')->nullable();
            $table->text('vacunas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mascotas');
    }
};
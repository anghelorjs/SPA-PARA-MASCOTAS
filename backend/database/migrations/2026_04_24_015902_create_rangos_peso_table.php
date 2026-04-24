<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rangos_peso', function (Blueprint $table) {
            $table->id('idRango');
            $table->string('nombre');
            $table->decimal('pesoMinKg', 8, 2);
            $table->decimal('pesoMaxKg', 8, 2);
            $table->decimal('factorTiempo', 5, 2)->default(1.0);
            $table->decimal('factorPrecio', 5, 2)->default(1.0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rangos_peso');
    }
};
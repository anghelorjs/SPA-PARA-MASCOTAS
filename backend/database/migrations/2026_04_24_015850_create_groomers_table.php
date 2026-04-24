<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groomers', function (Blueprint $table) {
            $table->id('idGroomer');
            $table->foreignId('idUsuario')->constrained('users', 'idUsuario')->onDelete('cascade');
            $table->string('especialidad')->nullable();
            $table->integer('maxServiciosSimultaneos')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groomers');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('idCliente');
            $table->foreignId('idUsuario')->constrained('users', 'idUsuario')->onDelete('cascade');
            $table->string('direccion')->nullable();
            $table->text('preferencias')->nullable();
            $table->enum('canalContacto', ['whatsapp', 'telegram', 'email', 'sms'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
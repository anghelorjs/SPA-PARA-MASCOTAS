<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variante_productos', function (Blueprint $table) {
            $table->id('idVariante');
            $table->foreignId('idProducto')->constrained('productos', 'idProducto')->onDelete('cascade');
            $table->string('nombreVariante');
            $table->decimal('precio', 10, 2);
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variante_productos');
    }
};
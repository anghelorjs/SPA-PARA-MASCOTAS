<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Para activación de cuenta
            $table->timestamp('email_verified_at')->nullable();
            $table->string('activation_token')->nullable();
            $table->timestamp('activation_token_expires_at')->nullable();
            
            // Para forzar cambio de contraseña en primer inicio
            $table->boolean('must_change_password')->default(false);
            
            // Para Google Login (futuro)
            $table->string('google_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified_at',
                'activation_token',
                'activation_token_expires_at',
                'must_change_password',
                'google_id'
            ]);
        });
    }
};
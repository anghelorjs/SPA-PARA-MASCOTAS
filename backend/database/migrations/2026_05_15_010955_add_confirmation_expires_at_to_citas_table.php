<?php
// database/migrations/xxxx_xx_xx_add_confirmation_expires_at_to_citas_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->timestamp('confirmacion_expira_at')->nullable();
        });

        DB::statement("ALTER TABLE citas MODIFY estado ENUM('programada', 'pendiente_confirmacion', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio') NOT NULL DEFAULT 'programada'");
    }

    public function down(): void
    {
        DB::table('citas')
            ->where('estado', 'pendiente_confirmacion')
            ->update(['estado' => 'programada']);

        DB::statement("ALTER TABLE citas MODIFY estado ENUM('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio') NOT NULL DEFAULT 'programada'");

        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn('confirmacion_expira_at');
        });
    }
};

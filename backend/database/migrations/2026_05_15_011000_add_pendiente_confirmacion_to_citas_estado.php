<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE citas MODIFY estado ENUM('programada', 'pendiente_confirmacion', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio') NOT NULL DEFAULT 'programada'");
    }

    public function down(): void
    {
        DB::table('citas')
            ->where('estado', 'pendiente_confirmacion')
            ->update(['estado' => 'programada']);

        DB::statement("ALTER TABLE citas MODIFY estado ENUM('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio') NOT NULL DEFAULT 'programada'");
    }
};

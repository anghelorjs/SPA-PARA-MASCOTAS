<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->boolean('leida')->default(false)->after('entregada');
            $table->text('errorEnvio')->nullable()->after('leida');
        });

        DB::table('notificaciones')
            ->where('entregada', false)
            ->update(['entregada' => true]);
    }

    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropColumn(['leida', 'errorEnvio']);
        });
    }
};

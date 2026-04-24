<?php
// database/seeders/CitaSeeder.php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Disponibilidad;
use App\Models\Groomer;
use Illuminate\Database\Seeder;

class CitaSeeder extends Seeder
{
    public function run(): void
    {
        // Crear disponibilidades para groomers
        $groomers = Groomer::all();
        
        foreach ($groomers as $groomer) {
            $dias = [0, 1, 2, 3, 4]; // Lunes a Viernes
            foreach ($dias as $dia) {
                Disponibilidad::create([
                    'idGroomer' => $groomer->idGroomer,
                    'diaSemana' => $dia,
                    'horaInicio' => '09:00:00',
                    'horaFin' => '18:00:00',
                    'esBloqueo' => false,
                    'motivoBloqueo' => null
                ]);
            }
        }

        // Crear 50 citas de prueba
        Cita::factory(50)->create();
    }
}
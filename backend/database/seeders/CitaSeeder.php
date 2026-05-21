<?php
// database/seeders/CitaSeeder.php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Groomer;
use Illuminate\Database\Seeder;

class CitaSeeder extends Seeder
{
    public function run(): void
    {
        // Crear disponibilidades por defecto para groomers que aun no tengan horario.
        $groomers = Groomer::all();
        
        foreach ($groomers as $groomer) {
            $groomer->crearDisponibilidadDefault();
        }

    }
}

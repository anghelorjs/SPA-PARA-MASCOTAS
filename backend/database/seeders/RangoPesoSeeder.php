<?php
// database/seeders/RangoPesoSeeder.php

namespace Database\Seeders;

use App\Models\RangoPeso;
use Illuminate\Database\Seeder;

class RangoPesoSeeder extends Seeder
{
    public function run(): void
    {
        $rangos = [
            ['nombre' => 'Mini', 'pesoMinKg' => 0, 'pesoMaxKg' => 3, 'factorTiempo' => 0.8, 'factorPrecio' => 0.8],
            ['nombre' => 'Pequeño', 'pesoMinKg' => 3.01, 'pesoMaxKg' => 8, 'factorTiempo' => 1.0, 'factorPrecio' => 1.0],
            ['nombre' => 'Mediano', 'pesoMinKg' => 8.01, 'pesoMaxKg' => 20, 'factorTiempo' => 1.2, 'factorPrecio' => 1.2],
            ['nombre' => 'Grande', 'pesoMinKg' => 20.01, 'pesoMaxKg' => 35, 'factorTiempo' => 1.4, 'factorPrecio' => 1.4],
            ['nombre' => 'Gigante', 'pesoMinKg' => 35.01, 'pesoMaxKg' => 80, 'factorTiempo' => 1.6, 'factorPrecio' => 1.6],
        ];

        foreach ($rangos as $rango) {
            RangoPeso::create($rango);
        }
    }
}
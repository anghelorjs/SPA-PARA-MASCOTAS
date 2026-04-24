<?php
// database/seeders/ServicioSeeder.php

namespace Database\Seeders;

use App\Models\Servicio;
use App\Models\Administrador;
use App\Models\RangoPeso;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $administrador = Administrador::first();
        
        $servicios = [
            ['nombre' => 'Baño rápido', 'duracionMinutos' => 30, 'precioBase' => 80, 'admiteDobleBooking' => true],
            ['nombre' => 'Baño completo', 'duracionMinutos' => 60, 'precioBase' => 150, 'admiteDobleBooking' => false],
            ['nombre' => 'Corte de pelo', 'duracionMinutos' => 90, 'precioBase' => 200, 'admiteDobleBooking' => false],
            ['nombre' => 'Corte higiénico', 'duracionMinutos' => 45, 'precioBase' => 100, 'admiteDobleBooking' => true],
            ['nombre' => 'Limpieza de oídos', 'duracionMinutos' => 20, 'precioBase' => 40, 'admiteDobleBooking' => true],
            ['nombre' => 'Corte de uñas', 'duracionMinutos' => 15, 'precioBase' => 30, 'admiteDobleBooking' => true],
            ['nombre' => 'Spa completo', 'duracionMinutos' => 120, 'precioBase' => 350, 'admiteDobleBooking' => false],
        ];

        $rangos = RangoPeso::all();

        foreach ($servicios as $servicioData) {
            $servicio = Servicio::create([
                'idAdministrador' => $administrador->idAdministrador,
                ...$servicioData
            ]);

            // Asignar rangos de peso a cada servicio
            foreach ($rangos as $rango) {
                $duracionAjustada = round($servicio->duracionMinutos * $rango->factorTiempo);
                $precioAjustado = round($servicio->precioBase * $rango->factorPrecio);
                
                $servicio->rangosPeso()->attach($rango->idRango, [
                    'duracionAjustadaMin' => $duracionAjustada,
                    'precioAjustado' => $precioAjustado
                ]);
            }
        }
    }
}
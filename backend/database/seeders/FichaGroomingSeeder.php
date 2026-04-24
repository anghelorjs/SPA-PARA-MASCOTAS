<?php
// database/seeders/FichaGroomingSeeder.php

namespace Database\Seeders;

use App\Models\FichaGrooming;
use App\Models\ChecklistItem;
use App\Models\DetalleInsumo;
use App\Models\Foto;
use App\Models\Cita;
use Illuminate\Database\Seeder;

class FichaGroomingSeeder extends Seeder
{
    public function run(): void
    {
        // Crear fichas solo para citas completadas
        $citasCompletadas = Cita::where('estado', 'completada')->get();
        
        foreach ($citasCompletadas as $cita) {
            $ficha = FichaGrooming::create([
                'idCita' => $cita->idCita,
                'idGroomer' => $cita->idGroomer,
                'idMascota' => $cita->idMascota,
                'estadoIngreso' => 'Mascota en buenas condiciones',
                'nudos' => false,
                'tienePulgas' => false,
                'tieneHeridas' => false,
                'observaciones' => 'Todo en orden',
                'recomendaciones' => 'Volver en 1 mes',
                'fechaApertura' => $cita->fechaHoraInicio,
                'fechaCierre' => $cita->fechaHoraFin,
            ]);
            
            // Crear checklist items
            $items = ['Baño', 'Corte', 'Uñas', 'Oídos', 'Perfume'];
            foreach ($items as $item) {
                ChecklistItem::create([
                    'idFicha' => $ficha->idFicha,
                    'nombreItem' => $item,
                    'completado' => true,
                    'observacion' => null,
                ]);
            }
            
            // Crear fotos
            Foto::create([
                'idMascota' => $cita->idMascota,
                'idFicha' => $ficha->idFicha,
                'urlFoto' => 'https://example.com/photos/antes.jpg',
                'tipo' => 'antes',
                'fechaCarga' => $cita->fechaHoraInicio,
            ]);
            
            Foto::create([
                'idMascota' => $cita->idMascota,
                'idFicha' => $ficha->idFicha,
                'urlFoto' => 'https://example.com/photos/despues.jpg',
                'tipo' => 'despues',
                'fechaCarga' => $cita->fechaHoraFin,
            ]);
        }
        
        // Generar fichas adicionales con factory
        FichaGrooming::factory(20)->create()->each(function ($ficha) {
            ChecklistItem::factory(rand(3, 6))->create(['idFicha' => $ficha->idFicha]);
            DetalleInsumo::factory(rand(1, 3))->create(['idFicha' => $ficha->idFicha]);
            Foto::factory(rand(1, 3))->create(['idFicha' => $ficha->idFicha]);
        });
    }
}
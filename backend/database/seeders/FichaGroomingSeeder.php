<?php
// database/seeders/FichaGroomingSeeder.php

namespace Database\Seeders;

use App\Models\FichaGrooming;
use App\Models\ChecklistItem;
use App\Models\Foto;
use App\Models\Cita;
use Illuminate\Database\Seeder;

class FichaGroomingSeeder extends Seeder
{
    public function run(): void
    {
        // Crear fichas SOLO para citas completadas (no usar factory)
        $citasCompletadas = Cita::where('estado', 'completada')->get();
        
        if ($citasCompletadas->count() === 0) {
            // Si no hay citas completadas, tomar algunas citas programadas
            $citasCompletadas = Cita::take(10)->get();
        }
        
        foreach ($citasCompletadas as $cita) {
            // Verificar si ya existe una ficha para esta cita
            if (FichaGrooming::where('idCita', $cita->idCita)->exists()) {
                continue;
            }
            
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
            
            // Crear fotos (opcional)
            if (rand(0, 1)) {
                Foto::create([
                    'idMascota' => $cita->idMascota,
                    'idFicha' => $ficha->idFicha,
                    'urlFoto' => 'https://example.com/photos/antes.jpg',
                    'tipo' => 'antes',
                    'fechaCarga' => $cita->fechaHoraInicio,
                ]);
            }
            
            if (rand(0, 1)) {
                Foto::create([
                    'idMascota' => $cita->idMascota,
                    'idFicha' => $ficha->idFicha,
                    'urlFoto' => 'https://example.com/photos/despues.jpg',
                    'tipo' => 'despues',
                    'fechaCarga' => $cita->fechaHoraFin,
                ]);
            }
        }
    }
}
<?php
// database/seeders/NotificacionSeeder.php

namespace Database\Seeders;

use App\Models\Notificacion;
use App\Models\Cliente;
use App\Models\Cita;
use Illuminate\Database\Seeder;

class NotificacionSeeder extends Seeder
{
    public function run(): void
    {
        $clientes = Cliente::all();
        $citas = Cita::where('estado', 'programada')->orWhere('estado', 'confirmada')->get();
        
        // Notificaciones de próxima cita
        foreach ($citas->take(20) as $cita) {
            Notificacion::create([
                'idCliente' => $cita->mascota->cliente->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'recordatorio',
                'canal' => $cita->mascota->cliente->canalContacto,
                'mensaje' => "Recordatorio: Tu mascota {$cita->mascota->nombre} tiene una cita el {$cita->fechaHoraInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => $cita->fechaHoraInicio->subHours(24),
                'entregada' => true,
            ]);
            
            Notificacion::create([
                'idCliente' => $cita->mascota->cliente->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'recordatorio',
                'canal' => $cita->mascota->cliente->canalContacto,
                'mensaje' => "Recordatorio: Tu cita es en 2 horas",
                'fechaEnvio' => $cita->fechaHoraInicio->subHours(2),
                'entregada' => false,
            ]);
        }
        
        // Notificaciones de confirmación
        foreach ($citas->where('estado', 'confirmada')->take(15) as $cita) {
            Notificacion::create([
                'idCliente' => $cita->mascota->cliente->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'confirmacion',
                'canal' => $cita->mascota->cliente->canalContacto,
                'mensaje' => "Tu cita ha sido confirmada para el {$cita->fechaHoraInicio->format('d/m/Y H:i')}",
                'fechaEnvio' => $cita->created_at,
                'entregada' => true,
            ]);
        }
        
    }
}
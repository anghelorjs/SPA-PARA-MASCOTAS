<?php
// database/seeders/ReporteSeeder.php

namespace Database\Seeders;

use App\Models\Reporte;
use App\Models\Administrador;
use App\Models\Cita;
use App\Models\Venta;
use Illuminate\Database\Seeder;

class ReporteSeeder extends Seeder
{
    public function run(): void
    {
        $administrador = Administrador::first();
        
        // Reporte de citas por mes
        for ($i = 1; $i <= 3; $i++) {
            $fechaDesde = now()->subMonths($i)->startOfMonth();
            $fechaHasta = now()->subMonths($i)->endOfMonth();
            
            $citas = Cita::whereBetween('fechaHoraInicio', [$fechaDesde, $fechaHasta])->get();
            $ventas = Venta::whereBetween('fecha', [$fechaDesde, $fechaHasta])->get();
            
            Reporte::create([
                'idAdministrador' => $administrador->idAdministrador,
                'tipoReporte' => 'mensual',
                'fechaDesde' => $fechaDesde,
                'fechaHasta' => $fechaHasta,
                'idGroomerFiltro' => null,
                'generadoEn' => now(),
                'resultadoJson' => json_encode([
                    'total_citas' => $citas->count(),
                    'citas_completadas' => $citas->where('estado', 'completada')->count(),
                    'total_ventas' => $ventas->sum('total'),
                    'ticket_promedio' => $ventas->avg('total'),
                ]),
            ]);
        }
        
        // Reporte de grooming por groomer
        $groomers = \App\Models\Groomer::all();
        foreach ($groomers as $groomer) {
            Reporte::create([
                'idAdministrador' => $administrador->idAdministrador,
                'tipoReporte' => 'groomer',
                'fechaDesde' => now()->subMonth(),
                'fechaHasta' => now(),
                'idGroomerFiltro' => $groomer->idGroomer,
                'generadoEn' => now(),
                'resultadoJson' => json_encode([
                    'total_citas' => $groomer->citas()->count(),
                    'servicios_populares' => ['Baño', 'Corte', 'Uñas'],
                    'ocupacion' => rand(60, 95) . '%',
                ]),
            ]);
        }
        
    }
}
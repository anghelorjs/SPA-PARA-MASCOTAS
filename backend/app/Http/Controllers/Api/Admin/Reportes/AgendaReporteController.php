<?php
// app/Http/Controllers/Api/Admin/Reportes/AgendaReporteController.php

namespace App\Http\Controllers\Api\Admin\Reportes;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\Groomer;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AgendaReporteController extends ApiController
{
    /**
     * Generar reporte de agenda (citas por día, groomer, servicio)
     */
    public function generar(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'groomer_id' => 'nullable|exists:groomers,idGroomer'
        ]);

        $fechaDesde = Carbon::parse($request->fecha_desde);
        $fechaHasta = Carbon::parse($request->fecha_hasta);

        $query = Cita::with(['mascota.cliente.user', 'groomer.user', 'servicio'])
            ->whereBetween('fechaHoraInicio', [$fechaDesde, $fechaHasta]);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        $citas = $query->orderBy('fechaHoraInicio')->get();

        // ========== ESTADÍSTICAS GENERALES ==========
        $totalCitas = $citas->count();
        $citasCompletadas = $citas->where('estado', 'completada')->count();
        $citasCanceladas = $citas->where('estado', 'cancelada')->count();
        $citasProgramadas = $citas->where('estado', 'programada')->count();
        $citasConfirmadas = $citas->where('estado', 'confirmada')->count();
        $citasEnCurso = $citas->where('estado', 'en_curso')->count();
        
        $tasaCompletadas = $totalCitas > 0 ? round(($citasCompletadas / $totalCitas) * 100, 2) : 0;
        $tasaCanceladas = $totalCitas > 0 ? round(($citasCanceladas / $totalCitas) * 100, 2) : 0;

        // ========== GRÁFICA DE BARRAS: Citas por día ==========
        $citasPorDia = $citas->groupBy(function($cita) {
            return $cita->fechaHoraInicio->format('Y-m-d');
        })->map(function($items, $fecha) {
            return [
                'fecha' => $fecha,
                'total' => $items->count(),
                'completadas' => $items->where('estado', 'completada')->count(),
                'canceladas' => $items->where('estado', 'cancelada')->count()
            ];
        })->values();

        // ========== GRÁFICA COMPARATIVA: Citas por groomer ==========
        $citasPorGroomer = $citas->groupBy(function($cita) {
            return $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido;
        })->map(function($items, $groomer) {
            return [
                'groomer' => $groomer,
                'total_citas' => $items->count(),
                'completadas' => $items->where('estado', 'completada')->count(),
                'canceladas' => $items->where('estado', 'cancelada')->count(),
                'porcentaje' => round(($items->count() / $items->first()->groomer->citas()->count()) * 100, 2)
            ];
        })->values();

        // ========== GRÁFICA DE DONA: Citas por servicio ==========
        $citasPorServicio = $citas->groupBy('servicio.nombre')->map(function($items, $servicio) use ($citas) {
            return [
                'servicio' => $servicio,
                'total_citas' => $items->count(),
                'porcentaje' => round(($items->count() / $citas->count()) * 100, 2)
            ];
        })->values();

        // ========== OCUPACIÓN POR GROOMER Y FRANJA HORARIA ==========
        $groomers = Groomer::with('user')->get();
        $franjasHorarias = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
                            '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'];
        
        $ocupacionFranjas = [];
        foreach ($groomers as $groomer) {
            $franjasData = [];
            foreach ($franjasHorarias as $franja) {
                list($horaInicio, $horaFin) = explode('-', $franja);
                $citasEnFranja = Cita::where('idGroomer', $groomer->idGroomer)
                    ->whereBetween('fechaHoraInicio', [$fechaDesde, $fechaHasta])
                    ->whereTime('fechaHoraInicio', '>=', $horaInicio . ':00')
                    ->whereTime('fechaHoraInicio', '<', $horaFin . ':00')
                    ->count();
                
                $franjasData[] = [
                    'franja' => $franja,
                    'citas' => $citasEnFranja
                ];
            }
            $ocupacionFranjas[] = [
                'groomer' => $groomer->user->nombre . ' ' . $groomer->user->apellido,
                'franjas' => $franjasData
            ];
        }

        // ========== CITAS CANCELADAS VS COMPLETADAS ==========
        $canceladasVsCompletadas = [
            ['tipo' => 'Completadas', 'total' => $citasCompletadas],
            ['tipo' => 'Canceladas', 'total' => $citasCanceladas]
        ];

        // ========== GUARDAR REPORTE ==========
        $resultadoJson = [
            'filtros' => [
                'fecha_desde' => $fechaDesde->format('Y-m-d'),
                'fecha_hasta' => $fechaHasta->format('Y-m-d'),
                'groomer_id' => $request->groomer_id
            ],
            'estadisticas' => [
                'total_citas' => $totalCitas,
                'citas_completadas' => $citasCompletadas,
                'citas_canceladas' => $citasCanceladas,
                'citas_programadas' => $citasProgramadas,
                'citas_confirmadas' => $citasConfirmadas,
                'citas_en_curso' => $citasEnCurso,
                'tasa_completadas' => $tasaCompletadas,
                'tasa_canceladas' => $tasaCanceladas
            ]
        ];

        $this->guardarReporte('agenda', $fechaDesde, $fechaHasta, $request->groomer_id, $resultadoJson);

        // ========== DATOS PARA EXPORTACIÓN ==========
        $exportData = $citas->map(function($cita) {
            return [
                'ID' => $cita->idCita,
                'Fecha' => $cita->fechaHoraInicio->format('Y-m-d H:i'),
                'Mascota' => $cita->mascota->nombre,
                'Cliente' => $cita->mascota->cliente->user->nombre . ' ' . $cita->mascota->cliente->user->apellido,
                'Groomer' => $cita->groomer->user->nombre . ' ' . $cita->groomer->user->apellido,
                'Servicio' => $cita->servicio->nombre,
                'Duración' => $cita->duracionCalculadaMin . ' min',
                'Estado' => $cita->estado
            ];
        });

        return $this->successResponse([
            'estadisticas' => [
                'total_citas' => $totalCitas,
                'citas_completadas' => $citasCompletadas,
                'citas_canceladas' => $citasCanceladas,
                'tasa_completadas' => $tasaCompletadas,
                'tasa_canceladas' => $tasaCanceladas
            ],
            'grafica_citas_por_dia' => $citasPorDia,
            'grafica_citas_por_groomer' => $citasPorGroomer,
            'grafica_citas_por_servicio' => $citasPorServicio,
            'ocupacion_franjas' => $ocupacionFranjas,
            'canceladas_vs_completadas' => $canceladasVsCompletadas,
            'detalle_citas' => $citas,
            'export_data' => $exportData
        ], 'Reporte de agenda generado correctamente');
    }

    /**
     * Guardar reporte generado
     */
    private function guardarReporte($tipo, $fechaDesde, $fechaHasta, $groomerId, $resultadoJson)
    {
        $user = auth()->guard('api')->user();
        
        if (!$user || !isset($user->administrador)) {
            return;
        }
        
        Reporte::create([
            'idAdministrador' => $user->administrador->idAdministrador,
            'tipoReporte' => $tipo,
            'fechaDesde' => $fechaDesde,
            'fechaHasta' => $fechaHasta,
            'idGroomerFiltro' => $groomerId,
            'generadoEn' => now(),
            'resultadoJson' => json_encode($resultadoJson)
        ]);
    }
}
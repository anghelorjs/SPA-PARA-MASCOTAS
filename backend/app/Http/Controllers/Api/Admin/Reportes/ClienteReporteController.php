<?php
// app/Http/Controllers/Api/Admin/Reportes/ClienteReporteController.php

namespace App\Http\Controllers\Api\Admin\Reportes;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cliente;
use App\Models\Mascota;
use App\Models\Reporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClienteReporteController extends ApiController
{
    /**
     * Generar reporte de clientes
     */
    public function generar(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde'
        ]);

        $fechaDesde = $request->fecha_desde ? Carbon::parse($request->fecha_desde) : null;
        $fechaHasta = $request->fecha_hasta ? Carbon::parse($request->fecha_hasta) : null;

        // ========== TOP CLIENTES POR NÚMERO DE CITAS ==========
        $topClientes = Cliente::with('user')
            ->withCount(['mascotas as citas_count' => function($query) use ($fechaDesde, $fechaHasta) {
                $query->join('citas', 'mascotas.idMascota', '=', 'citas.idMascota');
                if ($fechaDesde) {
                    $query->whereDate('citas.fechaHoraInicio', '>=', $fechaDesde);
                }
                if ($fechaHasta) {
                    $query->whereDate('citas.fechaHoraInicio', '<=', $fechaHasta);
                }
            }])
            ->orderBy('citas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($cliente) {
                $totalGastado = $cliente->ventas()->where('estado', 'pagado')->sum('total');
                return [
                    'id' => $cliente->idCliente,
                    'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                    'telefono' => $cliente->user->telefono,
                    'email' => $cliente->user->email,
                    'total_citas' => $cliente->citas_count,
                    'total_gastado' => $totalGastado
                ];
            });

        // ========== CLIENTES SIN CITA EN LOS ÚLTIMOS 60 DÍAS (RETENCIÓN) ==========
        $fechaLimite = now()->subDays(60);
        $clientesInactivos = Cliente::with('user')
            ->whereDoesntHave('mascotas.citas', function($query) use ($fechaLimite) {
                $query->whereDate('fechaHoraInicio', '>=', $fechaLimite);
            })
            ->get()
            ->map(function($cliente) {
                $ultimaCita = $cliente->mascotas->flatMap->citas->sortByDesc('fechaHoraInicio')->first();
                $diasInactivo = $ultimaCita ? now()->diffInDays($ultimaCita->fechaHoraInicio) : null;
                return [
                    'id' => $cliente->idCliente,
                    'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                    'telefono' => $cliente->user->telefono,
                    'email' => $cliente->user->email,
                    'ultima_cita' => $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d') : 'Nunca',
                    'dias_inactivo' => $diasInactivo
                ];
            });

        // ========== TOP MASCOTAS MÁS ATENDIDAS ==========
        $mascotasQuery = Mascota::with('cliente.user')
            ->withCount('citas');
        
        if ($fechaDesde && $fechaHasta) {
            $mascotasQuery->withCount(['citas as citas_periodo_count' => function($query) use ($fechaDesde, $fechaHasta) {
                $query->whereBetween('fechaHoraInicio', [$fechaDesde, $fechaHasta]);
            }]);
        }
        
        $topMascotas = $mascotasQuery->orderBy('citas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($mascota) use ($fechaDesde, $fechaHasta) {
                $periodoCitas = $fechaDesde && $fechaHasta ? $mascota->citas_periodo_count : $mascota->citas_count;
                return [
                    'id' => $mascota->idMascota,
                    'nombre' => $mascota->nombre,
                    'especie' => $mascota->especie,
                    'raza' => $mascota->raza,
                    'dueno' => $mascota->cliente->user->nombre . ' ' . $mascota->cliente->user->apellido,
                    'total_citas' => $mascota->citas_count,
                    'citas_periodo' => $periodoCitas
                ];
            });

        // ========== DISTRIBUCIÓN POR ESPECIE ==========
        $distribucionEspecie = Mascota::select('especie', DB::raw('count(*) as total'))
            ->groupBy('especie')
            ->get()
            ->map(function($item) {
                return [
                    'especie' => $item->especie,
                    'total' => $item->total,
                    'porcentaje' => round(($item->total / Mascota::count()) * 100, 2)
                ];
            });

        // ========== CLIENTES NUEVOS POR MES ==========
        $clientesNuevosPorMes = Cliente::select(DB::raw('YEAR(created_at) as año'), DB::raw('MONTH(created_at) as mes'), DB::raw('count(*) as total'))
            ->groupBy('año', 'mes')
            ->orderBy('año', 'desc')
            ->orderBy('mes', 'desc')
            ->limit(12)
            ->get()
            ->map(function($item) {
                $nombreMes = Carbon::create()->month($item->mes)->locale('es')->isoFormat('MMMM');
                return [
                    'mes' => $nombreMes,
                    'año' => $item->año,
                    'total' => $item->total
                ];
            });

        // ========== GUARDAR REPORTE ==========
        $resultadoJson = [
            'filtros' => [
                'fecha_desde' => $fechaDesde ? $fechaDesde->format('Y-m-d') : null,
                'fecha_hasta' => $fechaHasta ? $fechaHasta->format('Y-m-d') : null
            ],
            'top_clientes' => $topClientes->count(),
            'clientes_inactivos' => $clientesInactivos->count()
        ];

        $this->guardarReporte('clientes', $fechaDesde, $fechaHasta, null, $resultadoJson);

        // ========== DATOS PARA EXPORTACIÓN ==========
        $exportData = [
            'top_clientes' => $topClientes,
            'clientes_inactivos' => $clientesInactivos,
            'top_mascotas' => $topMascotas
        ];

        return $this->successResponse([
            'top_clientes' => $topClientes,
            'clientes_inactivos' => $clientesInactivos,
            'top_mascotas' => $topMascotas,
            'distribucion_por_especie' => $distribucionEspecie,
            'clientes_nuevos_por_mes' => $clientesNuevosPorMes,
            'export_data' => $exportData
        ], 'Reporte de clientes generado correctamente');
    }

    private function guardarReporte($tipo, $fechaDesde, $fechaHasta, $groomerId, $resultadoJson)
    {
        $user = Auth::user();
        
        if (!$user || !$user->administrador) {
            return;
        }
        
        Reporte::create([
            'idAdministrador' => $user->administrador->idAdministrador,
            'tipoReporte' => $tipo,
            'fechaDesde' => $fechaDesde ?: now(),
            'fechaHasta' => $fechaHasta ?: now(),
            'idGroomerFiltro' => $groomerId,
            'generadoEn' => now(),
            'resultadoJson' => json_encode($resultadoJson)
        ]);
    }
}
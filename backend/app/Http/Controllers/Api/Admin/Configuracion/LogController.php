<?php

namespace App\Http\Controllers\Api\Admin\Configuracion;

use App\Http\Controllers\Api\ApiController;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogController extends ApiController
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'user_id' => 'nullable|integer|exists:users,idUsuario',
            'action' => 'nullable|string|max:100',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'search' => 'nullable|string|max:255',
        ]);

        $query = ActivityLog::with([
            'user:idUsuario,nombre,apellido,email,rol',
        ]);

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }

        if (!empty($validated['fecha_desde'])) {
            $query->whereDate('created_at', '>=', $validated['fecha_desde']);
        }

        if (!empty($validated['fecha_hasta'])) {
            $query->whereDate('created_at', '<=', $validated['fecha_hasta']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 15);

        $usuarios = User::select('idUsuario', 'nombre', 'apellido', 'email')
            ->orderBy('nombre')
            ->orderBy('apellido')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->idUsuario,
                'nombre' => trim($user->nombre . ' ' . $user->apellido),
                'email' => $user->email,
            ])
            ->values();

        $acciones = ActivityLog::query()
            ->whereNotNull('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->values();

        return $this->successResponse([
            'logs' => $logs,
            'usuarios' => $usuarios,
            'acciones' => $acciones,
        ], 'Logs obtenidos correctamente');
    }

    public function show($id)
    {
        $log = ActivityLog::with('user:idUsuario,nombre,apellido,email,rol')->find($id);

        if (!$log) {
            return $this->errorResponse('Log no encontrado', 404);
        }

        return $this->successResponse($log, 'Log obtenido correctamente');
    }

    public function stats(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $validated['fecha_inicio'] ?? now()->subDays(30)->toDateString();
        $fechaFin = $validated['fecha_fin'] ?? now()->toDateString();

        $baseQuery = ActivityLog::query()
            ->whereDate('created_at', '>=', $fechaInicio)
            ->whereDate('created_at', '<=', $fechaFin);

        $actividadPorDia = (clone $baseQuery)
            ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('count(*) as total'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('fecha')
            ->get();

        $topUsuarios = (clone $baseQuery)
            ->select('user_id', DB::raw('count(*) as total'))
            ->with('user:idUsuario,nombre,apellido,email')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function (ActivityLog $item) {
                return [
                    'usuario' => $item->user
                        ? trim($item->user->nombre . ' ' . $item->user->apellido)
                        : 'Desconocido',
                    'total' => $item->total,
                ];
            });

        $topAcciones = (clone $baseQuery)
            ->select('action', DB::raw('count(*) as total'))
            ->groupBy('action')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return $this->successResponse([
            'actividad_por_dia' => $actividadPorDia,
            'top_usuarios' => $topUsuarios,
            'top_acciones' => $topAcciones,
            'total_logs' => (clone $baseQuery)->count(),
            'logs_hoy' => ActivityLog::whereDate('created_at', now()->toDateString())->count(),
        ], 'Estadisticas obtenidas correctamente');
    }
}

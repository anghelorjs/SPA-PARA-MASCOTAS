<?php
// app/Http/Controllers/Api/Admin/Grooming/FichaController.php

namespace App\Http\Controllers\Api\Admin\Grooming;

use App\Http\Controllers\Api\ApiController;
use App\Models\FichaGrooming;
use Illuminate\Http\Request;

class FichaController extends ApiController
{
    /**
     * Listar fichas del día (todos los groomers)
     */
    public function hoy(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());
        
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user'])
            ->whereDate('fechaApertura', $fecha);
        
        // Filtro por groomer
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        // Filtro por estado
        if ($request->has('estado')) {
            if ($request->estado === 'abierta') {
                $query->whereNull('fechaCierre');
            } elseif ($request->estado === 'cerrada') {
                $query->whereNotNull('fechaCierre');
            }
        }
        
        $fichas = $query->orderBy('fechaApertura', 'desc')
            ->get()
            ->map(function($ficha) {
                return [
                    'id' => $ficha->idFicha,
                    'groomer' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido,
                    'groomer_id' => $ficha->idGroomer,
                    'mascota' => $ficha->cita->mascota->nombre,
                    'mascota_id' => $ficha->idMascota,
                    'servicio' => $ficha->cita->servicio->nombre,
                    'hora_apertura' => $ficha->fechaApertura->format('H:i'),
                    'hora_cierre' => $ficha->fechaCierre ? $ficha->fechaCierre->format('H:i') : null,
                    'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta'
                ];
            });
        
        return $this->successResponse($fichas, 'Fichas del día obtenidas correctamente');
    }

    /**
     * Listar todas las fichas (histórico completo)
     */
    public function todas(Request $request)
    {
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user']);
        
        // Búsqueda por nombre de mascota o groomer
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('cita.mascota', function($q2) use ($search) {
                    $q2->where('nombre', 'like', "%{$search}%");
                })->orWhereHas('groomer.user', function($q2) use ($search) {
                    $q2->where('nombre', 'like', "%{$search}%")
                       ->orWhere('apellido', 'like', "%{$search}%");
                });
            });
        }
        
        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaApertura', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaApertura', '<=', $request->fecha_hasta);
        }
        
        // Filtro por groomer
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        // Filtro por estado
        if ($request->has('estado')) {
            if ($request->estado === 'abierta') {
                $query->whereNull('fechaCierre');
            } elseif ($request->estado === 'cerrada') {
                $query->whereNotNull('fechaCierre');
            }
        }
        
        $fichas = $query->orderBy('fechaApertura', 'desc')
            ->paginate($request->get('per_page', 15))
            ->through(function($ficha) {
                return [
                    'id' => $ficha->idFicha,
                    'fecha_apertura' => $ficha->fechaApertura->format('d/m/Y H:i'),
                    'fecha_cierre' => $ficha->fechaCierre ? $ficha->fechaCierre->format('d/m/Y H:i') : null,
                    'groomer' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido,
                    'mascota' => $ficha->cita->mascota->nombre,
                    'servicio' => $ficha->cita->servicio->nombre,
                    'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta'
                ];
            });
        
        return $this->successResponse($fichas, 'Todas las fichas obtenidas correctamente');
    }

    /**
     * Ver detalle completo de una ficha (solo lectura)
     */
    public function show($id)
    {
        $ficha = FichaGrooming::with([
            'cita' => function($q) {
                $q->with(['mascota.cliente.user', 'servicio', 'groomer.user']);
            },
            'checklistItems',
            'detalleInsumos.insumo',
            'fotos'
        ])->find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada', 404);
        }
        
        $mascota = $ficha->cita->mascota;
        $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
        
        $checklistPredefinido = ['Baño', 'Corte', 'Uñas', 'Oídos', 'Glándulas', 'Perfume'];
        $checklistItems = $ficha->checklistItems->keyBy('nombreItem');
        
        $checklistCompleto = collect($checklistPredefinido)->map(function($item) use ($checklistItems) {
            $checklistItem = $checklistItems->get($item);
            return [
                'nombre' => $item,
                'completado' => $checklistItem ? (bool) $checklistItem->completado : false,
                'observacion' => $checklistItem ? $checklistItem->observacion : null
            ];
        });
        
        $completados = $checklistCompleto->where('completado', true)->count();
        
        return $this->successResponse([
            'ficha' => [
                'id' => $ficha->idFicha,
                'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta',
                'fecha_apertura' => $ficha->fechaApertura->format('d/m/Y H:i'),
                'fecha_cierre' => $ficha->fechaCierre ? $ficha->fechaCierre->format('d/m/Y H:i') : null,
                'progreso_checklist' => round(($completados / 6) * 100)
            ],
            'cita' => [
                'id' => $ficha->cita->idCita,
                'fecha' => $ficha->cita->fechaHoraInicio->format('d/m/Y'),
                'hora_inicio' => $ficha->cita->fechaHoraInicio->format('H:i'),
                'hora_fin' => $ficha->cita->fechaHoraFin->format('H:i')
            ],
            'mascota' => [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $rangoNombre,
                'temperamento' => $mascota->temperamento,
                'alergias' => $mascota->alergias,
                'restricciones' => $mascota->restricciones
            ],
            'servicio' => [
                'id' => $ficha->cita->servicio->idServicio,
                'nombre' => $ficha->cita->servicio->nombre,
                'duracion' => $ficha->cita->duracionCalculadaMin,
                'precio' => $ficha->cita->servicio->getPrecioForRango($mascota->idRango)
            ],
            'groomer' => [
                'id' => $ficha->groomer->idGroomer,
                'nombre' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido
            ],
            'estado_ingreso' => [
                'estadoIngreso' => $ficha->estadoIngreso,
                'nudos' => (bool) $ficha->nudos,
                'tienePulgas' => (bool) $ficha->tienePulgas,
                'tieneHeridas' => (bool) $ficha->tieneHeridas
            ],
            'checklist' => $checklistCompleto,
            'insumos' => $ficha->detalleInsumos->map(function($detalle) {
                return [
                    'id' => $detalle->idDetalleInsumo,
                    'nombre' => $detalle->insumo->nombre,
                    'unidad_medida' => $detalle->insumo->unidadMedida,
                    'cantidad_usada' => $detalle->cantidadUsada
                ];
            }),
            'observaciones' => [
                'observaciones' => $ficha->observaciones,
                'recomendaciones' => $ficha->recomendaciones
            ],
            'fotos' => [
                'antes' => $ficha->fotos->where('tipo', 'antes')->values(),
                'despues' => $ficha->fotos->where('tipo', 'despues')->values()
            ]
        ], 'Ficha obtenida correctamente');
    }
}
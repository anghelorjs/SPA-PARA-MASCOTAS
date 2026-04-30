<?php
// app/Http/Controllers/Api/Groomer/FichaController.php

namespace App\Http\Controllers\Api\Groomer;

use App\Http\Controllers\Api\ApiController;
use App\Models\FichaGrooming;
use App\Models\Cita;
use App\Models\Insumo;
use App\Models\DetalleInsumo;
use App\Models\Foto;
use App\Models\Notificacion;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FichaController extends ApiController
{
    // ==================== LISTADO DE FICHAS ====================

    /**
     * Listar fichas del groomer (pestaña Hoy)
     */
    public function hoy(Request $request)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        $fecha = $request->get('fecha', now()->toDateString());
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio'])
            ->where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaApertura', $fecha);
        
        // Filtro por estado
        if ($request->has('estado') && $request->estado !== 'todas') {
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
                    'mascota' => $ficha->cita->mascota->nombre,
                    'hora_apertura' => $ficha->fechaApertura->format('H:i'),
                    'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta',
                    'servicio' => $ficha->cita->servicio->nombre
                ];
            });
        
        return $this->successResponse($fichas, 'Fichas del día obtenidas correctamente');
    }

    /**
     * Listar todas las fichas del groomer (histórico)
     */
    public function todas(Request $request)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio'])
            ->where('idGroomer', $groomer->idGroomer);
        
        // Búsqueda por nombre de mascota
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('cita.mascota', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%");
            });
        }
        
        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaApertura', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaApertura', '<=', $request->fecha_hasta);
        }
        
        // Filtro por estado
        if ($request->has('estado') && $request->estado !== 'todas') {
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
                    'mascota' => $ficha->cita->mascota->nombre,
                    'servicio' => $ficha->cita->servicio->nombre,
                    'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta'
                ];
            });
        
        return $this->successResponse($fichas, 'Todas las fichas obtenidas correctamente');
    }

    // ==================== DETALLE DE FICHA ====================

    /**
     * Ver detalle completo de una ficha
     */
    public function show($id)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
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
        
        if ($ficha->idGroomer !== $groomer->idGroomer) {
            return $this->errorResponse('No tienes permiso para ver esta ficha', 403);
        }
        
        $mascota = $ficha->cita->mascota;
        $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
        
        // Calcular progreso del checklist
        $totalChecklist = 6; // Baño, Corte, Uñas, Oídos, Glándulas, Perfume
        $completados = $ficha->checklistItems->where('completado', true)->count();
        $progreso = round(($completados / $totalChecklist) * 100);
        $puedeCerrar = $completados >= 5;
        
        // Obtener galería histórica de la mascota
        $galeriaHistorica = Foto::with(['fichaGrooming.cita.servicio'])
            ->where('idMascota', $mascota->idMascota)
            ->where('idFicha', '!=', $id)
            ->orderBy('fechaCarga', 'desc')
            ->get()
            ->map(function($foto) {
                return [
                    'id' => $foto->idFoto,
                    'url' => $foto->urlFoto,
                    'tipo' => $foto->tipo,
                    'fecha' => $foto->fechaCarga->format('d/m/Y H:i'),
                    'servicio' => $foto->fichaGrooming->cita->servicio->nombre ?? 'Desconocido'
                ];
            });
        
        return $this->successResponse([
            'ficha' => [
                'id' => $ficha->idFicha,
                'estado' => $ficha->fechaCierre ? 'cerrada' : 'abierta',
                'fecha_apertura' => $ficha->fechaApertura->format('d/m/Y H:i'),
                'fecha_cierre' => $ficha->fechaCierre ? $ficha->fechaCierre->format('d/m/Y H:i') : null,
                'puede_cerrar' => $puedeCerrar,
                'progreso_checklist' => $progreso
            ],
            'cita' => [
                'id' => $ficha->cita->idCita,
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
                'restricciones' => $mascota->restricciones,
                'vacunas' => $mascota->vacunas
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
            'checklist' => $ficha->checklistItems->map(function($item) {
                return [
                    'id' => $item->idItem,
                    'nombre' => $item->nombreItem,
                    'completado' => (bool) $item->completado,
                    'observacion' => $item->observacion
                ];
            }),
            'insumos' => $ficha->detalleInsumos->map(function($detalle) {
                return [
                    'id' => $detalle->idDetalleInsumo,
                    'insumo_id' => $detalle->idInsumo,
                    'insumo_nombre' => $detalle->insumo->nombre,
                    'unidad_medida' => $detalle->insumo->unidadMedida,
                    'cantidad_usada' => $detalle->cantidadUsada
                ];
            }),
            'fotos' => [
                'antes' => $ficha->fotos->where('tipo', 'antes')->values(),
                'despues' => $ficha->fotos->where('tipo', 'despues')->values()
            ],
            'observaciones' => [
                'observaciones' => $ficha->observaciones,
                'recomendaciones' => $ficha->recomendaciones
            ],
            'galeria_historica' => $galeriaHistorica
        ], 'Ficha obtenida correctamente');
    }

    // ==================== PESTAÑA 1: Estado de Ingreso ====================

    /**
     * Actualizar estado de ingreso
     */
    public function updateEstadoIngreso(Request $request, $id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $request->validate([
            'estadoIngreso' => 'nullable|string',
            'nudos' => 'boolean',
            'tienePulgas' => 'boolean',
            'tieneHeridas' => 'boolean'
        ]);
        
        $ficha->update($request->only(['estadoIngreso', 'nudos', 'tienePulgas', 'tieneHeridas']));
        
        return $this->successResponse($ficha, 'Estado de ingreso actualizado correctamente');
    }

    // ==================== PESTAÑA 2: Checklist ====================

    /**
     * Obtener checklist predefinido
     */
    public function getChecklistPredefinido()
    {
        $itemsPredefinidos = [
            ['nombre' => 'Baño', 'completado' => false],
            ['nombre' => 'Corte', 'completado' => false],
            ['nombre' => 'Uñas', 'completado' => false],
            ['nombre' => 'Oídos', 'completado' => false],
            ['nombre' => 'Glándulas', 'completado' => false],
            ['nombre' => 'Perfume', 'completado' => false]
        ];
        
        return $this->successResponse($itemsPredefinidos, 'Checklist predefinido obtenido');
    }

    /**
     * Actualizar checklist completo
     */
    public function updateChecklist(Request $request, $id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $request->validate([
            'checklist' => 'required|array|min:6',
            'checklist.*.nombre' => 'required|string',
            'checklist.*.completado' => 'boolean',
            'checklist.*.observacion' => 'nullable|string'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Eliminar items existentes
            $ficha->checklistItems()->delete();
            
            // Crear nuevos items
            foreach ($request->checklist as $item) {
                ChecklistItem::create([
                    'idFicha' => $ficha->idFicha,
                    'nombreItem' => $item['nombre'],
                    'completado' => $item['completado'] ?? false,
                    'observacion' => $item['observacion'] ?? null
                ]);
            }
            
            DB::commit();
            
            $completados = $ficha->checklistItems()->where('completado', true)->count();
            $puedeCerrar = $completados >= 5;
            
            return $this->successResponse([
                'checklist' => $ficha->checklistItems,
                'completados' => $completados,
                'total' => 6,
                'puede_cerrar' => $puedeCerrar
            ], 'Checklist actualizado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar checklist: ' . $e->getMessage(), 500);
        }
    }

    // ==================== PESTAÑA 3: Insumos ====================

    /**
     * Buscar insumos para agregar
     */
    public function buscarInsumos(Request $request)
    {
        $request->validate([
            'search' => 'required|string|min:2'
        ]);
        
        $insumos = Insumo::where('nombre', 'like', "%{$request->search}%")
            ->orWhere('unidadMedida', 'like', "%{$request->search}%")
            ->limit(20)
            ->get()
            ->map(function($insumo) {
                return [
                    'id' => $insumo->idInsumo,
                    'nombre' => $insumo->nombre,
                    'unidad_medida' => $insumo->unidadMedida,
                    'stock_actual' => $insumo->stockActual
                ];
            });
        
        return $this->successResponse($insumos, 'Insumos encontrados');
    }

    /**
     * Agregar insumo a la ficha
     */
    public function agregarInsumo(Request $request, $id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $request->validate([
            'idInsumo' => 'required|exists:insumos,idInsumo',
            'cantidadUsada' => 'required|numeric|min:0.01'
        ]);
        
        // Verificar stock disponible
        $insumo = Insumo::find($request->idInsumo);
        if ($insumo->stockActual < $request->cantidadUsada) {
            return $this->errorResponse("Stock insuficiente. Disponible: {$insumo->stockActual} {$insumo->unidadMedida}", 400);
        }
        
        // Verificar si ya existe para evitar duplicados
        $existente = DetalleInsumo::where('idFicha', $ficha->idFicha)
            ->where('idInsumo', $request->idInsumo)
            ->first();
        
        if ($existente) {
            return $this->errorResponse('Este insumo ya fue agregado a la ficha', 400);
        }
        
        DB::beginTransaction();
        
        try {
            $detalle = DetalleInsumo::create([
                'idFicha' => $ficha->idFicha,
                'idInsumo' => $request->idInsumo,
                'cantidadUsada' => $request->cantidadUsada
            ]);
            
            // NO descontar stock aquí, se descuenta al cerrar la ficha
            
            DB::commit();
            
            return $this->successResponse([
                'id' => $detalle->idDetalleInsumo,
                'insumo_id' => $insumo->idInsumo,
                'insumo_nombre' => $insumo->nombre,
                'unidad_medida' => $insumo->unidadMedida,
                'cantidad_usada' => $detalle->cantidadUsada
            ], 'Insumo agregado correctamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al agregar insumo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar insumo de la ficha
     */
    public function eliminarInsumo($fichaId, $detalleId)
    {
        $ficha = $this->validateFicha($fichaId);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $detalle = DetalleInsumo::where('idFicha', $fichaId)
            ->where('idDetalleInsumo', $detalleId)
            ->first();
        
        if (!$detalle) {
            return $this->errorResponse('Insumo no encontrado en esta ficha', 404);
        }
        
        $detalle->delete();
        
        return $this->successResponse(null, 'Insumo eliminado correctamente');
    }

    // ==================== PESTAÑA 4: Observaciones ====================

    /**
     * Actualizar observaciones y recomendaciones
     */
    public function updateObservaciones(Request $request, $id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $request->validate([
            'observaciones' => 'nullable|string',
            'recomendaciones' => 'nullable|string'
        ]);
        
        $ficha->update($request->only(['observaciones', 'recomendaciones']));
        
        return $this->successResponse([
            'observaciones' => $ficha->observaciones,
            'recomendaciones' => $ficha->recomendaciones
        ], 'Observaciones actualizadas correctamente');
    }

    // ==================== PESTAÑA 5: Fotos ====================

    /**
     * Subir foto a la ficha
     */
    public function uploadFoto(Request $request, $id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $request->validate([
            'tipo' => 'required|in:antes,despues',
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120'
        ]);
        
        try {
            $file = $request->file('foto');
            $path = $file->store('fotos-grooming/' . $ficha->idMascota, 'public');
            
            $foto = Foto::create([
                'idMascota' => $ficha->idMascota,
                'idFicha' => $ficha->idFicha,
                'urlFoto' => Storage::url($path),
                'tipo' => $request->tipo,
                'fechaCarga' => now()
            ]);
            
            return $this->successResponse([
                'id' => $foto->idFoto,
                'url' => $foto->urlFoto,
                'tipo' => $foto->tipo,
                'fecha' => $foto->fechaCarga->format('d/m/Y H:i')
            ], 'Foto subida correctamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al subir foto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar foto de la ficha
     */
    public function deleteFoto($fichaId, $fotoId)
    {
        $ficha = $this->validateFicha($fichaId);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('No se puede modificar una ficha cerrada', 400);
        }
        
        $foto = Foto::where('idFicha', $fichaId)
            ->where('idFoto', $fotoId)
            ->first();
        
        if (!$foto) {
            return $this->errorResponse('Foto no encontrada', 404);
        }
        
        try {
            // Eliminar archivo del storage
            $path = str_replace('/storage/', '', $foto->urlFoto);
            Storage::disk('public')->delete($path);
            
            $foto->delete();
            
            return $this->successResponse(null, 'Foto eliminada correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar foto: ' . $e->getMessage(), 500);
        }
    }

    // ==================== CERRAR FICHA ====================

    /**
     * Cerrar ficha
     */
    public function cerrarFicha($id)
    {
        $ficha = $this->validateFicha($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada o sin permisos', 404);
        }
        
        if ($ficha->fechaCierre) {
            return $this->errorResponse('La ficha ya está cerrada', 400);
        }
        
        // Verificar checklist completado (mínimo 5 de 6)
        $completados = $ficha->checklistItems()->where('completado', true)->count();
        
        if ($completados < 5) {
            return $this->errorResponse('Debes completar al menos 5 de 6 items del checklist antes de cerrar', 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Descontar stock de insumos
            foreach ($ficha->detalleInsumos as $detalle) {
                $insumo = Insumo::find($detalle->idInsumo);
                $insumo->stockActual -= $detalle->cantidadUsada;
                
                if ($insumo->stockActual < 0) {
                    throw new \Exception("Stock insuficiente para {$insumo->nombre}");
                }
                
                $insumo->save();
            }
            
            // Cerrar ficha
            $ficha->fechaCierre = now();
            $ficha->save();
            
            // Actualizar estado de la cita
            $cita = $ficha->cita;
            $cita->estado = 'completada';
            $cita->save();
            
            // Enviar notificación al cliente
            Notificacion::create([
                'idCliente' => $cita->mascota->idCliente,
                'idCita' => $cita->idCita,
                'tipo' => 'listo_para_recoger',
                'canal' => $cita->mascota->cliente->canalContacto ?? 'whatsapp',
                'mensaje' => "✅ ¡{$cita->mascota->nombre} ya está listo/a! Puedes pasar a recoger a tu mascota. 🐕✨",
                'fechaEnvio' => now(),
                'entregada' => false
            ]);
            
            DB::commit();
            
            return $this->successResponse([
                'ficha_id' => $ficha->idFicha,
                'cita_id' => $cita->idCita,
                'fecha_cierre' => $ficha->fechaCierre->format('d/m/Y H:i')
            ], 'Ficha cerrada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cerrar ficha: ' . $e->getMessage(), 500);
        }
    }

    // ==================== FUNCIÓN AUXILIAR ====================

    /**
     * Validar que la ficha pertenezca al groomer autenticado
     */
    private function validateFicha($id)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return null;
        }
        
        $ficha = FichaGrooming::find($id);
        
        if (!$ficha || $ficha->idGroomer !== $groomer->idGroomer) {
            return null;
        }
        
        return $ficha;
    }
}
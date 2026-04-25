<?php
// app/Http/Controllers/Api/Admin/GroomingController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\FichaGrooming;
use App\Models\Foto;
use App\Models\Mascota;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GroomingController extends ApiController
{
    // ==================== FICHAS DE GROOMING ====================
    
    /**
     * Listar fichas de grooming
     */
    public function fichas(Request $request)
    {
        $query = FichaGrooming::with(['cita.mascota', 'cita.servicio', 'groomer.user']);
        
        if ($request->has('groomer_id')) {
            $query->where('idGroomer', $request->groomer_id);
        }
        
        if ($request->has('estado')) {
            if ($request->estado === 'abierta') {
                $query->whereNull('fechaCierre');
            } else if ($request->estado === 'cerrada') {
                $query->whereNotNull('fechaCierre');
            }
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaApertura', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaApertura', '<=', $request->fecha_hasta);
        }
        
        $fichas = $query->orderBy('fechaApertura', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return $this->successResponse($fichas, 'Fichas obtenidas correctamente');
    }
    
    /**
     * Ver detalle de ficha de grooming
     */
    public function fichaShow($id)
    {
        $ficha = FichaGrooming::with([
            'cita' => function($q) {
                $q->with(['mascota', 'servicio', 'groomer.user']);
            },
            'checklistItems',
            'detalleInsumos.insumo',
            'fotos'
        ])->find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada', 404);
        }
        
        return $this->successResponse($ficha, 'Ficha obtenida correctamente');
    }
    
    /**
     * Abrir ficha de grooming (desde una cita)
     */
    public function abrirFicha(Request $request, $citaId)
    {
        $cita = Cita::with(['mascota', 'servicio'])->find($citaId);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        // Verificar si ya tiene ficha
        if ($cita->fichaGrooming) {
            return $this->errorResponse('La cita ya tiene una ficha asociada', 400);
        }
        
        $request->validate([
            'estadoIngreso' => 'nullable|string',
            'nudos' => 'boolean',
            'tienePulgas' => 'boolean',
            'tieneHeridas' => 'boolean',
            'observaciones' => 'nullable|string'
        ]);
        
        try {
            $ficha = FichaGrooming::create([
                'idCita' => $citaId,
                'idGroomer' => $cita->idGroomer,
                'idMascota' => $cita->idMascota,
                'estadoIngreso' => $request->estadoIngreso,
                'nudos' => $request->nudos ?? false,
                'tienePulgas' => $request->tienePulgas ?? false,
                'tieneHeridas' => $request->tieneHeridas ?? false,
                'observaciones' => $request->observaciones,
                'recomendaciones' => null,
                'fechaApertura' => now(),
                'fechaCierre' => null
            ]);
            
            // Actualizar estado de la cita
            $cita->estado = 'en_curso';
            $cita->save();
            
            return $this->successResponse($ficha, 'Ficha abierta correctamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al abrir ficha: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Actualizar checklist de ficha
     */
    public function updateChecklist(Request $request, $id)
    {
        $ficha = FichaGrooming::find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada', 404);
        }
        
        $request->validate([
            'checklist' => 'required|array',
            'checklist.*.nombreItem' => 'required|string',
            'checklist.*.completado' => 'boolean',
            'checklist.*.observacion' => 'nullable|string'
        ]);
        
        try {
            // Eliminar items existentes
            $ficha->checklistItems()->delete();
            
            // Crear nuevos items
            foreach ($request->checklist as $item) {
                $ficha->checklistItems()->create([
                    'nombreItem' => $item['nombreItem'],
                    'completado' => $item['completado'] ?? false,
                    'observacion' => $item['observacion'] ?? null
                ]);
            }
            
            return $this->successResponse($ficha->checklistItems, 'Checklist actualizado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar checklist: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Registrar consumo de insumos en ficha
     */
    public function registrarInsumos(Request $request, $id)
    {
        $ficha = FichaGrooming::find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada', 404);
        }
        
        $request->validate([
            'insumos' => 'required|array',
            'insumos.*.idInsumo' => 'required|exists:insumos,idInsumo',
            'insumos.*.cantidadUsada' => 'required|numeric|min:0.01'
        ]);
        
        try {
            foreach ($request->insumos as $item) {
                $ficha->detalleInsumos()->create([
                    'idInsumo' => $item['idInsumo'],
                    'cantidadUsada' => $item['cantidadUsada']
                ]);
                
                // Descontar stock del insumo
                $insumo = \App\Models\Insumo::find($item['idInsumo']);
                $insumo->stockActual -= $item['cantidadUsada'];
                $insumo->save();
            }
            
            return $this->successResponse($ficha->detalleInsumos, 'Insumos registrados correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al registrar insumos: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Cerrar ficha de grooming
     */
    public function cerrarFicha(Request $request, $id)
    {
        $ficha = FichaGrooming::find($id);
        
        if (!$ficha) {
            return $this->errorResponse('Ficha no encontrada', 404);
        }
        
        $request->validate([
            'recomendaciones' => 'nullable|string'
        ]);
        
        try {
            $ficha->fechaCierre = now();
            $ficha->recomendaciones = $request->recomendaciones;
            $ficha->save();
            
            // Actualizar estado de la cita
            $ficha->cita->estado = 'completada';
            $ficha->cita->save();
            
            return $this->successResponse($ficha, 'Ficha cerrada correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al cerrar ficha: ' . $e->getMessage(), 500);
        }
    }

    // ==================== GALERÍA DE FOTOS ====================
    
    /**
     * Listar fotos (con filtros)
     */
    public function fotos(Request $request)
    {
        $query = Foto::with(['mascota.cliente.user', 'fichaGrooming.cita.groomer.user']);
        
        if ($request->has('mascota_id')) {
            $query->where('idMascota', $request->mascota_id);
        }
        
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        if ($request->has('groomer_id')) {
            $query->whereHas('fichaGrooming', function($q) use ($request) {
                $q->where('idGroomer', $request->groomer_id);
            });
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaCarga', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaCarga', '<=', $request->fecha_hasta);
        }
        
        $fotos = $query->orderBy('fechaCarga', 'desc')
            ->paginate($request->get('per_page', 24));
        
        return $this->successResponse($fotos, 'Fotos obtenidas correctamente');
    }
    
    /**
     * Subir foto
     */
    public function uploadFoto(Request $request)
    {
        $request->validate([
            'idMascota' => 'required|exists:mascotas,idMascota',
            'idFicha' => 'nullable|exists:fichas_grooming,idFicha',
            'tipo' => 'required|in:antes,despues,perfil',
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120'
        ]);
        
        try {
            $file = $request->file('foto');
            $path = $file->store('fotos-mascotas/' . $request->idMascota, 'public');
            
            $foto = Foto::create([
                'idMascota' => $request->idMascota,
                'idFicha' => $request->idFicha,
                'urlFoto' => Storage::url($path),
                'tipo' => $request->tipo,
                'fechaCarga' => now()
            ]);
            
            return $this->successResponse($foto, 'Foto subida correctamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al subir foto: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Eliminar foto
     */
    public function deleteFoto($id)
    {
        $foto = Foto::find($id);
        
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
    
    /**
     * Galería agrupada por mascota
     */
    public function galeriaPorMascota($mascotaId)
    {
        $mascota = Mascota::with(['fotos', 'cliente.user'])->find($mascotaId);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $fotosAgrupadas = [
            'perfil' => $mascota->fotos->where('tipo', 'perfil')->values(),
            'antes' => $mascota->fotos->where('tipo', 'antes')->values(),
            'despues' => $mascota->fotos->where('tipo', 'despues')->values()
        ];
        
        return $this->successResponse([
            'mascota' => $mascota,
            'fotos' => $fotosAgrupadas
        ], 'Galería obtenida correctamente');
    }
}
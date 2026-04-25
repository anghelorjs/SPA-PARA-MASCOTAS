<?php
// app/Http/Controllers/Api/MascotaController.php

namespace App\Http\Controllers\Api;

use App\Models\Mascota;
use App\Models\RangoPeso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MascotaController extends ApiController
{
    /**
     * Listar mascotas de un cliente
     */
    public function index(Request $request, $clienteId = null)
    {
        $query = Mascota::with('cliente.user', 'rangoPeso');
        
        if ($clienteId) {
            $query->where('idCliente', $clienteId);
        }
        
        if ($request->has('search')) {
            $query->where('nombre', 'like', "%{$request->search}%")
                  ->orWhere('raza', 'like', "%{$request->search}%");
        }
        
        $mascotas = $query->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Mostrar una mascota específica
     */
    public function show($id)
    {
        $mascota = Mascota::with([
            'cliente.user', 
            'rangoPeso',
            'citas.servicio',
            'citas.groomer.user',
            'fotos'
        ])->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        return $this->successResponse($mascota, 'Mascota obtenida correctamente');
    }

    /**
     * Crear una nueva mascota
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'nombre' => 'required|string|max:100',
            'especie' => 'required|in:perro,gato,otro',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array',
        ]);

        DB::beginTransaction();
        
        try {
            // Calcular rango de peso automáticamente
            $idRango = null;
            if ($request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                                  ->where('pesoMaxKg', '>=', $request->pesoKg)
                                  ->first();
                $idRango = $rango ? $rango->idRango : null;
            }
            
            $mascota = Mascota::create([
                'idCliente' => $request->idCliente,
                'idRango' => $idRango,
                'nombre' => $request->nombre,
                'especie' => $request->especie,
                'raza' => $request->raza,
                'tamanio' => $request->tamanio,
                'pesoKg' => $request->pesoKg,
                'fechaNacimiento' => $request->fechaNacimiento,
                'temperamento' => $request->temperamento,
                'alergias' => $request->alergias ? json_encode($request->alergias) : null,
                'restricciones' => $request->restricciones ? json_encode($request->restricciones) : null,
                'vacunas' => $request->vacunas ? json_encode($request->vacunas) : null,
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $mascota->load('cliente.user', 'rangoPeso'), 
                'Mascota creada exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear la mascota: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar una mascota
     */
    public function update(Request $request, $id)
    {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'especie' => 'sometimes|in:perro,gato,otro',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array',
        ]);

        DB::beginTransaction();
        
        try {
            // Recalcular rango de peso si cambió el peso
            if ($request->has('pesoKg') && $request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                                  ->where('pesoMaxKg', '>=', $request->pesoKg)
                                  ->first();
                $mascota->idRango = $rango ? $rango->idRango : null;
            }
            
            foreach ($request->all() as $key => $value) {
                if ($key !== 'idCliente' && $key !== 'idRango') {
                    if (in_array($key, ['alergias', 'restricciones', 'vacunas']) && $value) {
                        $mascota->$key = json_encode($value);
                    } else {
                        $mascota->$key = $value;
                    }
                }
            }
            
            $mascota->save();
            
            DB::commit();
            
            return $this->successResponse(
                $mascota->fresh('cliente.user', 'rangoPeso'), 
                'Mascota actualizada correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar la mascota: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar una mascota
     */
    public function destroy($id)
    {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        // Verificar si tiene citas activas
        $citasActivas = $mascota->citas()
            ->whereIn('estado', ['programada', 'confirmada', 'en_curso'])
            ->exists();
        
        if ($citasActivas) {
            return $this->errorResponse(
                'No se puede eliminar la mascota porque tiene citas activas', 
                400
            );
        }
        
        try {
            $mascota->delete();
            return $this->successResponse(null, 'Mascota eliminada correctamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar la mascota: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener historial de grooming de la mascota
     */
    public function historialGrooming($id)
    {
        $mascota = Mascota::with([
            'fichasGrooming.cita.servicio',
            'fichasGrooming.groomer.user',
            'fichasGrooming.checklistItems',
            'fichasGrooming.fotos'
        ])->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        return $this->successResponse($mascota, 'Historial de grooming obtenido correctamente');
    }
}
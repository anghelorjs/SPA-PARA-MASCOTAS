<?php
// app/Http/Controllers/Api/Admin/GestionMascotasController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Mascota;
use App\Models\RangoPeso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GestionMascotasController extends ApiController
{
    /**
     * Listar mascotas
     */
    public function index(Request $request)
    {
        $query = Mascota::with(['cliente.user', 'rangoPeso']);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%")
                  ->orWhere('raza', 'like', "%{$search}%")
                  ->orWhereHas('cliente.user', function($q) use ($search) {
                      $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('apellido', 'like', "%{$search}%");
                  });
        }
        
        if ($request->has('especie')) {
            $query->where('especie', $request->especie);
        }
        
        $mascotas = $query->paginate($request->get('per_page', 15));
        
        // Agregar datos adicionales
        $mascotas->getCollection()->transform(function($mascota) {
            $ultimaCita = $mascota->citas()->latest('fechaHoraInicio')->first();
            $mascota->ultima_cita = $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d H:i') : null;
            $mascota->ultimo_servicio = $ultimaCita ? $ultimaCita->servicio->nombre : null;
            
            return $mascota;
        });
        
        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Ver ficha completa de la mascota
     */
    public function show($id)
    {
        $mascota = Mascota::with([
            'cliente.user',
            'rangoPeso',
            'citas' => function($q) {
                $q->with(['servicio', 'groomer.user', 'fichaGrooming'])
                  ->latest('fechaHoraInicio')
                  ->limit(10);
            },
            'fotos'
        ])->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        // Estadísticas
        $totalCitas = $mascota->citas()->count();
        $citasCompletadas = $mascota->citas()->where('estado', 'completada')->count();
        
        return $this->successResponse([
            'mascota' => $mascota,
            'estadisticas' => [
                'total_citas' => $totalCitas,
                'citas_completadas' => $citasCompletadas,
                'fotos_registradas' => $mascota->fotos->count()
            ]
        ], 'Ficha de mascota obtenida correctamente');
    }

    /**
     * Crear mascota
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'nombre' => 'required|string|max:100',
            'especie' => 'required|string|max:50',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Calcular rango de peso
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
                'vacunas' => $request->vacunas ? json_encode($request->vacunas) : null
            ]);
            
            DB::commit();
            
            return $this->successResponse($mascota->load('cliente.user', 'rangoPeso'), 'Mascota creada exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear mascota: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar mascota
     */
    public function update(Request $request, $id)
    {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'especie' => 'sometimes|string|max:50',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array'
        ]);
        
        DB::beginTransaction();
        
        try {
            if ($request->has('pesoKg') && $request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                    ->where('pesoMaxKg', '>=', $request->pesoKg)
                    ->first();
                $mascota->idRango = $rango ? $rango->idRango : null;
            }
            
            foreach ($request->all() as $key => $value) {
                if (in_array($key, ['alergias', 'restricciones', 'vacunas']) && $value) {
                    $mascota->$key = json_encode($value);
                } else if ($key !== 'idCliente') {
                    $mascota->$key = $value;
                }
            }
            
            $mascota->save();
            
            DB::commit();
            
            return $this->successResponse($mascota->fresh(), 'Mascota actualizada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar mascota: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Historial de grooming de la mascota
     */
    public function historialGrooming($id)
    {
        $mascota = Mascota::with([
            'fichasGrooming' => function($q) {
                $q->with(['cita.servicio', 'groomer.user', 'checklistItems', 'detalleInsumos.insumo'])
                  ->latest('fechaApertura');
            }
        ])->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        return $this->successResponse($mascota, 'Historial de grooming obtenido correctamente');
    }
}
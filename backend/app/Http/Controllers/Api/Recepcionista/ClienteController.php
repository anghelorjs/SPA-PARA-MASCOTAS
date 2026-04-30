<?php
// app/Http/Controllers/Api/Recepcionista/ClienteController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cliente;
use App\Models\Mascota;
use App\Models\User;
use App\Models\RangoPeso;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ClienteController extends ApiController
{
    /**
     * Listar clientes con filtros
     */
    public function index(Request $request)
    {
        $query = Cliente::with(['user', 'mascotas']);
        
        // Búsqueda por nombre o teléfono (en tiempo real)
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $clientes = $query->paginate($request->get('per_page', 15));
        
        // Agregar datos adicionales
        $clientes->getCollection()->transform(function($cliente) {
            $ultimaCita = Cita::whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })->latest('fechaHoraInicio')->first();
            
            $cliente->cant_mascotas = $cliente->mascotas->count();
            $cliente->ultima_cita = $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d H:i') : null;
            $cliente->ultimo_servicio = $ultimaCita ? $ultimaCita->servicio->nombre : null;
            
            return $cliente;
        });
        
        return $this->successResponse($clientes, 'Clientes obtenidos correctamente');
    }

    /**
     * Ver perfil completo del cliente
     */
    public function show($id)
    {
        $cliente = Cliente::with([
            'user',
            'mascotas' => function($q) {
                $q->with(['citas' => function($q2) {
                    $q2->with(['servicio', 'groomer.user'])
                      ->latest('fechaHoraInicio')
                      ->limit(10);
                }, 'rangoPeso']);
            }
        ])->find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        // Estadísticas del cliente
        $totalCitas = Cita::whereHas('mascota', function($q) use ($cliente) {
            $q->where('idCliente', $cliente->idCliente);
        })->count();
        
        $totalGastado = $cliente->ventas()->where('estado', 'pagado')->sum('total');
        
        return $this->successResponse([
            'cliente' => $cliente,
            'estadisticas' => [
                'total_citas' => $totalCitas,
                'total_gastado' => $totalGastado,
                'mascotas_registradas' => $cliente->mascotas->count()
            ]
        ], 'Perfil de cliente obtenido correctamente');
    }

    /**
     * Crear nuevo cliente
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms'
        ]);
        
        DB::beginTransaction();
        
        try {
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($request->password ?? 'cliente123'),
                'telefono' => $request->telefono,
                'rol' => 'cliente',
                'activo' => true
            ]);
            
            $cliente = Cliente::create([
                'idUsuario' => $user->idUsuario,
                'direccion' => $request->direccion,
                'preferencias' => $request->preferencias ? json_encode($request->preferencias) : null,
                'canalContacto' => $request->canalContacto ?? 'whatsapp'
            ]);
            
            DB::commit();
            
            return $this->successResponse($cliente->load('user'), 'Cliente creado exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar cliente
     */
    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'sometimes|email|unique:users,email,' . $cliente->user->idUsuario . ',idUsuario',
            'direccion' => 'nullable|string',
            'preferencias' => 'nullable|array',
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Actualizar user
            if ($request->has('nombre')) $cliente->user->nombre = $request->nombre;
            if ($request->has('apellido')) $cliente->user->apellido = $request->apellido;
            if ($request->has('telefono')) $cliente->user->telefono = $request->telefono;
            if ($request->has('email')) $cliente->user->email = $request->email;
            $cliente->user->save();
            
            // Actualizar cliente
            if ($request->has('direccion')) $cliente->direccion = $request->direccion;
            if ($request->has('preferencias')) $cliente->preferencias = json_encode($request->preferencias);
            if ($request->has('canalContacto')) $cliente->canalContacto = $request->canalContacto;
            $cliente->save();
            
            DB::commit();
            
            return $this->successResponse($cliente->load('user'), 'Cliente actualizado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener historial de citas del cliente
     */
    public function historialCitas($id, Request $request)
    {
        $cliente = Cliente::find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $citas = Cita::with(['mascota', 'groomer.user', 'servicio', 'fichaGrooming'])
            ->whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->orderBy('fechaHoraInicio', 'desc')
            ->paginate($request->get('per_page', 20));
        
        return $this->successResponse($citas, 'Historial de citas obtenido correctamente');
    }

    // ==================== MASCOTAS ====================

    /**
     * Listar mascotas de un cliente
     */
    public function mascotas($clienteId)
    {
        $cliente = Cliente::find($clienteId);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascotas = $cliente->mascotas->map(function($mascota) {
            $ultimaCita = $mascota->citas()->latest('fechaHoraInicio')->first();
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $mascota->rangoPeso ? $mascota->rangoPeso->nombre : null,
                'ultima_cita' => $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d') : null
            ];
        });
        
        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }

    /**
     * Ver ficha de una mascota
     */
    public function mascotaShow($id)
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
        
        return $this->successResponse([
            'mascota' => $mascota,
            'historial_citas' => $mascota->citas
        ], 'Ficha de mascota obtenida correctamente');
    }

    /**
     * Crear nueva mascota
     */
    public function mascotaStore(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'nombre' => 'required|string|max:100',
            'especie' => 'required|string|max:50',
            'raza' => 'nullable|string|max:100',
            'pesoKg' => 'required|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'vacunas' => 'nullable|array'
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
                'pesoKg' => $request->pesoKg,
                'fechaNacimiento' => $request->fechaNacimiento,
                'temperamento' => $request->temperamento,
                'alergias' => $request->alergias ? json_encode($request->alergias) : null,
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
    public function mascotaUpdate(Request $request, $id)
    {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'especie' => 'sometimes|string|max:50',
            'raza' => 'nullable|string|max:100',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'vacunas' => 'nullable|array'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Recalcular rango si cambió el peso
            if ($request->has('pesoKg') && $request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                    ->where('pesoMaxKg', '>=', $request->pesoKg)
                    ->first();
                $mascota->idRango = $rango ? $rango->idRango : null;
            }
            
            foreach ($request->all() as $key => $value) {
                if (in_array($key, ['alergias', 'vacunas']) && $value) {
                    $mascota->$key = json_encode($value);
                } elseif ($key !== 'idCliente') {
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
}
<?php
// app/Http/Controllers/Api/Admin/Clientes/ClienteController.php

namespace App\Http\Controllers\Api\Admin\Clientes;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cliente;
use App\Models\Mascota;
use App\Models\User;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ClienteController extends ApiController
{
    /**
     * Listar clientes con filtros
     */
    public function index(Request $request)
    {
        $query = Cliente::with(['user', 'mascotas']);
        
        // Búsqueda por nombre o teléfono
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Filtro por clientes activos
        if ($request->has('activo')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('activo', $request->activo);
            });
        }
        
        // Filtro por periodo de última cita
        if ($request->has('periodo')) {
            $dias = (int) $request->periodo;
            $fechaLimite = now()->subDays($dias);
            
            $clientesConCitas = Cita::where('fechaHoraInicio', '>=', $fechaLimite)
                ->pluck('idMascota')
                ->map(function($idMascota) {
                    return Mascota::find($idMascota)->idCliente ?? null;
                })
                ->filter()
                ->unique();
            
            if ($request->periodo === 'sin_cita') {
                $query->whereNotIn('idCliente', $clientesConCitas);
            } else {
                $query->whereIn('idCliente', $clientesConCitas);
            }
        }
        
        $clientes = $query->paginate($request->get('per_page', 15));
        
        // Agregar datos adicionales
        $clientes->getCollection()->transform(function($cliente) {
            $ultimaCita = Cita::whereHas('mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })->latest('fechaHoraInicio')->first();
            
            $cliente->cant_mascotas = $cliente->mascotas->count();
            $cliente->ultima_cita = $ultimaCita ? $ultimaCita->fechaHoraInicio->format('Y-m-d H:i') : null;
            $cliente->ultima_cita_servicio = $ultimaCita ? $ultimaCita->servicio->nombre : null;
            
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
                    $q2->latest('fechaHoraInicio')->limit(5);
                }, 'rangoPeso']);
            },
            'ventas' => function($q) {
                $q->latest()->limit(10);
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
     * Crear cliente
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
                'canalContacto' => $request->canalContacto
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
            'direccion' => 'nullable|string',
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms',
            'activo' => 'nullable|boolean'
        ]);
        
        DB::beginTransaction();
        
        try {
            if ($request->has('nombre')) $cliente->user->nombre = $request->nombre;
            if ($request->has('apellido')) $cliente->user->apellido = $request->apellido;
            if ($request->has('telefono')) $cliente->user->telefono = $request->telefono;
            if ($request->has('activo')) $cliente->user->activo = $request->activo;
            $cliente->user->save();
            
            if ($request->has('direccion')) $cliente->direccion = $request->direccion;
            if ($request->has('canalContacto')) $cliente->canalContacto = $request->canalContacto;
            if ($request->has('preferencias')) $cliente->preferencias = json_encode($request->preferencias);
            $cliente->save();
            
            DB::commit();
            
            return $this->successResponse($cliente->load('user'), 'Cliente actualizado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Historial de citas del cliente
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
}
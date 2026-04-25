<?php
// app/Http/Controllers/Api/ClienteController.php

namespace App\Http\Controllers\Api;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ClienteController extends ApiController
{
    /**
     * Listar todos los clientes
     */
    public function index(Request $request)
    {
        $query = Cliente::with('user', 'mascotas');
        
        // Filtros opcionales
        if ($request->has('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->search}%")
                  ->orWhere('apellido', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        
        $clientes = $query->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($clientes, 'Clientes obtenidos correctamente');
    }

    /**
     * Mostrar un cliente específico
     */
    public function show($id)
    {
        $cliente = Cliente::with('user', 'mascotas', 'ventas')->find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        return $this->successResponse($cliente, 'Cliente obtenido correctamente');
    }

    /**
     * Crear un nuevo cliente
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'canalContacto' => 'nullable|in:whatsapp,telegram,email,sms',
        ]);

        DB::beginTransaction();
        
        try {
            // Crear usuario
            $user = User::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'passwordHash' => Hash::make($request->password ?? 'password123'),
                'telefono' => $request->telefono,
                'rol' => 'cliente',
                'activo' => true,
            ]);
            
            // Crear cliente
            $cliente = Cliente::create([
                'idUsuario' => $user->idUsuario,
                'direccion' => $request->direccion,
                'preferencias' => $request->preferencias ? json_encode($request->preferencias) : null,
                'canalContacto' => $request->canalContacto,
            ]);
            
            DB::commit();
            
            return $this->successResponse(
                $cliente->load('user'), 
                'Cliente creado exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear el cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un cliente
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
            'activo' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        
        try {
            // Actualizar usuario
            if ($request->has('nombre')) {
                $cliente->user->nombre = $request->nombre;
            }
            if ($request->has('apellido')) {
                $cliente->user->apellido = $request->apellido;
            }
            if ($request->has('telefono')) {
                $cliente->user->telefono = $request->telefono;
            }
            if ($request->has('activo')) {
                $cliente->user->activo = $request->activo;
            }
            $cliente->user->save();
            
            // Actualizar cliente
            if ($request->has('direccion')) {
                $cliente->direccion = $request->direccion;
            }
            if ($request->has('preferencias')) {
                $cliente->preferencias = json_encode($request->preferencias);
            }
            if ($request->has('canalContacto')) {
                $cliente->canalContacto = $request->canalContacto;
            }
            $cliente->save();
            
            DB::commit();
            
            return $this->successResponse(
                $cliente->fresh('user'), 
                'Cliente actualizado correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar el cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar un cliente (soft delete o hard delete)
     */
    public function destroy($id)
    {
        $cliente = Cliente::find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        DB::beginTransaction();
        
        try {
            // Desactivar usuario en lugar de eliminar
            $cliente->user->activo = false;
            $cliente->user->save();
            
            // O eliminar completamente
            // $cliente->user->delete();
            // $cliente->delete();
            
            DB::commit();
            
            return $this->successResponse(null, 'Cliente desactivado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar el cliente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener historial completo del cliente
     */
    public function historial($id)
    {
        $cliente = Cliente::with([
            'user', 
            'mascotas.citas.servicio',
            'mascotas.citas.groomer.user',
            'ventas.detalleVentas.variante.producto'
        ])->find($id);
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        return $this->successResponse($cliente, 'Historial obtenido correctamente');
    }
}
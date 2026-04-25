<?php
// app/Http/Controllers/Api/ProductoController.php

namespace App\Http\Controllers\Api;

use App\Models\Producto;
use App\Models\VarianteProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoController extends ApiController
{
    /**
     * Listar productos
     */
    public function index(Request $request)
    {
        $query = Producto::with(['categoria', 'variantes']);
        
        if ($request->has('categoria')) {
            $query->whereHas('categoria', function($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->categoria}%");
            });
        }
        
        if ($request->has('search')) {
            $query->where('nombre', 'like', "%{$request->search}%")
                  ->orWhere('descripcion', 'like', "%{$request->search}%");
        }
        
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }
        
        $productos = $query->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($productos, 'Productos obtenidos correctamente');
    }

    /**
     * Mostrar un producto específico
     */
    public function show($id)
    {
        $producto = Producto::with(['categoria', 'variantes'])->find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        return $this->successResponse($producto, 'Producto obtenido correctamente');
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCategoria' => 'required|exists:categorias,idCategoria',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'precioBase' => 'required|numeric|min:0',
            'variantes' => 'required|array|min:1',
            'variantes.*.nombreVariante' => 'required|string',
            'variantes.*.precio' => 'required|numeric|min:0',
            'variantes.*.stock' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        
        try {
            $producto = Producto::create([
                'idCategoria' => $request->idCategoria,
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'precioBase' => $request->precioBase,
                'activo' => true,
            ]);
            
            foreach ($request->variantes as $variante) {
                VarianteProducto::create([
                    'idProducto' => $producto->idProducto,
                    'nombreVariante' => $variante['nombreVariante'],
                    'precio' => $variante['precio'],
                    'stock' => $variante['stock'],
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse(
                $producto->load('categoria', 'variantes'), 
                'Producto creado exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear el producto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un producto
     */
    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $request->validate([
            'idCategoria' => 'sometimes|exists:categorias,idCategoria',
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string',
            'precioBase' => 'sometimes|numeric|min:0',
            'activo' => 'sometimes|boolean',
        ]);

        try {
            $producto->update($request->all());
            
            return $this->successResponse(
                $producto->load('categoria', 'variantes'), 
                'Producto actualizado correctamente'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar el producto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar un producto
     */
    public function destroy($id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        try {
            // Soft delete: solo desactivar
            $producto->activo = false;
            $producto->save();
            
            return $this->successResponse(null, 'Producto desactivado correctamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al desactivar el producto: ' . $e->getMessage(), 500);
        }
    }
}
<?php
// app/Http/Controllers/Api/VarianteProductoController.php

namespace App\Http\Controllers\Api;

use App\Models\VarianteProducto;
use App\Models\Producto;
use Illuminate\Http\Request;

class VarianteProductoController extends ApiController
{
    /**
     * Listar variantes de un producto
     */
    public function index($productoId)
    {
        $producto = Producto::find($productoId);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $variantes = $producto->variantes;
        
        return $this->successResponse($variantes, 'Variantes obtenidas correctamente');
    }

    /**
     * Mostrar una variante específica
     */
    public function show($id)
    {
        $variante = VarianteProducto::with('producto')->find($id);
        
        if (!$variante) {
            return $this->errorResponse('Variante no encontrada', 404);
        }
        
        return $this->successResponse($variante, 'Variante obtenida correctamente');
    }

    /**
     * Crear una nueva variante
     */
    public function store(Request $request, $productoId)
    {
        $producto = Producto::find($productoId);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $request->validate([
            'nombreVariante' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        try {
            $variante = VarianteProducto::create([
                'idProducto' => $productoId,
                'nombreVariante' => $request->nombreVariante,
                'precio' => $request->precio,
                'stock' => $request->stock,
            ]);
            
            return $this->successResponse(
                $variante, 
                'Variante creada exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear la variante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar stock de una variante
     */
    public function updateStock(Request $request, $id)
    {
        $variante = VarianteProducto::find($id);
        
        if (!$variante) {
            return $this->errorResponse('Variante no encontrada', 404);
        }
        
        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        try {
            $variante->stock = $request->stock;
            $variante->save();
            
            return $this->successResponse($variante, 'Stock actualizado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar el stock: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar una variante
     */
    public function destroy($id)
    {
        $variante = VarianteProducto::find($id);
        
        if (!$variante) {
            return $this->errorResponse('Variante no encontrada', 404);
        }
        
        try {
            $variante->delete();
            return $this->successResponse(null, 'Variante eliminada correctamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar la variante: ' . $e->getMessage(), 500);
        }
    }
}
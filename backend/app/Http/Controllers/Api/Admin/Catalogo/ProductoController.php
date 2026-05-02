<?php
// app/Http/Controllers/Api/Admin/Catalogo/ProductoController.php

namespace App\Http\Controllers\Api\Admin\Catalogo;

use App\Http\Controllers\Api\ApiController;
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
            $query->where('nombre', 'like', "%{$request->search}%");
        }
        
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }
        
        $productos = $query->paginate($request->get('per_page', 15));
        
        // Agregar stock total y alerta
        $productos->getCollection()->transform(function($producto) {
            $stockTotal = $producto->variantes->sum('stock');
            $stockMinimo = $producto->variantes->sum('stock_minimo') ?? 5;
            $producto->stock_total = $stockTotal;
            $producto->alerta_stock = $stockTotal <= $stockMinimo;
            return $producto;
        });
        
        return $this->successResponse($productos, 'Productos obtenidos correctamente');
    }

    /**
     * Ver detalle de producto
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
     * Crear producto
     */
    public function store(Request $request)
    {
        $request->validate([
            'idCategoria' => 'required|exists:categorias,idCategoria',
            'nombre' => 'required|string|max:100|unique:productos,nombre',
            'descripcion' => 'nullable|string',
            'precioBase' => 'required|numeric|min:0',
            'variantes' => 'required|array|min:1',
            'variantes.*.nombreVariante' => 'required|string',
            'variantes.*.precio' => 'required|numeric|min:0',
            'variantes.*.stock' => 'required|integer|min:0',
            'variantes.*.stock_minimo' => 'nullable|integer|min:0'
        ]);

        DB::beginTransaction();
        
        try {
            $producto = Producto::create([
                'idCategoria' => $request->idCategoria,
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'precioBase' => $request->precioBase,
                'activo' => true
            ]);
            
            foreach ($request->variantes as $variante) {
                VarianteProducto::create([
                    'idProducto' => $producto->idProducto,
                    'nombreVariante' => $variante['nombreVariante'],
                    'precio' => $variante['precio'],
                    'stock' => $variante['stock'],
                    'stock_minimo' => $variante['stock_minimo'] ?? 5
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse($producto->load('categoria', 'variantes'), 'Producto creado exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear producto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $request->validate([
            'idCategoria' => 'sometimes|exists:categorias,idCategoria',
            'nombre' => 'sometimes|string|max:100|unique:productos,nombre,' . $id . ',idProducto',
            'descripcion' => 'nullable|string',
            'precioBase' => 'sometimes|numeric|min:0',
            'activo' => 'sometimes|boolean'
        ]);

        try {
            $producto->update($request->all());
            
            return $this->successResponse($producto->load('categoria', 'variantes'), 'Producto actualizado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar producto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/desactivar producto
     */
    public function toggle($id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $producto->activo = !$producto->activo;
        $producto->save();
        
        return $this->successResponse($producto, 'Producto ' . ($producto->activo ? 'activado' : 'desactivado') . ' correctamente');
    }

    /**
     * Eliminar producto (soft delete)
     */
    public function destroy($id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        // Verificar si tiene ventas asociadas
        $tieneVentas = VarianteProducto::where('idProducto', $id)
            ->whereHas('detalleVentas')
            ->exists();
        
        if ($tieneVentas) {
            return $this->errorResponse('No se puede eliminar el producto porque tiene ventas asociadas', 400);
        }
        
        // Soft delete: solo desactivar
        $producto->activo = false;
        $producto->save();
        
        return $this->successResponse(null, 'Producto desactivado correctamente');
    }

    // ==================== VARIANTES ====================

    /**
     * Crear variante
     */
    public function varianteStore(Request $request, $productoId)
    {
        $producto = Producto::find($productoId);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $request->validate([
            'nombreVariante' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0'
        ]);

        try {
            $variante = VarianteProducto::create([
                'idProducto' => $productoId,
                'nombreVariante' => $request->nombreVariante,
                'precio' => $request->precio,
                'stock' => $request->stock
            ]);
            
            return $this->successResponse($variante, 'Variante creada exitosamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear variante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar variante
     */
    public function varianteUpdate(Request $request, $id)
    {
        $variante = VarianteProducto::find($id);
        
        if (!$variante) {
            return $this->errorResponse('Variante no encontrada', 404);
        }
        
        $request->validate([
            'nombreVariante' => 'sometimes|string',
            'precio' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0'
        ]);

        try {
            $variante->update($request->all());
            
            return $this->successResponse($variante, 'Variante actualizada correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar variante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar variante
     */
    public function varianteDestroy($id)
    {
        $variante = VarianteProducto::find($id);
        
        if (!$variante) {
            return $this->errorResponse('Variante no encontrada', 404);
        }
        
        // Verificar si tiene ventas o pedidos asociados
        $tieneVentas = $variante->detalleVentas()->exists();
        $tienePedidos = $variante->itemsPedido()->exists();
        
        if ($tieneVentas || $tienePedidos) {
            return $this->errorResponse('No se puede eliminar la variante porque tiene ventas o pedidos asociados', 400);
        }
        
        $variante->delete();
        
        return $this->successResponse(null, 'Variante eliminada correctamente');
    }
}
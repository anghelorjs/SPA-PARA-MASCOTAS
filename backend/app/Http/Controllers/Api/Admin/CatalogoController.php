<?php
// app/Http/Controllers/Api/Admin/CatalogoController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Producto;
use App\Models\VarianteProducto;
use App\Models\Insumo;
use App\Models\Categoria;
use App\Models\MovimientoInventario;
use App\Models\DetalleInsumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogoController extends ApiController
{
    // ==================== PRODUCTOS ====================

    /**
     * Listar productos
     */
    public function productos(Request $request)
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
    public function productoShow($id)
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
    public function productoStore(Request $request)
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
    public function productoUpdate(Request $request, $id)
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
    public function productoToggle($id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return $this->errorResponse('Producto no encontrado', 404);
        }
        
        $producto->activo = !$producto->activo;
        $producto->save();
        
        return $this->successResponse($producto, 'Producto ' . ($producto->activo ? 'activado' : 'desactivado') . ' correctamente');
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
        
        $variante->delete();
        
        return $this->successResponse(null, 'Variante eliminada correctamente');
    }

    // ==================== INSUMOS ====================

    /**
     * Listar insumos
     */
    public function insumos(Request $request)
    {
        $query = Insumo::with('categoria');
        
        if ($request->has('categoria')) {
            $query->whereHas('categoria', function($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->categoria}%");
            });
        }
        
        if ($request->has('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }
        
        if ($request->has('bajo_stock')) {
            $query->whereRaw('stockActual <= stockMinimo');
        }
        
        $insumos = $query->paginate($request->get('per_page', 15));
        
        // Agregar alerta de stock bajo
        $insumos->getCollection()->transform(function($insumo) {
            $insumo->alerta_stock = $insumo->stockActual <= $insumo->stockMinimo;
            return $insumo;
        });
        
        return $this->successResponse($insumos, 'Insumos obtenidos correctamente');
    }

    /**
     * Ver detalle de insumo
     */
    public function insumoShow($id)
    {
        $insumo = Insumo::with('categoria')->find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        // Historial de consumo
        $consumoHistorico = DetalleInsumo::where('idInsumo', $id)
            ->with('fichaGrooming.cita.mascota')
            ->latest()
            ->limit(20)
            ->get();
        
        return $this->successResponse([
            'insumo' => $insumo,
            'consumo_historico' => $consumoHistorico
        ], 'Insumo obtenido correctamente');
    }

    /**
     * Crear insumo
     */
    public function insumoStore(Request $request)
    {
        $request->validate([
            'idCategoria' => 'required|exists:categorias,idCategoria',
            'nombre' => 'required|string|max:100|unique:insumos,nombre',
            'unidadMedida' => 'required|string|max:20',
            'stockActual' => 'required|numeric|min:0',
            'stockMinimo' => 'required|numeric|min:0',
            'costoUnitario' => 'required|numeric|min:0'
        ]);

        try {
            $insumo = Insumo::create($request->all());
            
            return $this->successResponse($insumo->load('categoria'), 'Insumo creado exitosamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear insumo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar insumo
     */
    public function insumoUpdate(Request $request, $id)
    {
        $insumo = Insumo::find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        $request->validate([
            'idCategoria' => 'sometimes|exists:categorias,idCategoria',
            'nombre' => 'sometimes|string|max:100|unique:insumos,nombre,' . $id . ',idInsumo',
            'unidadMedida' => 'sometimes|string|max:20',
            'stockActual' => 'sometimes|numeric|min:0',
            'stockMinimo' => 'sometimes|numeric|min:0',
            'costoUnitario' => 'sometimes|numeric|min:0'
        ]);

        try {
            $insumo->update($request->all());
            
            return $this->successResponse($insumo->load('categoria'), 'Insumo actualizado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar insumo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ajustar stock de insumo
     */
    public function insumoAjustarStock(Request $request, $id)
    {
        $insumo = Insumo::find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        $request->validate([
            'cantidad' => 'required|numeric|not_in:0',
            'motivo' => 'required|string'
        ]);
        
        $nuevoStock = $insumo->stockActual + $request->cantidad;
        
        if ($nuevoStock < 0) {
            return $this->errorResponse('No se puede tener stock negativo', 400);
        }
        
        $insumo->stockActual = $nuevoStock;
        $insumo->save();
        
        // Registrar movimiento (podrías crear una tabla de movimientos de insumos)
        
        return $this->successResponse($insumo, 'Stock ajustado correctamente');
    }

    // ==================== CATEGORÍAS ====================

    /**
     * Listar categorías
     */
    public function categorias(Request $request)
    {
        $query = Categoria::withCount(['productos', 'insumos']);
        
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        $categorias = $query->paginate($request->get('per_page', 15));
        
        return $this->successResponse($categorias, 'Categorías obtenidas correctamente');
    }

    /**
     * Crear categoría
     */
    public function categoriaStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias,nombre',
            'tipo' => 'required|in:producto,insumo',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $categoria = Categoria::create($request->all());
            
            return $this->successResponse($categoria, 'Categoría creada exitosamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear categoría: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar categoría
     */
    public function categoriaUpdate(Request $request, $id)
    {
        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            return $this->errorResponse('Categoría no encontrada', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100|unique:categorias,nombre,' . $id . ',idCategoria',
            'tipo' => 'sometimes|in:producto,insumo',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $categoria->update($request->all());
            
            return $this->successResponse($categoria, 'Categoría actualizada correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar categoría: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar categoría
     */
    public function categoriaDestroy($id)
    {
        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            return $this->errorResponse('Categoría no encontrada', 404);
        }
        
        if ($categoria->productos()->count() > 0 || $categoria->insumos()->count() > 0) {
            return $this->errorResponse('No se puede eliminar la categoría porque tiene productos o insumos asociados', 400);
        }
        
        $categoria->delete();
        
        return $this->successResponse(null, 'Categoría eliminada correctamente');
    }

    // ==================== MOVIMIENTOS DE INVENTARIO ====================

    /**
     * Listar movimientos de inventario
     */
    public function movimientos(Request $request)
    {
        $query = MovimientoInventario::with('producto');
        
        if ($request->has('producto_id')) {
            $query->where('idProducto', $request->producto_id);
        }
        
        if ($request->has('tipoMovimiento')) {
            $query->where('tipoMovimiento', $request->tipoMovimiento);
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }
        
        $movimientos = $query->orderBy('fecha', 'desc')
            ->paginate($request->get('per_page', 20));
        
        return $this->successResponse($movimientos, 'Movimientos obtenidos correctamente');
    }

    /**
     * Registrar movimiento manual
     */
    public function movimientoStore(Request $request)
    {
        $request->validate([
            'idProducto' => 'required|exists:productos,idProducto',
            'tipoMovimiento' => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|integer|min:1',
            'variante_id' => 'required|exists:variante_productos,idVariante', // ← Agregar: especificar qué variante
            'motivo' => 'required|string'
        ]);

        try {
            $movimiento = MovimientoInventario::create([
                'idProducto' => $request->idProducto,
                'tipoMovimiento' => $request->tipoMovimiento,
                'cantidad' => $request->cantidad,
                'fecha' => now(),
                'motivo' => $request->motivo
            ]);
            
            // Actualizar stock de la VARIANTE, no del producto
            $variante = VarianteProducto::find($request->variante_id);
            
            if ($request->tipoMovimiento === 'entrada') {
                $variante->stock += $request->cantidad;
            } else {
                $variante->stock -= $request->cantidad;
            }
            
            // Validar que no quede negativo
            if ($variante->stock < 0) {
                return $this->errorResponse('No se puede tener stock negativo', 400);
            }
            
            $variante->save();
            
            return $this->successResponse($movimiento, 'Movimiento registrado correctamente', 201);
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al registrar movimiento: ' . $e->getMessage(), 500);
        }
    }
}
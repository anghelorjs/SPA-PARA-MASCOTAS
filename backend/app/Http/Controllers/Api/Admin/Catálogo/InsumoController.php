<?php
// app/Http/Controllers/Api/Admin/Catalogo/InsumoController.php

namespace App\Http\Controllers\Api\Admin\Catalogo;

use App\Http\Controllers\Api\ApiController;
use App\Models\Insumo;
use App\Models\DetalleInsumo;
use Illuminate\Http\Request;

class InsumoController extends ApiController
{
    /**
     * Listar insumos
     */
    public function index(Request $request)
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
        
        // Agregar alerta de stock bajo y nivel de stock
        $insumos->getCollection()->transform(function($insumo) {
            $insumo->alerta_stock = $insumo->stockActual <= $insumo->stockMinimo;
            
            // Nivel de stock: verde (>70%), amarillo (30-70%), rojo (<30%)
            $porcentaje = $insumo->stockMinimo > 0 
                ? ($insumo->stockActual / $insumo->stockMinimo) * 100 
                : 100;
            
            if ($porcentaje >= 70) {
                $insumo->nivel_stock = 'verde';
            } elseif ($porcentaje >= 30) {
                $insumo->nivel_stock = 'amarillo';
            } else {
                $insumo->nivel_stock = 'rojo';
            }
            
            return $insumo;
        });
        
        return $this->successResponse($insumos, 'Insumos obtenidos correctamente');
    }

    /**
     * Ver detalle de insumo
     */
    public function show($id)
    {
        $insumo = Insumo::with('categoria')->find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        // Historial de consumo
        $consumoHistorico = DetalleInsumo::where('idInsumo', $id)
            ->with('fichaGrooming.cita.mascota', 'fichaGrooming.cita.servicio')
            ->latest()
            ->paginate(20);
        
        return $this->successResponse([
            'insumo' => $insumo,
            'consumo_historico' => $consumoHistorico
        ], 'Insumo obtenido correctamente');
    }

    /**
     * Crear insumo
     */
    public function store(Request $request)
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
    public function update(Request $request, $id)
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
    public function ajustarStock(Request $request, $id)
    {
        $insumo = Insumo::find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        $request->validate([
            'tipo' => 'required|in:entrada,ajuste',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:255'
        ]);
        
        try {
            if ($request->tipo === 'entrada') {
                $insumo->stockActual += $request->cantidad;
            } else {
                $insumo->stockActual = $request->cantidad;
            }
            
            $insumo->save();
            
            // Aquí se podría registrar en una tabla de movimientos de insumos
            
            return $this->successResponse($insumo, 'Stock ajustado correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al ajustar stock: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar insumo
     */
    public function destroy($id)
    {
        $insumo = Insumo::find($id);
        
        if (!$insumo) {
            return $this->errorResponse('Insumo no encontrado', 404);
        }
        
        // Verificar si tiene consumos asociados
        $tieneConsumos = DetalleInsumo::where('idInsumo', $id)->exists();
        
        if ($tieneConsumos) {
            return $this->errorResponse('No se puede eliminar el insumo porque tiene consumos asociados', 400);
        }
        
        $insumo->delete();
        
        return $this->successResponse(null, 'Insumo eliminado correctamente');
    }
}
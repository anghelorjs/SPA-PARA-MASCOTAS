<?php
// app/Http/Controllers/Api/Admin/Catalogo/CategoriaController.php

namespace App\Http\Controllers\Api\Admin\Catalogo;

use App\Http\Controllers\Api\ApiController;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends ApiController
{
    /**
     * Listar categorías
     */
    public function index(Request $request)
    {
        $query = Categoria::withCount(['productos', 'insumos']);
        
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        $categorias = $query->paginate($request->get('per_page', 15));
        
        return $this->successResponse($categorias, 'Categorías obtenidas correctamente');
    }

    /**
     * Ver detalle de categoría
     */
    public function show($id)
    {
        $categoria = Categoria::withCount(['productos', 'insumos'])->find($id);
        
        if (!$categoria) {
            return $this->errorResponse('Categoría no encontrada', 404);
        }
        
        return $this->successResponse($categoria, 'Categoría obtenida correctamente');
    }

    /**
     * Crear categoría
     */
    public function store(Request $request)
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
    public function update(Request $request, $id)
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
    public function destroy($id)
    {
        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            return $this->errorResponse('Categoría no encontrada', 404);
        }
        
        // Verificar si tiene productos asociados
        if ($categoria->productos()->count() > 0) {
            return $this->errorResponse('No se puede eliminar la categoría porque tiene productos asociados', 400);
        }
        
        // Verificar si tiene insumos asociados
        if ($categoria->insumos()->count() > 0) {
            return $this->errorResponse('No se puede eliminar la categoría porque tiene insumos asociados', 400);
        }
        
        $categoria->delete();
        
        return $this->successResponse(null, 'Categoría eliminada correctamente');
    }
}
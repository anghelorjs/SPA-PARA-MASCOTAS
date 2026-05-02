<?php
// app/Http/Controllers/Api/Admin/Agenda/RangoPesoController.php

namespace App\Http\Controllers\Api\Admin\Agenda;

use App\Http\Controllers\Api\ApiController;
use App\Models\RangoPeso;
use Illuminate\Http\Request;

class RangoPesoController extends ApiController
{
    /**
     * Listar rangos de peso
     */
    public function index()
    {
        $rangos = RangoPeso::withCount('servicios')->get();
        
        return $this->successResponse($rangos, 'Rangos de peso obtenidos correctamente');
    }

    /**
     * Ver detalle de un rango de peso
     */
    public function show($id)
    {
        $rango = RangoPeso::with('servicios')->find($id);
        
        if (!$rango) {
            return $this->errorResponse('Rango no encontrado', 404);
        }
        
        return $this->successResponse($rango, 'Rango de peso obtenido correctamente');
    }

    /**
     * Crear nuevo rango de peso
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50|unique:rangos_peso,nombre',
            'pesoMinKg' => 'required|numeric|min:0',
            'pesoMaxKg' => 'required|numeric|gt:pesoMinKg',
            'factorTiempo' => 'required|numeric|min:0.5|max:3',
            'factorPrecio' => 'required|numeric|min:0.5|max:3'
        ]);
        
        $rango = RangoPeso::create($request->all());
        
        return $this->successResponse($rango, 'Rango de peso creado exitosamente', 201);
    }

    /**
     * Actualizar rango de peso
     */
    public function update(Request $request, $id)
    {
        $rango = RangoPeso::find($id);
        
        if (!$rango) {
            return $this->errorResponse('Rango no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:50|unique:rangos_peso,nombre,' . $id . ',idRango',
            'pesoMinKg' => 'sometimes|numeric|min:0',
            'pesoMaxKg' => 'sometimes|numeric|gt:pesoMinKg',
            'factorTiempo' => 'sometimes|numeric|min:0.5|max:3',
            'factorPrecio' => 'sometimes|numeric|min:0.5|max:3'
        ]);
        
        $rango->update($request->all());
        
        return $this->successResponse($rango, 'Rango de peso actualizado correctamente');
    }

    /**
     * Eliminar rango de peso
     */
    public function destroy($id)
    {
        $rango = RangoPeso::find($id);
        
        if (!$rango) {
            return $this->errorResponse('Rango no encontrado', 404);
        }
        
        // Verificar si tiene mascotas asociadas
        if ($rango->mascotas()->count() > 0) {
            return $this->errorResponse('No se puede eliminar el rango porque tiene mascotas asociadas', 400);
        }
        
        // Verificar si tiene servicios asociados
        if ($rango->servicios()->count() > 0) {
            return $this->errorResponse('No se puede eliminar el rango porque está asociado a servicios', 400);
        }
        
        $rango->delete();
        
        return $this->successResponse(null, 'Rango de peso eliminado correctamente');
    }
}
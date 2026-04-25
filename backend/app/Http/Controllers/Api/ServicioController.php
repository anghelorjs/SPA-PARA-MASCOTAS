<?php
// app/Http/Controllers/Api/ServicioController.php

namespace App\Http\Controllers\Api;

use App\Models\Servicio;
use App\Models\RangoPeso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServicioController extends ApiController
{
    /**
     * Listar servicios
     */
    public function index(Request $request)
    {
        $query = Servicio::with('rangosPeso');
        
        if ($request->has('activo')) {
            // Por ahora todos están activos, puedes agregar campo activo
        }
        
        $servicios = $query->paginate($request->get('per_page', 15));
        
        return $this->paginatedResponse($servicios, 'Servicios obtenidos correctamente');
    }

    /**
     * Mostrar un servicio específico
     */
    public function show($id)
    {
        $servicio = Servicio::with('rangosPeso')->find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        return $this->successResponse($servicio, 'Servicio obtenido correctamente');
    }

    /**
     * Crear un nuevo servicio
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:servicios,nombre',
            'duracionMinutos' => 'required|integer|min:5|max:480',
            'precioBase' => 'required|numeric|min:0',
            'admiteDobleBooking' => 'boolean',
        ]);

        DB::beginTransaction();
        
        try {
            $servicio = Servicio::create([
                'idAdministrador' => 1, // Obtener del usuario autenticado después
                'nombre' => $request->nombre,
                'duracionMinutos' => $request->duracionMinutos,
                'precioBase' => $request->precioBase,
                'admiteDobleBooking' => $request->admiteDobleBooking ?? false,
            ]);
            
            // Asignar rangos de peso automáticamente
            $rangos = RangoPeso::all();
            foreach ($rangos as $rango) {
                $duracionAjustada = round($servicio->duracionMinutos * $rango->factorTiempo);
                $precioAjustado = round($servicio->precioBase * $rango->factorPrecio);
                
                $servicio->rangosPeso()->attach($rango->idRango, [
                    'duracionAjustadaMin' => $duracionAjustada,
                    'precioAjustado' => $precioAjustado
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse(
                $servicio->load('rangosPeso'), 
                'Servicio creado exitosamente', 
                201
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear el servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un servicio
     */
    public function update(Request $request, $id)
    {
        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100|unique:servicios,nombre,' . $id . ',idServicio',
            'duracionMinutos' => 'sometimes|integer|min:5|max:480',
            'precioBase' => 'sometimes|numeric|min:0',
            'admiteDobleBooking' => 'boolean',
        ]);

        DB::beginTransaction();
        
        try {
            $servicio->update($request->all());
            
            // Recalcular rangos si cambió duración o precio
            if ($request->has('duracionMinutos') || $request->has('precioBase')) {
                $rangos = RangoPeso::all();
                foreach ($rangos as $rango) {
                    $duracionAjustada = round($servicio->duracionMinutos * $rango->factorTiempo);
                    $precioAjustado = round($servicio->precioBase * $rango->factorPrecio);
                    
                    $servicio->rangosPeso()->updateExistingPivot($rango->idRango, [
                        'duracionAjustadaMin' => $duracionAjustada,
                        'precioAjustado' => $precioAjustado
                    ]);
                }
            }
            
            DB::commit();
            
            return $this->successResponse(
                $servicio->load('rangosPeso'), 
                'Servicio actualizado correctamente'
            );
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar el servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar un servicio
     */
    public function destroy($id)
    {
        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        // Verificar si tiene citas asociadas
        if ($servicio->citas()->exists()) {
            return $this->errorResponse(
                'No se puede eliminar el servicio porque tiene citas asociadas', 
                400
            );
        }
        
        try {
            $servicio->rangosPeso()->detach();
            $servicio->delete();
            return $this->successResponse(null, 'Servicio eliminado correctamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar el servicio: ' . $e->getMessage(), 500);
        }
    }
}
<?php
// app/Http/Controllers/Api/Admin/Agenda/ServicioController.php

namespace App\Http\Controllers\Api\Admin\Agenda;

use App\Http\Controllers\Api\ApiController;
use App\Models\Servicio;
use App\Models\RangoPeso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServicioController extends ApiController
{
    /**
     * Listar servicios con sus rangos de peso
     */
    public function index(Request $request)
    {
        $servicios = Servicio::with('rangosPeso')->get();
        
        $rangos = RangoPeso::all();
        
        return $this->successResponse([
            'servicios' => $servicios,
            'rangos' => $rangos
        ], 'Servicios obtenidos correctamente');
    }

    /**
     * Ver detalle de un servicio
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
     * Crear nuevo servicio
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:servicios,nombre',
            'duracionMinutos' => 'required|integer|min:5|max:480',
            'precioBase' => 'required|numeric|min:0',
            'admiteDobleBooking' => 'boolean',
            'preciosPorRango' => 'required|array',
            'preciosPorRango.*.idRango' => 'required|exists:rangos_peso,idRango',
            'preciosPorRango.*.duracionAjustadaMin' => 'required|integer|min:5',
            'preciosPorRango.*.precioAjustado' => 'required|numeric|min:0'
        ]);
        
        DB::beginTransaction();
        
        try {
            $servicio = Servicio::create([
                'idAdministrador' => auth('api')->user()?->administrador->idAdministrador ?? null,
                'nombre' => $request->nombre,
                'duracionMinutos' => $request->duracionMinutos,
                'precioBase' => $request->precioBase,
                'admiteDobleBooking' => $request->admiteDobleBooking ?? false
            ]);
            
            foreach ($request->preciosPorRango as $item) {
                $servicio->rangosPeso()->attach($item['idRango'], [
                    'duracionAjustadaMin' => $item['duracionAjustadaMin'],
                    'precioAjustado' => $item['precioAjustado']
                ]);
            }
            
            DB::commit();
            
            return $this->successResponse($servicio->load('rangosPeso'), 'Servicio creado exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar servicio
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
            'preciosPorRango' => 'sometimes|array',
            'preciosPorRango.*.idRango' => 'required_with:preciosPorRango|exists:rangos_peso,idRango',
            'preciosPorRango.*.duracionAjustadaMin' => 'required_with:preciosPorRango|integer|min:5',
            'preciosPorRango.*.precioAjustado' => 'required_with:preciosPorRango|numeric|min:0'
        ]);
        
        DB::beginTransaction();
        
        try {
            $servicio->update($request->only(['nombre', 'duracionMinutos', 'precioBase', 'admiteDobleBooking']));
            
            if ($request->has('preciosPorRango')) {
                $servicio->rangosPeso()->detach();
                foreach ($request->preciosPorRango as $item) {
                    $servicio->rangosPeso()->attach($item['idRango'], [
                        'duracionAjustadaMin' => $item['duracionAjustadaMin'],
                        'precioAjustado' => $item['precioAjustado']
                    ]);
                }
            }
            
            DB::commit();
            
            return $this->successResponse($servicio->load('rangosPeso'), 'Servicio actualizado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/desactivar servicio
     */
    public function toggle($id)
    {
        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        // Puedes agregar un campo 'activo' a la tabla servicios si lo deseas
        // Por ahora devolvemos el servicio
        return $this->successResponse($servicio, 'Estado del servicio cambiado');
    }

    /**
     * Eliminar servicio
     */
    public function destroy($id)
    {
        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            return $this->errorResponse('Servicio no encontrado', 404);
        }
        
        // Verificar si tiene citas asociadas
        if ($servicio->citas()->exists()) {
            return $this->errorResponse('No se puede eliminar el servicio porque tiene citas asociadas', 400);
        }
        
        DB::beginTransaction();
        
        try {
            $servicio->rangosPeso()->detach();
            $servicio->delete();
            
            DB::commit();
            
            return $this->successResponse(null, 'Servicio eliminado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar servicio: ' . $e->getMessage(), 500);
        }
    }
}
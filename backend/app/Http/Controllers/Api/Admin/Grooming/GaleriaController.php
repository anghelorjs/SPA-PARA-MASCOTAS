<?php
// app/Http/Controllers/Api/Admin/Grooming/GaleriaController.php

namespace App\Http\Controllers\Api\Admin\Grooming;

use App\Http\Controllers\Api\ApiController;
use App\Models\Foto;
use App\Models\Mascota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriaController extends ApiController
{
    /**
     * Listar fotos del sistema (con filtros)
     */
    public function index(Request $request)
    {
        $query = Foto::with(['mascota.cliente.user', 'fichaGrooming.cita.groomer.user']);
        
        // Filtro por mascota (buscador)
        if ($request->has('mascota_search')) {
            $search = $request->mascota_search;
            $query->whereHas('mascota', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%");
            });
        }
        
        // Filtro por groomer
        if ($request->has('groomer_id')) {
            $query->whereHas('fichaGrooming', function($q) use ($request) {
                $q->where('idGroomer', $request->groomer_id);
            });
        }
        
        // Filtro por tipo de foto
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaCarga', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaCarga', '<=', $request->fecha_hasta);
        }
        
        $fotos = $query->orderBy('fechaCarga', 'desc')
            ->paginate($request->get('per_page', 24))
            ->through(function($foto) {
                return [
                    'id' => $foto->idFoto,
                    'url' => $foto->urlFoto,
                    'tipo' => $foto->tipo,
                    'fecha' => $foto->fechaCarga->format('d/m/Y H:i'),
                    'mascota' => $foto->mascota->nombre,
                    'mascota_id' => $foto->idMascota,
                    'groomer' => $foto->fichaGrooming 
                        ? $foto->fichaGrooming->groomer->user->nombre . ' ' . $foto->fichaGrooming->groomer->user->apellido 
                        : null
                ];
            });
        
        return $this->successResponse($fotos, 'Fotos obtenidas correctamente');
    }

    /**
     * Eliminar foto (solo admin)
     */
    public function destroy($id)
    {
        $foto = Foto::find($id);
        
        if (!$foto) {
            return $this->errorResponse('Foto no encontrada', 404);
        }
        
        try {
            // Eliminar archivo del storage
            $path = str_replace('/storage/', '', $foto->urlFoto);
            Storage::disk('public')->delete($path);
            
            $foto->delete();
            
            return $this->successResponse(null, 'Foto eliminada correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar foto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Galería por mascota (vista agrupada)
     */
    public function porMascota($mascotaId)
    {
        $mascota = Mascota::with(['fotos' => function($q) {
            $q->orderBy('fechaCarga', 'desc');
        }])->find($mascotaId);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $fotosAgrupadas = [
            'perfil' => $mascota->fotos->where('tipo', 'perfil')->values(),
            'antes' => $mascota->fotos->where('tipo', 'antes')->values(),
            'despues' => $mascota->fotos->where('tipo', 'despues')->values()
        ];
        
        return $this->successResponse([
            'mascota' => [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza
            ],
            'fotos' => $fotosAgrupadas
        ], 'Galería de la mascota obtenida correctamente');
    }

    /**
     * Obtener tipos de foto para filtros
     */
    public function tipos()
    {
        $tipos = [
            ['id' => 'perfil', 'nombre' => 'Perfil'],
            ['id' => 'antes', 'nombre' => 'Antes'],
            ['id' => 'despues', 'nombre' => 'Después']
        ];
        
        return $this->successResponse($tipos, 'Tipos de foto obtenidos correctamente');
    }
}
<?php
// app/Http/Controllers/Api/Groomer/AgendaController.php

namespace App\Http\Controllers\Api\Groomer;

use App\Http\Controllers\Api\ApiController;
use App\Models\Cita;
use App\Models\FichaGrooming;
use App\Models\Notificacion;
use App\Models\Mascota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgendaController extends ApiController
{
    /**
     * Obtener citas del groomer con filtros
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        $fecha = $request->get('fecha', now()->toDateString());
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $query = Cita::with(['mascota.cliente.user', 'servicio', 'fichaGrooming'])
            ->where('idGroomer', $groomer->idGroomer)
            ->whereDate('fechaHoraInicio', $fecha);
        
        // Filtro por estado
        if ($request->has('estado') && $request->estado !== 'todas') {
            $query->where('estado', $request->estado);
        }
        
        $citas = $query->orderBy('fechaHoraInicio', 'asc')->get();
        
        // Obtener historial de mascotas para las citas
        $citasConHistorial = $citas->map(function($cita) {
            $mascota = $cita->mascota;
            
            // Historial de fichas anteriores de esta mascota
            $historialFichas = FichaGrooming::with(['cita.servicio'])
                ->where('idMascota', $mascota->idMascota)
                ->whereNotNull('fechaCierre')
                ->orderBy('fechaCierre', 'desc')
                ->limit(10)
                ->get()
                ->map(function($ficha) {
                    return [
                        'id' => $ficha->idFicha,
                        'fecha' => $ficha->fechaCierre->format('d/m/Y'),
                        'servicio' => $ficha->cita->servicio->nombre,
                        'observaciones' => $ficha->observaciones,
                        'recomendaciones' => $ficha->recomendaciones,
                        'fotos' => $ficha->fotos->map(function($foto) {
                            return [
                                'id' => $foto->idFoto,
                                'url' => $foto->urlFoto,
                                'tipo' => $foto->tipo
                            ];
                        })
                    ];
                });
            
            $estados = [
                'programada' => ['texto' => 'Programada', 'color' => '#3b82f6'],
                'confirmada' => ['texto' => 'Confirmada', 'color' => '#10b981'],
                'en_curso' => ['texto' => 'En curso', 'color' => '#f59e0b'],
                'completada' => ['texto' => 'Completada', 'color' => '#6b7280'],
                'cancelada' => ['texto' => 'Cancelada', 'color' => '#ef4444']
            ];
            
            $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
            
            return [
                'id' => $cita->idCita,
                'hora_inicio' => $cita->fechaHoraInicio->format('H:i'),
                'hora_fin' => $cita->fechaHoraFin->format('H:i'),
                'duracion' => $cita->duracionCalculadaMin,
                'mascota' => [
                    'id' => $mascota->idMascota,
                    'nombre' => $mascota->nombre,
                    'especie' => $mascota->especie,
                    'raza' => $mascota->raza,
                    'peso_kg' => $mascota->pesoKg,
                    'rango_nombre' => $rangoNombre,
                    'temperamento' => $mascota->temperamento,
                    'alergias' => $mascota->alergias,
                    'restricciones' => $mascota->restricciones,
                    'vacunas' => $mascota->vacunas,
                    'historial' => $historialFichas
                ],
                'servicio' => [
                    'id' => $cita->servicio->idServicio,
                    'nombre' => $cita->servicio->nombre
                ],
                'estado' => $cita->estado,
                'estado_texto' => $estados[$cita->estado]['texto'],
                'estado_color' => $estados[$cita->estado]['color'],
                'tiene_ficha' => $cita->fichaGrooming ? true : false,
                'ficha_id' => $cita->fichaGrooming->idFicha ?? null,
                'ficha_abierta' => $cita->fichaGrooming && !$cita->fichaGrooming->fechaCierre ? true : false
            ];
        });
        
        return $this->successResponse($citasConHistorial, 'Citas obtenidas correctamente');
    }
    
    /**
     * Iniciar servicio (crear ficha)
     */
    public function iniciarServicio($id)
    {
        $user = Auth::user();
        $groomer = $user->groomer;
        
        if (!$groomer) {
            return $this->errorResponse('Groomer no encontrado', 404);
        }
        
        $cita = Cita::find($id);
        
        if (!$cita) {
            return $this->errorResponse('Cita no encontrada', 404);
        }
        
        if ($cita->idGroomer !== $groomer->idGroomer) {
            return $this->errorResponse('No tienes permiso para esta cita', 403);
        }
        
        if ($cita->estado !== 'confirmada') {
            return $this->errorResponse('Solo se puede iniciar servicio en citas confirmadas', 400);
        }
        
        if ($cita->fichaGrooming) {
            return $this->errorResponse('La cita ya tiene una ficha asociada', 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Crear ficha
            $ficha = FichaGrooming::create([
                'idCita' => $cita->idCita,
                'idGroomer' => $groomer->idGroomer,
                'idMascota' => $cita->idMascota,
                'estadoIngreso' => null,
                'nudos' => false,
                'tienePulgas' => false,
                'tieneHeridas' => false,
                'observaciones' => null,
                'recomendaciones' => null,
                'fechaApertura' => now(),
                'fechaCierre' => null
            ]);
            
            // Actualizar estado de la cita
            $cita->estado = 'en_curso';
            $cita->save();
            
            DB::commit();
            
            return $this->successResponse([
                'cita_id' => $cita->idCita,
                'ficha_id' => $ficha->idFicha
            ], 'Servicio iniciado correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al iniciar servicio: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Ver historial de una mascota
     */
    public function historialMascota($mascotaId)
    {
        $mascota = Mascota::with([
            'cliente.user',
            'rangoPeso',
            'fichasGrooming' => function($q) {
                $q->with(['cita.servicio', 'fotos'])
                  ->whereNotNull('fechaCierre')
                  ->orderBy('fechaCierre', 'desc');
            }
        ])->find($mascotaId);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $historial = $mascota->fichasGrooming->map(function($ficha) {
            return [
                'id' => $ficha->idFicha,
                'fecha' => $ficha->fechaCierre->format('d/m/Y H:i'),
                'servicio' => $ficha->cita->servicio->nombre,
                'observaciones' => $ficha->observaciones,
                'recomendaciones' => $ficha->recomendaciones,
                'fotos' => $ficha->fotos->map(function($foto) {
                    return [
                        'id' => $foto->idFoto,
                        'url' => $foto->urlFoto,
                        'tipo' => $foto->tipo
                    ];
                })
            ];
        });
        
        return $this->successResponse([
            'mascota' => [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $mascota->rangoPeso ? $mascota->rangoPeso->nombre : null,
                'temperamento' => $mascota->temperamento,
                'alergias' => $mascota->alergias,
                'restricciones' => $mascota->restricciones,
                'vacunas' => $mascota->vacunas
            ],
            'historial' => $historial
        ], 'Historial obtenido correctamente');
    }
}
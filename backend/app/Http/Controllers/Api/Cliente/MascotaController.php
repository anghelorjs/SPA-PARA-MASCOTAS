<?php
// app/Http/Controllers/Api/Cliente/MascotaController.php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Api\ApiController;
use App\Models\Mascota;
use App\Models\RangoPeso;
use App\Models\Foto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MascotaController extends ApiController
{
    /**
     * Listar mascotas del cliente
     */
    public function index()
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascotas = $cliente->mascotas->map(function($mascota) {
            $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
            $fotoPerfil = $mascota->fotos->where('tipo', 'perfil')->first();
            
            return [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'tamanio' => $mascota->tamanio,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $rangoNombre,
                'foto_perfil_url' => $fotoPerfil ? $fotoPerfil->urlFoto : null,
                'fecha_nacimiento' => $mascota->fechaNacimiento ? $mascota->fechaNacimiento->format('Y-m-d') : null,
                'temperamento' => $mascota->temperamento,
                'alergias' => $mascota->alergias,
                'restricciones' => $mascota->restricciones,
                'vacunas' => $mascota->vacunas
            ];
        });
        
        return $this->successResponse($mascotas, 'Mascotas obtenidas correctamente');
    }
    
    /**
     * Ver detalle de una mascota
     */
    public function show($id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascota = Mascota::with(['rangoPeso', 'fotos'])
            ->where('idCliente', $cliente->idCliente)
            ->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        // Obtener historial de fichas de grooming
        $historialServicios = $mascota->fichasGrooming()
            ->with(['cita.servicio', 'groomer.user', 'fotos'])
            ->whereNotNull('fechaCierre')
            ->orderBy('fechaCierre', 'desc')
            ->get()
            ->map(function($ficha) {
                return [
                    'id' => $ficha->idFicha,
                    'fecha' => $ficha->fechaCierre->format('d/m/Y'),
                    'servicio' => $ficha->cita->servicio->nombre,
                    'groomer' => $ficha->groomer->user->nombre . ' ' . $ficha->groomer->user->apellido,
                    'observaciones' => $ficha->observaciones,
                    'recomendaciones' => $ficha->recomendaciones,
                    'fotos' => $ficha->fotos->map(function($foto) {
                        return [
                            'id' => $foto->idFoto,
                            'url' => $foto->urlFoto,
                            'tipo' => $foto->tipo,
                            'fecha' => $foto->fechaCarga->format('d/m/Y H:i')
                        ];
                    })
                ];
            });
        
        // Obtener fotos agrupadas por sesión
        $fotosAgrupadas = $mascota->fotos()
            ->with('fichaGrooming.cita.servicio')
            ->where('tipo', '!=', 'perfil')
            ->orderBy('fechaCarga', 'desc')
            ->get()
            ->groupBy(function($foto) {
                return $foto->fichaGrooming ? $foto->fichaGrooming->idFicha : 'sin_ficha';
            })
            ->map(function($fotos, $key) {
                $primeraFoto = $fotos->first();
                return [
                    'ficha_id' => $key !== 'sin_ficha' ? (int)$key : null,
                    'fecha' => $primeraFoto->fechaCarga->format('d/m/Y'),
                    'servicio' => $primeraFoto->fichaGrooming ? $primeraFoto->fichaGrooming->cita->servicio->nombre : 'General',
                    'fotos' => $fotos->map(function($foto) {
                        return [
                            'id' => $foto->idFoto,
                            'url' => $foto->urlFoto,
                            'tipo' => $foto->tipo
                        ];
                    })
                ];
            });
        
        $rangoNombre = $mascota->rangoPeso ? $mascota->rangoPeso->nombre : 'No asignado';
        
        return $this->successResponse([
            'mascota' => [
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre,
                'especie' => $mascota->especie,
                'raza' => $mascota->raza,
                'tamanio' => $mascota->tamanio,
                'peso_kg' => $mascota->pesoKg,
                'rango_nombre' => $rangoNombre,
                'fecha_nacimiento' => $mascota->fechaNacimiento ? $mascota->fechaNacimiento->format('Y-m-d') : null,
                'temperamento' => $mascota->temperamento,
                'alergias' => $mascota->alergias,
                'restricciones' => $mascota->restricciones,
                'vacunas' => $mascota->vacunas,
                'fotos_perfil' => $mascota->fotos->where('tipo', 'perfil')->values()
            ],
            'historial_servicios' => $historialServicios,
            'galeria_fotos' => $fotosAgrupadas
        ], 'Detalle de mascota obtenido correctamente');
    }
    
    /**
     * Crear nueva mascota
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:100',
            'especie' => 'required|string|max:50',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'required|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Calcular rango de peso automáticamente
            $idRango = null;
            if ($request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                    ->where('pesoMaxKg', '>=', $request->pesoKg)
                    ->first();
                $idRango = $rango ? $rango->idRango : null;
            }
            
            $mascota = Mascota::create([
                'idCliente' => $cliente->idCliente,
                'idRango' => $idRango,
                'nombre' => $request->nombre,
                'especie' => $request->especie,
                'raza' => $request->raza,
                'tamanio' => $request->tamanio,
                'pesoKg' => $request->pesoKg,
                'fechaNacimiento' => $request->fechaNacimiento,
                'temperamento' => $request->temperamento,
                'alergias' => $request->alergias ? json_encode($request->alergias) : null,
                'restricciones' => $request->restricciones ? json_encode($request->restricciones) : null,
                'vacunas' => $request->vacunas ? json_encode($request->vacunas) : null
            ]);
            
            DB::commit();
            
            return $this->successResponse([
                'id' => $mascota->idMascota,
                'nombre' => $mascota->nombre
            ], 'Mascota creada exitosamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear mascota: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Actualizar mascota
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascota = Mascota::where('idCliente', $cliente->idCliente)->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'especie' => 'sometimes|string|max:50',
            'raza' => 'nullable|string|max:100',
            'tamanio' => 'nullable|string|max:50',
            'pesoKg' => 'nullable|numeric|min:0|max:100',
            'fechaNacimiento' => 'nullable|date',
            'temperamento' => 'nullable|string',
            'alergias' => 'nullable|array',
            'restricciones' => 'nullable|array',
            'vacunas' => 'nullable|array'
        ]);
        
        DB::beginTransaction();
        
        try {
            // Recalcular rango si cambió el peso
            if ($request->has('pesoKg') && $request->pesoKg) {
                $rango = RangoPeso::where('pesoMinKg', '<=', $request->pesoKg)
                    ->where('pesoMaxKg', '>=', $request->pesoKg)
                    ->first();
                $mascota->idRango = $rango ? $rango->idRango : null;
            }
            
            foreach ($request->all() as $key => $value) {
                if (in_array($key, ['alergias', 'restricciones', 'vacunas']) && $value) {
                    $mascota->$key = json_encode($value);
                } elseif ($key !== 'idCliente' && $key !== 'idRango') {
                    $mascota->$key = $value;
                }
            }
            
            $mascota->save();
            
            DB::commit();
            
            return $this->successResponse(null, 'Mascota actualizada correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar mascota: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Subir foto de perfil de la mascota
     */
    public function uploadFoto(Request $request, $id)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $mascota = Mascota::where('idCliente', $cliente->idCliente)->find($id);
        
        if (!$mascota) {
            return $this->errorResponse('Mascota no encontrada', 404);
        }
        
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120'
        ]);
        
        try {
            // Eliminar foto de perfil anterior si existe
            $fotoAnterior = Foto::where('idMascota', $mascota->idMascota)
                ->where('tipo', 'perfil')
                ->first();
            
            if ($fotoAnterior) {
                $path = str_replace('/storage/', '', $fotoAnterior->urlFoto);
                Storage::disk('public')->delete($path);
                $fotoAnterior->delete();
            }
            
            $file = $request->file('foto');
            $path = $file->store('mascotas/' . $mascota->idMascota, 'public');
            
            $foto = Foto::create([
                'idMascota' => $mascota->idMascota,
                'idFicha' => null,
                'urlFoto' => Storage::url($path),
                'tipo' => 'perfil',
                'fechaCarga' => now()
            ]);
            
            return $this->successResponse([
                'id' => $foto->idFoto,
                'url' => $foto->urlFoto
            ], 'Foto de perfil subida correctamente');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Error al subir foto: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obtener fotos de una sesión específica (para lightbox)
     */
    public function fotosSesion($fichaId)
    {
        $user = Auth::user();
        $cliente = $user->cliente;
        
        if (!$cliente) {
            return $this->errorResponse('Cliente no encontrado', 404);
        }
        
        $ficha = \App\Models\FichaGrooming::with(['cita.mascota', 'cita.servicio', 'fotos'])
            ->whereHas('cita.mascota', function($q) use ($cliente) {
                $q->where('idCliente', $cliente->idCliente);
            })
            ->find($fichaId);
        
        if (!$ficha) {
            return $this->errorResponse('Sesión no encontrada', 404);
        }
        
        return $this->successResponse([
            'ficha_id' => $ficha->idFicha,
            'fecha' => $ficha->fechaCierre ? $ficha->fechaCierre->format('d/m/Y') : $ficha->fechaApertura->format('d/m/Y'),
            'servicio' => $ficha->cita->servicio->nombre,
            'mascota' => $ficha->cita->mascota->nombre,
            'fotos' => [
                'antes' => $ficha->fotos->where('tipo', 'antes')->values(),
                'despues' => $ficha->fotos->where('tipo', 'despues')->values()
            ]
        ], 'Fotos de la sesión obtenidas correctamente');
    }
}
<?php
// app/Models/Groomer.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groomer extends Model
{
    use HasFactory;

    protected $table = 'groomers';
    protected $primaryKey = 'idGroomer';

    protected $fillable = [
        'idUsuario',
        'especialidad',
        'maxServiciosSimultaneos'
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'idUsuario', 'idUsuario');
    }

    public function disponibilidades()
    {
        return $this->hasMany(Disponibilidad::class, 'idGroomer', 'idGroomer');
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'idGroomer', 'idGroomer');
    }

    public function fichasGrooming()
    {
        return $this->hasMany(FichaGrooming::class, 'idGroomer', 'idGroomer');
    }

    // Verificar disponibilidad en fecha específica
    public function isAvailable($fechaHoraInicio, $duracionMinutos)
    {
        $fechaHoraFin = (clone $fechaHoraInicio)->addMinutes($duracionMinutos);
        
        $citasSolapadas = $this->citas()
            ->where('estado', '!=', 'cancelada')
            ->where(function($query) use ($fechaHoraInicio, $fechaHoraFin) {
                $query->whereBetween('fechaHoraInicio', [$fechaHoraInicio, $fechaHoraFin])
                      ->orWhereBetween('fechaHoraFin', [$fechaHoraInicio, $fechaHoraFin])
                      ->orWhere(function($q) use ($fechaHoraInicio, $fechaHoraFin) {
                          $q->where('fechaHoraInicio', '<=', $fechaHoraInicio)
                            ->where('fechaHoraFin', '>=', $fechaHoraFin);
                      });
            })
            ->count();
            
        return $citasSolapadas < $this->maxServiciosSimultaneos;
    }
}
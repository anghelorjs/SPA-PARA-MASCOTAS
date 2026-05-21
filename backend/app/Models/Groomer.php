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

    public const DIAS_DISPONIBILIDAD_DEFAULT = [1, 2, 3, 4, 5, 6];
    public const HORA_INICIO_DEFAULT = '09:00:00';
    public const HORA_FIN_DEFAULT = '18:00:00';

    protected static function booted(): void
    {
        static::created(function (Groomer $groomer) {
            $groomer->crearDisponibilidadDefault();
        });
    }

    public function crearDisponibilidadDefault(): void
    {
        if ($this->disponibilidades()->where('esBloqueo', false)->exists()) {
            return;
        }

        foreach (self::DIAS_DISPONIBILIDAD_DEFAULT as $dia) {
            Disponibilidad::create([
                'idGroomer' => $this->idGroomer,
                'diaSemana' => $dia,
                'horaInicio' => self::HORA_INICIO_DEFAULT,
                'horaFin' => self::HORA_FIN_DEFAULT,
                'esBloqueo' => false,
                'motivoBloqueo' => null,
            ]);
        }
    }

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
            ->activas()
            ->solapadas($fechaHoraInicio, $fechaHoraFin)
            ->count();
            
        return $citasSolapadas < $this->maxServiciosSimultaneos;
    }
}

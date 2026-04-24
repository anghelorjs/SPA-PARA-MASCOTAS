<?php
// app/Models/Disponibilidad.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilidad extends Model
{
    use HasFactory;

    protected $table = 'disponibilidades';
    protected $primaryKey = 'idDisponibilidad';

    protected $fillable = [
        'idGroomer',
        'diaSemana',
        'horaInicio',
        'horaFin',
        'esBloqueo',
        'motivoBloqueo'
    ];

    protected $casts = [
        'esBloqueo' => 'boolean',
        'horaInicio' => 'datetime:H:i:s',
        'horaFin' => 'datetime:H:i:s'
    ];

    // Relaciones
    public function groomer()
    {
        return $this->belongsTo(Groomer::class, 'idGroomer', 'idGroomer');
    }

    // Verificar si un horario está dentro de disponibilidad
    public function containsTime($hora)
    {
        return $hora >= $this->horaInicio && $hora <= $this->horaFin;
    }
}
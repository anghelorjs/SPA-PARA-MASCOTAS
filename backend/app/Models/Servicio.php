<?php
// app/Models/Servicio.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';
    protected $primaryKey = 'idServicio';

    protected $fillable = [
        'idAdministrador',
        'nombre',
        'duracionMinutos',
        'precioBase',
        'admiteDobleBooking'
    ];

    protected $casts = [
        'admiteDobleBooking' => 'boolean',
        'precioBase' => 'decimal:2'
    ];

    // Relaciones
    public function administrador()
    {
        return $this->belongsTo(Administrador::class, 'idAdministrador', 'idAdministrador');
    }

    public function rangosPeso()
    {
        return $this->belongsToMany(RangoPeso::class, 'servicio_rango', 'idServicio', 'idRango')
                    ->withPivot('duracionAjustadaMin', 'precioAjustado')
                    ->withTimestamps();
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'idServicio', 'idServicio');
    }

    // Obtener precio ajustado por rango de peso
    public function getPrecioForRango($idRango)
    {
        $servicioRango = $this->rangosPeso()->where('idRango', $idRango)->first();
        return $servicioRango ? $servicioRango->pivot->precioAjustado : $this->precioBase;
    }

    // Obtener duración ajustada por rango de peso
    public function getDuracionForRango($idRango)
    {
        $servicioRango = $this->rangosPeso()->where('idRango', $idRango)->first();
        return $servicioRango ? $servicioRango->pivot->duracionAjustadaMin : $this->duracionMinutos;
    }
}
<?php
// app/Models/Reporte.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    use HasFactory;

    protected $table = 'reportes';
    protected $primaryKey = 'idReporte';

    protected $fillable = [
        'idAdministrador',
        'tipoReporte',
        'fechaDesde',
        'fechaHasta',
        'idGroomerFiltro',
        'generadoEn',
        'resultadoJson'
    ];

    protected $casts = [
        'fechaDesde' => 'date',
        'fechaHasta' => 'date',
        'generadoEn' => 'datetime',
        'resultadoJson' => 'array'
    ];

    // Relaciones
    public function administrador()
    {
        return $this->belongsTo(Administrador::class, 'idAdministrador', 'idAdministrador');
    }

    public function groomer()
    {
        return $this->belongsTo(Groomer::class, 'idGroomerFiltro', 'idGroomer');
    }
}
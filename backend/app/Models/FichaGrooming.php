<?php
// app/Models/FichaGrooming.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FichaGrooming extends Model
{
    use HasFactory;

    protected $table = 'fichas_grooming';
    protected $primaryKey = 'idFicha';

    protected $fillable = [
        'idCita',
        'idGroomer',
        'idMascota',
        'estadoIngreso',
        'nudos',
        'tienePulgas',
        'tieneHeridas',
        'observaciones',
        'recomendaciones',
        'fechaApertura',
        'fechaCierre'
    ];

    protected $casts = [
        'nudos' => 'boolean',
        'tienePulgas' => 'boolean',
        'tieneHeridas' => 'boolean',
        'fechaApertura' => 'datetime',
        'fechaCierre' => 'datetime'
    ];

    // Relaciones
    public function cita()
    {
        return $this->belongsTo(Cita::class, 'idCita', 'idCita');
    }

    public function groomer()
    {
        return $this->belongsTo(Groomer::class, 'idGroomer', 'idGroomer');
    }

    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'idMascota', 'idMascota');
    }

    public function checklistItems()
    {
        return $this->hasMany(ChecklistItem::class, 'idFicha', 'idFicha');
    }

    public function fotos()
    {
        return $this->hasMany(Foto::class, 'idFicha', 'idFicha');
    }

    public function detalleInsumos()
    {
        return $this->hasMany(DetalleInsumo::class, 'idFicha', 'idFicha');
    }

    // Métodos útiles
    public function cerrar()
    {
        $this->fechaCierre = now();
        $this->save();
    }

    public function getDuracionTotalAttribute()
    {
        if (!$this->fechaCierre) return null;
        return $this->fechaApertura->diffInMinutes($this->fechaCierre);
    }
}
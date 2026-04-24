<?php
// app/Models/Mascota.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mascota extends Model
{
    use HasFactory;

    protected $table = 'mascotas';
    protected $primaryKey = 'idMascota';

    protected $fillable = [
        'idCliente',
        'idRango',
        'nombre',
        'especie',
        'raza',
        'tamanio',
        'pesoKg',
        'fechaNacimiento',
        'temperamento',
        'alergias',
        'restricciones',
        'vacunas'
    ];

    protected $casts = [
        'fechaNacimiento' => 'date',
        'pesoKg' => 'decimal:2',
        'alergias' => 'array',
        'restricciones' => 'array',
        'vacunas' => 'array'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function rangoPeso()
    {
        return $this->belongsTo(RangoPeso::class, 'idRango', 'idRango');
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'idMascota', 'idMascota');
    }

    public function fichasGrooming()
    {
        return $this->hasMany(FichaGrooming::class, 'idMascota', 'idMascota');
    }

    public function fotos()
    {
        return $this->hasMany(Foto::class, 'idMascota', 'idMascota');
    }

    // Métodos útiles
    public function getEdadAttribute()
    {
        if (!$this->fechaNacimiento) return null;
        return $this->fechaNacimiento->age;
    }

    public function getPesoFormattedAttribute()
    {
        return $this->pesoKg . ' kg';
    }
}
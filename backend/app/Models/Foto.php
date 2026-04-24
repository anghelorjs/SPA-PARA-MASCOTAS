<?php
// app/Models/Foto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    use HasFactory;

    protected $table = 'fotos';
    protected $primaryKey = 'idFoto';

    protected $fillable = [
        'idMascota',
        'idFicha',
        'urlFoto',
        'tipo',
        'fechaCarga'
    ];

    protected $casts = [
        'fechaCarga' => 'datetime'
    ];

    // Relaciones
    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'idMascota', 'idMascota');
    }

    public function fichaGrooming()
    {
        return $this->belongsTo(FichaGrooming::class, 'idFicha', 'idFicha');
    }
}
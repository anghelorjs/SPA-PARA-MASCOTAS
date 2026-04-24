<?php
// app/Models/Administrador.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Administrador extends Model
{
    use HasFactory;

    protected $table = 'administradores';
    protected $primaryKey = 'idAdministrador';

    protected $fillable = [
        'idUsuario'
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'idUsuario', 'idUsuario');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'idAdministrador', 'idAdministrador');
    }

    public function reportes()
    {
        return $this->hasMany(Reporte::class, 'idAdministrador', 'idAdministrador');
    }
}
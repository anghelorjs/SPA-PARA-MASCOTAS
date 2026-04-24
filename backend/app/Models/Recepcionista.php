<?php
// app/Models/Recepcionista.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recepcionista extends Model
{
    use HasFactory;

    protected $table = 'recepcionistas';
    protected $primaryKey = 'idRecepcionista';

    protected $fillable = [
        'idUsuario',
        'turno'
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'idUsuario', 'idUsuario');
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'idRecepcionista', 'idRecepcionista');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'idRecepcionista', 'idRecepcionista');
    }
}
<?php
// app/Models/Cliente.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'clientes';
    protected $primaryKey = 'idCliente';

    protected $fillable = [
        'idUsuario',
        'direccion',
        'preferencias',
        'canalContacto'
    ];

    protected $casts = [
        'preferencias' => 'array'
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'idUsuario', 'idUsuario');
    }

    public function mascotas()
    {
        return $this->hasMany(Mascota::class, 'idCliente', 'idCliente');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'idCliente', 'idCliente');
    }

    public function pedidosWhatsapp()
    {
        return $this->hasMany(PedidoWhatsapp::class, 'idCliente', 'idCliente');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'idCliente', 'idCliente');
    }
}
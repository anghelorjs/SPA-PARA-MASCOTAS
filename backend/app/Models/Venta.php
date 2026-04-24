<?php
// app/Models/Venta.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    use HasFactory;

    protected $table = 'ventas';
    protected $primaryKey = 'idVenta';

    protected $fillable = [
        'idCliente',
        'idRecepcionista',
        'fecha',
        'total',
        'medioPago',
        'estado'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'total' => 'decimal:2'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function recepcionista()
    {
        return $this->belongsTo(Recepcionista::class, 'idRecepcionista', 'idRecepcionista');
    }

    public function detalleVentas()
    {
        return $this->hasMany(DetalleVenta::class, 'idVenta', 'idVenta');
    }

    public function factura()
    {
        return $this->hasOne(Factura::class, 'idVenta', 'idVenta');
    }

    // Métodos útiles
    public function calcularTotal()
    {
        $this->total = $this->detalleVentas()->sum('subtotal');
        $this->save();
        return $this->total;
    }

    public function pagar()
    {
        $this->estado = 'pagado';
        $this->save();
    }
}
<?php
// app/Models/Factura.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    use HasFactory;

    protected $table = 'facturas';
    protected $primaryKey = 'idFactura';

    protected $fillable = [
        'idVenta',
        'numeroFactura',
        'fechaEmision',
        'montoTotal',
        'estado'
    ];

    protected $casts = [
        'fechaEmision' => 'datetime',
        'montoTotal' => 'decimal:2'
    ];

    // Relaciones
    public function venta()
    {
        return $this->belongsTo(Venta::class, 'idVenta', 'idVenta');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'idFactura', 'idFactura');
    }

    // Métodos útiles
    public function cancelar()
    {
        $this->estado = 'cancelada';
        $this->save();
    }
}
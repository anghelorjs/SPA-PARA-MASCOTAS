<?php
// app/Models/Pago.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pagos';
    protected $primaryKey = 'idPago';

    protected $fillable = [
        'idFactura',
        'monto',
        'metodo',
        'fechaPago',
        'referencia'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fechaPago' => 'datetime'
    ];

    // Relaciones
    public function factura()
    {
        return $this->belongsTo(Factura::class, 'idFactura', 'idFactura');
    }
}
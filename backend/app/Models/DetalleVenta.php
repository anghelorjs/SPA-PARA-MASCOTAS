<?php
// app/Models/DetalleVenta.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    use HasFactory;

    protected $table = 'detalle_ventas';
    protected $primaryKey = 'idDetalleVenta';

    protected $fillable = [
        'idVenta',
        'idVariante',
        'cantidad',
        'precioUnitario',
        'subtotal'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precioUnitario' => 'decimal:2',
        'subtotal' => 'decimal:2'
    ];

    // Relaciones
    public function venta()
    {
        return $this->belongsTo(Venta::class, 'idVenta', 'idVenta');
    }

    public function variante()
    {
        return $this->belongsTo(VarianteProducto::class, 'idVariante', 'idVariante');
    }

    // Mutators
    public function setSubtotalAttribute()
    {
        $this->attributes['subtotal'] = $this->cantidad * $this->precioUnitario;
    }
}
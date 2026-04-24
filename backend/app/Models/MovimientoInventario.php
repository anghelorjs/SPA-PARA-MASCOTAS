<?php
// app/Models/MovimientoInventario.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoInventario extends Model
{
    use HasFactory;

    protected $table = 'movimientos_inventario';
    protected $primaryKey = 'idMovimiento';

    protected $fillable = [
        'idProducto',
        'tipoMovimiento',
        'cantidad',
        'fecha',
        'motivo'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'cantidad' => 'integer'
    ];

    // Relaciones
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }
}
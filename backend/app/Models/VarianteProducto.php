<?php
// app/Models/VarianteProducto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VarianteProducto extends Model
{
    use HasFactory;

    protected $table = 'variante_productos';
    protected $primaryKey = 'idVariante';

    protected $fillable = [
        'idProducto',
        'nombreVariante',
        'precio',
        'stock'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'stock' => 'integer'
    ];

    // Relaciones
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }

    public function detalleVentas()
    {
        return $this->hasMany(DetalleVenta::class, 'idVariante', 'idVariante');
    }

    public function itemsPedido()
    {
        return $this->hasMany(ItemPedido::class, 'idVariante', 'idVariante');
    }

    // Métodos útiles
    public function descontarStock($cantidad)
    {
        if ($this->stock >= $cantidad) {
            $this->stock -= $cantidad;
            $this->save();
            
            // Registrar movimiento
            MovimientoInventario::create([
                'idProducto' => $this->idProducto,
                'tipoMovimiento' => 'salida',
                'cantidad' => $cantidad,
                'motivo' => 'Venta de producto'
            ]);
            
            return true;
        }
        return false;
    }

    public function aumentarStock($cantidad, $motivo = null)
    {
        $this->stock += $cantidad;
        $this->save();
        
        MovimientoInventario::create([
            'idProducto' => $this->idProducto,
            'tipoMovimiento' => 'entrada',
            'cantidad' => $cantidad,
            'motivo' => $motivo
        ]);
    }
}
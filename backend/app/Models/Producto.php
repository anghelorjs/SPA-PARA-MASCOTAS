<?php
// app/Models/Producto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';
    protected $primaryKey = 'idProducto';

    protected $fillable = [
        'idCategoria',
        'nombre',
        'descripcion',
        'precioBase',
        'activo'
    ];

    protected $casts = [
        'precioBase' => 'decimal:2',
        'activo' => 'boolean'
    ];

    // Relaciones
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'idCategoria', 'idCategoria');
    }

    public function variantes()
    {
        return $this->hasMany(VarianteProducto::class, 'idProducto', 'idProducto');
    }

    public function movimientosInventario()
    {
        return $this->hasMany(MovimientoInventario::class, 'idProducto', 'idProducto');
    }
}
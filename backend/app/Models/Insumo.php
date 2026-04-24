<?php
// app/Models/Insumo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    use HasFactory;

    protected $table = 'insumos';
    protected $primaryKey = 'idInsumo';

    protected $fillable = [
        'idCategoria',
        'nombre',
        'unidadMedida',
        'stockActual',
        'stockMinimo',
        'costoUnitario'
    ];

    protected $casts = [
        'stockActual' => 'decimal:2',
        'stockMinimo' => 'decimal:2',
        'costoUnitario' => 'decimal:2'
    ];

    // Relaciones
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'idCategoria', 'idCategoria');
    }

    public function detalleInsumos()
    {
        return $this->hasMany(DetalleInsumo::class, 'idInsumo', 'idInsumo');
    }

    // Métodos útiles
    public function consumir($cantidad)
    {
        if ($this->stockActual >= $cantidad) {
            $this->stockActual -= $cantidad;
            $this->save();
            return true;
        }
        return false;
    }

    public function reponer($cantidad)
    {
        $this->stockActual += $cantidad;
        $this->save();
    }

    public function isLowStock()
    {
        return $this->stockActual <= $this->stockMinimo;
    }
}
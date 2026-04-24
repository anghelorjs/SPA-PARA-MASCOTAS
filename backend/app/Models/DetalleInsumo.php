<?php
// app/Models/DetalleInsumo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleInsumo extends Model
{
    use HasFactory;

    protected $table = 'detalle_insumos';
    protected $primaryKey = 'idDetalleInsumo';

    protected $fillable = [
        'idFicha',
        'idInsumo',
        'cantidadUsada'
    ];

    protected $casts = [
        'cantidadUsada' => 'decimal:2'
    ];

    // Relaciones
    public function fichaGrooming()
    {
        return $this->belongsTo(FichaGrooming::class, 'idFicha', 'idFicha');
    }

    public function insumo()
    {
        return $this->belongsTo(Insumo::class, 'idInsumo', 'idInsumo');
    }
}
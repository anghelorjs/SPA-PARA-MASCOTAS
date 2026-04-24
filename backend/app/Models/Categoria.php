<?php
// app/Models/Categoria.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';
    protected $primaryKey = 'idCategoria';

    protected $fillable = [
        'nombre',
        'tipo',
        'descripcion'
    ];

    // Relaciones
    public function productos()
    {
        return $this->hasMany(Producto::class, 'idCategoria', 'idCategoria');
    }

    public function insumos()
    {
        return $this->hasMany(Insumo::class, 'idCategoria', 'idCategoria');
    }
}
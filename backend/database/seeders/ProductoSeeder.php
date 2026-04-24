<?php
// database/seeders/ProductoSeeder.php

namespace Database\Seeders;

use App\Models\Producto;
use App\Models\VarianteProducto;
use App\Models\Categoria;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $categoriaAlimentos = Categoria::where('nombre', 'Alimentos')->first();
        $categoriaHigiene = Categoria::where('nombre', 'Higiene')->first();
        $categoriaAccesorios = Categoria::where('nombre', 'Accesorios')->first();
        $categoriaJuguetes = Categoria::where('nombre', 'Juguetes')->first();

        // Alimento Premium
        $alimento = Producto::create([
            'idCategoria' => $categoriaAlimentos->idCategoria,
            'nombre' => 'Alimento Premium',
            'descripcion' => 'Alimento balanceado de alta calidad',
            'precioBase' => 120,
            'activo' => true
        ]);
        
        VarianteProducto::create([
            'idProducto' => $alimento->idProducto,
            'nombreVariante' => '1kg',
            'precio' => 120,
            'stock' => 50
        ]);
        
        VarianteProducto::create([
            'idProducto' => $alimento->idProducto,
            'nombreVariante' => '3kg',
            'precio' => 320,
            'stock' => 30
        ]);

        // Shampoo para mascotas
        $shampoo = Producto::create([
            'idCategoria' => $categoriaHigiene->idCategoria,
            'nombre' => 'Shampoo Hipoalergénico',
            'descripcion' => 'Shampoo suave para piel sensible',
            'precioBase' => 45,
            'activo' => true
        ]);
        
        VarianteProducto::create([
            'idProducto' => $shampoo->idProducto,
            'nombreVariante' => '250ml',
            'precio' => 45,
            'stock' => 100
        ]);

        // Correa resistente
        $correa = Producto::create([
            'idCategoria' => $categoriaAccesorios->idCategoria,
            'nombre' => 'Correa Resistente',
            'descripcion' => 'Correa de nylon reforzado',
            'precioBase' => 35,
            'activo' => true
        ]);
        
        VarianteProducto::create([
            'idProducto' => $correa->idProducto,
            'nombreVariante' => '1.2m',
            'precio' => 35,
            'stock' => 75
        ]);

        // Juguete interactivo
        $juguete = Producto::create([
            'idCategoria' => $categoriaJuguetes->idCategoria,
            'nombre' => 'Juguete Interactivo',
            'descripcion' => 'Juguete dispensador de comida',
            'precioBase' => 65,
            'activo' => true
        ]);
        
        VarianteProducto::create([
            'idProducto' => $juguete->idProducto,
            'nombreVariante' => 'Talla M',
            'precio' => 65,
            'stock' => 40
        ]);

    }
}
<?php
// database/seeders/CategoriaSeeder.php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Alimentos', 'tipo' => 'producto', 'descripcion' => 'Alimentos balanceados para mascotas'],
            ['nombre' => 'Higiene', 'tipo' => 'producto', 'descripcion' => 'Productos de limpieza e higiene'],
            ['nombre' => 'Accesorios', 'tipo' => 'producto', 'descripcion' => 'Accesorios y complementos'],
            ['nombre' => 'Juguetes', 'tipo' => 'producto', 'descripcion' => 'Juguetes para entretenimiento'],
            ['nombre' => 'Shampoos', 'tipo' => 'insumo', 'descripcion' => 'Shampoos para baño'],
            ['nombre' => 'Medicamentos', 'tipo' => 'producto', 'descripcion' => 'Medicamentos y suplementos'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
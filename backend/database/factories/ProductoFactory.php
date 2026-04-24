<?php
// database/factories/ProductoFactory.php

namespace Database\Factories;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition(): array
    {
        $productos = [
            'Alimento Premium' => 100,
            'Shampoo para mascotas' => 50,
            'Correa resistente' => 30,
            'Juguete interactivo' => 25,
            'Cama ortopédica' => 150,
            'Cepillo deslanador' => 20,
            'Comedero elevado' => 35,
            'Bebedero automático' => 45,
        ];
        
        $nombre = $this->faker->randomElement(array_keys($productos));
        
        return [
            'idCategoria' => Categoria::factory(),
            'nombre' => $nombre,
            'descripcion' => $this->faker->paragraph(),
            'precioBase' => $productos[$nombre],
            'activo' => true,
        ];
    }
}
<?php
// database/factories/InsumoFactory.php

namespace Database\Factories;

use App\Models\Insumo;
use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

class InsumoFactory extends Factory
{
    protected $model = Insumo::class;

    public function definition(): array
    {
        $unidades = ['litros', 'kg', 'unidades', 'ml', 'gr'];
        
        return [
            'idCategoria' => Categoria::factory(),
            'nombre' => $this->faker->randomElement(['Shampoo', 'Acondicionador', 'Perfume', 'Desinfectante', 'Jabón']),
            'unidadMedida' => $this->faker->randomElement($unidades),
            'stockActual' => $this->faker->randomFloat(2, 0, 100),
            'stockMinimo' => $this->faker->randomFloat(2, 1, 20),
            'costoUnitario' => $this->faker->randomFloat(2, 5, 200),
        ];
    }
}
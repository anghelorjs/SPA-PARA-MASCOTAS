<?php
// database/factories/ChecklistItemFactory.php

namespace Database\Factories;

use App\Models\ChecklistItem;
use App\Models\FichaGrooming;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChecklistItemFactory extends Factory
{
    protected $model = ChecklistItem::class;

    public function definition(): array
    {
        $items = [
            'Baño', 'Corte de pelo', 'Corte de uñas', 'Limpieza de oídos',
            'Cepillado dental', 'Glándulas anales', 'Perfume', 'Secado'
        ];
        
        return [
            'idFicha' => FichaGrooming::factory(),
            'nombreItem' => $this->faker->randomElement($items),
            'completado' => $this->faker->boolean(70),
            'observacion' => $this->faker->optional()->sentence(),
        ];
    }
}
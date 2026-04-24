<?php
// database/factories/ItemPedidoFactory.php

namespace Database\Factories;

use App\Models\ItemPedido;
use App\Models\PedidoWhatsapp;
use App\Models\VarianteProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemPedidoFactory extends Factory
{
    protected $model = ItemPedido::class;

    public function definition(): array
    {
        $cantidad = $this->faker->numberBetween(1, 3);
        $precioUnitario = $this->faker->randomFloat(2, 10, 150);
        
        return [
            'idPedido' => PedidoWhatsapp::factory(),
            'idVariante' => VarianteProducto::factory(),
            'cantidad' => $cantidad,
            'precioUnitario' => $precioUnitario,
        ];
    }
}
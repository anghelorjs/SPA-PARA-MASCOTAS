<?php
// database/factories/PedidoWhatsappFactory.php

namespace Database\Factories;

use App\Models\PedidoWhatsapp;
use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

class PedidoWhatsappFactory extends Factory
{
    protected $model = PedidoWhatsapp::class;

    public function definition(): array
    {
        return [
            'idCliente' => Cliente::factory(),
            'fecha' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'estado' => $this->faker->randomElement(['pendiente', 'enviado', 'confirmado', 'pagado']),
            'subtotal' => $this->faker->randomFloat(2, 30, 500),
            'mensajeGenerado' => $this->faker->optional()->paragraph(),
            'canal' => $this->faker->randomElement(['whatsapp', 'telegram']),
        ];
    }
}
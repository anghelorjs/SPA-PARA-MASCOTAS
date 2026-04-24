<?php
// database/factories/ClienteFactory.php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClienteFactory extends Factory
{
    protected $model = Cliente::class;

    public function definition(): array
    {
        return [
            'idUsuario' => User::factory()->cliente(),
            'direccion' => $this->faker->address(),
            'preferencias' => json_encode([
                'horario_preferido' => $this->faker->randomElement(['mañana', 'tarde']),
                'groomer_preferido' => $this->faker->randomElement([null, 'Juan', 'María', 'Carlos']),
            ]),
            'canalContacto' => $this->faker->randomElement(['whatsapp', 'telegram', 'email', 'sms']),
        ];
    }
}
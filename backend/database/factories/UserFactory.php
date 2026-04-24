<?php
// database/factories/UserFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->firstName(),
            'apellido' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'passwordHash' => Hash::make('password123'),
            'telefono' => $this->faker->phoneNumber(),
            'rol' => $this->faker->randomElement(['administrador', 'recepcionista', 'groomer', 'cliente']),
            'activo' => true,
            'creadoEn' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    public function administrador(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'administrador',
        ]);
    }

    public function recepcionista(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'recepcionista',
        ]);
    }

    public function groomer(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'groomer',
        ]);
    }

    public function cliente(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => 'cliente',
        ]);
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }
}
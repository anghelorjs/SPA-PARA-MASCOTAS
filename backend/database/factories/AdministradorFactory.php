<?php
// database/factories/AdministradorFactory.php

namespace Database\Factories;

use App\Models\Administrador;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdministradorFactory extends Factory
{
    protected $model = Administrador::class;

    public function definition(): array
    {
        return [
            'idUsuario' => User::factory()->administrador(),
        ];
    }
}
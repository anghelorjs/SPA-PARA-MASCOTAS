<?php
// database/factories/ServicioFactory.php

namespace Database\Factories;

use App\Models\Servicio;
use App\Models\Administrador;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicioFactory extends Factory
{
    protected $model = Servicio::class;

    public function definition(): array
    {
        $servicios = [
            'Baño rápido' => 30,
            'Baño completo' => 60,
            'Corte de pelo' => 90,
            'Corte higiénico' => 45,
            'Limpieza de oídos' => 20,
            'Corte de uñas' => 15,
            'Cepillado dental' => 25,
            'Desparasitación' => 10,
            'Spa completo' => 120,
        ];
        
        $nombre = $this->faker->randomElement(array_keys($servicios));
        
        return [
            'idAdministrador' => Administrador::factory(),
            'nombre' => $nombre,
            'duracionMinutos' => $servicios[$nombre],
            'precioBase' => $this->faker->randomFloat(2, 50, 500),
            'admiteDobleBooking' => $this->faker->boolean(20),
        ];
    }
}
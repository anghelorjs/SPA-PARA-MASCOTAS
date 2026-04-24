<?php
// database/factories/NotificacionFactory.php

namespace Database\Factories;

use App\Models\Notificacion;
use App\Models\Cliente;
use App\Models\Cita;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificacionFactory extends Factory
{
    protected $model = Notificacion::class;

    public function definition(): array
    {
        return [
            'idCliente' => Cliente::factory(),
            'idCita' => $this->faker->optional(0.7)->passthrough(Cita::factory()),
            'tipo' => $this->faker->randomElement(['confirmacion', 'recordatorio', 'listo_para_recoger', 'encuesta']),
            'canal' => $this->faker->randomElement(['whatsapp', 'telegram', 'email', 'sms']),
            'mensaje' => $this->faker->sentence(),
            'fechaEnvio' => $this->faker->optional(0.8)->dateTimeBetween('-1 month', 'now'),
            'entregada' => $this->faker->boolean(70),
        ];
    }
}
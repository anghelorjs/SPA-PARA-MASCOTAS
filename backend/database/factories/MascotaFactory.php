<?php
// database/factories/MascotaFactory.php

namespace Database\Factories;

use App\Models\Mascota;
use App\Models\Cliente;
use App\Models\RangoPeso;
use Illuminate\Database\Eloquent\Factories\Factory;

class MascotaFactory extends Factory
{
    protected $model = Mascota::class;

    public function definition(): array
    {
        $especie = $this->faker->randomElement(['perro', 'gato']);
        $razasPerro = ['Labrador', 'Pastor Alemán', 'Bulldog', 'Poodle', 'Chihuahua', 'Golden Retriever'];
        $razasGato = ['Persa', 'Siamés', 'Maine Coon', 'Bengalí', 'Egipcio'];
        
        return [
            'idCliente' => Cliente::factory(),
            'idRango' => RangoPeso::factory(),
            'nombre' => $this->faker->firstName(),
            'especie' => $especie,
            'raza' => $especie === 'perro' ? $this->faker->randomElement($razasPerro) : $this->faker->randomElement($razasGato),
            'tamanio' => $this->faker->randomElement(['pequeño', 'mediano', 'grande']),
            'pesoKg' => $this->faker->randomFloat(2, 1, 40),
            'fechaNacimiento' => $this->faker->dateTimeBetween('-10 years', 'now'),
            'temperamento' => $this->faker->randomElement(['Tranquilo', 'Juguetón', 'Agresivo', 'Tímido', 'Cariñoso']),
            'alergias' => $this->faker->optional()->randomElement([null, 'Polen', 'Alimentos', 'Ácaros']),
            'restricciones' => $this->faker->optional()->randomElement([null, 'No puede bañarse', 'Requiere correa especial']),
            'vacunas' => json_encode(['Rabia', 'Parvovirus', 'Moquillo']),
        ];
    }
}
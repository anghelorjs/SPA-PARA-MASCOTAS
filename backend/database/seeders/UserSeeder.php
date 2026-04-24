<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Administrador;
use App\Models\Recepcionista;
use App\Models\Groomer;
use App\Models\Cliente;
use App\Models\Mascota;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario Administrador
        $adminUser = User::create([
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'email' => 'admin@spamascotas.com',
            'passwordHash' => Hash::make('admin123'),
            'telefono' => '123456789',
            'rol' => 'administrador',
            'activo' => true,
        ]);
        Administrador::create(['idUsuario' => $adminUser->idUsuario]);

        // Usuario Recepcionista
        $recepcionistaUser = User::create([
            'nombre' => 'Ana',
            'apellido' => 'García',
            'email' => 'recepcion@spamascotas.com',
            'passwordHash' => Hash::make('recepcion123'),
            'telefono' => '987654321',
            'rol' => 'recepcionista',
            'activo' => true,
        ]);
        Recepcionista::create([
            'idUsuario' => $recepcionistaUser->idUsuario,
            'turno' => 'matutino'
        ]);

        // Usuario Groomer
        $groomerUser = User::create([
            'nombre' => 'Carlos',
            'apellido' => 'López',
            'email' => 'groomer@spamascotas.com',
            'passwordHash' => Hash::make('groomer123'),
            'telefono' => '555123456',
            'rol' => 'groomer',
            'activo' => true,
        ]);
        Groomer::create([
            'idUsuario' => $groomerUser->idUsuario,
            'especialidad' => 'Perros y gatos',
            'maxServiciosSimultaneos' => 2
        ]);

        // Usuario Cliente 1
        $clienteUser1 = User::create([
            'nombre' => 'María',
            'apellido' => 'Rodríguez',
            'email' => 'cliente1@example.com',
            'passwordHash' => Hash::make('cliente123'),
            'telefono' => '555111222',
            'rol' => 'cliente',
            'activo' => true,
        ]);
        $cliente1 = Cliente::create([
            'idUsuario' => $clienteUser1->idUsuario,
            'direccion' => 'Av. Principal 123',
            'preferencias' => json_encode(['horario_preferido' => 'mañana']),
            'canalContacto' => 'whatsapp'
        ]);

        // Mascotas para Cliente 1
        Mascota::create([
            'idCliente' => $cliente1->idCliente,
            'nombre' => 'Luna',
            'especie' => 'perro',
            'raza' => 'Labrador',
            'tamanio' => 'grande',
            'pesoKg' => 28.5,
            'fechaNacimiento' => '2020-05-15',
            'temperamento' => 'Juguetón',
            'alergias' => null,
            'restricciones' => null,
            'vacunas' => json_encode(['Rabia', 'Parvovirus'])
        ]);

        Mascota::create([
            'idCliente' => $cliente1->idCliente,
            'nombre' => 'Simba',
            'especie' => 'gato',
            'raza' => 'Siamés',
            'tamanio' => 'mediano',
            'pesoKg' => 4.2,
            'fechaNacimiento' => '2021-08-22',
            'temperamento' => 'Tranquilo',
            'alergias' => 'Polen',
            'restricciones' => null,
            'vacunas' => json_encode(['Rabia', 'Leucemia felina'])
        ]);

        // Usuario Cliente 2
        $clienteUser2 = User::create([
            'nombre' => 'Pedro',
            'apellido' => 'Martínez',
            'email' => 'cliente2@example.com',
            'passwordHash' => Hash::make('cliente123'),
            'telefono' => '555333444',
            'rol' => 'cliente',
            'activo' => true,
        ]);
        $cliente2 = Cliente::create([
            'idUsuario' => $clienteUser2->idUsuario,
            'direccion' => 'Calle Secundaria 456',
            'preferencias' => json_encode(['horario_preferido' => 'tarde']),
            'canalContacto' => 'telegram'
        ]);

        Mascota::create([
            'idCliente' => $cliente2->idCliente,
            'nombre' => 'Rocky',
            'especie' => 'perro',
            'raza' => 'Bulldog',
            'tamanio' => 'mediano',
            'pesoKg' => 12.3,
            'fechaNacimiento' => '2019-11-10',
            'temperamento' => 'Travieso',
            'alergias' => 'Alimentos',
            'restricciones' => 'No dar huesos',
            'vacunas' => json_encode(['Rabia', 'Moquillo', 'Hepatitis'])
        ]);

        // Generar 20 clientes adicionales con Factories
        Cliente::factory(20)->create()->each(function ($cliente) {
            Mascota::factory(rand(1, 3))->create(['idCliente' => $cliente->idCliente]);
        });
    }
}
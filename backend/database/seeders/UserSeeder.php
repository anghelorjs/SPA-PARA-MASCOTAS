<?php
// database/seeders/UserSeeder.php - VERSIÓN OPTIMIZADA

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
        // 1. Usuario Administrador
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

        // 2. Usuario Recepcionista
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

        // 3. Usuario Groomer 1
        $groomerUser1 = User::create([
            'nombre' => 'Carlos',
            'apellido' => 'López',
            'email' => 'groomer1@spamascotas.com',
            'passwordHash' => Hash::make('groomer123'),
            'telefono' => '555123456',
            'rol' => 'groomer',
            'activo' => true,
        ]);
        Groomer::create([
            'idUsuario' => $groomerUser1->idUsuario,
            'especialidad' => 'Perros',
            'maxServiciosSimultaneos' => 2
        ]);

        // 4. Usuario Groomer 2
        $groomerUser2 = User::create([
            'nombre' => 'María',
            'apellido' => 'Fernández',
            'email' => 'groomer2@spamascotas.com',
            'passwordHash' => Hash::make('groomer123'),
            'telefono' => '555789012',
            'rol' => 'groomer',
            'activo' => true,
        ]);
        Groomer::create([
            'idUsuario' => $groomerUser2->idUsuario,
            'especialidad' => 'Gatos y perros pequeños',
            'maxServiciosSimultaneos' => 1
        ]);

        // 5. Usuario Cliente 1
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

        Mascota::create([
            'idCliente' => $cliente1->idCliente,
            'nombre' => 'Luna',
            'especie' => 'perro',
            'raza' => 'Labrador',
            'tamanio' => 'grande',
            'pesoKg' => 28.5,
            'fechaNacimiento' => '2020-05-15',
            'temperamento' => 'Juguetón',
            'vacunas' => json_encode(['Rabia', 'Parvovirus'])
        ]);

        // 6. Usuario Cliente 2
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
            'vacunas' => json_encode(['Rabia', 'Moquillo'])
        ]);

    }
}
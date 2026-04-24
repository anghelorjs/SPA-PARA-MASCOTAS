<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            RangoPesoSeeder::class,
            CategoriaSeeder::class,
            ServicioSeeder::class,
            ProductoSeeder::class,
            CitaSeeder::class,
            FichaGroomingSeeder::class,
            VentaSeeder::class,
            PedidoWhatsappSeeder::class,
            NotificacionSeeder::class,
            ReporteSeeder::class,
        ]);
    }
}
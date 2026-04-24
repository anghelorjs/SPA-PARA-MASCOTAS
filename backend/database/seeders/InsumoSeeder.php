<?php
// database/seeders/InsumoSeeder.php

namespace Database\Seeders;

use App\Models\Insumo;
use App\Models\Categoria;
use Illuminate\Database\Seeder;

class InsumoSeeder extends Seeder
{
    public function run(): void
    {
        $insumos = [
            ['nombre' => 'Shampoo Profesional', 'unidadMedida' => 'litros', 'stockActual' => 50, 'stockMinimo' => 10, 'costoUnitario' => 25],
            ['nombre' => 'Acondicionador', 'unidadMedida' => 'litros', 'stockActual' => 30, 'stockMinimo' => 8, 'costoUnitario' => 22],
            ['nombre' => 'Perfume Canino', 'unidadMedida' => 'ml', 'stockActual' => 200, 'stockMinimo' => 50, 'costoUnitario' => 5],
            ['nombre' => 'Cortauñas', 'unidadMedida' => 'unidades', 'stockActual' => 15, 'stockMinimo' => 5, 'costoUnitario' => 12],
            ['nombre' => 'Lima de uñas', 'unidadMedida' => 'unidades', 'stockActual' => 20, 'stockMinimo' => 5, 'costoUnitario' => 8],
            ['nombre' => 'Cepillo deslanador', 'unidadMedida' => 'unidades', 'stockActual' => 10, 'stockMinimo' => 3, 'costoUnitario' => 15],
        ];

        $categoriaInsumos = Categoria::where('tipo', 'insumo')->first();

        foreach ($insumos as $insumo) {
            Insumo::create([
                'idCategoria' => $categoriaInsumos->idCategoria,
                ...$insumo
            ]);
        }
    }
}
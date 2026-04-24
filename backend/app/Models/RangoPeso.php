<?php
// app/Models/RangoPeso.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RangoPeso extends Model
{
    use HasFactory;

    protected $table = 'rangos_peso';
    protected $primaryKey = 'idRango';

    protected $fillable = [
        'nombre',
        'pesoMinKg',
        'pesoMaxKg',
        'factorTiempo',
        'factorPrecio'
    ];

    protected $casts = [
        'pesoMinKg' => 'decimal:2',
        'pesoMaxKg' => 'decimal:2',
        'factorTiempo' => 'decimal:2',
        'factorPrecio' => 'decimal:2'
    ];

    // Relaciones
    public function mascotas()
    {
        return $this->hasMany(Mascota::class, 'idRango', 'idRango');
    }

    public function servicios()
    {
        return $this->belongsToMany(Servicio::class, 'servicio_rango', 'idRango', 'idServicio')
                    ->withPivot('duracionAjustadaMin', 'precioAjustado')
                    ->withTimestamps();
    }

    // Determinar rango según peso
    public static function getRangoByPeso($pesoKg)
    {
        return self::where('pesoMinKg', '<=', $pesoKg)
                   ->where('pesoMaxKg', '>=', $pesoKg)
                   ->first();
    }
}
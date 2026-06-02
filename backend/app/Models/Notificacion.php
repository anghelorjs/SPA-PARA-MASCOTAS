<?php
// app/Models/Notificacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';
    protected $primaryKey = 'idNotificacion';

    protected $fillable = [
        'idCliente',
        'idCita',
        'tipo',
        'canal',
        'mensaje',
        'fechaEnvio',
        'entregada',
        'leida',
        'errorEnvio'
    ];

    protected $casts = [
        'fechaEnvio' => 'datetime',
        'entregada' => 'boolean',
        'leida' => 'boolean'
    ];

    // Tipos válidos de notificaciones
    const TIPOS = [
        'confirmacion',
        'recordatorio',
        'listo_para_recoger',
        'encuesta',
        'cancelacion',
        'reprogramacion',
        'pendiente_confirmacion', // ← NUEVO
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function cita()
    {
        return $this->belongsTo(Cita::class, 'idCita', 'idCita');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('entregada', false)
                     ->whereNotNull('fechaEnvio')
                     ->where('fechaEnvio', '<=', now());
    }

    // Métodos útiles
    public function marcarComoEntregada()
    {
        $this->entregada = true;
        $this->errorEnvio = null;
        $this->save();
    }

    public function marcarComoLeida()
    {
        $this->leida = true;
        $this->save();
    }
}

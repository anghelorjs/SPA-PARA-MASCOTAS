<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Cita extends Model
{
    use HasFactory;

    protected $table = 'citas';
    protected $primaryKey = 'idCita';

    protected $fillable = [
        'idMascota',
        'idGroomer',
        'idServicio',
        'idRecepcionista',
        'fechaHoraInicio',
        'fechaHoraFin',
        'duracionCalculadaMin',
        'estado',
        'observaciones',
        'confirmacion_expira_at', // ← NUEVO
    ];

    protected $casts = [
        'fechaHoraInicio' => 'datetime',
        'fechaHoraFin' => 'datetime',
        'duracionCalculadaMin' => 'integer',
        'confirmacion_expira_at' => 'datetime', // ← NUEVO
    ];

    // Relaciones
    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'idMascota', 'idMascota');
    }

    public function groomer()
    {
        return $this->belongsTo(Groomer::class, 'idGroomer', 'idGroomer');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'idServicio', 'idServicio');
    }

    public function recepcionista()
    {
        return $this->belongsTo(Recepcionista::class, 'idRecepcionista', 'idRecepcionista');
    }

    public function fichaGrooming()
    {
        return $this->hasOne(FichaGrooming::class, 'idCita', 'idCita');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'idCita', 'idCita');
    }

    // Scopes útiles
    public function scopeProgramadas($query)
    {
        return $query->whereIn('estado', ['programada', 'confirmada', 'pendiente_confirmacion']);
    }

    public function scopePorGroomer($query, $idGroomer)
    {
        return $query->where('idGroomer', $idGroomer);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fechaHoraInicio', $fecha);
    }

    public function scopePendientesConfirmacion($query)
    {
        return $query->where('estado', 'pendiente_confirmacion')
                     ->where('confirmacion_expira_at', '>', now());
    }

    // Métodos útiles
    public function cancelar()
    {
        $this->estado = 'cancelada';
        $this->save();
    }

    public function confirmar()
    {
        $this->estado = 'confirmada';
        $this->save();
    }

    public function iniciar()
    {
        $this->estado = 'en_curso';
        $this->save();
    }

    public function completar()
    {
        $this->estado = 'completada';
        $this->save();
    }

    // NUEVO: Verificar si está pendiente de confirmación
    public function estaPendienteConfirmacion(): bool
    {
        return $this->estado === 'pendiente_confirmacion' 
            && $this->confirmacion_expira_at 
            && $this->confirmacion_expira_at > now();
    }
}
<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'idUsuario';

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'passwordHash',
        'telefono',
        'rol',
        'activo'
    ];

    protected $hidden = [
        'passwordHash',
        'remember_token'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'creadoEn' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Mutator para password
    public function setPasswordAttribute($value)
    {
        $this->attributes['passwordHash'] = bcrypt($value);
    }

    // Accessor para obtener password (no se usa)
    public function getAuthPassword()
    {
        return $this->passwordHash;
    }

    // Relaciones
    public function administrador()
    {
        return $this->hasOne(Administrador::class, 'idUsuario', 'idUsuario');
    }

    public function recepcionista()
    {
        return $this->hasOne(Recepcionista::class, 'idUsuario', 'idUsuario');
    }

    public function groomer()
    {
        return $this->hasOne(Groomer::class, 'idUsuario', 'idUsuario');
    }

    public function cliente()
    {
        return $this->hasOne(Cliente::class, 'idUsuario', 'idUsuario');
    }

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByRol($query, $rol)
    {
        return $query->where('rol', $rol);
    }
}
<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Str;

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
        'activo',
        'email_verified_at',
        'activation_token',
        'activation_token_expires_at',
        'must_change_password',
        'google_id'
    ];

    protected $hidden = [
        'passwordHash',
        'remember_token',
        'activation_token'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'creadoEn' => 'datetime',
        'email_verified_at' => 'datetime',
        'activation_token_expires_at' => 'datetime',
        'must_change_password' => 'boolean',
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

    // ========== MÉTODOS PARA ACTIVACIÓN DE CUENTA ==========
    
    /**
     * Generar token de activación (válido por 15 minutos)
     */
    public function generateActivationToken(): string
    {
        $this->activation_token = Str::random(64);
        $this->activation_token_expires_at = now()->addMinutes(15);
        $this->save();
        
        return $this->activation_token;
    }

    /**
     * Verificar si el token de activación es válido
     */
    public function verifyActivationToken(string $token): bool
    {
        if (!$this->activation_token || $this->activation_token !== $token) {
            return false;
        }
        
        if ($this->activation_token_expires_at < now()) {
            return false;
        }
        
        return true;
    }

    /**
     * Activar la cuenta del usuario
     */
    public function activateAccount(): void
    {
        $this->email_verified_at = now();
        $this->must_change_password = true;
        $this->activation_token = null;
        $this->activation_token_expires_at = null;
        $this->save();
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

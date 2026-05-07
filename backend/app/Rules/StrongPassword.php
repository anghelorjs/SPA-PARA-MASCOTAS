<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Mínimo 8 caracteres
        if (strlen($value) < 8) {
            $fail('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        
        // Al menos una letra mayúscula
        if (!preg_match('/[A-Z]/', $value)) {
            $fail('La contraseña debe contener al menos una letra mayúscula.');
            return;
        }
        
        // Al menos una letra minúscula
        if (!preg_match('/[a-z]/', $value)) {
            $fail('La contraseña debe contener al menos una letra minúscula.');
            return;
        }
        
        // Al menos un número
        if (!preg_match('/[0-9]/', $value)) {
            $fail('La contraseña debe contener al menos un número.');
            return;
        }
        
        // Opcional: al menos un carácter especial
        // if (!preg_match('/[^A-Za-z0-9]/', $value)) {
        //     $fail('La contraseña debe contener al menos un carácter especial (!@#$%^&*).');
        //     return;
        // }
    }
}
<?php
// app/Http/Controllers/Api/Admin/Configuracion/NegocioController.php

namespace App\Http\Controllers\Api\Admin\Configuracion;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NegocioController extends ApiController
{
    /**
     * Obtener datos del negocio
     */
    public function datosNegocio()
    {
        // Estos datos podrían venir de una tabla 'configuraciones' o de archivo
        $datosNegocio = [
            'nombre_negocio' => config('app.name', 'SPA para Mascotas'),
            'logo' => config('app.logo', null),
            'telefono' => config('app.phone', '+591 12345678'),
            'direccion' => config('app.address', 'Av. Principal 123, La Paz'),
            'email_contacto' => config('app.email', 'contacto@spamascotas.com'),
            'redes_sociales' => [
                'facebook' => config('app.facebook', 'https://facebook.com/spamascotas'),
                'instagram' => config('app.instagram', 'https://instagram.com/spamascotas'),
                'whatsapp' => config('app.whatsapp', 'https://wa.me/59171234567')
            ],
            'horario_atencion' => [
                'lunes_viernes' => '09:00 - 18:00',
                'sabado' => '09:00 - 13:00',
                'domingo' => 'Cerrado'
            ]
        ];
        
        return $this->successResponse($datosNegocio, 'Datos del negocio obtenidos correctamente');
    }
    
    /**
     * Actualizar datos del negocio
     */
    public function updateDatosNegocio(Request $request)
    {
        $request->validate([
            'nombre_negocio' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'email_contacto' => 'nullable|email',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'whatsapp' => 'nullable|url',
            'horario_apertura' => 'nullable|string',
            'horario_cierre' => 'nullable|string'
        ]);
        
        // Aquí guardarías en una tabla de configuraciones o archivo .env
        // Por ahora simulamos la actualización
        // En un sistema real, guardarías en la tabla 'configuraciones' o en el archivo .env
        
        return $this->successResponse($request->all(), 'Datos del negocio actualizados correctamente');
    }
    
    /**
     * Subir logo del negocio
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);
        
        if ($request->hasFile('logo')) {
            // Eliminar logo anterior si existe
            $oldLogo = config('app.logo');
            if ($oldLogo && Storage::disk('public')->exists(str_replace('/storage/', '', $oldLogo))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }
            
            $path = $request->file('logo')->store('logos', 'public');
            $logoUrl = Storage::url($path);
            
            // Aquí guardarías la URL en la configuración o base de datos
            
            return $this->successResponse(['logo_url' => $logoUrl], 'Logo subido correctamente');
        }
        
        return $this->errorResponse('No se recibió ningún archivo', 400);
    }
}
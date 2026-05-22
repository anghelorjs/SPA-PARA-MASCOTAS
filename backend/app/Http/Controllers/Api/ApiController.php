<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ApiController extends Controller
{
    /**
     * Respuesta exitosa estándar
     */
    protected function successResponse($data, $message = 'Operación exitosa', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Respuesta de error estándar
     */
    protected function errorResponse($message = 'Error en la operación', $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $code);
    }

    /**
     * Respuesta de lista paginada
     */
    protected function paginatedResponse($data, $message = 'Operación exitosa')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage(),
            ],
        ], 200);
    }

    /**
     * Convertir ruta relativa a URL pública absoluta
     */
    protected function publicUrl(?string $path): ?string
    {
        if (!$path) return null;

        // Ya es URL absoluta
        if (preg_match('/^https?:\/\//i', $path)) return $path;

        // Quitar slashes iniciales y prefijo "storage/" duplicado si existe
        $clean = ltrim($path, '/');
        if (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, strlen('storage/'));
        }

        return request()->getSchemeAndHttpHost() . '/storage/' . $clean;
    }
}
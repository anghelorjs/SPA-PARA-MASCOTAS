<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\GroomerController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\VarianteProductoController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\DashboardController;

// Rutas públicas
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('reporte/citas', [DashboardController::class, 'reporteCitas']);
    
    Route::apiResource('clientes', ClienteController::class);
    Route::get('clientes/{id}/historial', [ClienteController::class, 'historial']);
    
    Route::apiResource('mascotas', MascotaController::class);
    Route::get('mascotas/{id}/historial-grooming', [MascotaController::class, 'historialGrooming']);
    Route::get('clientes/{clienteId}/mascotas', [MascotaController::class, 'index']);
    
    Route::apiResource('servicios', ServicioController::class);
    
    Route::apiResource('groomers', GroomerController::class);
    Route::get('groomers/{id}/disponibilidad', [GroomerController::class, 'disponibilidad']);
    Route::post('groomers/{id}/disponibilidad', [GroomerController::class, 'setDisponibilidad']);
    
    Route::apiResource('citas', CitaController::class);
    Route::post('citas/{id}/cancel', [CitaController::class, 'cancel']);
    Route::post('citas/slots-disponibles', [CitaController::class, 'slotsDisponibles']);
    
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('productos.variantes', VarianteProductoController::class);
    Route::put('variantes/{id}/stock', [VarianteProductoController::class, 'updateStock']);
    
    Route::apiResource('ventas', VentaController::class);
    Route::post('ventas/{id}/cancel', [VentaController::class, 'cancel']);
});
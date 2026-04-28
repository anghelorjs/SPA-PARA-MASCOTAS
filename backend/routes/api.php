<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\AgendaController;
use App\Http\Controllers\Api\Admin\GestionClientesController;
use App\Http\Controllers\Api\Admin\GestionMascotasController;
use App\Http\Controllers\Api\Admin\CatalogoController;
use App\Http\Controllers\Api\Admin\GroomingController;
use App\Http\Controllers\Api\Admin\ReporteController;
use App\Http\Controllers\Api\Admin\ConfiguracionController;
use App\Http\Controllers\Api\Admin\PerfilController;

// ==================== RUTAS PÚBLICAS ====================
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// ==================== RUTAS PROTEGIDAS (requieren autenticación) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // ==================== AUTENTICACIÓN ====================
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    
    // ==================== ADMINISTRADOR ====================
    Route::prefix('admin')->middleware('role:administrador')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);
        
        // Agenda
        Route::get('agenda/citas', [AgendaController::class, 'citas']);
        Route::put('agenda/citas/{id}/reprogramar', [AgendaController::class, 'reprogramar']);
        Route::post('agenda/citas/{id}/confirmar', [AgendaController::class, 'confirmarCita']);
        
        // Disponibilidad
        Route::get('agenda/disponibilidad', [AgendaController::class, 'disponibilidadGroomers']);
        Route::put('agenda/disponibilidad/{id}', [AgendaController::class, 'setDisponibilidadGroomer']);
        Route::post('agenda/bloqueos', [AgendaController::class, 'registrarBloqueo']);
        Route::delete('agenda/bloqueos/{id}', [AgendaController::class, 'eliminarBloqueo']);
        
        // Servicios y Rangos
        Route::get('agenda/servicios', [AgendaController::class, 'servicios']);
        Route::post('agenda/servicios', [AgendaController::class, 'guardarServicio']);
        Route::put('agenda/servicios/{id}', [AgendaController::class, 'guardarServicio']);
        Route::post('agenda/servicios/{id}/toggle', [AgendaController::class, 'toggleServicio']);
        
        Route::get('agenda/rangos-peso', [AgendaController::class, 'rangosPeso']);
        Route::post('agenda/rangos-peso', [AgendaController::class, 'guardarRangoPeso']);
        Route::put('agenda/rangos-peso/{id}', [AgendaController::class, 'guardarRangoPeso']);
        Route::delete('agenda/rangos-peso/{id}', [AgendaController::class, 'eliminarRangoPeso']);
        
        // Clientes
        Route::get('clientes', [GestionClientesController::class, 'index']);
        Route::get('clientes/{id}', [GestionClientesController::class, 'show']);
        Route::post('clientes', [GestionClientesController::class, 'store']);
        Route::put('clientes/{id}', [GestionClientesController::class, 'update']);
        Route::get('clientes/{id}/citas', [GestionClientesController::class, 'historialCitas']);
        
        // Mascotas
        Route::get('mascotas', [GestionMascotasController::class, 'index']);
        Route::get('mascotas/{id}', [GestionMascotasController::class, 'show']);
        Route::post('mascotas', [GestionMascotasController::class, 'store']);
        Route::put('mascotas/{id}', [GestionMascotasController::class, 'update']);
        Route::get('mascotas/{id}/historial-grooming', [GestionMascotasController::class, 'historialGrooming']);
        
        // Catálogo
        Route::get('catalogo/productos', [CatalogoController::class, 'productos']);
        Route::get('catalogo/productos/{id}', [CatalogoController::class, 'productoShow']);
        Route::post('catalogo/productos', [CatalogoController::class, 'productoStore']);
        Route::put('catalogo/productos/{id}', [CatalogoController::class, 'productoUpdate']);
        Route::post('catalogo/productos/{id}/toggle', [CatalogoController::class, 'productoToggle']);
        
        Route::post('catalogo/productos/{productoId}/variantes', [CatalogoController::class, 'varianteStore']);
        Route::put('catalogo/variantes/{id}', [CatalogoController::class, 'varianteUpdate']);
        Route::delete('catalogo/variantes/{id}', [CatalogoController::class, 'varianteDestroy']);
        
        Route::get('catalogo/insumos', [CatalogoController::class, 'insumos']);
        Route::get('catalogo/insumos/{id}', [CatalogoController::class, 'insumoShow']);
        Route::post('catalogo/insumos', [CatalogoController::class, 'insumoStore']);
        Route::put('catalogo/insumos/{id}', [CatalogoController::class, 'insumoUpdate']);
        Route::post('catalogo/insumos/{id}/stock', [CatalogoController::class, 'insumoAjustarStock']);
        
        Route::get('catalogo/categorias', [CatalogoController::class, 'categorias']);
        Route::post('catalogo/categorias', [CatalogoController::class, 'categoriaStore']);
        Route::put('catalogo/categorias/{id}', [CatalogoController::class, 'categoriaUpdate']);
        Route::delete('catalogo/categorias/{id}', [CatalogoController::class, 'categoriaDestroy']);
        
        Route::get('catalogo/movimientos', [CatalogoController::class, 'movimientos']);
        Route::post('catalogo/movimientos', [CatalogoController::class, 'movimientoStore']);
        
        // Grooming
        Route::get('grooming/fichas', [GroomingController::class, 'fichas']);
        Route::get('grooming/fichas/{id}', [GroomingController::class, 'fichaShow']);
        Route::post('grooming/citas/{citaId}/abrir', [GroomingController::class, 'abrirFicha']);
        Route::put('grooming/fichas/{id}/checklist', [GroomingController::class, 'updateChecklist']);
        Route::post('grooming/fichas/{id}/insumos', [GroomingController::class, 'registrarInsumos']);
        Route::post('grooming/fichas/{id}/cerrar', [GroomingController::class, 'cerrarFicha']);
        
        Route::get('grooming/fotos', [GroomingController::class, 'fotos']);
        Route::post('grooming/fotos', [GroomingController::class, 'uploadFoto']);
        Route::delete('grooming/fotos/{id}', [GroomingController::class, 'deleteFoto']);
        Route::get('grooming/mascotas/{mascotaId}/galeria', [GroomingController::class, 'galeriaPorMascota']);
        
        // Reportes
        Route::get('reportes/citas', [ReporteController::class, 'citas']);
        Route::get('reportes/ingresos', [ReporteController::class, 'ingresos']);
        Route::get('reportes/inventario', [ReporteController::class, 'inventario']);
        Route::get('reportes/clientes', [ReporteController::class, 'clientes']);
        
        // Configuración
        Route::get('configuracion/negocio', [ConfiguracionController::class, 'datosNegocio']);
        Route::put('configuracion/negocio', [ConfiguracionController::class, 'updateDatosNegocio']);
        Route::post('configuracion/logo', [ConfiguracionController::class, 'uploadLogo']);
        
        Route::get('configuracion/usuarios', [ConfiguracionController::class, 'usuarios']);
        Route::get('configuracion/usuarios/{id}', [ConfiguracionController::class, 'usuarioShow']);
        Route::post('configuracion/usuarios', [ConfiguracionController::class, 'usuarioStore']);
        Route::put('configuracion/usuarios/{id}', [ConfiguracionController::class, 'usuarioUpdate']);
        Route::post('configuracion/usuarios/{id}/reset-password', [ConfiguracionController::class, 'usuarioResetPassword']);
        Route::delete('configuracion/usuarios/{id}', [ConfiguracionController::class, 'usuarioDestroy']);
        
        // Perfil Admin
        Route::get('perfil', [PerfilController::class, 'me']);
        Route::put('perfil', [PerfilController::class, 'update']);
        Route::post('perfil/password', [PerfilController::class, 'updatePassword']);
        Route::get('perfil/reportes', [PerfilController::class, 'historialReportes']);
    });
});
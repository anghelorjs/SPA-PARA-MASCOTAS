<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// ==================== ADMINISTRADOR ====================
// Dashboard y Perfil
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\PerfilController;

// Clientes
use App\Http\Controllers\Api\Admin\Clientes\ClienteController;
use App\Http\Controllers\Api\Admin\Clientes\MascotaController;

// Catálogo
use App\Http\Controllers\Api\Admin\Catalogo\ProductoController;
use App\Http\Controllers\Api\Admin\Catalogo\InsumoController;
use App\Http\Controllers\Api\Admin\Catalogo\CategoriaController;
use App\Http\Controllers\Api\Admin\Catalogo\MovimientoController;

// Agenda
use App\Http\Controllers\Api\Admin\Agenda\CalendarioController;
use App\Http\Controllers\Api\Admin\Agenda\DisponibilidadController;
use App\Http\Controllers\Api\Admin\Agenda\ServicioController;
use App\Http\Controllers\Api\Admin\Agenda\RangoPesoController;

// Grooming
use App\Http\Controllers\Api\Admin\Grooming\FichaController;
use App\Http\Controllers\Api\Admin\Grooming\GaleriaController;

// Reportes
use App\Http\Controllers\Api\Admin\Reportes\AgendaReporteController;
use App\Http\Controllers\Api\Admin\Reportes\IngresoReporteController;
use App\Http\Controllers\Api\Admin\Reportes\InventarioReporteController;
use App\Http\Controllers\Api\Admin\Reportes\ClienteReporteController;

// Configuración
use App\Http\Controllers\Api\Admin\Configuracion\NegocioController;
use App\Http\Controllers\Api\Admin\Configuracion\UsuarioController;
use App\Http\Controllers\Api\Admin\Configuracion\NotificacionController;

// ==================== RECEPCIONISTA ====================
use App\Http\Controllers\Api\Recepcionista\DashboardController as RecepcionistaDashboardController;
use App\Http\Controllers\Api\Recepcionista\AgendaController as RecepcionistaAgendaController;
use App\Http\Controllers\Api\Recepcionista\ClienteController as RecepcionistaClienteController;
use App\Http\Controllers\Api\Recepcionista\VentaController as RecepcionistaVentaController;
use App\Http\Controllers\Api\Recepcionista\NotificacionController as RecepcionistaNotificacionController;
use App\Http\Controllers\Api\Recepcionista\PerfilController as RecepcionistaPerfilController;

// ==================== GROOMER ====================
use App\Http\Controllers\Api\Groomer\DashboardController as GroomerDashboardController;
use App\Http\Controllers\Api\Groomer\AgendaController as GroomerAgendaController;
use App\Http\Controllers\Api\Groomer\FichaController as GroomerFichaController;
use App\Http\Controllers\Api\Groomer\PerfilController as GroomerPerfilController;

// ==================== CLIENTE ====================
use App\Http\Controllers\Api\Cliente\DashboardController as ClienteDashboardController;
use App\Http\Controllers\Api\Cliente\MascotaController as ClienteMascotaController;
use App\Http\Controllers\Api\Cliente\CitaController as ClienteCitaController;
use App\Http\Controllers\Api\Cliente\CatalogoController as ClienteCatalogoController;
use App\Http\Controllers\Api\Cliente\HistorialController as ClienteHistorialController;
use App\Http\Controllers\Api\Cliente\PerfilController as ClientePerfilController;

// ==================== RUTAS PÚBLICAS ====================
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// ==================== RUTAS PROTEGIDAS (requieren autenticación) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // ==================== AUTENTICACIÓN ====================
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    
    // ==================== ADMINISTRADOR ====================
    Route::prefix('admin')->middleware('role:administrador')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);
        
        // ========== AGENDA ==========
        // Calendario de Citas
        Route::get('agenda/citas', [CalendarioController::class, 'citas']);
        Route::get('agenda/citas/{id}', [CalendarioController::class, 'detalleCita']);
        Route::post('agenda/citas/{id}/confirmar', [CalendarioController::class, 'confirmar']);
        Route::post('agenda/citas/{id}/cancelar', [CalendarioController::class, 'cancelar']);
        Route::put('agenda/citas/{id}/reprogramar', [CalendarioController::class, 'reprogramar']);
        Route::post('agenda/slots-disponibles', [CalendarioController::class, 'slotsDisponibles']);
        
        // Disponibilidad de Groomers
        Route::get('agenda/disponibilidad', [DisponibilidadController::class, 'index']);
        Route::get('agenda/disponibilidad/{id}', [DisponibilidadController::class, 'show']);
        Route::put('agenda/disponibilidad/{id}', [DisponibilidadController::class, 'store']);
        Route::put('agenda/disponibilidad/{id}/horario/{horarioId}', [DisponibilidadController::class, 'update']);
        Route::delete('agenda/disponibilidad/{id}', [DisponibilidadController::class, 'destroy']);
        Route::post('agenda/bloqueos', [DisponibilidadController::class, 'registrarBloqueo']);
        Route::delete('agenda/bloqueos/{id}', [DisponibilidadController::class, 'eliminarBloqueo']);
        Route::get('agenda/dias-semana', [DisponibilidadController::class, 'diasSemana']);
        
        // Gestión de Servicios
        Route::get('agenda/servicios', [ServicioController::class, 'index']);
        Route::get('agenda/servicios/{id}', [ServicioController::class, 'show']);
        Route::post('agenda/servicios', [ServicioController::class, 'store']);
        Route::put('agenda/servicios/{id}', [ServicioController::class, 'update']);
        Route::post('agenda/servicios/{id}/toggle', [ServicioController::class, 'toggle']);
        Route::delete('agenda/servicios/{id}', [ServicioController::class, 'destroy']);
        
        // Rangos de Peso
        Route::get('agenda/rangos-peso', [RangoPesoController::class, 'index']);
        Route::get('agenda/rangos-peso/{id}', [RangoPesoController::class, 'show']);
        Route::post('agenda/rangos-peso', [RangoPesoController::class, 'store']);
        Route::put('agenda/rangos-peso/{id}', [RangoPesoController::class, 'update']);
        Route::delete('agenda/rangos-peso/{id}', [RangoPesoController::class, 'destroy']);
        
        // ========== CLIENTES ==========
        // Clientes
        Route::get('clientes', [ClienteController::class, 'index']);
        Route::get('clientes/{id}', [ClienteController::class, 'show']);
        Route::post('clientes', [ClienteController::class, 'store']);
        Route::put('clientes/{id}', [ClienteController::class, 'update']);
        Route::delete('clientes/{id}', [ClienteController::class, 'destroy']);
        Route::get('clientes/{id}/citas', [ClienteController::class, 'historialCitas']);
        
        // Mascotas
        Route::get('mascotas', [MascotaController::class, 'index']);
        Route::get('mascotas/{id}', [MascotaController::class, 'show']);
        Route::post('mascotas', [MascotaController::class, 'store']);
        Route::put('mascotas/{id}', [MascotaController::class, 'update']);
        Route::delete('mascotas/{id}', [MascotaController::class, 'destroy']);
        Route::get('mascotas/{id}/historial-grooming', [MascotaController::class, 'historialGrooming']);
        
        // ========== CATÁLOGO ==========
        // Productos
        Route::get('catalogo/productos', [ProductoController::class, 'index']);
        Route::get('catalogo/productos/{id}', [ProductoController::class, 'show']);
        Route::post('catalogo/productos', [ProductoController::class, 'store']);
        Route::put('catalogo/productos/{id}', [ProductoController::class, 'update']);
        Route::post('catalogo/productos/{id}/toggle', [ProductoController::class, 'toggle']);
        Route::delete('catalogo/productos/{id}', [ProductoController::class, 'destroy']);
        
        // Variantes
        Route::post('catalogo/productos/{productoId}/variantes', [ProductoController::class, 'varianteStore']);
        Route::put('catalogo/variantes/{id}', [ProductoController::class, 'varianteUpdate']);
        Route::delete('catalogo/variantes/{id}', [ProductoController::class, 'varianteDestroy']);
        
        // Insumos
        Route::get('catalogo/insumos', [InsumoController::class, 'index']);
        Route::get('catalogo/insumos/{id}', [InsumoController::class, 'show']);
        Route::post('catalogo/insumos', [InsumoController::class, 'store']);
        Route::put('catalogo/insumos/{id}', [InsumoController::class, 'update']);
        Route::post('catalogo/insumos/{id}/stock', [InsumoController::class, 'ajustarStock']);
        Route::delete('catalogo/insumos/{id}', [InsumoController::class, 'destroy']);
        
        // Categorías
        Route::get('catalogo/categorias', [CategoriaController::class, 'index']);
        Route::get('catalogo/categorias/{id}', [CategoriaController::class, 'show']);
        Route::post('catalogo/categorias', [CategoriaController::class, 'store']);
        Route::put('catalogo/categorias/{id}', [CategoriaController::class, 'update']);
        Route::delete('catalogo/categorias/{id}', [CategoriaController::class, 'destroy']);
        
        // Movimientos de Inventario
        Route::get('catalogo/movimientos', [MovimientoController::class, 'index']);
        Route::get('catalogo/movimientos/{id}', [MovimientoController::class, 'show']);
        Route::post('catalogo/movimientos', [MovimientoController::class, 'store']);
        Route::get('catalogo/productos-lista', [MovimientoController::class, 'productosList']);
        
        // ========== GROOMING ==========
        // Fichas
        Route::get('grooming/fichas/hoy', [FichaController::class, 'hoy']);
        Route::get('grooming/fichas/todas', [FichaController::class, 'todas']);
        Route::get('grooming/fichas/{id}', [FichaController::class, 'show']);
        
        // Galería
        Route::get('grooming/fotos', [GaleriaController::class, 'index']);
        Route::delete('grooming/fotos/{id}', [GaleriaController::class, 'destroy']);
        Route::get('grooming/mascotas/{mascotaId}/fotos', [GaleriaController::class, 'porMascota']);
        Route::get('grooming/tipos-foto', [GaleriaController::class, 'tipos']);
        
        // ========== REPORTES ==========
        Route::get('reportes/agenda', [AgendaReporteController::class, 'generar']);
        Route::get('reportes/ingresos', [IngresoReporteController::class, 'generar']);
        Route::get('reportes/inventario', [InventarioReporteController::class, 'generar']);
        Route::get('reportes/clientes', [ClienteReporteController::class, 'generar']);
        
        // ========== CONFIGURACIÓN ==========
        // Datos del Negocio
        Route::get('configuracion/negocio', [NegocioController::class, 'datosNegocio']);
        Route::put('configuracion/negocio', [NegocioController::class, 'updateDatosNegocio']);
        Route::post('configuracion/logo', [NegocioController::class, 'uploadLogo']);
        
        // Gestión de Usuarios
        Route::get('configuracion/usuarios', [UsuarioController::class, 'index']);
        Route::get('configuracion/usuarios/{id}', [UsuarioController::class, 'show']);
        Route::post('configuracion/usuarios', [UsuarioController::class, 'store']);
        Route::put('configuracion/usuarios/{id}', [UsuarioController::class, 'update']);
        Route::post('configuracion/usuarios/{id}/reset-password', [UsuarioController::class, 'resetPassword']);
        Route::delete('configuracion/usuarios/{id}', [UsuarioController::class, 'destroy']);
        Route::get('configuracion/roles', [UsuarioController::class, 'roles']);
        
        // Notificaciones del Sistema
        Route::get('configuracion/notificaciones', [NotificacionController::class, 'index']);
        Route::get('configuracion/notificaciones/{id}', [NotificacionController::class, 'show']);
        Route::post('configuracion/notificaciones/{id}/reenviar', [NotificacionController::class, 'reenviar']);
        Route::post('configuracion/notificaciones/enviar', [NotificacionController::class, 'enviarManual']);
        Route::get('configuracion/notificaciones/clientes', [NotificacionController::class, 'clientesList']);
        Route::get('configuracion/notificaciones/citas', [NotificacionController::class, 'citasList']);
        Route::post('configuracion/notificaciones/vista-previa', [NotificacionController::class, 'vistaPrevia']);
        
        // ========== PERFIL DEL ADMINISTRADOR ==========
        Route::get('perfil', [PerfilController::class, 'me']);
        Route::put('perfil', [PerfilController::class, 'update']);
        Route::post('perfil/password', [PerfilController::class, 'updatePassword']);
        Route::get('perfil/reportes', [PerfilController::class, 'historialReportes']);
    });
    
    // ==================== RECEPCIONISTA ====================
    Route::prefix('recepcionista')->middleware('role:recepcionista')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [RecepcionistaDashboardController::class, 'index']);
        Route::get('citas/{id}/detalle', [RecepcionistaDashboardController::class, 'detalleCita']);
        
        // Agenda - Calendario y Citas
        Route::get('agenda/citas', [RecepcionistaAgendaController::class, 'citas']);
        Route::post('agenda/slots-libres', [RecepcionistaAgendaController::class, 'slotsLibres']);
        Route::post('agenda/citas', [RecepcionistaAgendaController::class, 'crearCita']);
        Route::post('agenda/citas/{id}/confirmar', [RecepcionistaAgendaController::class, 'confirmarCita']);
        Route::post('agenda/citas/{id}/cancelar', [RecepcionistaAgendaController::class, 'cancelarCita']);
        Route::put('agenda/citas/{id}/reprogramar', [RecepcionistaAgendaController::class, 'reprogramarCita']);
        
        // Agenda - Búsquedas para Nueva Cita
        Route::get('buscar-clientes', [RecepcionistaAgendaController::class, 'buscarClientes']);
        Route::get('clientes/{id}/mascotas', [RecepcionistaAgendaController::class, 'mascotasPorCliente']);
        Route::post('servicios-con-precios', [RecepcionistaAgendaController::class, 'serviciosConPrecios']);
        
        // Clientes
        Route::get('clientes', [RecepcionistaClienteController::class, 'index']);
        Route::get('clientes/{id}', [RecepcionistaClienteController::class, 'show']);
        Route::post('clientes', [RecepcionistaClienteController::class, 'store']);
        Route::put('clientes/{id}', [RecepcionistaClienteController::class, 'update']);
        Route::get('clientes/{id}/citas', [RecepcionistaClienteController::class, 'historialCitas']);
        
        // Mascotas
        Route::get('clientes/{clienteId}/mascotas', [RecepcionistaClienteController::class, 'mascotas']);
        Route::get('mascotas/{id}', [RecepcionistaClienteController::class, 'mascotaShow']);
        Route::post('mascotas', [RecepcionistaClienteController::class, 'mascotaStore']);
        Route::put('mascotas/{id}', [RecepcionistaClienteController::class, 'mascotaUpdate']);
        
        // Ventas
        Route::get('ventas', [RecepcionistaVentaController::class, 'index']);
        Route::get('ventas/{id}', [RecepcionistaVentaController::class, 'show']);
        Route::post('ventas', [RecepcionistaVentaController::class, 'store']);
        Route::get('ventas/{id}/factura', [RecepcionistaVentaController::class, 'factura']);
        Route::get('productos/buscar', [RecepcionistaVentaController::class, 'buscarProductos']);
        Route::get('categorias', [RecepcionistaVentaController::class, 'categorias']);
        
        // Notificaciones
        Route::get('notificaciones/clientes', [RecepcionistaNotificacionController::class, 'clientesList']);
        Route::get('notificaciones/citas', [RecepcionistaNotificacionController::class, 'citasList']);
        Route::post('notificaciones/vista-previa', [RecepcionistaNotificacionController::class, 'vistaPrevia']);
        Route::post('notificaciones/enviar', [RecepcionistaNotificacionController::class, 'enviarManual']);
        Route::post('notificaciones/{id}/reenviar', [RecepcionistaNotificacionController::class, 'reenviar']);
        Route::get('notificaciones/{id}', [RecepcionistaNotificacionController::class, 'show']);
        Route::get('notificaciones', [RecepcionistaNotificacionController::class, 'index']);
        
        // Perfil del Recepcionista
        Route::get('perfil', [RecepcionistaPerfilController::class, 'me']);
        Route::put('perfil', [RecepcionistaPerfilController::class, 'update']);
        Route::post('perfil/password', [RecepcionistaPerfilController::class, 'updatePassword']);
        Route::get('perfil/resumen-dia', [RecepcionistaPerfilController::class, 'resumenDia']);
    });
    
    // ==================== GROOMER ====================
    Route::prefix('groomer')->middleware('role:groomer')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [GroomerDashboardController::class, 'index']);
        
        // Mi Agenda
        Route::get('agenda', [GroomerAgendaController::class, 'index']);
        Route::post('agenda/{id}/iniciar', [GroomerAgendaController::class, 'iniciarServicio']);
        Route::get('mascotas/{id}/historial', [GroomerAgendaController::class, 'historialMascota']);
        
        // Fichas
        Route::get('fichas/hoy', [GroomerFichaController::class, 'hoy']);
        Route::get('fichas/todas', [GroomerFichaController::class, 'todas']);
        Route::get('fichas/{id}', [GroomerFichaController::class, 'show']);
        
        // Fichas - Estado de Ingreso
        Route::put('fichas/{id}/estado-ingreso', [GroomerFichaController::class, 'updateEstadoIngreso']);
        
        // Fichas - Checklist
        Route::get('checklist/predefinido', [GroomerFichaController::class, 'getChecklistPredefinido']);
        Route::put('fichas/{id}/checklist', [GroomerFichaController::class, 'updateChecklist']);
        
        // Fichas - Insumos
        Route::get('insumos/buscar', [GroomerFichaController::class, 'buscarInsumos']);
        Route::post('fichas/{id}/insumos', [GroomerFichaController::class, 'agregarInsumo']);
        Route::delete('fichas/{fichaId}/insumos/{detalleId}', [GroomerFichaController::class, 'eliminarInsumo']);
        
        // Fichas - Observaciones
        Route::put('fichas/{id}/observaciones', [GroomerFichaController::class, 'updateObservaciones']);
        
        // Fichas - Fotos
        Route::post('fichas/{id}/fotos', [GroomerFichaController::class, 'uploadFoto']);
        Route::delete('fichas/{fichaId}/fotos/{fotoId}', [GroomerFichaController::class, 'deleteFoto']);
        
        // Fichas - Cerrar
        Route::post('fichas/{id}/cerrar', [GroomerFichaController::class, 'cerrarFicha']);
        
        // Perfil
        Route::get('perfil', [GroomerPerfilController::class, 'me']);
        Route::put('perfil', [GroomerPerfilController::class, 'update']);
        Route::post('perfil/password', [GroomerPerfilController::class, 'updatePassword']);
    });

    // ==================== CLIENTE ====================
    Route::prefix('cliente')->middleware('role:cliente')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [ClienteDashboardController::class, 'index']);
        
        // Mis Mascotas
        Route::get('mascotas', [ClienteMascotaController::class, 'index']);
        Route::get('mascotas/{id}', [ClienteMascotaController::class, 'show']);
        Route::post('mascotas', [ClienteMascotaController::class, 'store']);
        Route::put('mascotas/{id}', [ClienteMascotaController::class, 'update']);
        Route::post('mascotas/{id}/foto', [ClienteMascotaController::class, 'uploadFoto']);
        Route::get('fichas/{fichaId}/fotos', [ClienteMascotaController::class, 'fotosSesion']);
        
        // Mis Citas
        Route::get('citas', [ClienteCitaController::class, 'index']);
        Route::get('citas/{id}', [ClienteCitaController::class, 'show']);
        Route::post('citas', [ClienteCitaController::class, 'store']);
        Route::post('citas/{id}/cancelar', [ClienteCitaController::class, 'cancel']);
        
        // Agendado de citas (pasos)
        Route::get('agendado/mascotas', [ClienteCitaController::class, 'getMascotas']);
        Route::post('agendado/servicios', [ClienteCitaController::class, 'getServicios']);
        Route::post('agendado/slots', [ClienteCitaController::class, 'getSlots']);
        
        // Catálogo
        Route::get('catalogo/productos', [ClienteCatalogoController::class, 'index']);
        Route::get('catalogo/categorias', [ClienteCatalogoController::class, 'getCategorias']);
        Route::post('catalogo/pedido', [ClienteCatalogoController::class, 'crearPedido']);
        
        // Mi Historial
        Route::get('historial/servicios', [ClienteHistorialController::class, 'servicios']);
        Route::get('historial/compras', [ClienteHistorialController::class, 'compras']);
        Route::get('historial/servicios/{id}', [ClienteHistorialController::class, 'servicioDetalle']);
        
        // Perfil
        Route::get('perfil', [ClientePerfilController::class, 'me']);
        Route::put('perfil', [ClientePerfilController::class, 'update']);
        Route::post('perfil/password', [ClientePerfilController::class, 'updatePassword']);
        Route::post('perfil/notificaciones/{id}/leer', [ClientePerfilController::class, 'marcarNotificacion']);
    });
});
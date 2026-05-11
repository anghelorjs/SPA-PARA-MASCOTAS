<?php
// app/Http/Middleware/LogActivity.php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        // Capturar datos ANTES de procesar la petición (para comparar en updates)
        $oldData = $this->captureOldData($request);

        $response = $next($request);

        // Saltar si no hay nada que loguear
        if (!$this->shouldLog($request)) {
            return $response;
        }

        try {
            $this->processLog($request, $response, $oldData);
        } catch (\Throwable $e) {
            // El log nunca debe romper la respuesta real
            Log::warning('LogActivity: error al guardar log', ['error' => $e->getMessage()]);
        }

        return $response;
    }

    // ── Decisión: ¿loguear esta petición? ────────────────────────────────────

    private function shouldLog(Request $request): bool
    {
        // Solo métodos que modifican estado o son de autenticación
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        // Excluir los propios endpoints de logs para no generar ruido
        $excludedPaths = [
            'api/admin/configuracion/logs',
            'api/admin/configuracion/logs-stats',
            'api/admin/configuracion/logs/*',
            'api/captcha',
        ];

        foreach ($excludedPaths as $path) {
            if ($request->is($path)) {
                return false;
            }
        }

        return true;
    }

    // ── Procesar y guardar el log ─────────────────────────────────────────────

    private function processLog(Request $request, Response $response, ?array $oldData): void
    {
        $statusCode = $response->getStatusCode();
        $action     = $this->resolveAction($request, $statusCode);

        // Resolver usuario: primero el autenticado, luego el de la respuesta
        $user   = $request->user();
        $userId = $user?->idUsuario;

        // Para login/register, el usuario viene en la respuesta
        if (!$userId && in_array($action, ['login', 'login_failed', 'register'], true)) {
            $userId = $this->resolveUserIdFromContext($request, $response, $action);
        }

        $newData = null;
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'], true) && $statusCode < 400) {
            $newData = $this->sanitize($request->all());
        }

        ActivityLog::create([
            'user_id'     => $userId,
            'action'      => $action,
            'description' => $this->buildDescription($request, $action, $userId),
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'old_data'    => $oldData,
            'new_data'    => $newData,
        ]);
    }

    // ── Resolución de acción ──────────────────────────────────────────────────

    private function resolveAction(Request $request, int $statusCode): string
    {
        $method = $request->method();
        $path   = $request->path(); // sin "api/" al inicio en Laravel

        // ── Autenticación ──────────────────────────────────────────────────
        if ($request->is('api/login') && $method === 'POST') {
            // Cualquier respuesta no-exitosa en login = intento fallido
            return ($statusCode >= 200 && $statusCode < 300) ? 'login' : 'login_failed';
        }
        if ($request->is('api/logout')           && $method === 'POST') return 'logout';
        if ($request->is('api/register')          && $method === 'POST') return 'register';
        if ($request->is('api/activate-account')  && $method === 'POST') return 'activate_account';
        if ($request->is('api/force-change-password') && $method === 'POST') return 'force_change_password';
        if ($request->is('api/change-password')   && $method === 'POST') return 'change_password';
        if ($request->is('api/forgot-password')   && $method === 'POST') return 'forgot_password';
        if ($request->is('api/reset-password')    && $method === 'POST') return 'reset_password_public';

        // ── Mapa de rutas con wildcard ─────────────────────────────────────
        $routeMap = [
            // Usuarios
            'api/admin/configuracion/usuarios/resend-credentials' => 'resend_credentials',
            'api/admin/configuracion/usuarios/*/reset-password'   => 'reset_password',

            // Catálogo
            'api/admin/catalogo/insumos/*/stock'      => 'adjust_stock',
            'api/admin/catalogo/productos/*/toggle'   => 'toggle_producto',

            // Agenda – citas
            'api/admin/agenda/citas/*/confirmar'      => 'confirm_cita',
            'api/admin/agenda/citas/*/cancelar'       => 'cancel_cita',
            'api/admin/agenda/citas/*/reprogramar'    => 'reschedule_cita',

            // Recepcionista – agenda
            'api/recepcionista/agenda/citas/*/confirmar'   => 'confirm_cita',
            'api/recepcionista/agenda/citas/*/cancelar'    => 'cancel_cita',
            'api/recepcionista/agenda/citas/*/reprogramar' => 'reschedule_cita',

            // Grooming
            'api/groomer/fichas/*/cerrar'   => 'close_ficha',
            'api/groomer/agenda/*/iniciar'  => 'open_ficha',

            // Perfil/password de cada rol
            'api/admin/perfil/password'         => 'change_password',
            'api/recepcionista/perfil/password' => 'change_password',
            'api/groomer/perfil/password'       => 'change_password',
            'api/cliente/perfil/password'       => 'change_password',

            // Citas del cliente
            'api/cliente/citas/*/cancelar' => 'cancel_cita',
        ];

        foreach ($routeMap as $pattern => $action) {
            if ($request->is($pattern)) {
                return $action;
            }
        }

        // ── Mapa por recurso + método ──────────────────────────────────────
        $resourceMap = [
            'api/admin/configuracion/usuarios'   => ['POST' => 'create_user',      'PUT' => 'update_user',    'PATCH' => 'update_user',    'DELETE' => 'delete_user'],
            'api/admin/clientes'                 => ['POST' => 'create_cliente',    'PUT' => 'update_cliente', 'PATCH' => 'update_cliente', 'DELETE' => 'delete_cliente'],
            'api/admin/mascotas'                 => ['POST' => 'create_mascota',    'PUT' => 'update_mascota', 'PATCH' => 'update_mascota', 'DELETE' => 'delete_mascota'],
            'api/admin/agenda/citas'             => ['POST' => 'create_cita',       'PUT' => 'update_cita',    'PATCH' => 'update_cita'],
            'api/admin/agenda/servicios'         => ['POST' => 'create_servicio',   'PUT' => 'update_servicio','PATCH' => 'update_servicio','DELETE' => 'delete_servicio'],
            'api/admin/agenda/rangos-peso'       => ['POST' => 'create_rango',      'PUT' => 'update_rango',   'DELETE' => 'delete_rango'],
            'api/admin/agenda/bloqueos'          => ['POST' => 'create_bloqueo',    'DELETE' => 'delete_bloqueo'],
            'api/admin/catalogo/productos'       => ['POST' => 'create_producto',   'PUT' => 'update_producto','PATCH' => 'update_producto','DELETE' => 'delete_producto'],
            'api/admin/catalogo/insumos'         => ['POST' => 'create_insumo',     'PUT' => 'update_insumo',  'PATCH' => 'update_insumo', 'DELETE' => 'delete_insumo'],
            'api/admin/catalogo/categorias'      => ['POST' => 'create_categoria',  'PUT' => 'update_categoria','PATCH' => 'update_categoria','DELETE' => 'delete_categoria'],
            'api/admin/catalogo/movimientos'     => ['POST' => 'create_movimiento'],
            'api/admin/grooming/fotos'           => ['DELETE' => 'delete_foto'],
            'api/recepcionista/agenda/citas'     => ['POST' => 'create_cita'],
            'api/recepcionista/clientes'         => ['POST' => 'create_cliente',    'PUT' => 'update_cliente'],
            'api/recepcionista/mascotas'         => ['POST' => 'create_mascota',    'PUT' => 'update_mascota'],
            'api/recepcionista/ventas'           => ['POST' => 'create_venta'],
            'api/groomer/fichas/*/insumos'       => ['POST' => 'add_insumo_ficha',  'DELETE' => 'remove_insumo_ficha'],
            'api/groomer/fichas/*/fotos'         => ['POST' => 'upload_foto'],
            'api/cliente/mascotas'               => ['POST' => 'create_mascota',    'PUT' => 'update_mascota'],
            'api/cliente/citas'                  => ['POST' => 'create_cita'],
            'api/cliente/catalogo/pedido'        => ['POST' => 'create_pedido'],
        ];

        foreach ($resourceMap as $pattern => $methods) {
            if ($request->is($pattern) || $request->is($pattern . '/*')) {
                if (isset($methods[$method])) {
                    return $methods[$method];
                }
            }
        }

        // Fallback genérico
        return strtolower($method) . '_' . str_replace(['api/', '/'], ['', '_'], $path);
    }

    // ── Descripción legible ───────────────────────────────────────────────────

    private function buildDescription(Request $request, string $action, ?int $userId): string
    {
        $userName = 'Sistema';

        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                $userName = trim($user->nombre . ' ' . $user->apellido) . ' (' . $user->email . ')';
            }
        }

        // Para login fallido intentamos obtener el email del request
        $targetEmail = $request->input('email', '');

        $descriptions = [
            'login'                  => "El usuario {$userName} inició sesión exitosamente",
            'login_failed'           => "Intento de inicio de sesión fallido para: {$targetEmail}",
            'logout'                 => "El usuario {$userName} cerró sesión",
            'register'               => "Nuevo registro de cuenta: {$targetEmail}",
            'activate_account'       => "Cuenta activada exitosamente",
            'force_change_password'  => "El usuario {$userName} cambió su contraseña obligatoria",
            'change_password'        => "El usuario {$userName} cambió su contraseña",
            'forgot_password'        => "Solicitud de recuperación de contraseña para: {$targetEmail}",
            'reset_password_public'  => "Restablecimiento de contraseña vía enlace",
            'create_user'            => "El usuario {$userName} creó un nuevo usuario en el sistema",
            'update_user'            => "El usuario {$userName} actualizó los datos de un usuario",
            'delete_user'            => "El usuario {$userName} desactivó un usuario del sistema",
            'reset_password'         => "El usuario {$userName} restableció la contraseña de un usuario",
            'resend_credentials'     => "El usuario {$userName} reenvió las credenciales de acceso",
            'create_cliente'         => "El usuario {$userName} registró un nuevo cliente",
            'update_cliente'         => "El usuario {$userName} actualizó los datos de un cliente",
            'delete_cliente'         => "El usuario {$userName} desactivó un cliente",
            'create_mascota'         => "El usuario {$userName} registró una nueva mascota",
            'update_mascota'         => "El usuario {$userName} actualizó los datos de una mascota",
            'delete_mascota'         => "El usuario {$userName} eliminó una mascota",
            'create_servicio'        => "El usuario {$userName} creó un nuevo servicio",
            'update_servicio'        => "El usuario {$userName} actualizó un servicio",
            'delete_servicio'        => "El usuario {$userName} eliminó un servicio",
            'create_rango'           => "El usuario {$userName} creó un rango de peso",
            'update_rango'           => "El usuario {$userName} actualizó un rango de peso",
            'delete_rango'           => "El usuario {$userName} eliminó un rango de peso",
            'create_bloqueo'         => "El usuario {$userName} registró un bloqueo en la agenda",
            'delete_bloqueo'         => "El usuario {$userName} eliminó un bloqueo de la agenda",
            'create_producto'        => "El usuario {$userName} creó un nuevo producto",
            'update_producto'        => "El usuario {$userName} actualizó un producto",
            'toggle_producto'        => "El usuario {$userName} cambió el estado de un producto",
            'delete_producto'        => "El usuario {$userName} desactivó un producto",
            'create_insumo'          => "El usuario {$userName} registró un nuevo insumo",
            'update_insumo'          => "El usuario {$userName} actualizó un insumo",
            'delete_insumo'          => "El usuario {$userName} eliminó un insumo",
            'adjust_stock'           => "El usuario {$userName} ajustó el stock de un insumo",
            'create_categoria'       => "El usuario {$userName} creó una nueva categoría",
            'update_categoria'       => "El usuario {$userName} actualizó una categoría",
            'delete_categoria'       => "El usuario {$userName} eliminó una categoría",
            'create_movimiento'      => "El usuario {$userName} registró un movimiento de inventario",
            'create_cita'            => "El usuario {$userName} agendó una nueva cita",
            'update_cita'            => "El usuario {$userName} actualizó una cita",
            'confirm_cita'           => "El usuario {$userName} confirmó una cita",
            'cancel_cita'            => "El usuario {$userName} canceló una cita",
            'reschedule_cita'        => "El usuario {$userName} reprogramó una cita",
            'open_ficha'             => "El usuario {$userName} abrió una ficha de grooming",
            'close_ficha'            => "El usuario {$userName} cerró una ficha de grooming",
            'add_insumo_ficha'       => "El usuario {$userName} agregó un insumo a la ficha de grooming",
            'remove_insumo_ficha'    => "El usuario {$userName} quitó un insumo de la ficha de grooming",
            'upload_foto'            => "El usuario {$userName} subió una foto a la ficha de grooming",
            'delete_foto'            => "El usuario {$userName} eliminó una foto del sistema",
            'create_venta'           => "El usuario {$userName} registró una nueva venta",
            'create_pedido'          => "El usuario {$userName} creó un pedido de productos",
        ];

        return $descriptions[$action]
            ?? "El usuario {$userName} realizó la acción: {$action}";
    }

    // ── Resolver userId para login/register desde la respuesta ────────────────

    private function resolveUserIdFromContext(Request $request, Response $response, string $action): ?int
    {
        // login exitoso: el userId viene en el payload de respuesta
        if ($action === 'login') {
            $payload = json_decode($response->getContent(), true);
            $id = $payload['data']['user']['idUsuario'] ?? null;
            if ($id) return (int) $id;
        }

        // login_failed: buscar por email en la request
        if ($action === 'login_failed' && $request->filled('email')) {
            $user = User::where('email', $request->email)->first();
            return $user?->idUsuario;
        }

        // register: el userId viene en el payload
        if ($action === 'register') {
            $payload = json_decode($response->getContent(), true);
            $id = $payload['data']['user']['idUsuario'] ?? null;
            if ($id) return (int) $id;
        }

        return null;
    }

    // ── Capturar datos anteriores para updates ────────────────────────────────

    private function captureOldData(Request $request): ?array
    {
        // Solo capturamos old_data en updates de usuarios (tiene más valor)
        if (!in_array($request->method(), ['PUT', 'PATCH', 'DELETE'], true)) {
            return null;
        }

        if ($request->is('api/admin/configuracion/usuarios/*')) {
            $id = $request->route('id');
            if ($id) {
                $user = User::find($id);
                return $user ? $this->sanitize($user->toArray()) : null;
            }
        }

        return null;
    }

    // ── Sanitizar datos sensibles ─────────────────────────────────────────────

    private function sanitize(array $data): array
    {
        $sensitiveKeys = [
            'password', 'password_confirmation', 'passwordHash',
            'current_password', 'new_password', 'token',
            'activation_token', 'captcha', 'captcha_id',
            'remember_token', 'google_id',
        ];

        foreach ($sensitiveKeys as $key) {
            unset($data[$key]);
        }

        return $data;
    }
}
<?php
// app/Http/Controllers/Api/Admin/Configuracion/NotificacionController.php

namespace App\Http\Controllers\Api\Admin\Configuracion;

use App\Http\Controllers\Api\ApiController;
use App\Models\Notificacion;
use App\Models\Cliente;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends ApiController
{
    /**
     * Listar todas las notificaciones del sistema
     */
    public function index(Request $request)
    {
        $query = Notificacion::with(['cliente.user', 'cita']);
        
        // Filtro por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        // Filtro por canal
        if ($request->has('canal')) {
            $query->where('canal', $request->canal);
        }
        
        // Filtro por estado de entrega
        if ($request->has('entregada')) {
            $query->where('entregada', $request->entregada);
        }
        
        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }
        
        // Búsqueda por cliente
        if ($request->has('cliente_search')) {
            $search = $request->cliente_search;
            $query->whereHas('cliente.user', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $notificaciones = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15))
            ->through(function($notificacion) {
                return [
                    'id' => $notificacion->idNotificacion,
                    'cliente' => $notificacion->cliente->user->nombre . ' ' . $notificacion->cliente->user->apellido,
                    'cliente_id' => $notificacion->idCliente,
                    'tipo' => $notificacion->tipo,
                    'canal' => $notificacion->canal,
                    'mensaje' => substr($notificacion->mensaje, 0, 100) . (strlen($notificacion->mensaje) > 100 ? '...' : ''),
                    'fecha_envio' => $notificacion->fechaEnvio ? $notificacion->fechaEnvio->format('d/m/Y H:i') : null,
                    'fecha_creacion' => $notificacion->created_at->format('d/m/Y H:i'),
                    'entregada' => $notificacion->entregada,
                    'cita_id' => $notificacion->idCita
                ];
            });
        
        // Obtener tipos de notificación para filtros
        $tiposNotificacion = [
            ['id' => 'confirmacion', 'nombre' => 'Confirmación'],
            ['id' => 'recordatorio', 'nombre' => 'Recordatorio'],
            ['id' => 'listo_para_recoger', 'nombre' => 'Listo para recoger'],
            ['id' => 'encuesta', 'nombre' => 'Encuesta'],
            ['id' => 'cancelacion', 'nombre' => 'Cancelación'],
            ['id' => 'reprogramacion', 'nombre' => 'Reprogramación']
        ];
        
        // Obtener canales para filtros
        $canales = [
            ['id' => 'whatsapp', 'nombre' => 'WhatsApp'],
            ['id' => 'telegram', 'nombre' => 'Telegram'],
            ['id' => 'email', 'nombre' => 'Email'],
            ['id' => 'sms', 'nombre' => 'SMS']
        ];
        
        return $this->successResponse([
            'notificaciones' => $notificaciones,
            'tipos' => $tiposNotificacion,
            'canales' => $canales
        ], 'Notificaciones obtenidas correctamente');
    }
    
    /**
     * Ver detalle de una notificación
     */
    public function show($id)
    {
        $notificacion = Notificacion::with(['cliente.user', 'cita.mascota', 'cita.servicio'])->find($id);
        
        if (!$notificacion) {
            return $this->errorResponse('Notificación no encontrada', 404);
        }
        
        return $this->successResponse($notificacion, 'Notificación obtenida correctamente');
    }
    
    /**
     * Reenviar notificación fallida
     */
    public function reenviar($id)
    {
        $notificacion = Notificacion::find($id);
        
        if (!$notificacion) {
            return $this->errorResponse('Notificación no encontrada', 404);
        }
        
        if ($notificacion->entregada) {
            return $this->errorResponse('La notificación ya fue entregada', 400);
        }
        
        // Actualizar fecha de envío
        $notificacion->fechaEnvio = now();
        
        // Aquí se integraría con el servicio real de WhatsApp/Telegram/Email/SMS
        // Por ahora solo simulamos el reenvío
        $notificacion->entregada = true;
        $notificacion->save();
        
        return $this->successResponse($notificacion, 'Notificación reenviada correctamente');
    }
    
    /**
     * Enviar notificación manual (desde admin)
     */
    public function enviarManual(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'idCita' => 'nullable|exists:citas,idCita',
            'tipo' => 'required|in:confirmacion,recordatorio,listo_para_recoger,encuesta,cancelacion,reprogramacion',
            'canal' => 'required|in:whatsapp,telegram,email,sms',
            'mensaje_personalizado' => 'nullable|string|max:500'
        ]);
        
        $cliente = Cliente::with('user')->find($request->idCliente);
        $cita = null;
        
        if ($request->has('idCita')) {
            $cita = Cita::with(['mascota', 'servicio'])->find($request->idCita);
        }
        
        // Generar mensaje según tipo
        $mensaje = $this->generarMensaje($request->tipo, $cliente, $cita);
        
        // Si hay mensaje personalizado, agregarlo
        if ($request->has('mensaje_personalizado')) {
            $mensaje .= "\n\nNota adicional: " . $request->mensaje_personalizado;
        }
        
        DB::beginTransaction();
        
        try {
            $notificacion = Notificacion::create([
                'idCliente' => $request->idCliente,
                'idCita' => $request->idCita,
                'tipo' => $request->tipo,
                'canal' => $request->canal,
                'mensaje' => $mensaje,
                'fechaEnvio' => now(),
                'entregada' => true // Simulamos que se envía correctamente
            ]);
            
            DB::commit();
            
            return $this->successResponse($notificacion, 'Notificación enviada correctamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al enviar notificación: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obtener clientes para selector (en envío manual)
     */
    public function clientesList(Request $request)
    {
        $search = $request->get('search', '');
        
        $query = Cliente::with('user');
        
        if ($search) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $clientes = $query->limit(20)->get()->map(function($cliente) {
            return [
                'id' => $cliente->idCliente,
                'nombre' => $cliente->user->nombre . ' ' . $cliente->user->apellido,
                'email' => $cliente->user->email,
                'canal_contacto' => $cliente->canalContacto
            ];
        });
        
        return $this->successResponse($clientes, 'Clientes obtenidos correctamente');
    }
    
    /**
     * Obtener citas para selector
     */
    public function citasList(Request $request)
    {
        $clienteId = $request->get('cliente_id');
        
        if (!$clienteId) {
            return $this->successResponse([], 'Seleccione un cliente primero');
        }
        
        $citas = Cita::with(['mascota', 'servicio'])
            ->whereHas('mascota', function($q) use ($clienteId) {
                $q->where('idCliente', $clienteId);
            })
            ->whereIn('estado', ['programada', 'confirmada'])
            ->orderBy('fechaHoraInicio', 'asc')
            ->limit(20)
            ->get()
            ->map(function($cita) {
                return [
                    'id' => $cita->idCita,
                    'info' => $cita->mascota->nombre . ' - ' . $cita->servicio->nombre . ' (' . $cita->fechaHoraInicio->format('d/m/Y H:i') . ')',
                    'fecha' => $cita->fechaHoraInicio->format('Y-m-d H:i')
                ];
            });
        
        return $this->successResponse($citas, 'Citas obtenidas correctamente');
    }
    
    /**
     * Vista previa del mensaje
     */
    public function vistaPrevia(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:confirmacion,recordatorio,listo_para_recoger,encuesta,cancelacion,reprogramacion'
        ]);
        
        $clienteDemo = (object) [
            'user' => (object) ['nombre' => 'Juan', 'apellido' => 'Perez']
        ];
        $citaDemo = (object) [
            'mascota' => (object) ['nombre' => 'Luna'],
            'servicio' => (object) ['nombre' => 'Baño completo'],
            'fechaHoraInicio' => now()
        ];
        
        $mensaje = $this->generarMensaje($request->tipo, $clienteDemo, $citaDemo);
        
        return $this->successResponse(['vista_previa' => $mensaje], 'Vista previa generada correctamente');
    }
    
    /**
     * Generar mensaje según tipo de notificación
     */
    private function generarMensaje($tipo, $cliente, $cita = null)
    {
        $nombreCliente = $cliente->user->nombre;
        $fechaCita = $cita ? $cita->fechaHoraInicio->format('d/m/Y H:i') : null;
        $nombreMascota = $cita ? $cita->mascota->nombre : null;
        $nombreServicio = $cita ? $cita->servicio->nombre : null;
        
        switch ($tipo) {
            case 'confirmacion':
                return "🐾 Hola {$nombreCliente}, tu cita ha sido confirmada.\n\n" .
                       "📅 Fecha: {$fechaCita}\n" .
                       "🐕 Mascota: {$nombreMascota}\n" .
                       "✂️ Servicio: {$nombreServicio}\n\n" .
                       "¡Te esperamos! 🐶";
                       
            case 'recordatorio':
                return "⏰ Recordatorio {$nombreCliente}!\n\n" .
                       "Tienes una cita mañana a las {$fechaCita} para {$nombreMascota} ({$nombreServicio}).\n\n" .
                       "Confirma tu asistencia. 🐾";
                       
            case 'listo_para_recoger':
                return "✅ ¡{$nombreMascota} ya está listo/a {$nombreCliente}!\n\n" .
                       "Tu mascota ya terminó su sesión de {$nombreServicio}.\n" .
                       "Puedes pasar a recogerla. 🐕✨";
                       
            case 'encuesta':
                return "📝 Hola {$nombreCliente},\n\n" .
                       "¿Cómo estuvo su experiencia con nosotros?\n" .
                       "Califícanos del 1 al 5. ¡Tu opinión nos ayuda a mejorar! 🐾";
                       
            case 'cancelacion':
                return "❌ Hola {$nombreCliente},\n\n" .
                       "Tu cita para {$nombreMascota} ({$nombreServicio}) ha sido cancelada.\n\n" .
                       "Si tienes alguna duda, contáctanos. 🐾";
                       
            case 'reprogramacion':
                return "🔄 Hola {$nombreCliente},\n\n" .
                       "Tu cita ha sido reprogramada para el {$fechaCita} para {$nombreMascota} ({$nombreServicio}).\n\n" .
                       "¡Te esperamos! 🐶";
                       
            default:
                return "Notificación de SPA para Mascotas";
        }
    }
}
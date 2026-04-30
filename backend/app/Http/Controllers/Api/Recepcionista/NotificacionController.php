<?php
// app/Http/Controllers/Api/Recepcionista/NotificacionController.php

namespace App\Http\Controllers\Api\Recepcionista;

use App\Http\Controllers\Api\ApiController;
use App\Models\Notificacion;
use App\Models\Cliente;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends ApiController
{
    /**
     * Listar notificaciones con filtros
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
        
        // Filtro por fecha
        if ($request->has('fecha_desde')) {
            $query->whereDate('fechaEnvio', '>=', $request->fecha_desde);
        }
        
        if ($request->has('fecha_hasta')) {
            $query->whereDate('fechaEnvio', '<=', $request->fecha_hasta);
        }
        
        // Filtro por estado de entrega
        if ($request->has('entregada')) {
            $query->where('entregada', $request->entregada);
        }
        
        $notificaciones = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return $this->successResponse($notificaciones, 'Notificaciones obtenidas correctamente');
    }

    /**
     * Ver detalle de una notificación
     */
    public function show($id)
    {
        $notificacion = Notificacion::with(['cliente.user', 'cita'])->find($id);
        
        if (!$notificacion) {
            return $this->errorResponse('Notificación no encontrada', 404);
        }
        
        return $this->successResponse($notificacion, 'Notificación obtenida correctamente');
    }

    /**
     * Enviar notificación manual
     */
    public function enviarManual(Request $request)
    {
        $request->validate([
            'idCliente' => 'required|exists:clientes,idCliente',
            'idCita' => 'nullable|exists:citas,idCita',
            'tipo' => 'required|in:confirmacion,recordatorio,listo_para_recoger,encuesta',
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
                'entregada' => false // Simulamos que no se envía realmente
            ]);
            
            DB::commit();
            
            // Aquí se integraría con el servicio real de WhatsApp/Telegram/Email/SMS
            // Por ahora solo simulamos el envío
            
            return $this->successResponse($notificacion, 'Notificación enviada correctamente', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al enviar notificación: ' . $e->getMessage(), 500);
        }
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
        
        // Actualizar fecha de envío y marcar como entregada
        $notificacion->fechaEnvio = now();
        $notificacion->entregada = true;
        $notificacion->save();
        
        return $this->successResponse($notificacion, 'Notificación reenviada correctamente');
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
            'tipo' => 'required|in:confirmacion,recordatorio,listo_para_recoger,encuesta'
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
                       
            default:
                return "Notificación de SPA para Mascotas";
        }
    }
}
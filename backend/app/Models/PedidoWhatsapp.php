<?php
// app/Models/PedidoWhatsapp.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoWhatsapp extends Model
{
    use HasFactory;

    protected $table = 'pedidos_whatsapp';
    protected $primaryKey = 'idPedido';

    protected $fillable = [
        'idCliente',
        'fecha',
        'estado',
        'subtotal',
        'mensajeGenerado',
        'canal'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'subtotal' => 'decimal:2'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function itemsPedido()
    {
        return $this->hasMany(ItemPedido::class, 'idPedido', 'idPedido');
    }

    // Métodos útiles
    public function generarMensajeWhatsapp()
    {
        $mensaje = "🛍️ *Nuevo Pedido* 🛍️\n\n";
        $mensaje .= "Cliente: {$this->cliente->user->nombre} {$this->cliente->user->apellido}\n";
        $mensaje .= "Teléfono: {$this->cliente->user->telefono}\n\n";
        $mensaje .= "*Productos:*\n";
        
        foreach ($this->itemsPedido as $item) {
            $mensaje .= "• {$item->variante->producto->nombre} - {$item->variante->nombreVariante}: {$item->cantidad} x \${$item->precioUnitario}\n";
        }
        
        $mensaje .= "\n*Subtotal:* \${$this->subtotal}\n";
        $mensaje .= "\n¡Gracias por tu compra! 🐾";
        
        $this->mensajeGenerado = $mensaje;
        $this->save();
        
        return $mensaje;
    }
}
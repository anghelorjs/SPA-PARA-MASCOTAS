<?php
// app/Models/ItemPedido.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemPedido extends Model
{
    use HasFactory;

    protected $table = 'items_pedido';
    protected $primaryKey = 'idItemPedido';

    protected $fillable = [
        'idPedido',
        'idVariante',
        'cantidad',
        'precioUnitario'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precioUnitario' => 'decimal:2'
    ];

    // Relaciones
    public function pedido()
    {
        return $this->belongsTo(PedidoWhatsapp::class, 'idPedido', 'idPedido');
    }

    public function variante()
    {
        return $this->belongsTo(VarianteProducto::class, 'idVariante', 'idVariante');
    }

    // Accessor
    public function getSubtotalAttribute()
    {
        return $this->cantidad * $this->precioUnitario;
    }
}
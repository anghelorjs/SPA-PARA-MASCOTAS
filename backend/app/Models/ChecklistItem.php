<?php
// app/Models/ChecklistItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChecklistItem extends Model
{
    use HasFactory;

    protected $table = 'checklist_items';
    protected $primaryKey = 'idItem';

    protected $fillable = [
        'idFicha',
        'nombreItem',
        'completado',
        'observacion'
    ];

    protected $casts = [
        'completado' => 'boolean'
    ];

    // Relaciones
    public function fichaGrooming()
    {
        return $this->belongsTo(FichaGrooming::class, 'idFicha', 'idFicha');
    }
}
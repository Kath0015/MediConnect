<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'patient_id',
        'patient_name',
        'test_name',
        'category',
        'requested_by',
        'status',
        'results',
        'attachment_path',
        'date_requested',
        'completed_at',
    ];

    protected $casts = [
        'date_requested' => 'date',
        'completed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}

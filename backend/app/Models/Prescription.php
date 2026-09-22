<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_number',
        'patient_id',
        'patient_name',
        'prescribed_by',
        'doctor_name',
        'diagnosis',
        'medications',
        'notes',
        'status',
        'date_prescribed',
    ];

    protected $casts = [
        'medications' => 'array',
        'date_prescribed' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'prescribed_by');
    }
}

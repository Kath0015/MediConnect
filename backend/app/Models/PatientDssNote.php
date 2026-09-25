<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientDssNote extends Model
{
    use HasFactory;

    protected $table = 'patient_dss_notes';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'note',
        'symptoms',
        'suggested_conditions',
        'suggested_labs',
        'urgency_level',
        'status',
    ];

    protected $casts = [
        'symptoms' => 'array',
        'suggested_conditions' => 'array',
        'suggested_labs' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}

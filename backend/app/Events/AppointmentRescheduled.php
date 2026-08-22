<?php

namespace App\Events;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentRescheduled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Appointment $appointment;
    public ?Carbon $originalStart;
    public ?Carbon $originalEnd;

    public function __construct(Appointment $appointment, ?Carbon $originalStart = null, ?Carbon $originalEnd = null)
    {
        $this->appointment = $appointment;
        $this->originalStart = $originalStart;
        $this->originalEnd = $originalEnd;
    }
}

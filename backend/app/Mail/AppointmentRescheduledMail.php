<?php

namespace App\Mail;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentRescheduledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;
    public ?Carbon $originalStart;
    public ?Carbon $originalEnd;

    public function __construct(Appointment $appointment, ?Carbon $originalStart = null, ?Carbon $originalEnd = null)
    {
        $this->appointment = $appointment;
        $this->originalStart = $originalStart;
        $this->originalEnd = $originalEnd;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment has been Rescheduled',
        );
    }

    public function content(): Content
    {
        $oldDate = $this->originalStart ? $this->originalStart->format('l, F j, Y') : null;
        $oldTime = $this->originalStart ? $this->originalStart->format('h:i A') : null;

        return new Content(
            view: 'emails.appointment-rescheduled',
            with: [
                'appointment' => $this->appointment,
                'patientName' => $this->appointment->patient?->user?->name ?? 'Patient',
                'appointmentType' => $this->appointment->appointmentType?->name ?? $this->appointment->type ?? 'Appointment',
                'oldAppointmentDate' => $oldDate,
                'oldAppointmentTime' => $oldTime,
                'newAppointmentDate' => $this->appointment->start_time
                    ? $this->appointment->start_time->format('l, F j, Y')
                    : null,
                'newAppointmentTime' => $this->appointment->start_time
                    ? $this->appointment->start_time->format('h:i A')
                    : null,
                'appointmentLocation' => $this->appointment->location ?? 'Campus Clinic',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

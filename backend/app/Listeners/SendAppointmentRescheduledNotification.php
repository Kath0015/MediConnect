<?php

namespace App\Listeners;

use App\Events\AppointmentRescheduled;
use App\Mail\AppointmentRescheduledMail;
use App\Models\MailSetting;
use App\Models\Notification;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAppointmentRescheduledNotification
{
    public function handle(AppointmentRescheduled $event): void
    {
        $appointment = $event->appointment->load(['patient.user', 'appointmentType']);
        $patient = $appointment->patient?->user;

        if (!$patient) {
            Log::warning('Cannot send appointment rescheduled notification: patient not found', [
                'appointment_id' => $appointment->id,
            ]);
            return;
        }

        $oldStart = $event->originalStart;
        $newStart = $appointment->start_time;

        $oldLabel = $oldStart ? $oldStart->format('M d, Y h:i A') : null;
        $newLabel = $newStart ? $newStart->format('M d, Y h:i A') : null;

        Notification::create([
            'user_id' => $patient->id,
            'type' => 'appointment_rescheduled',
            'channel' => 'in_app',
            'subject' => 'Appointment rescheduled',
            'message' => $oldLabel && $newLabel
                ? "Your appointment has been rescheduled from {$oldLabel} to {$newLabel}."
                : 'Your appointment schedule has been updated.',
            'data' => [
                'appointment_id' => $appointment->id,
                'previous_start_time' => $event->originalStart?->toDateTimeString(),
                'previous_end_time' => $event->originalEnd?->toDateTimeString(),
                'new_start_time' => $appointment->start_time?->toDateTimeString(),
                'new_end_time' => $appointment->end_time?->toDateTimeString(),
            ],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $patientEmail = $patient->email;
        if (!$patientEmail) {
            Log::warning('Cannot send appointment rescheduled email: patient email not found', [
                'appointment_id' => $appointment->id,
            ]);
            return;
        }

        try {
            $mailSettings = MailSetting::first();

            if (!$mailSettings) {
                Log::warning('Mail settings not configured for appointment rescheduled');
                return;
            }

            config([
                'mail.mailers.smtp.host' => $mailSettings->host ?? 'smtp.gmail.com',
                'mail.mailers.smtp.port' => $mailSettings->port ?? 587,
                'mail.mailers.smtp.username' => $mailSettings->email,
                'mail.mailers.smtp.password' => Crypt::decryptString($mailSettings->encrypted_password),
                'mail.mailers.smtp.encryption' => $mailSettings->encryption ?? 'tls',
                'mail.from.address' => $mailSettings->email,
                'mail.from.name' => 'Clinic and Laboratory',
            ]);

            Log::info('Sending appointment rescheduled email', [
                'appointment_id' => $appointment->id,
                'patient_email' => $patientEmail,
                'mail_from' => $mailSettings->email,
            ]);

            Mail::to($patientEmail)->send(new AppointmentRescheduledMail($appointment, $event->originalStart, $event->originalEnd));

            Log::info('Appointment rescheduled email sent successfully', [
                'appointment_id' => $appointment->id,
                'patient_email' => $patientEmail,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send appointment rescheduled email', [
                'appointment_id' => $appointment->id,
                'patient_email' => $patientEmail,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

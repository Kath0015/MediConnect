<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\Notification;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Scan upcoming confirmed appointments and send 24-hour and 1-hour reminders';

    public function handle(): int
    {
        $now = Carbon::now();
        $in24h = (clone $now)->addHours(24);
        $in1h = (clone $now)->addHour();

        $this->info("Scanning appointments for reminders at {$now->toDateTimeString()}...");

        // 1. Process 24-hour reminders
        $appts24h = Appointment::where('status', 'confirmed')
            ->where('reminder_sent_24h', false)
            ->where('start_time', '<=', $in24h)
            ->where('start_time', '>', $now)
            ->with(['patient.user'])
            ->get();

        $sent24hCount = 0;
        foreach ($appts24h as $appt) {
            $appt->update(['reminder_sent_24h' => true]);
            $sent24hCount++;

            if ($appt->patient?->user_id) {
                Notification::create([
                    'user_id' => $appt->patient->user_id,
                    'type' => 'appointment_reminder',
                    'channel' => 'database',
                    'subject' => 'Upcoming Consultation in 24 Hours',
                    'message' => "Reminder: You have a scheduled appointment on {$appt->start_time->format('M d, Y h:i A')}.",
                    'data' => json_encode(['appointment_id' => $appt->id]),
                    'sent_at' => now(),
                    'status' => 'sent',
                ]);
            }
        }

        // 2. Process 1-hour reminders
        $appts1h = Appointment::where('status', 'confirmed')
            ->where('reminder_sent_1h', false)
            ->where('start_time', '<=', $in1h)
            ->where('start_time', '>', $now)
            ->with(['patient.user'])
            ->get();

        $sent1hCount = 0;
        foreach ($appts1h as $appt) {
            $appt->update(['reminder_sent_1h' => true]);
            $sent1hCount++;

            if ($appt->patient?->user_id) {
                Notification::create([
                    'user_id' => $appt->patient->user_id,
                    'type' => 'appointment_reminder_1h',
                    'channel' => 'database',
                    'subject' => 'Consultation in 1 Hour',
                    'message' => "Your appointment starts soon at {$appt->start_time->format('h:i A')}. Please prepare to check in.",
                    'data' => json_encode(['appointment_id' => $appt->id]),
                    'sent_at' => now(),
                    'status' => 'sent',
                ]);
            }
        }

        $this->info("Completed: {$sent24hCount} 24h reminders sent, {$sent1hCount} 1h reminders sent.");
        return 0;
    }
}

<?php

namespace App\Providers;

use App\Events\MedCertApproved;
use App\Events\MedCertRejected;
use App\Events\AppointmentConfirmed;
use App\Events\AppointmentRejected;
use App\Events\AppointmentRescheduled;
use App\Listeners\SendMedCertApprovedNotification;
use App\Listeners\SendMedCertRejectedNotification;
use App\Listeners\SendAppointmentConfirmedNotification;
use App\Listeners\SendAppointmentRejectedNotification;
use App\Listeners\SendAppointmentRescheduledNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        MedCertApproved::class => [
            SendMedCertApprovedNotification::class,
        ],
        MedCertRejected::class => [
            SendMedCertRejectedNotification::class,
        ],
        AppointmentConfirmed::class => [
            SendAppointmentConfirmedNotification::class,
        ],
        AppointmentRejected::class => [
            SendAppointmentRejectedNotification::class,
        ],
        AppointmentRescheduled::class => [
            SendAppointmentRescheduledNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}

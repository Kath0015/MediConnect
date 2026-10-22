<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicSetting;

class ClinicSettingSeeder extends Seeder
{
    public function run(): void
    {
        ClinicSetting::updateOrCreate(
            ['id' => 1],
            [
                'open_time' => '08:00:00',
                'close_time' => '17:00:00',
                'working_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
                'appointment_interval' => 30,
                'brand_name' => 'Pareñas Medical Clinic',
                'brand_short_name' => 'Pareñas Clinic',
                'system_title' => 'Pareñas Medical Clinic System',
                'system_subtitle' => null,
                'brand_logo_path' => null,
                'footer_description' => 'Modern healthcare management for better patient care and operations.',
                'contact_email' => null,
                'contact_phone' => '0999-501-4626',
            ]
        );

        $this->command->info('Clinic settings initialized successfully!');
    }
}

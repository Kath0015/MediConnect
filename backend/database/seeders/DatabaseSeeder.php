<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Keep the production baseline limited to real roles and reference data.
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $doctorRole = Role::firstOrCreate(['name' => 'doctor']);
        $clinicianRole = Role::firstOrCreate(['name' => 'clinician']);
        $patientRole = Role::firstOrCreate(['name' => 'patient']);

        $this->command->info('Default roles created!');

        $this->call(AdminSeeder::class);

        $this->call([
            ClinicSettingSeeder::class,
            DocumentTypeSeeder::class,
            MedcertReasonSeeder::class,
            AppointmentTypeSeeder::class,
        ]);

        if (app()->environment(['local', 'testing'])) {
            $this->call(TestAccountsSeeder::class);
        }
    }
}
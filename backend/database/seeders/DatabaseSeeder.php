<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->removeTestAccounts();

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
            DocumentPatientSeeder::class,
        ]);

    }

    private function removeTestAccounts(): void
    {
        $testUsers = User::whereIn('email', ['doctor@gmail.com', 'staff@gmail.com'])->get();
        if ($testUsers->isEmpty()) {
            return;
        }

        $replacementDoctor = User::role('doctor')
            ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
            ->first();
        $replacementClinician = User::role('clinician')
            ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
            ->first();

        DB::transaction(function () use ($testUsers, $replacementDoctor, $replacementClinician) {
            foreach ($testUsers as $testUser) {
                $replacement = $testUser->hasRole('doctor')
                    ? $replacementDoctor
                    : $replacementClinician;
                $hasAppointments = DB::table('appointments')
                    ->where('clinician_id', $testUser->id)
                    ->exists();

                if ($hasAppointments && !$replacement) {
                    throw new \RuntimeException(
                        "Cannot remove {$testUser->email}: no replacement clinician account is available."
                    );
                }

                if ($hasAppointments) {
                    DB::table('appointments')
                        ->where('clinician_id', $testUser->id)
                        ->update(['clinician_id' => $replacement->id]);
                }

                $hasMedicalCertificates = DB::table('med_certs')
                    ->where('requested_by', $testUser->id)
                    ->exists();
                if ($hasMedicalCertificates && !$replacement) {
                    throw new \RuntimeException(
                        "Cannot remove {$testUser->email}: no replacement account is available for medical certificates."
                    );
                }

                if ($hasMedicalCertificates) {
                    DB::table('med_certs')
                        ->where('requested_by', $testUser->id)
                        ->update(['requested_by' => $replacement->id]);
                }

                DB::table('med_certs')
                    ->where('approved_by', $testUser->id)
                    ->update(['approved_by' => null]);

                $testUser->delete();
            }
        });

        $this->command->info('Removed test doctor and clinician accounts.');
    }
}
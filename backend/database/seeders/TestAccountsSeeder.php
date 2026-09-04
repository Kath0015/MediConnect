<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use App\Models\Message;
use Spatie\Permission\Models\Role;

class TestAccountsSeeder extends Seeder
{
    public function run()
    {
        // Ensure roles exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $doctorRole = Role::firstOrCreate(['name' => 'doctor']);
        $clinicianRole = Role::firstOrCreate(['name' => 'clinician']);
        $patientRole = Role::firstOrCreate(['name' => 'patient']);

        // Admin account
        $admin = User::firstOrNew(['email' => 'admin@gmail.com']);
        $admin->name = $admin->name ?? 'Admin User';
        $admin->password = bcrypt('password');
        $admin->email_verified_at = $admin->email_verified_at ?? now();
        $admin->save();
        $admin->assignRole('admin');
        $admin->save();

        // Doctor account
        $doctor = User::firstOrNew(['email' => 'doctor@gmail.com']);
        $doctor->name = $doctor->name ?? 'Dr. Jose Santos';
        $doctor->password = bcrypt('password');
        $doctor->email_verified_at = $doctor->email_verified_at ?? now();
        $doctor->save();
        $doctor->assignRole('doctor');
        $doctor->save();

        // Clinician account (Clinic Staff)
        $clinician = User::firstOrNew(['email' => 'staff@gmail.com']);
        $clinician->name = $clinician->name ?? 'Staff Clinician';
        $clinician->password = bcrypt('password');
        $clinician->email_verified_at = $clinician->email_verified_at ?? now();
        $clinician->save();
        $clinician->assignRole('clinician');
        $clinician->save();

        // Patient account
        $testPatient = User::firstOrNew(['email' => 'patient@gmail.com']);
        $testPatient->name = 'Maria Santos';
        $testPatient->password = bcrypt('password');
        $testPatient->email_verified_at = $testPatient->email_verified_at ?? now();
        $testPatient->save();
        $testPatient->assignRole('patient');
        $testPatient->save();

        if (!$testPatient->patient) {
            Patient::create([
                'user_id'           => $testPatient->id,
                'date_of_birth'     => '1995-06-15',
                'phone'             => '09171234567',
                'address'           => 'Quezon City, Metro Manila',
                'emergency_contact' => [],
                'is_active'         => true,
            ]);
        }

        // Seed initial message exchange between Doctor and Patient
        if ($doctor && $testPatient && Message::where('sender_id', $testPatient->id)->where('receiver_id', $doctor->id)->count() === 0) {
            Message::create([
                'sender_id' => $testPatient->id,
                'receiver_id' => $doctor->id,
                'message' => 'Good day Doc Jose, should I take the prescribed medication before or after eating?',
                'is_read' => false,
                'created_at' => now()->subHours(2),
            ]);

            Message::create([
                'sender_id' => $doctor->id,
                'receiver_id' => $testPatient->id,
                'message' => 'Hello Maria! Please take it 30 minutes after your meal with a full glass of water.',
                'is_read' => false,
                'created_at' => now()->subHour(),
            ]);
        }

        $this->command->info('Test accounts: admin@gmail.com, doctor@gmail.com, staff@gmail.com, patient@gmail.com (password: password)');
    }
}

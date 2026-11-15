<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\CheckIn;
use App\Models\MedCert;
use App\Models\Patient;
use App\Models\PatientVital;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DocumentPatientSeeder extends Seeder
{
    private const PAYLOAD = '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';

    public function run(): void
    {
        $records = json_decode(gzdecode(base64_decode(self::PAYLOAD)), true, 512, JSON_THROW_ON_ERROR);
        $this->removeLegacySeedPatients();

        $doctor = User::role('doctor')
            ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
            ->first();
        $clinicians = User::role('clinician')
            ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
            ->orderBy('id')
            ->get();

        if (!$doctor) {
            throw new \RuntimeException('A non-test doctor account is required before importing patient records.');
        }

        foreach ($records as $index => $record) {
            [$visitDate, $name, $ageGender, $address, $phone, $sourceEmail, $dateOfBirth, $password, $purpose] = $record;
            $email = $this->uniqueEmail($sourceEmail, $index);
            $date = Carbon::createFromFormat('m/d/Y', $visitDate)->format('Y-m-d');
            $dob = Carbon::createFromFormat('M d, Y', $dateOfBirth)->format('Y-m-d');
            $gender = str_contains($ageGender, '/ F') || str_ends_with($ageGender, ' F') ? 'Female' : 'Male';
            $category = str_starts_with($purpose, 'Laboratory') ? 'Laboratory' : 'Medical';
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'phone' => $this->cleanPhone($phone),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
            $user->syncRoles(['patient']);

            $patient = Patient::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => $dob,
                    'gender' => $gender,
                    'phone' => $this->cleanPhone($phone),
                    'address' => $address,
                    'medical_notes' => $purpose,
                    'patient_category' => $category,
                    'emergency_contact' => ['name' => 'To be provided', 'phone' => $this->cleanPhone($phone)],
                    'is_active' => true,
                ]
            );

            $start = $date.' '.sprintf('%02d:%02d:00', 8 + ($index % 8), ($index % 2) * 30);
            $end = Carbon::parse($start)->addMinutes(30)->toDateTimeString();
            Appointment::updateOrCreate(
                ['patient_id' => $patient->id, 'start_time' => $start],
                [
                    'clinician_id' => $doctor->id,
                    'title' => $purpose,
                    'description' => $purpose,
                    'end_time' => $end,
                    'status' => 'completed',
                    'type' => $category === 'Laboratory' ? 'other' : 'consultation',
                    'location' => 'MediConnect Clinic',
                ]
            );
            CheckIn::updateOrCreate(
                ['patient_id' => $patient->id, 'checked_in_at' => $start],
                [
                    'queue_number' => 'Q-WALK-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    'patient_name' => $name,
                    'purpose' => $purpose,
                    'status' => 'Done',
                ]
            );

            $weight = 45 + ($index % 36);
            $height = 145 + ($index % 31);
            PatientVital::updateOrCreate(
                ['patient_id' => $patient->id, 'recorded_at' => $start],
                [
                    'patient_name' => $name,
                    'blood_pressure' => (110 + ($index % 31)).'/'.(70 + ($index % 16)),
                    'heart_rate' => 68 + ($index % 21),
                    'temperature' => 36.3 + (($index % 5) * 0.1),
                    'respiratory_rate' => 16 + ($index % 5),
                    'oxygen_saturation' => 97 + ($index % 3),
                    'weight' => $weight,
                    'height' => $height,
                    'bmi' => round($weight / (($height / 100) ** 2), 1),
                    'recorded_by' => $clinicians->isNotEmpty()
                        ? $clinicians[$index % $clinicians->count()]->name
                        : $doctor->name,
                ]
            );
        }

        $this->seedMedicalCertificateRequests($clinicians, $doctor);
        $this->command->info('Imported '.count($records).' patient records from the supplied document.');
    }

    private function seedMedicalCertificateRequests($clinicians, User $doctor): void
    {
        $patients = Patient::whereNotNull('patient_category')
            ->orderBy('id')
            ->limit(6)
            ->get();

        if ($patients->count() < 6) {
            throw new \RuntimeException('At least six imported patients are required for medical certificate requests.');
        }

        $today = Carbon::today();
        $requests = [
            [
                'type' => 'medical_excuse',
                'start_date' => $today,
                'end_date' => $today->copy()->addDays(2),
                'status' => 'completed',
                'delivery_method' => 'pickup',
                'pickup_date' => $today->copy()->addDay(),
            ],
            [
                'type' => 'sick_leave',
                'start_date' => $today->copy()->subDays(5),
                'end_date' => $today->copy()->subDays(3),
                'status' => 'completed',
                'delivery_method' => 'pickup',
                'pickup_date' => $today->copy()->subDay(),
            ],
            [
                'type' => 'fitness_clearance',
                'start_date' => $today->copy()->subDays(10),
                'end_date' => $today->copy()->subDays(8),
                'status' => 'completed',
                'delivery_method' => 'digital',
                'pickup_date' => null,
            ],
            [
                'type' => 'medical_excuse',
                'start_date' => $today->copy()->subDays(15),
                'end_date' => $today->copy()->subDays(13),
                'status' => 'completed',
                'delivery_method' => 'pickup',
                'pickup_date' => $today->copy()->subDays(12),
            ],
            [
                'type' => 'sick_leave',
                'start_date' => $today->copy()->subDays(20),
                'end_date' => $today->copy()->subDays(18),
                'status' => 'completed',
                'delivery_method' => 'pickup',
                'pickup_date' => $today->copy()->subDays(17),
            ],
            [
                'type' => 'other',
                'start_date' => $today->copy()->subDays(25),
                'end_date' => $today->copy()->subDays(23),
                'status' => 'completed',
                'delivery_method' => 'digital',
                'pickup_date' => null,
            ],
        ];
        foreach ($patients as $index => $patient) {
            $request = $requests[$index];
            $requestedBy = $clinicians->isNotEmpty()
                ? $clinicians[$index % $clinicians->count()]->id
                : User::role('doctor')->firstOrFail()->id;
            $purpose = 'Seeded medical certificate request for staff review';
            $existing = MedCert::where('patient_id', $patient->id)
                ->where('purpose', $purpose)
                ->first();
            $approvedBy = in_array($request['status'], ['approved', 'completed', 'no-show'], true)
                ? $doctor->id
                : null;

            $attributes = [
                'patient_id' => $patient->id,
                'requested_by' => $requestedBy,
                'type' => $request['type'],
                'start_date' => $request['start_date']->toDateString(),
                'end_date' => $request['end_date']->toDateString(),
                'duration_days' => $request['start_date']->diffInDays($request['end_date']) + 1,
                'purpose' => $purpose,
                'status' => $request['status'],
                'approved_by' => $approvedBy,
                'approved_at' => $approvedBy ? $today->copy()->subDays(2) : null,
                'pickup_date' => $request['pickup_date']?->toDateString(),
                'delivery_method' => $request['delivery_method'],
                'rejection_reason' => null,
            ];
            if ($approvedBy) {
                $attributes['verification_hash'] = $existing?->verification_hash
                    ?? (new MedCert())->generateVerificationHash();
            } else {
                $attributes['verification_hash'] = null;
            }

            if ($existing) {
                $existing->update($attributes);
            } else {
                $attributes['certificate_number'] = (new MedCert())->generateCertificateNumber();
                MedCert::create($attributes);
            }
        }
    }

    private function removeLegacySeedPatients(): void
    {
        $replacement = User::role('doctor')
            ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
            ->first()
            ?? User::role('clinician')
                ->whereNotIn('email', ['doctor@gmail.com', 'staff@gmail.com'])
                ->first();

        Patient::whereNotNull('patient_category')->with('user')->get()->each(function (Patient $patient) use ($replacement): void {
            if ($patient->user) {
                $hasMedicalCertificates = DB::table('med_certs')
                    ->where('requested_by', $patient->user->id)
                    ->exists();
                if ($hasMedicalCertificates && !$replacement) {
                    throw new \RuntimeException(
                        "Cannot remove {$patient->user->email}: no replacement account is available for medical certificates."
                    );
                }

                if ($hasMedicalCertificates) {
                    DB::table('med_certs')
                        ->where('requested_by', $patient->user->id)
                        ->update(['requested_by' => $replacement->id]);
                }

                DB::table('med_certs')
                    ->where('approved_by', $patient->user->id)
                    ->update(['approved_by' => null]);
            }
            $patient->user?->delete();
        });
        User::where('email', 'patient@gmail.com')->delete();
    }

    private function uniqueEmail(string $sourceEmail, int $index): string
    {
        [$local, $domain] = explode('@', strtolower(trim($sourceEmail)), 2);
        $email = $local.'@'.$domain;
        if (User::where('email', $email)->whereHas('patient', fn ($query) => $query->whereNotNull('patient_category'))->exists()) {
            $email = $local.'+patient'.($index + 1).'@'.$domain;
        }
        return $email;
    }

    private function cleanPhone(string $phone): string
    {
        return trim(preg_replace('/\s+\([^)]*\)$/', '', $phone));
    }
}

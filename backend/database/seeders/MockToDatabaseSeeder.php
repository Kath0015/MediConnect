<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Invoice;
use App\Models\Prescription;
use App\Models\LabRequest;
use App\Models\CheckIn;
use App\Models\PatientVital;
use App\Models\Patient;
use App\Models\User;

class MockToDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $mariaPatient = Patient::first();
        $doctorUser = User::role('doctor')->first() ?? User::where('email', 'doctor@gmail.com')->first();
        $patientId = $mariaPatient?->id;

        // 1. Invoices
        $invoices = [
            [
                'invoice_number' => 'INV-001',
                'patient_id' => $patientId,
                'patient_name' => 'Maria Santos',
                'service' => 'Consultation + CBC',
                'amount' => 850.00,
                'status' => 'Paid',
                'payment_method' => 'GCash',
                'reference_number' => 'GCASH-987654321',
                'cashier' => 'Staff Lopez',
                'date' => '2026-08-10',
            ],
            [
                'invoice_number' => 'INV-002',
                'patient_id' => null,
                'patient_name' => 'Juan dela Cruz',
                'service' => 'Follow-up Consultation',
                'amount' => 500.00,
                'status' => 'Paid',
                'payment_method' => 'Cash',
                'reference_number' => 'CASH-REC-002',
                'cashier' => 'Staff Lopez',
                'date' => '2026-08-08',
            ],
            [
                'invoice_number' => 'INV-003',
                'patient_id' => null,
                'patient_name' => 'Ana Reyes',
                'service' => 'Consultation + Urinalysis',
                'amount' => 650.00,
                'status' => 'Unpaid',
                'payment_method' => null,
                'reference_number' => null,
                'cashier' => 'Pending',
                'date' => '2026-08-05',
            ],
            [
                'invoice_number' => 'INV-004',
                'patient_id' => null,
                'patient_name' => 'Pedro Lim',
                'service' => 'Emergency Consultation',
                'amount' => 1500.00,
                'status' => 'Pending',
                'payment_method' => null,
                'reference_number' => null,
                'cashier' => 'Pending',
                'date' => '2026-08-15',
            ],
            [
                'invoice_number' => 'INV-005',
                'patient_id' => null,
                'patient_name' => 'Rosa Garcia',
                'service' => 'Consultation + Lipid Profile',
                'amount' => 900.00,
                'status' => 'Paid',
                'payment_method' => 'GCash',
                'reference_number' => 'GCASH-123456789',
                'cashier' => 'Staff Lopez',
                'date' => '2026-08-09',
            ],
        ];

        foreach ($invoices as $inv) {
            Invoice::updateOrCreate(['invoice_number' => $inv['invoice_number']], $inv);
        }

        // 2. Prescriptions
        $prescriptions = [
            [
                'prescription_number' => 'RX-2026-001',
                'patient_id' => $patientId,
                'patient_name' => 'Maria Santos',
                'prescribed_by' => $doctorUser?->id,
                'doctor_name' => $doctorUser?->name ?? 'Dr. Jose Santos',
                'diagnosis' => 'Acute Upper Respiratory Tract Infection',
                'medications' => [
                    [
                        'name' => 'Amoxicillin 500mg',
                        'dosage' => '1 capsule',
                        'frequency' => 'Every 8 hours (3x a day)',
                        'duration' => '7 days',
                        'instructions' => 'Take after meals. Complete full 7-day course.',
                    ],
                    [
                        'name' => 'Paracetamol 500mg',
                        'dosage' => '1 tablet',
                        'frequency' => 'Every 4-6 hours PRN for fever',
                        'duration' => '5 days',
                        'instructions' => 'Take as needed for temperature > 37.8°C.',
                    ],
                    [
                        'name' => 'Cetirizine 10mg',
                        'dosage' => '1 tablet',
                        'frequency' => 'Once daily at bedtime',
                        'duration' => '5 days',
                        'instructions' => 'May cause drowsiness.',
                    ],
                ],
                'notes' => 'Patient advised to increase fluid intake and rest. Follow-up if symptoms persist after 3 days.',
                'status' => 'Active',
                'date_prescribed' => '2026-08-10',
            ],
            [
                'prescription_number' => 'RX-2026-002',
                'patient_id' => null,
                'patient_name' => 'Pedro Lim',
                'prescribed_by' => $doctorUser?->id,
                'doctor_name' => $doctorUser?->name ?? 'Dr. Jose Santos',
                'diagnosis' => 'Essential Hypertension - Stage 1',
                'medications' => [
                    [
                        'name' => 'Amlodipine 5mg',
                        'dosage' => '1 tablet',
                        'frequency' => 'Once daily in the morning',
                        'duration' => '30 days',
                        'instructions' => 'Take consistently at the same time each morning.',
                    ],
                ],
                'notes' => 'BP diary advised. Low-salt, low-fat diet. Monthly blood pressure monitoring.',
                'status' => 'Active',
                'date_prescribed' => '2026-08-08',
            ],
        ];

        foreach ($prescriptions as $rx) {
            Prescription::updateOrCreate(['prescription_number' => $rx['prescription_number']], $rx);
        }

        // 3. Lab Requests
        $labs = [
            [
                'request_number' => 'LAB-2026-001',
                'patient_id' => $patientId,
                'patient_name' => 'Maria Santos',
                'test_name' => 'Complete Blood Count (CBC) with Platelet',
                'category' => 'Hematology',
                'requested_by' => 'Dr. Jose Santos',
                'status' => 'Completed',
                'results' => 'WBC: 7.2 x10^9/L (Normal), RBC: 4.5 x10^12/L (Normal), Hemoglobin: 13.8 g/dL (Normal), Platelets: 240 x10^9/L (Normal). Normal hematologic profile.',
                'date_requested' => '2026-08-10',
                'completed_at' => '2026-08-11 14:30:00',
            ],
            [
                'request_number' => 'LAB-2026-002',
                'patient_id' => null,
                'patient_name' => 'Juan dela Cruz',
                'test_name' => 'Routine Urinalysis',
                'category' => 'Urinalysis',
                'requested_by' => 'Dr. Jose Santos',
                'status' => 'Completed',
                'results' => 'Color: Pale yellow, Transparency: Clear, Specific Gravity: 1.015, pH: 6.0, Protein: Negative, Glucose: Negative, Pus Cells: 0-2 /hpf, RBC: 0-1 /hpf.',
                'date_requested' => '2026-08-08',
                'completed_at' => '2026-08-09 10:00:00',
            ],
            [
                'request_number' => 'LAB-2026-003',
                'patient_id' => null,
                'patient_name' => 'Ana Reyes',
                'test_name' => 'Fasting Blood Sugar (FBS) & HbA1c',
                'category' => 'Blood Chemistry',
                'requested_by' => 'Dr. Jose Santos',
                'status' => 'Pending',
                'results' => null,
                'date_requested' => '2026-08-14',
                'completed_at' => null,
            ],
            [
                'request_number' => 'LAB-2026-004',
                'patient_id' => null,
                'patient_name' => 'Pedro Lim',
                'test_name' => 'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)',
                'category' => 'Blood Chemistry',
                'requested_by' => 'Dr. Jose Santos',
                'status' => 'Processing',
                'results' => null,
                'date_requested' => '2026-08-15',
                'completed_at' => null,
            ],
        ];

        foreach ($labs as $lab) {
            LabRequest::updateOrCreate(['request_number' => $lab['request_number']], $lab);
        }

        // 4. Check-Ins
        $checkIns = [
            [
                'queue_number' => 'Q-001',
                'patient_id' => $patientId,
                'patient_name' => 'Maria Santos',
                'purpose' => 'General Checkup',
                'status' => 'In Consultation',
                'checked_in_at' => now()->subMinutes(25),
            ],
            [
                'queue_number' => 'Q-002',
                'patient_id' => null,
                'patient_name' => 'Juan dela Cruz',
                'purpose' => 'Follow-up Lab Review',
                'status' => 'Waiting',
                'checked_in_at' => now()->subMinutes(15),
            ],
            [
                'queue_number' => 'Q-003',
                'patient_id' => null,
                'patient_name' => 'Ana Reyes',
                'purpose' => 'Prescription Refill',
                'status' => 'Waiting',
                'checked_in_at' => now()->subMinutes(5),
            ],
        ];

        foreach ($checkIns as $c) {
            CheckIn::updateOrCreate(['queue_number' => $c['queue_number']], $c);
        }

        // 5. Patient Vitals
        $vitals = [
            [
                'patient_id' => $patientId,
                'patient_name' => 'Maria Santos',
                'blood_pressure' => '120/80',
                'heart_rate' => 74,
                'temperature' => 36.6,
                'respiratory_rate' => 18,
                'oxygen_saturation' => 99,
                'weight' => 54.5,
                'height' => 160.0,
                'bmi' => 21.3,
                'recorded_by' => 'Staff Clinician',
                'recorded_at' => now()->subDays(1),
            ],
            [
                'patient_id' => null,
                'patient_name' => 'Pedro Lim',
                'blood_pressure' => '138/88',
                'heart_rate' => 82,
                'temperature' => 36.8,
                'respiratory_rate' => 20,
                'oxygen_saturation' => 98,
                'weight' => 78.0,
                'height' => 172.0,
                'bmi' => 26.4,
                'recorded_by' => 'Staff Clinician',
                'recorded_at' => now()->subDays(2),
            ],
        ];

        foreach ($vitals as $v) {
            PatientVital::create($v);
        }
    }
}

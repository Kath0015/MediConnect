<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\LabRequest;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class October2026PatientSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'clinician']);
        Role::firstOrCreate(['name' => 'patient']);
        Patient::whereHas('user', fn ($query) => $query->whereIn('name', [
            'Maria Santos',
            'Juan dela Cruz',
            'Ana Reyes',
            'Pedro Lim',
        ]))->get()->each->delete();

        $doctor = User::role('doctor')->where('email', '!=', 'doctor@gmail.com')->first()
            ?? $this->staffAccount('doctor@gmail.com', 'Dr. Roy B. Pareñas, M.D.', 'doctor');
        $staff = $this->staffAccount('staff@gmail.com', 'Clinic Staff', 'clinician');

        $patients = [
            ['Alpher Gacilo', '35 / M', 'Brgy. Ogbot, Bongabong Oriental Mindoro', '09440859069', 'alpheor.gaaclo@gmail.com', '1989-03-14', 'Alpheor35!', 'Medical', 'Hypertension Follow-up & BP Monitoring', 'Amlodipine 5mg OD'],
            ['Marjorie Ysog', '12 / F', 'Brgy. Victoria, Roxas Oriental Mindoro', '09997772481', 'marjorie.tsoq@gmail.com', '2012-06-22', 'Marjorie12!', 'Medical', 'Pediatric Routine Physical Check-up & Multivitamin Prescription', 'Multivitamin'],
            ['Julianne Delas Alas', '17 / F', 'Brgy. Little Tanaun, Roxas Oriental Mindoro', '09532166139', 'julianne.delas@gmail.com', '2007-01-08', 'Delas17!', 'Medical', 'Acute Upper Respiratory Tract Infection', 'Amoxicillin 500mg'],
            ['Emma Musico', '59 / F', 'Brgy. Orcunuma, Bongabong Oriental Mindoro', '09386322790', 'emma.musico@gmail.com', '1965-09-19', 'Emma59!', 'Medical', 'Type 2 Diabetes Screening & Joint Pain Management', 'Metformin'],
            ['Ryan Fajiculay', '1 Yr 2 Mos / M', 'Brgy. San Aquilino, Roxas Oriental Mindoro', '09277122601', 'kyan.fajaulay@gmail.com', '2023-08-12', 'Kyan2023!', 'Medical', 'Well-Child Check & Primary Immunization Assessment', null],
            ['Mina Mallesteros', '63 / F', 'Brgy. San Mariano, Roxas Oriental Mindoro', '09277122601', 'mina.mallesteros@gmail.com', '1961-05-04', 'Mina63!', 'Medical', 'Geriatric Osteoarthritis Consultation', 'Celecoxib 200mg PRN'],
            ['Glydel Mallesteros', '30 / F', 'Brgy. San Mariano, Roxas Oriental Mindoro', '09183572841', 'glydel.mallesteros@gmail.com', '1993-11-28', 'Glydel30!', 'Medical', 'Prenatal First Trimester Check-up', 'Folic Acid'],
            ['Shawn Leur Cusi', 'Adult / M', 'Brgy. Libtong, Roxas Oriental Mindoro', '09284619052', 'shawnleur.cust@gmail.com', '1990-07-15', 'ShawnLeur!', 'Medical', 'General Adult Physical Exam & Employment Health Clearance', null],
            ['Reilyn Cortez', 'Adult / F', 'Brgy. Libtong, Roxas, Oriental Mindoro', '09395182046', 'reilyn.cortez@gmail.com', '1995-04-03', 'ReilynCortez!', 'Medical', 'Dermatological Evaluation for Allergic Contact Dermatitis', null],
            ['Ronaldo C. Nicolas', '55 / M', 'Brgy. Libtong, Roxas, Oriental Mindoro', '09471938562', 'ronaldo.nicolas@gmail.com', '1968-12-10', 'Ronaldo55!', 'Medical', 'Cardiovascular Health Risk Assessment & Lipid Panel Screening', null],
            ['Arsenio Obinario', '56 / M', 'Brgy. Teresita, Mansalay, Oriental Mindoro', '09172648910', 'arsenio.obinario@gmail.com', '1970-02-18', 'Arsenio56!', 'Medical', 'Chronic Lower Back Pain Consultation & Physical Therapy Referral', null],
            ['Kate Jassel Delara', '25 / F', 'Brgy. Teresita, Mansalay, Oriental Mindoro', '09181248413', 'katejassel.delara@gmail.com', '2001-08-05', 'Kate2001!', 'Medical', 'Acute Migraine Evaluation & Symptom Management', 'Sumatriptan'],
            ['Hanz Jacob La Peña', '3 Mos / M', 'Brgy. Paclacan, Roxas Oriental Mindoro', '096640298020', 'hanzjacob.lapena@gmail.com', '2026-07-02', 'Hanz2026!', 'Medical', 'Infant Growth Tracking & Colic Evaluation', null],
            ['Marielle Dayanghirang', '19 / F', 'Brgy. Cantil, Roxas Oriental Mindoro', '09593230571', 'marielle.dayanghirang@gmail.com', '2007-10-01', 'Marielle19!', 'Medical', 'Iron Deficiency Anemia Follow-up', 'Ferrous Sulfate 325mg'],
            ['Angel Mapano', '19 / F', 'Brgy. Cantil, Roxas Oriental Mindoro', '09593230571', 'angel.dafano@gmail.com', '2007-05-17', 'Angel2007!', 'Laboratory', 'Diagnostic Blood Work: Complete Blood Count (CBC) & Urinalysis', null],
            ['Mark Aaron Aquilon', '15 / M', 'Brgy. Kaligtasan, Bongabong Oriental Mindoro', '09515552441', 'markaaron.aquilon@gmail.com', '2011-09-11', 'MarkAaron15!', 'Laboratory', 'Diagnostic Blood Work: Complete Blood Count (CBC) & Urinalysis', null],
            ['Alyssa Fedequin', '19 / F', 'Brgy. Cantil, Roxas Oriental Mindoro', '09454558702', 'alyssa.fedequin@gmail.com', '2007-03-29', 'Alyssa2007!', 'Laboratory', 'Diagnostic Blood Work: Complete Blood Count (CBC) & Urinalysis', null],
            ['Wilfredo Salibio', '76 / M', 'Brgy. Cabalwa, Mansalay Oriental Mindoro', '09198324561', 'wilfredo.salibio@gmail.com', '1950-01-12', 'Wilfredo76!', 'Medical', 'Geriatric Cardiac Maintenance & Blood Pressure Review', null],
            ['Kristan Fajarito', '18 / M', 'Brgy. Mabuhay, Oriental Mindoro', '09223194852', 'kristan.fajarito@gmail.com', '2008-06-24', 'Kristan18!', 'Medical', 'Adolescent Sports Physical & Athletic Clearance', null],
            ['Corazon Aquino', '67 / F', 'Brgy. Dalahican, Oriental Mindoro', '09294819263', 'corazon.aquino@gmail.com', '1959-04-30', 'Corazon67!', 'Medical', 'Post-Menopausal Bone Density & Osteoporosis Screening', null],
            ['Carl Lester Sim', '21 / M', 'Brgy. San Rafael, Oriental Mindoro', '09482047635', 'carllester.sim@gmail.com', '2004-12-03', 'CarlLester21!', 'Medical', 'Acute Gastritis Evaluation', 'Omeprazole 20mg'],
            ['Joshua Mariano', 'Young Adult / M', 'Brgy. Sta Maria, Oriental Mindoro', '09331827495', 'joshua.mariano@gmail.com', '2004-07-19', 'Joshua2004!', 'Medical', 'Routine Pre-Employment Physical Examination', null],
            ['King Rufi Lumbres', '17 / M', 'Brgy. Odiong, Oriental Mindoro', '09556218390', 'kingrufi.lumbres@gmail.com', '2008-11-14', 'KingRufl17!', 'Medical', 'Upper Respiratory Tract Infection Assessment', 'Cough syrup'],
            ['Rechelle Bayanay', '51 / M', 'Brgy. Roma Mansalay, Oriental Mindoro', '09681493021', 'rochelle.bayanay@gmail.com', '1975-08-22', 'Rochelle51!', 'Medical', 'Metabolic Syndrome Screening & Diet Consultation', null],
            ['Gavin Pattaguan', '6 / M', 'Brgy. Dangay, Oriental Mindoro', '09123456789', 'gavin.pattaguan@gmail.com', '2018-05-10', 'Gavin2018!', 'Medical', 'Pediatric Allergic Rhinitis Evaluation', 'Antihistamine'],
            ['Elena Rimon', '81 / F', 'Brgy. Roma Mansalay, Oriental Mindoro', '09234567891', 'elena.rimon@gmail.com', '1943-01-03', 'Elena81!', 'Medical', 'Geriatric General Check-up & Essential Hypertension Review', null],
            ['Bobby Solis', '46 / M', 'Brgy. Bongabong, Oriental Mindoro', '09345678912', 'bobby.solis@gmail.com', '1978-09-27', 'Bobby46!', 'Clinical', 'Clinical Outpatient Consultation & Preventive Health Audit', null],
            ['Bea Sophia Seminiano', '17 / F', 'Brgy. Budburan, Oriental Mindoro', '09054667102', 'beasophia.semiziano@gmail.com', '2009-02-14', 'BeaSophia17!', 'Medical', 'Adolescent Wellness Exam & Nutritional Assessment', null],
            ['Merly Gadon', '59 / F', 'Brgy. Dalahican, Oriental Mindoro', '09162849370', 'merly.gadon@gmail.com', '1967-07-08', 'Merly59!', 'Medical', 'Routine Follow-up for Type 2 Diabetes & Glycemic Control', null],
            ['Maria Fatima Cay', 'Adult / F', 'Brgy. Dayhagan, Oriental Mindoro', '09273950481', 'mariafatima.cay@gmail.com', '1985-05-25', 'MariaFatima!', 'Medical', 'Adult Outpatient Physical Exam & Preventive Screenings', null],
            ['Raffy Genn', '46 / M', 'Brgy. Dayhagan, Oriental Mindoro', '09384061592', 'raffy.genn@gmail.com', '1980-10-19', 'Raffy46!', 'Medical', 'Work-Related Ergonomic Strain & Pain Management', 'Ibuprofen'],
            ['Jicelle Lumawig', '32 / F', 'Brgy. Manaul, Oriental Mindoro', '091666014446', 'jicelle.lumawig@gmail.com', '1993-12-30', 'Jicelle32!', 'Medical', 'Thyroid Function Follow-up & General Outpatient Review', null],
            ['Narlie Manito', '57 / F', 'Brgy. B. Del Mundo, Mansalay, Oriental Mindoro', '09495172638', 'narlie.manito@gmail.com', '1969-04-09', 'Narlie57!', 'Medical', 'Hypertension Follow-up & Serum Electrolyte Assessment', null],
            ['Alican Sison', '48 / M', 'Roxas, Oriental Mindoro', '09854005106', 'alican.sison@gmail.com', '1978-08-31', 'Alican48!', 'FPS / Medical', 'Family Planning Service & General Health Counseling', null],
            ['Rosalina Sison', '45 / F', 'Roxas, Oriental Mindoro', '09854005106', 'rosalina.sison@gmail.com', '1981-06-15', 'Rosalina45!', 'FPS / Medical', 'Family Planning Consultation & Reproductive Health Review', null],
            ['Petronila Sison', '70 / F', 'Roxas, Oriental Mindoro', '09854005106', 'petronila.sison@gmail.com', '1956-01-21', 'Petronila70!', 'FPS / Medical', 'Senior Community Health Consultation & BP Screening', null],
            ['Karen Sison', '45 / F', 'Roxas, Oriental Mindoro', '09854005106', 'karen.sison@gmail.com', '1981-10-05', 'Karen45!', 'FPS / Medical', 'Family Planning Service & Cervical Cancer Screening Info', null],
            ['Janeth Gan', '31 / F', 'Brgy. Dayhagan, Oriental Mindoro', '09633175684', 'janeth.gani@gmail.com', '1995-07-11', 'Janeth31!', 'Medical', 'Maternal Outpatient Review & Vital Signs Check', null],
            ['Guiah Odessy Leuterio', '31 / F', 'Roxas, Oriental Mindoro', '09171340958', 'guiahodessy.leuterio@gmail.com', '1995-03-18', 'Guiah31!', 'Medical', 'General Outpatient Consultation & Stress Management', null],
            ['Ruchel M. Fabita', '49 / F', 'Brgy. Campaasaan, Oriental Mindoro', '09281948375', 'ruchel.fabita@gmail.com', '1976-11-02', 'Ruchel49!', 'Medical', 'Perimenopausal Symptom Evaluation & Calcium Supplementation', null],
            ['Flordeliza A. Prespito', '50 / F', 'Brgy. Odiong, Oriental Mindoro', '095551147363', 'flordeliza.prespito@gmail.com', '1976-05-29', 'Flordeliza50!', 'MSWD / Medical', 'Social Welfare Assisted Medical Evaluation & Prescription Assistance', null],
            ['Dylan Tugbok', '2 / M', 'Brgy. Tauga, San Vicente, Oriental Mindoro', '09392817496', 'dylan.tugbok@gmail.com', '2024-09-04', 'Dylan2024!', 'Medical', 'Pediatric Febrile Illness Evaluation', 'Paracetamol Drops'],
            ['Manlou Miran', '54 / F', 'Brgy. San Juan, Cantil, Oriental Mindoro', '09203148774', 'mahlon.aran@gmail.com', '1972-02-07', 'Mahlon54!', 'Laboratory', 'Diagnostic Lab Work: Fasting Blood Sugar (FBS) & Lipid Panel', null],
            ['Ronalyn Arcemo', '26 / F', 'Mansalay, Oriental Mindoro', '09532248294', 'renalyn.arcemo@gmail.com', '2000-08-16', 'Renalyn26!', 'Medical', 'Acute Pharyngitis Consultation & Antibiotic Evaluation', null],
            ['Kristine Danilaw', '5 / F', 'Bongabong, Oriental Mindoro', '09942467535', 'kristine.danila@gmail.com', '2020-12-12', 'Kristine05!', 'Medical', 'Pediatric Routine Check-up & Deworming Medication', 'Deworming medication'],
            ['Peter Rizardo', '38 / M', 'Mansalay, Oriental Mindoro', '09953415821', 'peter.rizando@gmail.com', '1988-04-23', 'Peter38!', 'Medical', 'Musculoskeletal Sprain Evaluation & Anti-inflammatory Treatment', null],
            ['Delfin Gado', '58 / M', 'Brgy. Dangay, Oriental Mindoro', '09164441679', 'delfin.gado@gmail.com', '1968-01-17', 'Delfin58!', 'Medical', 'Routine Adult Health Audit & Cardiovascular Monitoring', null],
            ['Ronnie Miguel Faderon', '7 / M', 'Brgy. Mabuhay, Roxas, Oriental Mindoro', '09279668489', 'ronniemiguel.faderon@gmail.com', '2019-10-08', 'Ronnie07!', 'Medical', 'Pediatric Growth & Nutrition Assessment', null],
            ['Schne Francisco', '4 / M', 'Brgy. Mansalay, Oriental Mindoro', '0993298272219', 'francisco@gmail.com', '2022-06-01', 'Francisco04!', 'Medical', 'Pediatric Upper Respiratory Tract Evaluation', null],
        ];

        foreach ($patients as $index => $record) {
            [$name, $ageGender, $address, $phone, $email, $dob, $password, $category, $purpose, $medication] = $record;
            $gender = str_contains($ageGender, '/ F') ? 'Female' : 'Male';
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'phone' => $phone,
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
                    'phone' => $phone,
                    'address' => $address,
                    'emergency_contact' => ['name' => 'To be provided', 'phone' => $phone],
                    'medical_notes' => $purpose,
                    'patient_category' => $category,
                    'is_active' => true,
                ]
            );

            $date = $this->dateForIndex($index);
            $start = $date.' '.sprintf('%02d:%02d:00', 8 + ($index % 8), ($index % 2) * 30);
            $end = date('Y-m-d H:i:s', strtotime($start.' +30 minutes'));
            Appointment::updateOrCreate(
                ['patient_id' => $patient->id, 'start_time' => $start],
                [
                    'clinician_id' => $doctor->id,
                    'title' => $purpose,
                    'description' => $purpose,
                    'start_time' => $start,
                    'end_time' => $end,
                    'status' => 'completed',
                    'type' => $category === 'Laboratory' ? 'other' : 'consultation',
                    'location' => 'MediConnect Clinic',
                    'notes' => $medication ? 'Clinical outcome: '.$medication.' prescribed or advised.' : 'Clinical outcome: assessment completed; follow-up as clinically indicated.',
                ]
            );
            $this->createNotifications($patient->user_id, $doctor, $staff, $name, $purpose, $date);

            if ($medication) {
                $this->createPrescription($patient, $doctor, $name, $purpose, $medication, $date);
            }

            if ($category === 'Laboratory') {
                $this->createLabRequest($patient, $doctor, $name, $purpose, $date);
            }
        }
    }

    private function staffAccount(string $email, string $name, string $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'email_verified_at' => now(), 'is_active' => true]
        );
        $user->assignRole($role);
        return $user;
    }

    private function dateForIndex(int $index): string
    {
        if ($index < 10) {
            return '2026-10-19';
        }
        if ($index < 19) {
            return '2026-10-20';
        }
        if ($index < 24) {
            return '2026-10-21';
        }
        if ($index < 32) {
            return '2026-10-22';
        }
        if ($index < 40) {
            return '2026-10-23';
        }
        return '2026-10-24';
    }

    private function createPrescription(Patient $patient, User $doctor, string $name, string $diagnosis, string $medication, string $date): void
    {
        $number = 'RX-2026-OCT-'.str_pad((string) $patient->id, 4, '0', STR_PAD_LEFT);
        Prescription::updateOrCreate(
            ['prescription_number' => $number],
            [
                'patient_id' => $patient->id,
                'patient_name' => $name,
                'prescribed_by' => $doctor->id,
                'doctor_name' => $doctor->name,
                'diagnosis' => $diagnosis,
                'medications' => [[
                    'name' => $medication,
                    'dosage' => 'Use as directed by the attending physician',
                    'frequency' => 'As prescribed',
                    'duration' => 'Per clinical assessment',
                    'instructions' => "Follow the doctor's instructions and return for worsening or persistent symptoms.",
                ]],
                'notes' => 'Prescription generated from the October 2026 consultation record.',
                'status' => 'Active',
                'date_prescribed' => $date,
            ]
        );
    }

    private function createLabRequest(Patient $patient, User $doctor, string $name, string $purpose, string $date): void
    {
        $number = 'LAB-2026-OCT-'.str_pad((string) $patient->id, 4, '0', STR_PAD_LEFT);
        $isCbc = str_contains(strtolower($purpose), 'cbc');
        $results = $isCbc
            ? 'CBC: Hemoglobin and platelet count within expected range; WBC mildly elevated, consistent with recent minor illness. Clinical correlation advised. Urinalysis: clear, negative for glucose and protein, no significant RBC or pus cells.'
            : 'Fasting blood sugar: 102 mg/dL (borderline elevated). Total cholesterol: 198 mg/dL, LDL: 121 mg/dL, HDL: 48 mg/dL, triglycerides: 145 mg/dL. Lifestyle modification and follow-up monitoring advised.';

        LabRequest::updateOrCreate(
            ['request_number' => $number],
            [
                'patient_id' => $patient->id,
                'patient_name' => $name,
                'test_name' => $purpose,
                'category' => $isCbc ? 'Hematology / Urinalysis' : 'Blood Chemistry',
                'requested_by' => $doctor->name,
                'status' => 'Completed',
                'results' => $results,
                'date_requested' => $date,
                'completed_at' => $date.' 15:00:00',
            ]
        );
    }

    private function createNotifications(int $patientUserId, User $doctor, User $staff, string $patientName, string $purpose, string $date): void
    {
        $notifications = [
            [
                'user_id' => $patientUserId,
                'type' => 'appointment_completed',
                'subject' => 'Consultation completed',
                'message' => "Your {$purpose} consultation on {$date} with {$doctor->name} was completed. Check your records for the clinical summary.",
            ],
            [
                'user_id' => $doctor->id,
                'type' => 'patient_consultation',
                'subject' => 'Patient consultation completed',
                'message' => "{$patientName}'s {$purpose} consultation on {$date} is recorded in your patient list.",
            ],
            [
                'user_id' => $staff->id,
                'type' => 'patient_consultation',
                'subject' => 'Patient record updated',
                'message' => "{$patientName}'s {$purpose} visit on {$date} was completed and is available for clinic staff.",
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::firstOrCreate(
                [
                    'user_id' => $notification['user_id'],
                    'type' => $notification['type'],
                    'subject' => $notification['subject'],
                    'message' => $notification['message'],
                ],
                [
                    'channel' => 'in_app',
                    'status' => 'sent',
                    'sent_at' => now(),
                ]
            );
        }
    }
}

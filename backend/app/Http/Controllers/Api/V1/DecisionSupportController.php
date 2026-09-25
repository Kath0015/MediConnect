<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClinicSetting;
use App\Models\Message;
use App\Models\Patient;
use App\Models\PatientDssNote;
use App\Models\User;
use App\Services\DecisionSupportService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DecisionSupportController extends Controller
{
    use ApiResponses;

    protected DecisionSupportService $dssService;

    public function __construct(DecisionSupportService $dssService)
    {
        $this->dssService = $dssService;
    }

    /**
     * Get DSS overview statistics for clinic professionals
     */
    public function overview(): JsonResponse
    {
        try {
            $stats = $this->dssService->getOverviewStats();
            return $this->ok('Decision Support System overview retrieved successfully', $stats);
        } catch (\Exception $e) {
            return $this->error('Failed to load DSS overview: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 1. Symptom-Based Decision Support
     */
    public function analyzeSymptoms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'symptoms' => 'required|array|min:1',
            'symptoms.*' => 'required|string|max:150',
            'severity' => 'nullable|string|in:mild,moderate,severe',
            'duration' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:0|max:150',
            'gender' => 'nullable|string|in:male,female,other',
        ]);

        try {
            $result = $this->dssService->analyzeSymptoms(
                $validated['symptoms'],
                $validated['severity'] ?? 'mild',
                $validated['duration'] ?? null,
                $validated['age'] ?? null,
                $validated['gender'] ?? null
            );

            return $this->ok('Symptom-based decision support analysis generated', $result);
        } catch (\Exception $e) {
            return $this->error('Symptom evaluation failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 2. Laboratory Interpretation
     */
    public function interpretLaboratory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lab_values' => 'required|array|min:1',
            'lab_request_id' => 'nullable|integer',
        ]);

        try {
            $result = $this->dssService->interpretLaboratory(
                $validated['lab_values'],
                $validated['lab_request_id'] ?? null
            );

            return $this->ok('Laboratory interpretation completed', $result);
        } catch (\Exception $e) {
            return $this->error('Lab interpretation failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 3, 4, 5. Comprehensive Patient DSS Assessment
     */
    public function assessPatient(int $patientId): JsonResponse
    {
        try {
            $assessment = $this->dssService->assessPatientDSS($patientId);
            if (isset($assessment['error'])) {
                return $this->error($assessment['error'], 404);
            }

            return $this->ok('Comprehensive patient DSS assessment generated', $assessment);
        } catch (\Exception $e) {
            return $this->error('Patient assessment failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Current authenticated patient's own DSS assessment
     */
    public function myAssessment(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $patient = $user->patient ?? \App\Models\Patient::where('user_id', $user->id)->first();
            if (!$patient) {
                return $this->error('Patient profile not found for this account.', 404);
            }

            $assessment = $this->dssService->assessPatientDSS($patient->id);
            return $this->ok('Personal health assessment loaded successfully', $assessment);
        } catch (\Exception $e) {
            return $this->error('Failed to load your personal assessment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 4. Predictive Analytics across the clinic
     */
    public function predictiveAnalytics(): JsonResponse
    {
        try {
            $analytics = $this->dssService->getPredictiveAnalytics();
            return $this->ok('Predictive analytics and risk profiling loaded', $analytics);
        } catch (\Exception $e) {
            return $this->error('Failed to load predictive analytics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get doctor DSS notes for a patient.
     * If user is patient, returns their own notes.
     * If patient_id is provided, returns notes for that patient.
     */
    public function getDoctorNotes(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $patientId = $request->query('patient_id');

            if (!$patientId) {
                $patient = $user->patient ?? Patient::where('user_id', $user->id)->first();
                if ($patient) {
                    $patientId = $patient->id;
                }
            }

            if (!$patientId) {
                return $this->ok('No patient notes available', []);
            }

            $notes = PatientDssNote::with(['doctor:id,name,email,phone', 'patient.user:id,name,email'])
                ->where('patient_id', $patientId)
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->ok('Doctor DSS notes retrieved successfully', $notes);
        } catch (\Exception $e) {
            return $this->error('Failed to load doctor notes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Doctor sends or suggests a note/recommendation to a patient's DSS
     */
    public function storeDoctorNote(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'note' => 'required|string|max:3000',
            'symptoms' => 'nullable|array',
            'suggested_conditions' => 'nullable|array',
            'suggested_labs' => 'nullable|array',
            'urgency_level' => 'nullable|string|max:50',
            'send_chat_message' => 'nullable|boolean',
        ]);

        try {
            $note = PatientDssNote::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $user->id,
                'note' => $validated['note'],
                'symptoms' => $validated['symptoms'] ?? [],
                'suggested_conditions' => $validated['suggested_conditions'] ?? [],
                'suggested_labs' => $validated['suggested_labs'] ?? [],
                'urgency_level' => $validated['urgency_level'] ?? 'Normal',
                'status' => 'active',
            ]);

            $note->load(['doctor:id,name,email,phone', 'patient.user:id,name,email']);

            // Optionally notify patient in chat
            if ($request->boolean('send_chat_message', true) && $note->patient?->user_id) {
                $doctorName = $user->name ?? 'Your Doctor';
                $chatMsg = "📋 [Clinical DSS Suggestion from Dr. {$doctorName}]:\n\n{$note->note}";
                if (!empty($note->suggested_conditions)) {
                    $chatMsg .= "\n\nSuggested Considerations: " . implode(', ', $note->suggested_conditions);
                }
                if (!empty($note->suggested_labs)) {
                    $chatMsg .= "\nRecommended Tests: " . implode(', ', $note->suggested_labs);
                }
                $chatMsg .= "\n\n(View full details in your Health DSS dashboard)";

                Message::create([
                    'sender_id' => $user->id,
                    'receiver_id' => $note->patient->user_id,
                    'message' => $chatMsg,
                    'is_read' => false,
                ]);
            }

            return $this->ok('Doctor DSS suggestion sent to patient successfully', $note);
        } catch (\Exception $e) {
            return $this->error('Failed to save doctor note: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get notes sent by this doctor
     */
    public function getDoctorSentNotes(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $notes = PatientDssNote::with(['patient.user:id,name,email', 'doctor:id,name,email'])
                ->where('doctor_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return $this->ok('Sent DSS suggestions retrieved', $notes);
        } catch (\Exception $e) {
            return $this->error('Failed to load sent notes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List clinic doctors so patients can connect
     */
    public function getAttendingDoctors(): JsonResponse
    {
        try {
            $doctors = User::whereHas('roles', function ($q) {
                $q->where('name', 'doctor');
            })->where('is_active', true)->select('id', 'name', 'email', 'phone')->get();

            return $this->ok('Doctors retrieved successfully', $doctors);
        } catch (\Exception $e) {
            return $this->error('Failed to load doctors: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Google Sheet raw data sync settings & status
     */
    public function getGoogleSheetSettings(): JsonResponse
    {
        try {
            $meta = $this->dssService->getGoogleSheetSyncMeta();
            return $this->ok('Google Sheet sync settings retrieved', $meta);
        } catch (\Exception $e) {
            return $this->error('Failed to get Google Sheet settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Trigger synchronization with Google Sheet raw data
     */
    public function syncGoogleSheet(Request $request): JsonResponse
    {
        try {
            $customUrl = $request->input('url');
            if (!empty($customUrl)) {
                $setting = ClinicSetting::firstOrCreate([]);
                $setting->update(['dss_google_sheet_url' => $customUrl]);
            }

            $result = $this->dssService->syncGoogleSheetRawData($customUrl);
            return $this->ok('Google Sheet raw clinical data synchronized successfully', $result);
        } catch (\Exception $e) {
            return $this->error('Failed to sync Google Sheet data: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update Google Sheet URL in clinic settings
     */
    public function updateGoogleSheetUrl(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url' => 'nullable|string|max:1000',
        ]);

        try {
            $url = $validated['url'] ?? '';
            $setting = ClinicSetting::firstOrCreate([]);
            $setting->update(['dss_google_sheet_url' => $url]);

            $syncResult = $this->dssService->syncGoogleSheetRawData($url);

            return $this->ok('Google Sheet URL updated and synced', [
                'url' => $url,
                'sync' => $syncResult,
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to update Google Sheet URL: ' . $e->getMessage(), 500);
        }
    }
}

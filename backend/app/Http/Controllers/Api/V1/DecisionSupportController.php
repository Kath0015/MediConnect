<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
}

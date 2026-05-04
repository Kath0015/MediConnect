<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SymptomCheckerController extends Controller
{
    use ApiResponses;
    
    /**
     * AI-based symptom checker that analyzes user symptoms and provides recommendations
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkSymptoms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'symptoms' => 'required|array|min:1',
            'symptoms.*' => 'required|string|max:100',
            'duration' => 'nullable|string|in:less_than_24h,1_to_3_days,4_to_7_days,more_than_7_days',
            'severity' => 'nullable|string|in:mild,moderate,severe',
            'age' => 'nullable|integer|min:1|max:150',
        ]);

        try {
            $analysis = $this->analyzeSymptoms(
                $validated['symptoms'],
                $validated['duration'] ?? null,
                $validated['severity'] ?? null,
                $validated['age'] ?? null
            );

            return $this->ok('Symptom analysis completed', $analysis);
        } catch (\Exception $e) {
            return $this->error('Failed to analyze symptoms: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Main symptom analysis logic with AI-like symptom mapping
     */
    private function analyzeSymptoms(array $symptoms, ?string $duration, ?string $severity, ?int $age): array
    {
        $normalizedSymptoms = array_map('strtolower', $symptoms);

        // Symptom database with possible conditions and recommendations
        $symptomDatabase = $this->getSymptomDatabase();

        // Find possible conditions
        $possibleConditions = $this->findPossibleConditions($normalizedSymptoms, $symptomDatabase);

        // Analyze severity and duration
        $requiresUrgentCare = $this->isUrgent($normalizedSymptoms, $severity, $duration);

        // Generate recommendations
        $recommendations = $this->generateRecommendations(
            $possibleConditions,
            $severity,
            $duration,
            $requiresUrgentCare
        );

        return [
            'symptoms_analyzed' => $symptoms,
            'symptom_count' => count($symptoms),
            'possible_conditions' => $possibleConditions,
            'severity_assessment' => $severity ? ucfirst($severity) : 'Not specified',
            'duration_assessment' => $duration ? str_replace('_', ' ', ucfirst($duration)) : 'Not specified',
            'requires_urgent_care' => $requiresUrgentCare,
            'recommendations' => $recommendations,
            'disclaimer' => 'This is a preliminary assessment based on symptoms provided. Please consult with a healthcare professional for accurate diagnosis.',
        ];
    }

    /**
     * Comprehensive symptom database mapping symptoms to possible conditions
     */
    private function getSymptomDatabase(): array
    {
        return [
            // Cold & Flu
            'cold_symptoms' => [
                'symptoms' => ['cough', 'sore throat', 'runny nose', 'sneezing', 'congestion', 'nasal congestion'],
                'conditions' => [
                    ['name' => 'Common Cold', 'severity' => 'mild', 'confidence' => 90],
                    ['name' => 'Allergies', 'severity' => 'mild', 'confidence' => 70],
                ],
            ],
            'flu_symptoms' => [
                'symptoms' => ['fever', 'body aches', 'fatigue', 'chills', 'cough', 'headache'],
                'conditions' => [
                    ['name' => 'Influenza (Flu)', 'severity' => 'moderate', 'confidence' => 85],
                    ['name' => 'Viral Infection', 'severity' => 'moderate', 'confidence' => 75],
                ],
            ],
            // Gastrointestinal
            'gi_symptoms' => [
                'symptoms' => ['nausea', 'vomiting', 'diarrhea', 'stomach pain', 'abdominal pain', 'indigestion'],
                'conditions' => [
                    ['name' => 'Gastroenteritis', 'severity' => 'moderate', 'confidence' => 80],
                    ['name' => 'Food Poisoning', 'severity' => 'moderate', 'confidence' => 70],
                    ['name' => 'Acid Reflux', 'severity' => 'mild', 'confidence' => 65],
                ],
            ],
            // Headache & Migraine
            'headache_symptoms' => [
                'symptoms' => ['headache', 'migraine', 'head pain', 'light sensitivity', 'sensitivity to light'],
                'conditions' => [
                    ['name' => 'Tension Headache', 'severity' => 'mild', 'confidence' => 80],
                    ['name' => 'Migraine', 'severity' => 'moderate', 'confidence' => 75],
                    ['name' => 'Dehydration', 'severity' => 'mild', 'confidence' => 60],
                ],
            ],
            // Respiratory
            'respiratory_symptoms' => [
                'symptoms' => ['shortness of breath', 'difficulty breathing', 'chest pain', 'wheezing', 'asthma'],
                'conditions' => [
                    ['name' => 'Asthma', 'severity' => 'moderate', 'confidence' => 75],
                    ['name' => 'Bronchitis', 'severity' => 'moderate', 'confidence' => 70],
                    ['name' => 'Pneumonia', 'severity' => 'severe', 'confidence' => 65],
                ],
            ],
            // Allergies
            'allergy_symptoms' => [
                'symptoms' => ['itchy eyes', 'watery eyes', 'itchy nose', 'rash', 'skin rash', 'hives'],
                'conditions' => [
                    ['name' => 'Allergic Reaction', 'severity' => 'mild', 'confidence' => 85],
                    ['name' => 'Hay Fever', 'severity' => 'mild', 'confidence' => 80],
                    ['name' => 'Dermatitis', 'severity' => 'mild', 'confidence' => 70],
                ],
            ],
            // General Symptoms
            'general_symptoms' => [
                'symptoms' => ['fatigue', 'tiredness', 'weakness', 'fever', 'chills', 'sweating'],
                'conditions' => [
                    ['name' => 'General Illness', 'severity' => 'mild', 'confidence' => 60],
                    ['name' => 'Infection', 'severity' => 'moderate', 'confidence' => 65],
                ],
            ],
        ];
    }

    /**
     * Find possible conditions based on symptoms
     */
    private function findPossibleConditions(array $symptoms, array $database): array
    {
        $foundConditions = [];

        foreach ($database as $group) {
            $matchedSymptoms = array_intersect($symptoms, $group['symptoms']);

            if (count($matchedSymptoms) > 0) {
                foreach ($group['conditions'] as $condition) {
                    $matchPercentage = (count($matchedSymptoms) / count($group['symptoms'])) * 100;
                    
                    $signature = $condition['name'];
                    if (!isset($foundConditions[$signature])) {
                        $foundConditions[$signature] = [
                            'name' => $condition['name'],
                            'estimated_severity' => $condition['severity'],
                            'confidence_level' => ceil($condition['confidence'] * ($matchPercentage / 100)),
                            'matched_symptoms' => array_values($matchedSymptoms),
                        ];
                    } else {
                        // Boost confidence if matched again
                        $foundConditions[$signature]['confidence_level'] = min(
                            100,
                            $foundConditions[$signature]['confidence_level'] + 5
                        );
                    }
                }
            }
        }

        // Sort by confidence level and limit results
        usort($foundConditions, function ($a, $b) {
            return $b['confidence_level'] <=> $a['confidence_level'];
        });

        return array_slice(array_values($foundConditions), 0, 5);
    }

    /**
     * Determine if symptoms require urgent care
     */
    private function isUrgent(array $symptoms, ?string $severity, ?string $duration): bool
    {
        $urgentSymptoms = [
            'chest pain',
            'difficulty breathing',
            'shortness of breath',
            'severe headache',
            'loss of consciousness',
            'severe bleeding',
            'poisoning',
            'seizure',
            'anaphylaxis',
            'severe allergic reaction',
        ];

        $hasUrgentSymptom = count(array_intersect($symptoms, $urgentSymptoms)) > 0;
        $hasSeverity = $severity === 'severe';

        return $hasUrgentSymptom || $hasSeverity;
    }

    /**
     * Generate actionable recommendations based on analysis
     */
    private function generateRecommendations(array $conditions, ?string $severity, ?string $duration, bool $urgent): array
    {
        $recommendations = [];

        if ($urgent) {
            $recommendations[] = [
                'type' => 'urgent',
                'action' => 'Seek Emergency Care',
                'description' => 'Your symptoms suggest a potentially serious condition. Please visit an emergency room or call an ambulance immediately.',
                'priority' => 'CRITICAL',
            ];
            return $recommendations;
        }

        // Home Care Recommendations
        $recommendations[] = [
            'type' => 'home_care',
            'action' => 'Home Care Management',
            'description' => 'Rest, stay hydrated, and monitor your symptoms. Over-the-counter pain relievers may help reduce discomfort.',
            'priority' => 'HIGH',
        ];

        // Laboratory Tests
        if (count($conditions) > 0 && $conditions[0]['confidence_level'] >= 70) {
            $recommendations[] = [
                'type' => 'laboratory',
                'action' => 'Request Laboratory Tests',
                'description' => 'Based on your symptoms, consider scheduling laboratory tests to confirm diagnosis. Available tests include: Complete Blood Count (CBC), Blood Cultures, Throat Swab.',
                'tests' => ['Complete Blood Count (CBC)', 'Rapid Diagnostic Test', 'Blood Culture'],
                'priority' => 'MEDIUM',
            ];
        }

        // Consultation
        if (count($conditions) > 0) {
            $recommendations[] = [
                'type' => 'consultation',
                'action' => 'Schedule a Consultation',
                'description' => 'Consult with a healthcare professional for a thorough evaluation and proper diagnosis. They can provide personalized treatment recommendations.',
                'specialist' => $this->suggestSpecialist($conditions[0]['name']),
                'priority' => 'MEDIUM',
            ];
        }

        // Monitoring
        $recommendations[] = [
            'type' => 'monitoring',
            'action' => 'Monitor Your Symptoms',
            'description' => 'Keep track of your symptoms. Contact a healthcare provider if symptoms worsen or new symptoms develop.',
            'priority' => 'LOW',
        ];

        return $recommendations;
    }

    /**
     * Suggest appropriate medical specialist based on condition
     */
    private function suggestSpecialist(string $condition): string
    {
        $specialists = [
            'Common Cold' => 'General Practitioner',
            'Influenza' => 'General Practitioner',
            'Gastroenteritis' => 'Gastroenterologist',
            'Food Poisoning' => 'Gastroenterologist',
            'Migraine' => 'Neurologist',
            'Asthma' => 'Pulmonologist',
            'Bronchitis' => 'Pulmonologist',
            'Pneumonia' => 'Pulmonologist',
            'Allergic Reaction' => 'Allergist',
            'Dermatitis' => 'Dermatologist',
        ];

        return $specialists[$condition] ?? 'General Practitioner';
    }
}

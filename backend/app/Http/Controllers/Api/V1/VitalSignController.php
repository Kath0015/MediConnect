<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PatientVital;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VitalSignController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientVital::query()->with('patient.user');

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('patient_name', 'like', "%{$search}%");
        }

        $vitals = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $vitals,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|exists:patients,id',
            'blood_pressure' => 'nullable|string|max:20',
            'heart_rate' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'respiratory_rate' => 'nullable|integer',
            'oxygen_saturation' => 'nullable|integer',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'recorded_by' => 'nullable|string|max:255',
        ]);

        if (empty($validated['recorded_by'])) {
            $validated['recorded_by'] = $request->user()?->name ?? 'Clinician';
        }

        // Calculate BMI if height and weight provided
        if (!empty($validated['weight']) && !empty($validated['height'])) {
            $heightInM = $validated['height'] / 100;
            if ($heightInM > 0) {
                $validated['bmi'] = round($validated['weight'] / ($heightInM * $heightInM), 1);
            }
        }

        $validated['recorded_at'] = now();

        $vital = PatientVital::create($validated);

        return response()->json($vital, Response::HTTP_CREATED);
    }

    public function show($id)
    {
        $vital = PatientVital::with('patient.user')->findOrFail($id);
        return response()->json($vital);
    }
}

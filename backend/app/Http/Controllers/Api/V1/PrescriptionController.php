<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::query()->with(['patient.user', 'doctor']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('doctor_name', 'like', "%{$search}%")
                  ->orWhere('prescription_number', 'like', "%{$search}%")
                  ->orWhere('diagnosis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $user = $request->user();
        if ($user && $user->role === 'patient') {
            $patient = $user->patient;
            if ($patient) {
                $query->where(function ($q) use ($patient, $user) {
                    $q->where('patient_id', $patient->id)
                      ->orWhere('patient_name', 'like', "%{$user->name}%");
                });
            }
        } elseif ($user && $user->role === 'doctor') {
            // Doctors can see all or their own
            if ($request->boolean('my_prescriptions')) {
                $query->where('prescribed_by', $user->id);
            }
        }

        $prescriptions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $prescriptions,
            'summary' => [
                'total' => Prescription::count(),
                'active' => Prescription::where('status', 'Active')->count(),
                'completed' => Prescription::where('status', 'Completed')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|exists:patients,id',
            'doctor_name' => 'nullable|string|max:255',
            'diagnosis' => 'required|string|max:500',
            'medications' => 'required|array',
            'medications.*.name' => 'required|string',
            'medications.*.dosage' => 'nullable|string',
            'medications.*.frequency' => 'nullable|string',
            'medications.*.duration' => 'nullable|string',
            'medications.*.instructions' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Completed,Discontinued',
            'date_prescribed' => 'nullable|date',
        ]);

        $user = $request->user();
        $validated['prescribed_by'] = $user?->id;
        if (empty($validated['doctor_name'])) {
            $validated['doctor_name'] = $user ? 'Dr. ' . $user->name : 'Dr. Attending Physician';
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'Active';
        }
        if (empty($validated['date_prescribed'])) {
            $validated['date_prescribed'] = now()->toDateString();
        }

        $count = Prescription::count();
        $validated['prescription_number'] = 'RX-' . date('Y') . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        $prescription = Prescription::create($validated);

        return response()->json($prescription, Response::HTTP_CREATED);
    }

    public function show(Prescription $prescription)
    {
        return response()->json($prescription->load(['patient.user', 'doctor']));
    }

    public function update(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'diagnosis' => 'sometimes|string|max:500',
            'medications' => 'sometimes|array',
            'notes' => 'nullable|string',
            'status' => 'sometimes|string|in:Active,Completed,Discontinued',
        ]);

        $prescription->update($validated);

        return response()->json($prescription);
    }

    public function destroy(Prescription $prescription)
    {
        $prescription->delete();

        return response()->json(['message' => 'Prescription deleted successfully']);
    }
}

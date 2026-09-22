<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LabRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LabRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = LabRequest::query()->with('patient.user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('test_name', 'like', "%{$search}%")
                  ->orWhere('request_number', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
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
        }

        $labs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $labs,
            'summary' => [
                'total' => LabRequest::count(),
                'pending' => LabRequest::where('status', 'Pending')->count(),
                'completed' => LabRequest::where('status', 'Completed')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|exists:patients,id',
            'test_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'requested_by' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Pending,Processing,Completed,Cancelled',
            'results' => 'nullable|string',
            'date_requested' => 'nullable|date',
        ]);

        $user = $request->user();
        if (empty($validated['requested_by'])) {
            $validated['requested_by'] = $user ? 'Dr. ' . $user->name : 'Attending Physician';
        }
        if (empty($validated['category'])) {
            $validated['category'] = 'Hematology';
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'Pending';
        }
        if (empty($validated['date_requested'])) {
            $validated['date_requested'] = now()->toDateString();
        }

        $count = LabRequest::count();
        $validated['request_number'] = 'LAB-' . date('Y') . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        $lab = LabRequest::create($validated);

        return response()->json($lab, Response::HTTP_CREATED);
    }

    public function show(LabRequest $labRequest)
    {
        return response()->json($labRequest->load('patient.user'));
    }

    public function update(Request $request, LabRequest $labRequest)
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:Pending,Processing,Completed,Cancelled',
            'results' => 'nullable|string',
            'category' => 'sometimes|string|max:100',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'Completed' && !$labRequest->completed_at) {
            $validated['completed_at'] = now();
        }

        $labRequest->update($validated);

        return response()->json($labRequest);
    }

    public function destroy(LabRequest $labRequest)
    {
        $labRequest->delete();

        return response()->json(['message' => 'Lab request deleted successfully']);
    }
}

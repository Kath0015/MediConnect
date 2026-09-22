<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CheckInController extends Controller
{
    public function index(Request $request)
    {
        $query = CheckIn::query();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('queue_number', 'like', "%{$search}%");
            });
        }

        $checkIns = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $checkIns,
            'summary' => [
                'waiting' => CheckIn::where('status', 'Waiting')->count(),
                'in_consultation' => CheckIn::where('status', 'In Consultation')->count(),
                'done' => CheckIn::where('status', 'Done')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|exists:patients,id',
            'purpose' => 'nullable|string|max:255',
        ]);

        $todayCount = CheckIn::whereDate('created_at', now()->toDateString())->count();
        $validated['queue_number'] = 'Q-' . str_pad($todayCount + 1, 3, '0', STR_PAD_LEFT);
        $validated['status'] = 'Waiting';
        $validated['checked_in_at'] = now();

        $checkIn = CheckIn::create($validated);

        return response()->json($checkIn, Response::HTTP_CREATED);
    }

    public function updateStatus(Request $request, $id)
    {
        $checkIn = CheckIn::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string|in:Waiting,In Consultation,Done',
        ]);

        $checkIn->update($validated);

        return response()->json($checkIn);
    }

    public function destroy($id)
    {
        $checkIn = CheckIn::findOrFail($id);
        $checkIn->delete();

        return response()->json(['message' => 'Check-in removed successfully']);
    }
}

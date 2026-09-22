<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query()->with('patient.user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('invoice_number', 'like', "%{$search}%")
                  ->orWhere('service', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // If patient role, optionally scope to their patient record
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

        $invoices = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $invoices,
            'summary' => [
                'total_revenue' => (float) Invoice::where('status', 'Paid')->sum('amount'),
                'unpaid_count' => Invoice::where('status', 'Unpaid')->count(),
                'pending_count' => Invoice::where('status', 'Pending')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|exists:patients,id',
            'service' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:Paid,Unpaid,Pending',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'cashier' => 'nullable|string|max:100',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'Paid';
        }

        if (empty($validated['date'])) {
            $validated['date'] = now()->toDateString();
        }

        // Generate invoice number
        $lastId = Invoice::max('id') ?? 0;
        $validated['invoice_number'] = 'INV-' . str_pad($lastId + 1, 3, '0', STR_PAD_LEFT);

        if (empty($validated['cashier'])) {
            $validated['cashier'] = $request->user()?->name ?? 'Staff';
        }

        if (empty($validated['reference_number']) && ($validated['payment_method'] ?? '') !== '') {
            $validated['reference_number'] = strtoupper($validated['payment_method']) . '-' . substr(time(), -6);
        }

        $invoice = Invoice::create($validated);

        return response()->json($invoice, Response::HTTP_CREATED);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('patient.user'));
    }

    public function markPaid(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $validated = $request->validate([
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
        ]);

        $invoice->update([
            'status' => 'Paid',
            'payment_method' => $validated['payment_method'] ?? ($invoice->payment_method ?: 'Cash'),
            'reference_number' => $validated['reference_number'] ?? ($invoice->reference_number ?: 'REC-' . substr(time(), -6)),
        ]);

        return response()->json($invoice);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}

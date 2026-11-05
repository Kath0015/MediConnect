<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Clinical Summary</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; }
        h1 { color: #5b21b6; margin-bottom: 4px; }
        h2 { border-bottom: 1px solid #d1d5db; padding-bottom: 5px; margin-top: 24px; }
        .muted { color: #6b7280; }
        .section { margin-top: 16px; }
        .label { font-weight: bold; color: #4b5563; }
    </style>
</head>
<body>
    <h1>Pareñas Medical Clinic</h1>
    <p class="muted">Clinical Consultation Summary</p>
    <h2>Patient and Consultation</h2>
    <p><span class="label">Patient:</span> {{ $appointment->patient?->user?->name ?? 'Unknown patient' }}</p>
    <p><span class="label">Doctor:</span> {{ $appointment->clinician?->name ?? 'Attending physician' }}</p>
    <p><span class="label">Date:</span> {{ optional($appointment->start_time)->format('F d, Y h:i A') }}</p>
    <p><span class="label">Status:</span> {{ ucfirst($appointment->status) }}</p>
    <div class="section">
        <p class="label">Diagnosis / Consultation Purpose</p>
        <p>{{ $appointment->title ?: $appointment->description ?: 'Clinical consultation' }}</p>
    </div>
    <div class="section">
        <p class="label">Clinical Notes / Treatment Plan</p>
        <p>{{ $appointment->notes ?: $appointment->description ?: 'Follow-up as clinically indicated.' }}</p>
    </div>
</body>
</html>

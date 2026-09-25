{{-- resources/views/med-certs/pdf.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Medical Certificate - {{ $medCert->certificate_number }}</title>
    <style>
        @page {
            margin: 25mm 20mm 20mm 20mm;
            size: a4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .cert-container {
            border: 3px double #0284c7;
            padding: 30px;
            background: #ffffff;
            position: relative;
        }
        .clinic-header {
            text-align: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .clinic-name {
            font-size: 22px;
            font-weight: bold;
            color: #0369a1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
        }
        .clinic-sub {
            font-size: 11px;
            color: #64748b;
            margin: 4px 0 0 0;
        }
        .cert-title-box {
            text-align: center;
            margin: 20px 0;
        }
        .cert-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
            display: inline-block;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 4px;
        }
        .cert-number {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            margin-top: 5px;
        }
        .salutation {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin: 25px 0 15px 0;
        }
        .body-text {
            font-size: 13px;
            text-align: justify;
            margin-bottom: 18px;
            line-height: 1.8;
        }
        .highlight {
            font-weight: bold;
            color: #0f172a;
            text-decoration: underline;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .details-table td {
            padding: 8px 12px;
            font-size: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .details-table td.label {
            font-weight: bold;
            color: #475569;
            width: 32%;
            background: #f1f5f9;
        }
        .details-table td.value {
            color: #0f172a;
            font-weight: 600;
        }
        .recommendations-box {
            margin: 20px 0;
            padding: 12px 15px;
            background: #f0fdf4;
            border-left: 4px solid #16a34a;
            border-radius: 4px;
        }
        .recommendations-box p {
            margin: 0;
            font-size: 12px;
            color: #166534;
        }
        .signatures-area {
            margin-top: 45px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 250px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1.5px solid #0f172a;
            margin-bottom: 5px;
            height: 40px;
        }
        .physician-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
        }
        .physician-title {
            font-size: 11px;
            color: #64748b;
            margin: 2px 0 0 0;
        }
        .footer-note {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="cert-container">
        <!-- Clinic Header -->
        <div class="clinic-header">
            <h1 class="clinic-name">{{ config('app.name', 'Pareñas Medical Clinic') }}</h1>
            <p class="clinic-sub">Comprehensive Healthcare & Clinical Services • Certified Medical Record</p>
        </div>

        <!-- Title & Certificate Number -->
        <div class="cert-title-box">
            <h2 class="cert-title">Medical Certificate</h2>
            <div class="cert-number">Certificate No: <strong>{{ $medCert->certificate_number }}</strong></div>
        </div>

        <!-- Salutation -->
        <div class="salutation">TO WHOM IT MAY CONCERN:</div>

        <!-- Main Body -->
        <div class="body-text">
            This is to certify that <span class="highlight">{{ $medCert->patient?->user?->name ?? 'the patient' }}</span>,
            @if($medCert->patient?->age)
                <span class="highlight">{{ $medCert->patient->age }}</span> years of age,
            @endif
            @if($medCert->patient?->gender)
                <span class="highlight">{{ ucfirst($medCert->patient->gender) }}</span>,
            @endif
            was examined and evaluated at this clinic for <span class="highlight">{{ $medCert->type ?? 'Medical Consultation' }}</span>.
        </div>

        <!-- Details Summary Table -->
        <table class="details-table">
            <tr>
                <td class="label">Patient Name:</td>
                <td class="value">{{ $medCert->patient?->user?->name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Medical Reason / Purpose:</td>
                <td class="value">{{ $medCert->purpose ?? $medCert->medical_reason ?? 'Medical Evaluation' }}</td>
            </tr>
            <tr>
                <td class="label">Period Covered:</td>
                <td class="value">
                    {{ $medCert->start_date ? $medCert->start_date->format('F j, Y') : 'N/A' }}
                    to
                    {{ $medCert->end_date ? $medCert->end_date->format('F j, Y') : 'N/A' }}
                    ({{ $medCert->duration_days ?? 1 }} day/s)
                </td>
            </tr>
            <tr>
                <td class="label">Status:</td>
                <td class="value" style="color: #16a34a; text-transform: uppercase;">{{ $medCert->status ?? 'Approved' }}</td>
            </tr>
            @if($medCert->pickup_date)
            <tr>
                <td class="label">Date of Pickup / Release:</td>
                <td class="value">{{ \Carbon\Carbon::parse($medCert->pickup_date)->format('F j, Y') }}</td>
            </tr>
            @endif
        </table>

        <!-- Recommendations -->
        @if($medCert->recommendations)
        <div class="recommendations-box">
            <p><strong>Physician's Remarks & Recommendations:</strong></p>
            <p style="margin-top: 4px;">{{ $medCert->recommendations }}</p>
        </div>
        @endif

        <!-- Closing Remark -->
        <div class="body-text" style="margin-top: 15px;">
            This medical certificate is issued upon the request of the above-named patient for whatever legal or official purpose it may serve.
        </div>

        <!-- Signature Section -->
        <div class="signatures-area">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p class="physician-name">
                    {{ $medCert->approver?->name ? 'Dr. ' . $medCert->approver->name : 'Attending Physician, M.D.' }}
                </p>
                <p class="physician-title">Licensed Physician / Clinic Authority</p>
                <p class="physician-title">Date: {{ $medCert->approved_at ? $medCert->approved_at->format('F j, Y') : now()->format('F j, Y') }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer-note">
            This is an official clinical document generated by {{ config('app.name', 'Pareñas Medical Clinic') }}. Valid without physical seal when verified in system.
        </div>
    </div>
</body>
</html>
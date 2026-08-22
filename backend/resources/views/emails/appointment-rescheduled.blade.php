<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Rescheduled</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #01377D;
            margin-bottom: 10px;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 8px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 12px;
            font-size: 15px;
        }
        .detail-label {
            font-weight: 600;
            color: #01377D;
            width: 140px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #555;
        }
        .status-box {
            background-color: #e0f2fe;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #0f172a;
        }
        .footer {
            background-color: #f0f0f0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Rescheduled</h1>
        </div>

        <div class="content">
            <p>Hi {{ $patientName }},</p>

            <p>Your appointment has been updated by the clinic staff. Please review the new schedule below.</p>

            <div class="status-box">
                <strong>Status:</strong> Appointment rescheduled
            </div>

            @if ($oldAppointmentDate && $oldAppointmentTime)
            <div class="section">
                <div class="section-title">Previous Schedule</div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ $oldAppointmentDate }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{ $oldAppointmentTime }}</span>
                </div>
            </div>
            @endif

            <div class="section">
                <div class="section-title">New Appointment Details</div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">{{ $appointmentType }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ $newAppointmentDate ?? 'TBD' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{ $newAppointmentTime ?? 'TBD' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ $appointmentLocation }}</span>
                </div>
            </div>

            <p>If you have questions or need to request another change, please contact the clinic.</p>

            <p>
                Best regards,<br>
                <strong>Clinic and Laboratory</strong>
            </p>
        </div>

        <div class="footer">
            <p>This is an automated message from Clinic and Laboratory. Please do not reply directly to this email if you're using an email system that doesn't support replies.</p>
            <p>&copy; {{ date('Y') }} Clinic and Laboratory. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

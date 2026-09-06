<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #009DD1;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #01377D;
        }
        .content {
            margin: 20px 0;
            line-height: 1.6;
        }
        .appointment-details {
            background-color: #f5f5f5;
            border-left: 4px solid #009DD1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #01377D;
        }
        .status-badge {
            background-color: #fff3cd;
            color: #856404;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin: 10px 0;
            display: inline-block;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #009DD1;
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 4px;
            text-decoration: none;
            margin: 15px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MediConnect</div>
            <p>Appointment Request Received</p>
        </div>

        <div class="content">
            <p>Hello {{ $patient?->name ?? 'Valued Patient' }},</p>

            <p>Thank you for scheduling an appointment with us! We have received your appointment request and will review it shortly.</p>

            <div class="appointment-details">
                <div class="detail-row">
                    <span class="label">Appointment Type:</span>
                    <span>{{ $appointment->appointmentType?->name ?? $appointment->type ?? 'Not specified' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Requested Date:</span>
                    <span>{{ $appointment->start_time?->format('F j, Y') ?? 'Not specified' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Requested Time:</span>
                    <span>{{ $appointment->start_time?->format('g:i A') ?? 'Not specified' }}</span>
                </div>
                @if($appointment->clinician)
                <div class="detail-row">
                    <span class="label">Preferred Physician:</span>
                    <span>{{ $appointment->clinician->name }}</span>
                </div>
                @endif
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="status-badge">Pending Review</span>
                </div>
            </div>

            <p><strong>What's Next?</strong></p>
            <p>Our clinic staff will review your appointment request and will confirm or suggest alternative times if the requested slot is unavailable. You will receive a confirmation email once your appointment is approved.</p>

            <p><strong>Typical Response Time:</strong> We will respond to your appointment request within 24 hours during business days.</p>

            <p>If you need to reschedule or have any questions, please reply to this email or contact us directly.</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} MediConnect. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>

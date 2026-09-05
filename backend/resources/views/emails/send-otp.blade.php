<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Medical Clinic Account</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #009DD1 0%, #0077A8 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .greeting strong {
            color: #009DD1;
        }
        .info-box {
            background-color: #f0f7fb;
            border-left: 4px solid #009DD1;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 10px 0;
            font-size: 14px;
            color: #555;
        }
        .otp-box {
            background-color: #ecf4f8;
            border: 2px dashed #009DD1;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
            border-radius: 6px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #009DD1;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .otp-instructions {
            font-size: 13px;
            color: #666;
            margin-top: 15px;
            line-height: 1.8;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
        }
        .footer p {
            margin: 5px 0;
        }
        .clinic-name {
            color: #009DD1;
            font-weight: 600;
        }
        hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏥 Medical Clinic</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Account Verification</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                Hello <strong>{{ $patientName }}</strong>,
            </div>

            <!-- Main message -->
            <p style="font-size: 15px; color: #333; margin-bottom: 20px;">
                Thank you for registering with our Medical Clinic patient portal. To complete your account registration and verify your email address, please use the One-Time Password (OTP) code below.
            </p>

            <!-- OTP Box -->
            <div class="otp-box">
                <div style="font-size: 13px; color: #666; margin-bottom: 10px;">Your Verification Code:</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-instructions">
                    <strong>This code will expire in {{ $expirationTime }}</strong><br>
                    Do not share this code with anyone.
                </div>
            </div>

            <!-- Instructions -->
            <div class="info-box">
                <p><strong>How to use your OTP:</strong></p>
                <p>1. Return to the registration page</p>
                <p>2. Paste the 7-character code above into the OTP field</p>
                <p>3. Click "Verify Email & Create Account"</p>
                <p>4. Your account will be created and activated immediately</p>
            </div>

            <!-- Warning -->
            <div class="warning">
                <strong>⚠️ Important:</strong> If you did not initiate this registration, please disregard this email. Do not share your OTP code with anyone. The Medical Clinic will never ask for your verification code via email or phone.
            </div>

            <!-- Additional info -->
            <p style="font-size: 13px; color: #666; margin-top: 20px; line-height: 1.6;">
                <strong>What's Next?</strong><br>
                Once you've verified your email and created your account, you'll be able to:
            </p>
            <ul style="font-size: 13px; color: #666; margin: 10px 0; padding-left: 20px;">
                <li>Book and manage medical appointments</li>
                <li>View your medical records</li>
                <li>Communicate with doctors and clinic staff</li>
                <li>Request medical certificates</li>
                <li>Access lab results and prescriptions</li>
            </ul>

            <hr>

            <!-- Support -->
            <p style="font-size: 13px; color: #666; margin-top: 20px;">
                <strong>Need Help?</strong><br>
                If you have any questions or need assistance, please contact our support team at 
                <strong style="color: #009DD1;">support@medicalclinic.com</strong> or call us during business hours.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Medical Clinic Patient Portal</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="margin-top: 15px; color: #bbb;">
                © {{ date('Y') }} Medical Clinic. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>

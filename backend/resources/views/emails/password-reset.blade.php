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
        .button {
            display: inline-block;
            background-color: #009DD1;
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 4px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MediConnect</div>
            <p>Password Reset Request</p>
        </div>

        <div class="content">
            <p>Hello {{ $user->name }},</p>

            <p>We received a request to reset your MediConnect password. Click the button below to create a new password:</p>

            <center>
                <a href="{{ $resetUrl }}" class="button">Reset Your Password</a>
            </center>

            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                {{ $resetUrl }}
            </p>

            <div class="warning">
                <strong>Security Notice:</strong> This password reset link will expire in {{ $expiresIn }}. If you did not request a password reset, please ignore this email or contact support immediately.
            </div>

            <p>If you did not request this password reset, please disregard this email. Your account will remain secure.</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} MediConnect. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useBranding } from "../../contexts/BrandingContext";
import api from "../../api/axios";

export const PatientOTPVerification = () => {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(600); // 10 minutes

  // Get registration data and email from location state
  const registrationData = location.state?.registrationData;
  const email = location.state?.email;

  const displayBrand = branding?.brandName;
  const displayBrandLabel = displayBrand || "Medical Clinic";

  // Redirect if no registration data
  useEffect(() => {
    if (!registrationData || !email) {
      toast.error("Please complete the registration form first");
      navigate("/auth/patient/register");
    }
  }, [registrationData, email, navigate]);

  // Expiry timer countdown (10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setExpiryTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("OTP has expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Resend timer countdown (1 minute)
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (resendTimer === 0 && !canResend && loading === false && resending === false) {
      setCanResend(true);
    }
  }, [resendTimer, canResend, loading, resending]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters and limit to 7
    const filtered = value.replace(/[^A-Z0-9]/g, "").slice(0, 7);
    setOtp(filtered);

    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }
  };

  const validateOTP = () => {
    if (!otp.trim()) {
      setOtpError("OTP is required");
      return false;
    }

    if (otp.length !== 7) {
      setOtpError("OTP must be 7 characters long");
      return false;
    }

    return true;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!validateOTP()) {
      return;
    }

    if (expiryTimer === 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      // Send OTP verification request
      const response = await api.post("/auth/patient/verify-otp", {
        ...registrationData,
        otp: otp.trim(),
      });

      if (response.data.success || response.status === 200) {
        toast.success(response.data.data.message);

        // Redirect to login page
        setTimeout(() => {
          navigate("/auth/login", {
            state: { email: email, message: "Account created successfully! Please log in." },
          });
        }, 1500);
      } else {
        setOtpError(response.data.message || "OTP verification failed");
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      // Show specific error messages
      if (errorMessage.includes("already been used")) {
        setOtpError("This OTP has already been used. Please request a new one.");
      } else if (errorMessage.includes("expired")) {
        setOtpError("This OTP has expired. Please request a new one.");
      } else if (errorMessage.includes("Invalid")) {
        setOtpError("Invalid OTP. Please check the code sent to your email.");
      } else {
        setOtpError(errorMessage || "OTP verification failed");
      }

      toast.error(errorMessage || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    setResending(true);

    try {
      const response = await api.post("/auth/patient/resend-otp", {
        email: email,
        first_name: registrationData.first_name,
      });

      if (response.data.success || response.status === 200) {
        toast.success("New OTP sent to your email");
        setOtp(""); // Clear the OTP field
        setOtpError(""); // Clear any errors
        setCanResend(false); // Disable resend button
        setResendTimer(60); // Start 1-minute cooldown
        setExpiryTimer(600); // Reset 10-minute expiry
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      const waitSeconds = error.response?.data?.data?.wait_seconds;

      if (waitSeconds) {
        setResendTimer(waitSeconds);
        setCanResend(false);
        toast.error(`Please wait ${waitSeconds} seconds before resending`);
      } else {
        toast.error(errorMessage || "Failed to resend OTP");
      }
    } finally {
      setResending(false);
    }
  };

  if (!registrationData || !email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <Link to="/" className="flex items-center gap-2">
              {branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={`${displayBrand} logo`}
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <Activity className="w-8 h-8 text-[#009DD1]" />
              )}
              <span className="hidden sm:inline text-lg font-bold text-[#01377D]">
                {displayBrandLabel}
              </span>
            </Link>

            <button
              onClick={() => navigate("/auth/patient/register")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#009DD1] hover:text-[#0077A8] font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <Card className="w-full max-w-md shadow-lg bg-white rounded-2xl border-slate-200">
          <CardHeader className="text-center pb-4 border-b border-slate-100">
            <div className="mb-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#009DD1]/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#009DD1]" />
              </div>
            </div>
            <CardTitle className="text-[#01377D] font-bold text-2xl">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              We've sent a verification code to:
            </CardDescription>
            <p className="text-sm font-semibold text-[#009DD1] mt-1 break-all">{email}</p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-[#01377D] text-sm font-medium">
                  Enter 7-Character Verification Code *
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="ABC1234"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="7"
                  className={`text-center text-lg font-semibold tracking-widest border rounded-lg uppercase ${
                    otpError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:ring-[#009DD1]"
                  }`}
                  disabled={loading || expiryTimer === 0}
                />
                {otpError && (
                  <p className="text-red-500 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {otpError}
                  </p>
                )}
              </div>

              {/* Expiry Timer */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#009DD1] flex-shrink-0" />
                <span className="text-sm text-slate-700">
                  {expiryTimer > 0 ? (
                    <>
                      Code expires in <strong>{formatTime(expiryTimer)}</strong>
                    </>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Code has expired. Please request a new one.
                    </span>
                  )}
                </span>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={loading || expiryTimer === 0 || otp.length !== 7}
                className="w-full bg-[#009DD1] text-white py-3 rounded-lg font-semibold hover:bg-[#0077A8] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Email & Create Account
                  </>
                )}
              </Button>

              {/* Resend OTP Section */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-center text-sm text-slate-600 mb-3">
                  Didn't receive the code?
                </p>
                <div className="flex flex-col items-center gap-2">
                  {canResend && expiryTimer > 0 ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-[#009DD1] hover:text-[#0077A8] font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                          Resending...
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-500 text-xs">
                        Resend available in <strong>{formatTime(resendTimer)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-slate-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Each OTP can only be used once. If you don't use it within 10 minutes, you'll need to request a new one.
                  </span>
                </p>
              </div>
            </form>

            {/* Troubleshooting */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">Common Issues:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Check your spam/junk folder if you don't see the email</li>
                <li>• Make sure you entered the email correctly</li>
                <li>• OTP codes are case-sensitive (uppercase letters)</li>
                <li>• Try requesting a new OTP if it's taking too long</li>
              </ul>
            </div>

            {/* Back Link */}
            <p className="text-center text-slate-600 text-sm mt-6">
              Want to change your email?{" "}
              <button
                onClick={() => navigate("/auth/patient/register")}
                className="text-[#009DD1] font-semibold hover:underline"
              >
                Go back and edit
              </button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} {displayBrandLabel}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PatientOTPVerification;

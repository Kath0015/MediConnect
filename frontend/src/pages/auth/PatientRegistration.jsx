import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Activity, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useBranding } from "../../contexts/BrandingContext";
import api from "../../api/axios";

export const PatientRegistration = () => {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    date_of_birth: "",
    sex: "",
    address: "",
    password: "",
    password_confirmation: "",
    emergency_contact: [],
  });

  const displayBrand = branding?.brandName;
  const displayShortBrand = branding?.shortBrandName || branding?.shortBrand;
  const displayBrandLabel = displayBrand || "Medical Clinic";
  const displayShortBrandLabel = displayShortBrand || "Medical Clinic";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate first name
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    } else if (formData.first_name.length > 50) {
      errors.first_name = "First name cannot exceed 50 characters";
    }

    // Validate last name
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    } else if (formData.last_name.length > 50) {
      errors.last_name = "Last name cannot exceed 50 characters";
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate contact number
    if (!formData.contact_number.trim()) {
      errors.contact_number = "Contact number is required";
    }

    // Validate date of birth
    if (!formData.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    } else {
      const dob = new Date(formData.date_of_birth);
      if (dob >= new Date()) {
        errors.date_of_birth = "Date of birth must be in the past";
      }
    }

    // Validate sex (optional but if provided, must be valid)
    if (formData.sex && !["Male", "Female", "Other"].includes(formData.sex)) {
      errors.sex = "Please select a valid option";
    }

    // Validate address
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    } else if (formData.address.length > 500) {
      errors.address = "Address cannot exceed 500 characters";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    // Validate password confirmation
    if (!formData.password_confirmation) {
      errors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Send registration data and OTP
      const response = await api.post("/auth/patient/register", formData);

      if (response.data.success || response.status === 200) {
        toast.success(response.data.data.message);
        
        // Navigate to OTP verification page with registration data
        navigate("/auth/patient/verify-otp", {
          state: {
            registrationData: formData,
            email: formData.email,
          },
        });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      
      // Handle specific validation errors from server
      if (error.response?.data?.data) {
        setValidationErrors(error.response.data.data);
      }

      toast.error(errorMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <span className="sm:hidden text-sm font-semibold text-[#01377D]">
                {displayShortBrandLabel}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/auth/login"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#009DD1] hover:text-[#0077A8] font-medium transition-all duration-300"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <Card className="w-full max-w-4xl shadow-lg bg-white rounded-2xl border-slate-200">
          <CardHeader className="text-center pb-4 border-b border-slate-100">
            <CardTitle className="text-[#01377D] font-bold text-2xl">
              Create Patient Account
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Create your account to access the patient portal
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#01377D] mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#009DD1] text-white text-sm font-bold">
                    1
                  </span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="text-[#01377D] text-sm font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="Juan"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`border rounded-lg ${
                        validationErrors.first_name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    />
                    {validationErrors.first_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="text-[#01377D] text-sm font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Dela Cruz"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`border rounded-lg ${
                        validationErrors.last_name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    />
                    {validationErrors.last_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[#01377D] text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="juan@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`border rounded-lg ${
                        validationErrors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contact_number" className="text-[#01377D] text-sm font-medium">
                      Contact Number *
                    </Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      type="tel"
                      placeholder="09171234567"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className={`border rounded-lg ${
                        validationErrors.contact_number
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    />
                    {validationErrors.contact_number && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.contact_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth & Sex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date_of_birth" className="text-[#01377D] text-sm font-medium">
                      Date of Birth *
                    </Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`border rounded-lg ${
                        validationErrors.date_of_birth
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    />
                    {validationErrors.date_of_birth && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.date_of_birth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sex" className="text-[#01377D] text-sm font-medium">
                      Sex
                    </Label>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.sex
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-[#009DD1]"
                      }`}
                    >
                      <option value="">Select sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.sex && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.sex}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5 mt-4">
                  <Label htmlFor="address" className="text-[#01377D] text-sm font-medium">
                    Complete Address *
                  </Label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.address
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-[#009DD1]"
                    }`}
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-[#01377D] mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#009DD1] text-white text-sm font-bold">
                    2
                  </span>
                  Account Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[#01377D] text-sm font-medium">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={`border rounded-lg pr-10 ${
                          validationErrors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300 focus:ring-[#009DD1]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.password}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      At least 8 characters (mix of uppercase, lowercase, numbers, and symbols recommended)
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation" className="text-[#01377D] text-sm font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`border rounded-lg pr-10 ${
                          validationErrors.password_confirmation
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300 focus:ring-[#009DD1]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password_confirmation && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#009DD1] text-white py-3 rounded-lg font-semibold hover:bg-[#0077A8] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Continue to Email Verification"}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-center text-slate-600 text-sm mt-4">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-[#009DD1] font-semibold hover:underline">
                    Log in here
                  </Link>
                </p>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#009DD1] flex-shrink-0 mt-0.5" />
                <span>
                  Your information is secure and will only be used for medical clinic services. We follow strict data protection policies.
                </span>
              </p>
            </div>
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

export default PatientRegistration;

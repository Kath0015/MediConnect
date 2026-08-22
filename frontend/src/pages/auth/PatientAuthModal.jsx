import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';

export const PatientAuthModal = ({ isOpen, onClose }) => {
  // Mode: 'login' | 'register' | 'otp'
  const [modalMode, setModalMode] = useState('login');

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    dateOfBirth: '',
    sex: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Pagkatapos mag-submit ng registration details, ilipat sa Email Verification modal
    setModalMode('otp');
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input field
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ---------------- 1. PATIENT LOGIN MODAL ---------------- */}
        {modalMode === 'login' && (
          <div className="space-y-6 pt-2">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-[#1a56db]">Patient Login</h2>
            </div>

            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1a56db] focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#1a56db] focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1d61ff] py-3 text-sm font-semibold text-white transition-all hover:bg-[#124bce]"
              >
                Login
              </button>

              <div className="text-center space-y-1">
                <button
                  type="button"
                  onClick={() => setModalMode('register')}
                  className="text-sm font-medium text-[#1d61ff] hover:underline block w-full"
                >
                  Create a Patient Account
                </button>
                <a href="/auth/forgot-password" className="text-xs text-gray-500 hover:underline inline-block">
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        )}

        {/* ---------------- 2. PATIENT REGISTRATION MODAL ---------------- */}
        {modalMode === 'register' && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-2xl font-bold text-[#1a56db]">Patient Registration</h2>
              <p className="text-xs text-gray-500 mt-1">Create your MediConnect patient account.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="09XXXXXXXXX"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sex</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 focus:border-[#1a56db] focus:outline-none"
                    required
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Complete Address</label>
                <textarea
                  rows="2"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#1a56db] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1d61ff] py-3 text-xs font-semibold text-white transition-all hover:bg-[#124bce] mt-2"
              >
                Continue to Email Verification
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setModalMode('login')}
                  className="text-xs text-[#1d61ff] hover:underline"
                >
                  ← Back to Patient Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------- 3. OTP VERIFICATION MODAL ---------------- */}
        {modalMode === 'otp' && (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1d61ff]">
              <Mail className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1a56db]">Verify Your Email</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit verification code sent to your email address.
              </p>
            </div>

            <div className="flex justify-center gap-2 my-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  className="h-10 w-10 text-center rounded-xl border border-gray-300 text-sm font-bold text-gray-700 focus:border-[#1d61ff] focus:outline-none focus:ring-1 focus:ring-[#1d61ff]"
                />
              ))}
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-[#1d61ff] py-3 text-xs font-semibold text-white transition-all hover:bg-[#124bce]"
            >
              Verify Email
            </button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Didn't receive the code?</p>
              <button type="button" className="font-semibold text-[#1d61ff] hover:underline">
                Resend OTP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
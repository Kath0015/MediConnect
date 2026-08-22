import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, ArrowLeft, Stethoscope, Users, HeartPulse, Shield, Lock, UserPlus, Mail, CheckCircle, RefreshCw, Loader2, Activity } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { sendOtp, verifyOtp } from "../../api/Auth";
import { toast } from "sonner";
import { useBranding } from "../../contexts/BrandingContext";

const ROLE_CARDS = [
  { id: "patient", label: "Patient", icon: Users, color: "#009DD1", gradient: "from-[#009DD1] to-[#0077A8]", bg: "bg-[#009DD1]/10 hover:bg-[#009DD1]/20", border: "border-[#009DD1]/30 hover:border-[#009DD1]", description: "Book appointments, view records & lab results", canRegister: true },
  { id: "doctor", label: "Doctor", icon: Stethoscope, color: "#7C3AED", gradient: "from-[#7C3AED] to-[#5B21B6]", bg: "bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20", border: "border-[#7C3AED]/30 hover:border-[#7C3AED]", description: "Manage patients, write prescriptions & certificates", canRegister: false },
  { id: "clinician", label: "Clinic Staff", icon: HeartPulse, color: "#26B170", gradient: "from-[#26B170] to-[#1a8a55]", bg: "bg-[#26B170]/10 hover:bg-[#26B170]/20", border: "border-[#26B170]/30 hover:border-[#26B170]", description: "Check-in patients, record vitals & manage schedules", canRegister: false },
  { id: "admin", label: "Administrator", icon: Shield, color: "#01377D", gradient: "from-[#01377D] to-[#012060]", bg: "bg-[#01377D]/10 hover:bg-[#01377D]/20", border: "border-[#01377D]/30 hover:border-[#01377D]", description: "Full system oversight, reports & user management", canRegister: false },
];

const MODAL_ANIM = "@keyframes modalIn{from{opacity:0;transform:scale(0.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}";

const OtpInput = ({ otp, setOtp, disabled }) => {
  const refs = useRef([]);
  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const n = [...otp]; n[i] = d; setOtp(n);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };
  const handlePaste = (e) => { e.preventDefault(); const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (p.length === 6) setOtp(p.split("")); };
  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-14 text-center text-2xl font-bold border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:ring-2 focus:ring-[#009DD1]/30 focus:outline-none transition-all bg-white text-[#01377D] disabled:opacity-50" />
      ))}
    </div>
  );
};

const ModalOverlay = ({ children, onClose, maxW = "max-w-lg" }) => {
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(1,30,74,0.65)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`relative w-full ${maxW} bg-white rounded-2xl shadow-2xl overflow-hidden`} style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {children}
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
};

const ErrorBox = ({ msg }) => msg ? <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{msg}</div> : null;

const AuthModals = ({ isOpen, onClose, initialScreen = "portal", initialRole = null }) => {
  const { signup, login } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(initialScreen);
  const [selectedRole, setSelectedRole] = useState(() => {
    if (initialRole) return ROLE_CARDS.find(r => r.id === initialRole) || null;
    return null;
  });

  // Sync screen and selectedRole state when props change (e.g. opened from role cards)
  useEffect(() => {
    setScreen(initialScreen);
    if (initialRole) {
      const found = ROLE_CARDS.find(r => r.id === initialRole);
      if (found) setSelectedRole(found);
    } else if (initialScreen === 'portal') {
      setSelectedRole(null);
    }
  }, [initialScreen, initialRole]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", date_of_birth: "", password: "", password_confirmation: "" });
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const displayBrand = branding?.brandName || "MediConnect";

  const resetAndClose = useCallback(() => {
    setScreen(initialScreen); setError("");
    setSelectedRole(initialRole ? (ROLE_CARDS.find(r => r.id === initialRole) || null) : null);
    setRegForm({ name: "", email: "", phone: "", date_of_birth: "", password: "", password_confirmation: "" });
    setLoginForm({ email: "", password: "" });
    setOtpDigits(["", "", "", "", "", ""]); setDevOtp("");
    onClose();
  }, [onClose, initialScreen, initialRole]);

  const goToPortal = () => { setScreen("portal"); setError(""); };

  const handleRoleCardClick = role => { setSelectedRole(role); setError(""); setScreen(role.id === "patient" ? "patient-login" : "staff-login"); };

  const handleRegSubmit = async e => {
    e.preventDefault(); setError("");
    if (regForm.password !== regForm.password_confirmation) { setError("Passwords do not match."); return; }
    if (regForm.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await signup(regForm);
      const otpRes = await sendOtp(regForm.email);
      const data = otpRes?.data?.data || otpRes?.data || {};
      setOtpEmail(regForm.email);
      if (data.otp) setDevOtp(data.otp);
      setScreen("otp");
      toast.success("Account created! Please verify your email.");
    } catch (err) { setError(err?.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      await verifyOtp(otpEmail, code);
      toast.success("Email verified! You can now log in.");
      setLoginForm({ email: otpEmail, password: "" });
      setScreen("patient-login");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Invalid OTP.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res = await sendOtp(otpEmail);
      const data = res?.data?.data || res?.data || {};
      if (data.otp) setDevOtp(data.otp);
      toast.success("A new OTP has been sent.");
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to resend OTP.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleLoginSubmit = async e => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const result = await login(loginForm);
      if (result.success) {
        const u = result.data;
        const roles = [];
        if (Array.isArray(u?.roles)) u.roles.forEach(r => roles.push((r?.name || r).toLowerCase()));
        if (u?.role) roles.push(u.role.toLowerCase());
        resetAndClose();
        if (roles.includes("admin")) navigate("/admin/dashboard");
        else if (roles.includes("doctor")) navigate("/doctor/dashboard");
        else if (roles.includes("clinician")) navigate("/clinician/dashboard");
        else navigate("/patient/dashboard");
      } else { setError(result.error || "Login failed. Please try again."); }
    } catch (err) { setError(err?.message || "Login failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  if (screen === "portal") return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(1,30,74,0.65)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && resetAndClose()}>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className="bg-gradient-to-r from-[#01377D] to-[#009DD1] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? <img src={branding.logoUrl} alt="logo" className="h-9 w-9 rounded-lg object-cover" /> : <Activity className="w-9 h-9 text-[#d2ffb6]" />}
            <div><p className="text-xs font-semibold text-[#97E7F5] uppercase tracking-widest">Portal Access</p><h2 className="text-xl font-bold text-white">{displayBrand}</h2></div>
          </div>
          <button onClick={resetAndClose} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <p className="text-center text-[#35507A] text-sm mb-5">Select your role to access the portal</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_CARDS.map(role => {
              const Icon = role.icon;
              return (
                <button key={role.id} onClick={() => handleRoleCardClick(role)} className={`flex flex-col items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${role.bg} ${role.border}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${role.color}18` }}><Icon className="w-5 h-5" style={{ color: role.color }} /></div>
                  <div>
                    <p className="font-semibold text-[#01377D] text-sm">{role.label}</p>
                    <p className="text-xs text-[#35507A] mt-0.5 leading-relaxed">{role.description}</p>
                    {role.canRegister && <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 bg-[#009DD1]/10 text-[#009DD1] rounded-full">Open Registration</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );

  if (screen === "patient-login" || screen === "patient-register") return (
    <ModalOverlay onClose={resetAndClose}>
      <div className="bg-gradient-to-r from-[#009DD1] to-[#0077A8] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goToPortal} className="text-white/70 hover:text-white mr-1 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <Users className="w-5 h-5 text-white" /><span className="text-white font-semibold">Patient Portal</span>
        </div>
        <button onClick={resetAndClose} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex border-b border-slate-100">
        {[["patient-login","Login"],["patient-register","Register"]].map(([s,label]) => (
          <button key={s} onClick={() => { setScreen(s); setError(""); }} className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${screen === s ? "text-[#009DD1] border-b-2 border-[#009DD1]" : "text-slate-400 hover:text-[#009DD1]"}`}>{label}</button>
        ))}
      </div>
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        <ErrorBox msg={error} />
        {screen === "patient-login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-[#01377D] mb-1">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required disabled={loading} className="w-full px-4 py-2.5 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:ring-2 focus:ring-[#009DD1]/20 focus:outline-none text-sm text-[#01377D] transition-all" /></div>
            <div><label className="block text-sm font-medium text-[#01377D] mb-1">Password</label>
              <div className="relative">
                <input type={showLoginPass ? "text" : "password"} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required disabled={loading} className="w-full px-4 py-2.5 pr-10 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:ring-2 focus:ring-[#009DD1]/20 focus:outline-none text-sm text-[#01377D] transition-all" />
                <button type="button" onClick={() => setShowLoginPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]">{showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <div className="text-right mt-1"><a href="/auth/forgot-password" className="text-xs text-[#009DD1] hover:underline">Forgot password?</a></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#009DD1] text-white rounded-xl font-semibold hover:bg-[#0077A8] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}{loading ? "Logging in…" : "Login as Patient"}
            </button>
          </form>
        )}
        {screen === "patient-register" && (
          <form onSubmit={handleRegSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{label:"Full Name *",field:"name",type:"text",placeholder:"Juan dela Cruz"},{label:"Email *",field:"email",type:"email",placeholder:"you@example.com"},{label:"Phone *",field:"phone",type:"tel",placeholder:"09171234567"},{label:"Date of Birth *",field:"date_of_birth",type:"date",placeholder:""}].map(({label,field,type,placeholder}) => (
                <div key={field}><label className="block text-sm font-medium text-[#01377D] mb-1">{label}</label>
                  <input type={type} value={regForm[field]} placeholder={placeholder} onChange={e => setRegForm(p => ({ ...p, [field]: e.target.value }))} required disabled={loading} className="w-full px-4 py-2.5 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:outline-none text-sm text-[#01377D] transition-all" /></div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-[#01377D] mb-3">Account Security</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-[#01377D] mb-1">Password *</label>
                  <div className="relative">
                    <input type={showRegPass ? "text" : "password"} value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required disabled={loading} className="w-full px-4 py-2.5 pr-10 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:outline-none text-sm text-[#01377D] transition-all" />
                    <button type="button" onClick={() => setShowRegPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]">{showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div></div>
                <div><label className="block text-sm font-medium text-[#01377D] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input type={showRegConfirm ? "text" : "password"} value={regForm.password_confirmation} onChange={e => setRegForm(p => ({ ...p, password_confirmation: e.target.value }))} placeholder="••••••••" required disabled={loading} className="w-full px-4 py-2.5 pr-10 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:outline-none text-sm text-[#01377D] transition-all" />
                    <button type="button" onClick={() => setShowRegConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]">{showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">At least 8 characters</p>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#26B170] text-white rounded-xl font-semibold hover:bg-[#1a8a55] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{loading ? "Creating Account…" : "Create Patient Account"}
            </button>
          </form>
        )}
      </div>
    </ModalOverlay>
  );

  if (screen === "otp") return (
    <ModalOverlay onClose={resetAndClose} maxW="max-w-md">
      <div className="bg-gradient-to-r from-[#26B170] to-[#1a8a55] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-white" /><span className="text-white font-semibold">Email Verification</span></div>
        <button onClick={resetAndClose} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#26B170]/10 flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-[#26B170]" /></div>
          <h3 className="text-lg font-bold text-[#01377D] mb-1">Check your email</h3>
          <p className="text-sm text-[#35507A]">We sent a 6-digit code to<br /><span className="font-semibold text-[#009DD1]">{otpEmail}</span></p>
          {devOtp && <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 inline-block"><strong>Dev OTP:</strong> {devOtp}</div>}
        </div>
        <ErrorBox msg={error} />
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <OtpInput otp={otpDigits} setOtp={setOtpDigits} disabled={loading} />
          <button type="submit" disabled={loading || otpDigits.join("").length < 6} className="w-full py-3 bg-[#26B170] text-white rounded-xl font-semibold hover:bg-[#1a8a55] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{loading ? "Verifying…" : "Verify Email"}
          </button>
          <div className="text-center">
            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-sm text-[#009DD1] hover:underline flex items-center gap-1 mx-auto disabled:opacity-50">
              <RefreshCw className="w-3.5 h-3.5" /> Resend code
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );

  if (screen === "staff-login") {
    const role = selectedRole || ROLE_CARDS[1];
    const Icon = role.icon;
    return (
      <ModalOverlay onClose={resetAndClose} maxW="max-w-md">
        <div className={`bg-gradient-to-r ${role.gradient} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <button onClick={goToPortal} className="text-white/70 hover:text-white mr-1 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
            <Icon className="w-5 h-5 text-white" /><span className="text-white font-semibold">{role.label} Login</span>
          </div>
          <button onClick={resetAndClose} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <ErrorBox msg={error} />
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-[#01377D] mb-1">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="you@clinic.com" required disabled={loading} className="w-full px-4 py-2.5 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:ring-2 focus:ring-[#009DD1]/20 focus:outline-none text-sm text-[#01377D] transition-all" /></div>
            <div><label className="block text-sm font-medium text-[#01377D] mb-1">Password</label>
              <div className="relative">
                <input type={showLoginPass ? "text" : "password"} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required disabled={loading} className="w-full px-4 py-2.5 pr-10 border-2 border-[#97E7F5] rounded-xl focus:border-[#009DD1] focus:ring-2 focus:ring-[#009DD1]/20 focus:outline-none text-sm text-[#01377D] transition-all" />
                <button type="button" onClick={() => setShowLoginPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009DD1]">{showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <div className="text-right mt-1"><a href="/auth/forgot-password" className="text-xs text-[#009DD1] hover:underline">Forgot password?</a></div>
            </div>
            <button type="submit" disabled={loading} style={{ background: `linear-gradient(to right, ${role.color}, ${role.color}cc)` }} className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}{loading ? "Logging in…" : `Login as ${role.label}`}
            </button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-4">Authorized {role.label.toLowerCase()} personnel only.</p>
        </div>
      </ModalOverlay>
    );
  }

  return null;
};

export default AuthModals;

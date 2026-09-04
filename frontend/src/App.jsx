import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import "./App.css";
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import PatientPageSkeleton from './components/patient/PatientPageSkeleton';
import PatientAppointmentSkeleton from './components/patient/PatientAppointmentSkeleton';
import AdminPageSkeleton from './components/admin/AdminPageSkeleton';
import api from "./api/axios";

// Public pages
import Home from "./pages/home";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Profile from "./pages/auth/Profile";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// ─── Admin lazy imports ──────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Appointments = lazy(() => import("./pages/admin/Appointments"));
const MedCerts = lazy(() => import("./pages/admin/MedCerts"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminPatients = lazy(() => import("./pages/admin/Patients"));
const AdminDoctors = lazy(() => import("./pages/admin/Doctors"));
const AdminClinicians = lazy(() => import("./pages/admin/Clinicians"));
const AdminMedicalRecords = lazy(() => import("./pages/admin/MedicalRecords"));
const AdminLaboratory = lazy(() => import("./pages/admin/Laboratory"));
const AdminPrescriptions = lazy(() => import("./pages/admin/Prescriptions"));
const AdminBilling = lazy(() => import("./pages/admin/Billing"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminHelp = lazy(() => import("./pages/admin/Help"));

// ─── Doctor lazy imports ─────────────────────────────────────────────────────
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard"));
const DoctorAppointments = lazy(() => import("./pages/doctor/Appointments"));
const DoctorPatients = lazy(() => import("./pages/doctor/Patients"));
const DoctorMedicalRecords = lazy(() => import("./pages/doctor/MedicalRecords"));
const DoctorLaboratory = lazy(() => import("./pages/doctor/Laboratory"));
const DoctorPrescriptions = lazy(() => import("./pages/doctor/Prescriptions"));
const DoctorMedCerts = lazy(() => import("./pages/doctor/MedCerts"));
const DoctorNotifications = lazy(() => import("./pages/doctor/Notifications"));
const DoctorMessages = lazy(() => import("./pages/doctor/Messages"));
const DoctorSettings = lazy(() => import("./pages/doctor/Settings"));
const DoctorHelp = lazy(() => import("./pages/doctor/Help"));

// ─── Clinician lazy imports ──────────────────────────────────────────────────
const ClinicianDashboard = lazy(() => import("./pages/clinician/Dashboard"));
const PatientList = lazy(() => import("./pages/clinician/PatientList"));
const PatientRecords = lazy(() => import("./pages/clinician/PatientRecords"));
const Schedule = lazy(() => import("./pages/clinician/Schedule"));
const RequestManagement = lazy(() => import("./pages/clinician/RequestManagement"));
const ClinicianDocuments = lazy(() => import("./pages/clinician/Documents"));
const ClinicianPreviousLaboratory = lazy(() => import("./pages/clinician/PreviousLaboratory"));
const ClinicianSettings = lazy(() => import("./pages/clinician/Settings"));
const ClinicianCheckIn = lazy(() => import("./pages/clinician/CheckIn"));
const ClinicianVitals = lazy(() => import("./pages/clinician/Vitals"));
const ClinicianNotifications = lazy(() => import("./pages/clinician/Notifications"));
const ClinicianMessages = lazy(() => import("./pages/clinician/Messages"));
const ClinicianHelp = lazy(() => import("./pages/clinician/Help"));

// ─── Patient lazy imports ────────────────────────────────────────────────────
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard"));
const Appointment = lazy(() => import("./pages/patient/Appointment"));
const Records = lazy(() => import("./pages/patient/Records"));
const RequestCertificate = lazy(() => import("./pages/patient/RequestCertificate"));
const UploadDocument = lazy(() => import("./pages/patient/UploadDocument"));
const PatientPreviousLaboratory = lazy(() => import("./pages/patient/PreviousLaboratory"));
const MediBot = lazy(() => import("./pages/patient/MediBot"));
const PatientPrescriptions = lazy(() => import("./pages/patient/Prescriptions"));
const PatientAuditLogs = lazy(() => import("./pages/patient/AuditLogs"));
const PatientNotifications = lazy(() => import("./pages/patient/Notifications"));
const PatientMessages = lazy(() => import("./pages/patient/Messages"));
const PatientHelp = lazy(() => import("./pages/patient/Help"));

// Wrapper component that conditionally applies Layout
const RouteWrapper = ({ children, requireLayout = false }) => {
  if (requireLayout) {
    return <Layout>{children}</Layout>;
  }
  return children;
};

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009DD1]"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Suspense wrapper for lazy components
const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <LoadingFallback />}>
    {children}
  </Suspense>
);

// Dashboard redirect component — inside AuthProvider
const DashboardRedirect = () => {
  const { user, isAdmin, isClinician, isPatient, isDoctor } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isDoctor) return <Navigate to="/doctor/dashboard" replace />;
  if (isClinician) return <Navigate to="/clinician/dashboard" replace />;
  if (isPatient) return <Navigate to="/patient/dashboard" replace />;

  return <Navigate to="/" replace />;
};

// Helper: protected route with Layout wrapper
const PRoute = ({ allowedRoles, fallback, children }) => (
  <RouteWrapper requireLayout={true}>
    <ProtectedRoute allowedRoles={allowedRoles}>
      <LazyWrapper fallback={fallback}>
        {children}
      </LazyWrapper>
    </ProtectedRoute>
  </RouteWrapper>
);

const App = () => {
  useEffect(() => {
    api.get('/sanctum/csrf-cookie').catch(() => {});
  }, []);

  return (
    <Router>
      <BrandingProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />

            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />

            {/* Dashboard redirect */}
            <Route
              path="/dashboard"
              element={
                <RouteWrapper requireLayout={true}>
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                </RouteWrapper>
              }
            />

            {/* Profile (all roles) */}
            <Route
              path="/auth/profile"
              element={
                <RouteWrapper requireLayout={true}>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </RouteWrapper>
              }
            />

            {/* ── ADMIN ROUTES ──────────────────────────────────────── */}
            <Route path="/admin/dashboard" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="dashboard" rows={4} />}><AdminDashboard /></PRoute>} />
            <Route path="/admin/appointments" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><Appointments /></PRoute>} />
            <Route path="/admin/patients" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminPatients /></PRoute>} />
            <Route path="/admin/doctors" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminDoctors /></PRoute>} />
            <Route path="/admin/clinicians" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminClinicians /></PRoute>} />
            <Route path="/admin/medical-records" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminMedicalRecords /></PRoute>} />
            <Route path="/admin/laboratory" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminLaboratory /></PRoute>} />
            <Route path="/admin/prescriptions" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AdminPrescriptions /></PRoute>} />
            <Route path="/admin/medcerts" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><MedCerts /></PRoute>} />
            <Route path="/admin/billing" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="charts" rows={3} />}><AdminBilling /></PRoute>} />
            <Route path="/admin/reports" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="charts" rows={3} />}><Reports /></PRoute>} />
            <Route path="/admin/notifications" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="list" rows={5} />}><AdminNotifications /></PRoute>} />
            <Route path="/admin/messages" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="list" rows={5} />}><AdminMessages /></PRoute>} />
            <Route path="/admin/manage-users" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><ManageUsers /></PRoute>} />
            <Route path="/admin/settings" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="tabs" rows={4} />}><Settings /></PRoute>} />
            <Route path="/admin/audit-logs" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="table" rows={5} />}><AuditLogs /></PRoute>} />
            <Route path="/admin/help" element={<PRoute allowedRoles={['admin']} fallback={<AdminPageSkeleton variant="dashboard" rows={3} />}><AdminHelp /></PRoute>} />

            {/* ── DOCTOR ROUTES ─────────────────────────────────────── */}
            <Route path="/doctor/dashboard" element={<PRoute allowedRoles={['doctor']}><DoctorDashboard /></PRoute>} />
            <Route path="/doctor/appointments" element={<PRoute allowedRoles={['doctor']}><DoctorAppointments /></PRoute>} />
            <Route path="/doctor/patients" element={<PRoute allowedRoles={['doctor']}><DoctorPatients /></PRoute>} />
            <Route path="/doctor/medical-records" element={<PRoute allowedRoles={['doctor']}><DoctorMedicalRecords /></PRoute>} />
            <Route path="/doctor/laboratory" element={<PRoute allowedRoles={['doctor']}><DoctorLaboratory /></PRoute>} />
            <Route path="/doctor/prescriptions" element={<PRoute allowedRoles={['doctor']}><DoctorPrescriptions /></PRoute>} />
            <Route path="/doctor/medcerts" element={<PRoute allowedRoles={['doctor']}><DoctorMedCerts /></PRoute>} />
            <Route path="/doctor/notifications" element={<PRoute allowedRoles={['doctor']}><DoctorNotifications /></PRoute>} />
            <Route path="/doctor/messages" element={<PRoute allowedRoles={['doctor']}><DoctorMessages /></PRoute>} />
            <Route path="/doctor/settings" element={<PRoute allowedRoles={['doctor']}><DoctorSettings /></PRoute>} />
            <Route path="/doctor/help" element={<PRoute allowedRoles={['doctor']}><DoctorHelp /></PRoute>} />

            {/* ── CLINICIAN (CLINIC STAFF) ROUTES ───────────────────── */}
            <Route path="/clinician/dashboard" element={<PRoute allowedRoles={['clinician']}><ClinicianDashboard /></PRoute>} />
            <Route path="/clinician/schedule" element={<PRoute allowedRoles={['clinician']}><Schedule /></PRoute>} />
            <Route path="/clinician/patients" element={<PRoute allowedRoles={['clinician']}><PatientList /></PRoute>} />
            <Route path="/clinician/checkin" element={<PRoute allowedRoles={['clinician']}><ClinicianCheckIn /></PRoute>} />
            <Route path="/clinician/vitals" element={<PRoute allowedRoles={['clinician']}><ClinicianVitals /></PRoute>} />
            <Route path="/clinician/previous-laboratory" element={<PRoute allowedRoles={['clinician']}><ClinicianPreviousLaboratory /></PRoute>} />
            <Route path="/clinician/documents" element={<PRoute allowedRoles={['clinician']}><ClinicianDocuments /></PRoute>} />
            <Route path="/clinician/notifications" element={<PRoute allowedRoles={['clinician']}><ClinicianNotifications /></PRoute>} />
            <Route path="/clinician/messages" element={<PRoute allowedRoles={['clinician']}><ClinicianMessages /></PRoute>} />
            <Route path="/clinician/settings" element={<PRoute allowedRoles={['clinician']}><ClinicianSettings /></PRoute>} />
            <Route path="/clinician/help" element={<PRoute allowedRoles={['clinician']}><ClinicianHelp /></PRoute>} />
            <Route path="/clinician/requests" element={<PRoute allowedRoles={['clinician']}><RequestManagement /></PRoute>} />
            <Route path="/staff/patient-records/:patientId" element={<PRoute allowedRoles={['clinician']}><PatientRecords /></PRoute>} />

            {/* ── PATIENT ROUTES ────────────────────────────────────── */}
            <Route path="/patient/dashboard" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="dashboard" rows={4} />}><PatientDashboard /></PRoute>} />
            <Route path="/patient/appointment" element={<PRoute allowedRoles={['patient']} fallback={<PatientAppointmentSkeleton />}><Appointment /></PRoute>} />
            <Route path="/patient/records" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="tabs" rows={4} />}><Records /></PRoute>} />
            <Route path="/patient/previous-laboratory" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="list" rows={4} />}><PatientPreviousLaboratory /></PRoute>} />
            <Route path="/patient/prescriptions" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="list" rows={4} />}><PatientPrescriptions /></PRoute>} />
            <Route path="/patient/audit-logs" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="list" rows={4} />}><PatientAuditLogs /></PRoute>} />
            <Route path="/patient/notifications" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="list" rows={4} />}><PatientNotifications /></PRoute>} />
            <Route path="/patient/messages" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="dashboard" rows={4} />}><PatientMessages /></PRoute>} />
            <Route path="/patient/medibot" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="form" rows={4} />}><MediBot /></PRoute>} />
            <Route path="/patient/help" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="dashboard" rows={3} />}><PatientHelp /></PRoute>} />
            <Route path="/patient/request-certificate" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="tabs" rows={4} />}><RequestCertificate /></PRoute>} />
            <Route path="/patient/upload-document" element={<PRoute allowedRoles={['patient']} fallback={<PatientPageSkeleton variant="form" rows={3} />}><UploadDocument /></PRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'white',
                  padding: '16px',
                  fontSize: '16px',
                  minWidth: '400px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  style: {
                    background: 'white',
                    border: '2px solid #10b981',
                    color: '#065f46',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1)',
                  },
                },
                error: {
                  style: {
                    background: 'white',
                    border: '2px solid #ef4444',
                    color: '#991b1b',
                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </BrandingProvider>
    </Router>
  );
};

export default App;
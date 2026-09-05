import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  ClipboardList,
  UserCircle,
  LogOut,
  Activity,
  Upload,
  FileCheck,
  Menu,
  X,
  Shield,
  FileBadge,
  FileEdit,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MessageCircle,
  MessageSquare,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  CreditCard,
  BarChart3,
  ClipboardCheck,
  UserCog,
  HelpCircle,
  ScrollText,
  Pill,
  UserCheck,
  Syringe,
  BookOpen,
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, loading, isAdmin, isClinician, isPatient, isDoctor } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [patientMenuOpen, setPatientMenuOpen] = useState(false);
  const [mobilePatientNavHidden, setMobilePatientNavHidden] = useState(false);
  const [showPatientScrollTop, setShowPatientScrollTop] = useState(false);
  const lastPatientScrollTopRef = useRef(0);
  const patientMainRef = useRef(null);
  const isPatientRoute = location.pathname.startsWith('/patient');
  const isClinicianRoute = location.pathname.startsWith('/clinician') || location.pathname.startsWith('/staff');
  const isDoctorRoute = location.pathname.startsWith('/doctor');
  const isPatientUser = isPatient || user?.role === 'patient';
  const isClinicianUser = isClinician || user?.role === 'clinician';
  const isDoctorUser = isDoctor || user?.role === 'doctor';
  const isPatientLayout = isPatientUser || isPatientRoute;
  const isClinicianLayout = isClinicianUser || isClinicianRoute;
  const isDoctorLayout = isDoctorUser || isDoctorRoute;
  const isTopNavigationLayout = false;

  const handleLogout = async () => {
    setLogoutDialogOpen(true);
  };

  const handleProfileClick = () => {
    navigate('/auth/profile');
    setSidebarOpen(false);
  };

  const getNavItems = () => {
    if (!user) return [];

    if (isAdmin) {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
        { path: '/admin/patients', label: 'Patients', icon: Users },
        { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
        { path: '/admin/clinicians', label: 'Clinicians', icon: HeartPulse },
        { path: '/admin/medical-records', label: 'Medical Records', icon: FileText },
        { path: '/admin/laboratory', label: 'Laboratory', icon: FlaskConical },
        { path: '/admin/prescriptions', label: 'Prescriptions', icon: Pill },
        { path: '/admin/medcerts', label: 'Medical Certificates', icon: FileBadge },
        { path: '/admin/billing', label: 'Billing & Payments', icon: CreditCard },
        { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { path: '/admin/notifications', label: 'Notifications', icon: Bell },
        { path: '/admin/messages', label: 'Messages', icon: MessageCircle },
        { path: '/admin/manage-users', label: 'User Management', icon: UserCog },
        { path: '/admin/settings', label: 'System Settings', icon: Settings },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
        { path: '/admin/help', label: 'Help & Support', icon: HelpCircle },
      ];
    } else if (isDoctorLayout) {
      return [
        { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/doctor/appointments', label: 'My Appointments', icon: Calendar },
        { path: '/doctor/patients', label: 'My Patients', icon: Users },
        { path: '/doctor/medical-records', label: 'Medical Records', icon: FileText },
        { path: '/doctor/laboratory', label: 'Laboratory Requests', icon: FlaskConical },
        { path: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
        { path: '/doctor/medcerts', label: 'Medical Certificates', icon: FileBadge },
        { path: '/doctor/notifications', label: 'Notifications', icon: Bell },
        { path: '/doctor/messages', label: 'Messages', icon: MessageCircle },
        { path: '/auth/profile', label: 'My Profile', icon: UserCircle },
        { path: '/doctor/settings', label: 'Settings', icon: Settings },
        { path: '/doctor/help', label: 'Help & Support', icon: HelpCircle },
      ];
    } else if (isClinicianLayout) {
      return [
        { path: '/clinician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/clinician/schedule', label: 'Appointments', icon: Calendar },
        { path: '/clinician/patients', label: 'Patients', icon: Users },
        { path: '/clinician/checkin', label: 'Patient Check-In', icon: UserCheck },
        { path: '/clinician/vitals', label: 'Vital Signs', icon: Syringe },
        { path: '/clinician/previous-laboratory', label: 'Laboratory', icon: FlaskConical },
        { path: '/clinician/documents', label: 'Documents', icon: FileText },
        { path: '/clinician/notifications', label: 'Notifications', icon: Bell },
        { path: '/clinician/messages', label: 'Messages', icon: MessageCircle },
        { path: '/auth/profile', label: 'My Profile', icon: UserCircle },
        { path: '/clinician/settings', label: 'Settings', icon: Settings },
        { path: '/clinician/help', label: 'Help & Support', icon: HelpCircle },
      ];
    } else if (isPatientLayout) {
      return [
        { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/patient/my-appointments', label: 'My Appointments', icon: Calendar },
        { path: '/patient/records', label: 'Medical Records', icon: FileText },
        { path: '/patient/previous-laboratory', label: 'Laboratory Results', icon: FlaskConical },
        { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
        { path: '/patient/audit-logs', label: 'Audit Logs', icon: ScrollText },
        { path: '/patient/notifications', label: 'Notifications', icon: Bell },
        { path: '/patient/messages', label: 'Messages', icon: MessageSquare },
        { path: '/auth/profile', label: 'Profile Settings', icon: UserCircle },
        { path: '/patient/help', label: 'Help & Support', icon: HelpCircle },
      ];
    } else {
      return [];
    }
  };

  const navItems = getNavItems();
  const isSidebarCollapsed = sidebarCollapsed;
  const roleLabel = isAdmin
    ? 'Administrator'
    : isDoctor || isDoctorLayout
    ? 'Doctor'
    : isClinician || isClinicianLayout
    ? 'Clinic Staff'
    : isPatientLayout
    ? 'Patient'
    : 'User';
    const displayBrand = branding?.brandName;
    const displayShortBrand = branding?.shortBrandName || branding?.shortBrand;
    const displayBrandLabel = displayBrand || 'Pareñas Medical Clinic';
    const displayShortBrandLabel = displayShortBrand || 'Pareñas Medical Clinic'; 
    const handlePatientMainScroll = (event) => {
    const currentTop = event.currentTarget.scrollTop;
    const previousTop = lastPatientScrollTopRef.current;
    const isScrollingDown = currentTop > previousTop + 6;
    const isScrollingUp = currentTop < previousTop - 6;

    if (currentTop < 24) {
      setMobilePatientNavHidden(false);
    } else if (isScrollingDown) {
      setMobilePatientNavHidden(true);
    } else if (isScrollingUp) {
      setMobilePatientNavHidden(false);
    }

    if (isTopNavigationLayout) {
      setShowPatientScrollTop(currentTop > 24);
    }

    lastPatientScrollTopRef.current = currentTop;
  };

  const handlePatientScrollToTop = () => {
    patientMainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setShowPatientScrollTop(false);
  };

  useEffect(() => {
    if (!isTopNavigationLayout) return;
    if (!patientMainRef.current) return;
    patientMainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    lastPatientScrollTopRef.current = 0;
    setShowPatientScrollTop(false);
    setMobilePatientNavHidden(false);
  }, [location.pathname, isTopNavigationLayout]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Role-based accent color for sidebar header gradient
  const sidebarAccent = isAdmin
    ? 'from-[#01377D] to-[#012060]'
    : isDoctorLayout
    ? 'from-[#7C3AED] to-[#5B21B6]'
    : isClinicianLayout
    ? 'from-[#26B170] to-[#1a8a55]'
    : 'from-[#009DD1] to-[#0077A8]';

  const LogoutDialog = () => (
    <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
      <DialogContent className="w-[min(92vw,640px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.24)] [&>button]:hidden">
        <DialogHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <DialogTitle className="text-2xl font-semibold text-[#e11d48]">Confirm Logout</DialogTitle>
          <DialogDescription className="pt-1 text-base text-slate-700">
            Are you sure you want to log out of your account?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 px-4 py-4 sm:px-6">
          <Button
            variant="ghost"
            className="h-10 px-5 text-base text-slate-700 hover:bg-slate-100"
            onClick={() => setLogoutDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 rounded-lg bg-red-600 px-6 text-base font-medium text-white hover:bg-red-700"
            onClick={async () => {
              try {
                await logout();
                setLogoutDialogOpen(false);
                navigate('/auth/login');
              } catch (e) {
                setLogoutDialogOpen(false);
              }
            }}
          >
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-cyan-100/80 bg-gradient-to-b from-[#f8fcff] via-[#f2f8ff] to-[#edf5ff] shadow-[0_16px_35px_rgba(15,23,42,0.08)] backdrop-blur
        transform transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        lg:translate-x-0 lg:fixed lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex h-16 flex-shrink-0 items-center justify-between border-b border-cyan-100/80 px-4 bg-gradient-to-r ${sidebarAccent}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'flex-1 justify-center' : 'gap-2'}`}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={`${displayBrand} logo`} className="h-9 w-9 rounded-xl border border-white/20 object-cover shadow-sm" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
              )}
              <span
                className={`overflow-hidden whitespace-nowrap text-sm font-semibold text-white transition-all duration-200 ${
                  isSidebarCollapsed ? 'max-w-0 opacity-0 -translate-x-1' : 'max-w-[220px] opacity-100 translate-x-0'
                }`}
              >
                {displayBrandLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          {loading ? (
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : user ? (
            <div
              className={`flex-shrink-0 cursor-pointer border-b border-cyan-100/80 p-4 transition-colors hover:bg-cyan-50/70 ${
                isSidebarCollapsed ? 'px-2' : ''
              }`}
              onClick={handleProfileClick}
              title={isSidebarCollapsed ? 'View profile' : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100/80">
                  <UserCircle className="w-6 h-6 text-cyan-700" />
                </div>
                <div
                  className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
                    isSidebarCollapsed ? 'max-w-0 opacity-0 -translate-x-1' : 'max-w-[200px] opacity-100 translate-x-0'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{roleLabel}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Navigation */}
          {user && navItems.length > 0 && (
            <nav className={`flex-1 overflow-y-auto py-4 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={isSidebarCollapsed ? 'w-full' : ''}
                  >
                    <Button
                      variant="ghost"
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`group mb-1 gap-3 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${sidebarAccent} text-white shadow-sm`
                          : 'text-slate-700 hover:bg-cyan-100/70 hover:text-[#01377D]'
                      } ${
                        isSidebarCollapsed
                          ? 'mx-auto h-11 w-11 justify-center gap-0 p-0'
                          : 'w-full justify-start px-3'
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-white text-slate-600 group-hover:scale-105 group-hover:bg-cyan-50 group-hover:text-[#01377D] group-hover:shadow-sm'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </span>
                      <span
                        className={`overflow-hidden whitespace-nowrap text-left transition-all duration-200 ${
                          isSidebarCollapsed ? 'max-w-0 opacity-0' : 'flex-1 max-w-[180px] opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Sidebar Footer */}
          <div className={`flex-shrink-0 border-t border-cyan-100/80 p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <Button
                variant="outline"
                className={`w-full gap-3 border-red-200 bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700 ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'
                }`}
                onClick={handleLogout}
                title={isSidebarCollapsed ? 'Logout' : undefined}
              >
                <LogOut className="w-5 h-5" />
                <span
                  className={`overflow-hidden whitespace-nowrap text-left transition-all duration-200 ${
                    isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'
                  }`}
                >
                  Logout
                </span>
              </Button>
            ) : (
              <div className="space-y-2">
                <Link to="/auth/login" onClick={() => setSidebarOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setSidebarOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        {!isTopNavigationLayout && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute -right-4 bottom-1/4 hidden h-9 w-9 rounded-full border-cyan-200 bg-white text-slate-700 shadow-md hover:bg-cyan-50 hover:text-[#01377D] lg:inline-flex"
            title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog />

      {/* Main Content Area */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin-left] duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={`${displayBrand} logo`} className="h-7 w-7 rounded-md object-cover" />
              ) : (
                <Activity className="w-6 h-6 text-cyan-600" />
              )}
              <span className="text-lg font-semibold text-gray-900">{displayBrandLabel}</span>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <Link to="/auth/profile">
                  <Button variant="ghost" size="sm">
                    <UserCircle className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#f8fcff] via-[#eff6ff] to-[#e8f1ff] transition-colors duration-500">
          <div
            className={`p-4 transition-all duration-500 sm:p-6 lg:p-8 ${
              isSidebarCollapsed ? 'lg:translate-x-1' : 'lg:translate-x-0'
            }`}
          >
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-cyan-100/80 bg-gradient-to-r from-[#edf5ff] to-[#e6f0ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-slate-700">
              © 2026 Pareñas Medical Clinic. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
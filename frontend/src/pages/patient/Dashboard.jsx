// Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPatientDashboardOverview } from '../../api/PatientPortal';
import { Calendar, FileText, FileCheck, Clock, ArrowRight, MessageCircle, Activity } from 'lucide-react';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';
import PatientPageSkeleton from '../../components/patient/PatientPageSkeleton';

const formatDisplayDate = (date, withTime = false) => {
  if (!date) return '—';
  try {
    const parsed = new Date(date);
    return withTime
      ? format(parsed, 'MMM d, yyyy • h:mm a')
      : format(parsed, 'MMM d, yyyy');
  } catch (err) {
    return '—';
  }
};

const titleCase = (value = '') =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const getStatusStyles = (status = '') => {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatStatusLabel = (status = '') => {
  const key = (status || '').toLowerCase();
  if (key === 'scheduled') return 'Waiting for approval';
  if (key === 'in_progress') return 'In progress';
  return titleCase(key || status);
};

export const PatientDashboard = () => {
  const { user } = useAuth();
  const patientId = user?.patient?.id;
  const [loading, setLoading] = useState(true);
  const createEmptyCollection = () => ({ data: [], meta: {} });
  const buildDefaultOverview = () => ({
    appointments: createEmptyCollection(),
    medCerts: createEmptyCollection(),
    documents: createEmptyCollection(),
    patient: null,
  });
  const [overview, setOverview] = useState(buildDefaultOverview);
  const [loadError, setLoadError] = useState('');
  const [hasPatientRecord, setHasPatientRecord] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const result = await fetchPatientDashboardOverview(patientId);
        if (!isMounted) return;

        setOverview(result);
        setHasPatientRecord(Boolean(result.patient || patientId));
      } catch (error) {
        console.error('Failed to load patient dashboard', error);
        if (isMounted) {
          setOverview(buildDefaultOverview());
          setLoadError('Unable to load some dashboard data. Please try again later.');
          toast.error('Showing limited dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, patientId]);

  const appointmentsData = overview.appointments?.data ?? [];
  const medCertsData = overview.medCerts?.data ?? [];
  const documentsData = overview.documents?.data ?? [];

  const upcomingAppointments = useMemo(() => {
    return appointmentsData
      .filter((appointment) => {
        const start = new Date(appointment.start_time);
        const now = new Date();
        return (
          start >= now &&
          ['confirmed', 'in_progress'].includes((appointment.status || '').toLowerCase())
        );
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3);
  }, [appointmentsData]);

  const pendingAppointments = useMemo(() => {
    return appointmentsData
      .filter((appointment) => {
        const start = new Date(appointment.start_time);
        const now = new Date();
        return (
          start >= now &&
          (appointment.status || '').toLowerCase() === 'scheduled'
        );
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3);
  }, [appointmentsData]);

  const pendingMedCerts = useMemo(
    () => medCertsData.filter((cert) => (cert.status || '').toLowerCase() === 'pending'),
    [medCertsData]
  );

  const recentActivity = useMemo(() => {
    const activities = [];

    medCertsData.forEach((cert) => {
      activities.push({
        id: `cert-${cert.id}`,
        type: 'certificate',
        message: `${titleCase(cert.type)} ${titleCase(cert.status)}`,
        date: cert.updated_at || cert.created_at,
      });
    });

    documentsData.forEach((doc) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document',
        message: `Document uploaded: ${doc.name}`,
        date: doc.created_at,
      });
    });

    appointmentsData.forEach((appointment) => {
      activities.push({
        id: `apt-${appointment.id}`,
        type: 'appointment',
        message: `${appointment.title || 'Appointment'} ${titleCase(appointment.status)}`,
        date: appointment.updated_at || appointment.start_time,
      });
    });

    return activities
      .filter((activity) => activity.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [medCertsData, documentsData, appointmentsData]);

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      subtext: 'Confirmed/In Progress',
      trend: upcomingAppointments.length > 0 ? `+${upcomingAppointments.length} active this week` : 'No upcoming schedule',
      icon: Calendar,
      iconWrap: 'bg-cyan-100 text-cyan-700',
      cardClass: 'border-cyan-200/60 bg-gradient-to-b from-white to-cyan-50/40',
      textClass: 'text-cyan-700',
      positive: upcomingAppointments.length > 0,
    },
    {
      label: 'Pending Appointments',
      value: pendingAppointments.length,
      subtext: 'Awaiting confirmation',
      trend: pendingAppointments.length > 0 ? `${pendingAppointments.length} pending requests` : 'All clear for now',
      icon: Clock,
      iconWrap: 'bg-amber-100 text-amber-700',
      cardClass: 'border-amber-200/60 bg-gradient-to-b from-white to-amber-50/40',
      textClass: 'text-amber-700',
      positive: pendingAppointments.length === 0,
    },
    {
      label: 'Pending Certificates',
      value: pendingMedCerts.length,
      subtext: 'Awaiting review',
      trend: pendingMedCerts.length > 0 ? `${pendingMedCerts.length} awaiting action` : 'No pending certificates',
      icon: FileCheck,
      iconWrap: 'bg-violet-100 text-violet-700',
      cardClass: 'border-violet-200/60 bg-gradient-to-b from-white to-violet-50/40',
      textClass: 'text-violet-700',
      positive: pendingMedCerts.length === 0,
    },
    {
      label: 'Uploaded Documents',
      value: overview.documents?.meta?.total ?? documentsData.length,
      subtext: 'All-time total',
      trend: 'Lifetime records',
      icon: FileText,
      iconWrap: 'bg-slate-100 text-slate-700',
      cardClass: 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50',
      textClass: 'text-slate-900',
      positive: true,
    },
  ];

  const patientDetails = overview.patient || user?.patient || null;
  const cardClass = 'border-slate-200/80 bg-white/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md';

  if (loading) {
    return <PatientPageSkeleton variant="dashboard" rows={4} />;
  }

  return (
    <div className="space-y-6">
      <PatientRoleBanner
        title={
          patientDetails?.user?.name
            ? `Welcome back, ${patientDetails.user.name}`
            : 'Welcome to your patient dashboard'
        }
        subtitle="Track appointments, certificates, and documents with quick access tools."
        floatingAction={{
          to: '/patient/symptom-checker',
          label: 'AI Symptom Checker',
          icon: Activity,
        }}
      />

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {loadError}
        </div>
      )}

      {!loading && !hasPatientRecord && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
          We could not find a linked clinic record yet. Some sections may be hidden until your profile is completed.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`${stat.cardClass} shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
                  <p className={`mt-3 text-3xl font-semibold ${stat.textClass}`}>{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
                  <p className={`mt-2 text-xs ${stat.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{stat.trend}</p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.iconWrap}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/patient/medibot" className="group">
          <Card className="border-cyan-200/60 bg-gradient-to-b from-white to-cyan-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                  <MessageCircle className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">MediBot Assistant</h3>
              <p className="text-sm text-slate-600 mb-4">Chat for lab prep, appointments, and clinic FAQs</p>
              <div className="flex items-center text-sm font-medium text-cyan-700 group-hover:text-cyan-800">
                Chat now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/appointment" className="group">
          <Card className="border-blue-200/60 bg-gradient-to-b from-white to-blue-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-700">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Book Appointment</h3>
              <p className="text-sm text-slate-600 mb-4">Schedule a meeting with a healthcare professional</p>
              <div className="flex items-center text-sm font-medium text-blue-700 group-hover:text-blue-800">
                Book now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/request-certificate" className="group">
          <Card className="border-violet-200/60 bg-gradient-to-b from-white to-violet-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-violet-700">
                  <FileCheck className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Request Certificate</h3>
              <p className="text-sm text-slate-600 mb-4">Request a medical, sick, or fitness certificate</p>
              <div className="flex items-center text-sm font-medium text-violet-700 group-hover:text-violet-800">
                Request now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-slate-900">Upcoming Appointments</CardTitle>
                <CardDescription className="text-slate-500">Confirmed & in progress</CardDescription>
              </div>
              <Link to="/patient/appointment">
                <Button variant="outline" size="sm" className="h-8 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-slate-100">
                  View all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No upcoming appointments.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.3fr_1.1fr_130px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Service</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & Time</p>
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                </div>
                {upcomingAppointments.map((appointment, index) => (
                  <div key={appointment.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.3fr_1.1fr_130px]">
                      <p className="truncate text-sm font-semibold text-slate-900">{appointment.type || appointment.title || 'Clinic Visit'}</p>
                      <p className="text-xs text-slate-500">{formatDisplayDate(appointment.start_time, true)}</p>
                      <div className="flex justify-center">
                        <Badge className={`capitalize border ${getStatusStyles(appointment.status)}`}>{formatStatusLabel(appointment.status)}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{appointment.type || appointment.title || 'Clinic Visit'}</p>
                        <Badge className={`capitalize border ${getStatusStyles(appointment.status)}`}>{formatStatusLabel(appointment.status)}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{formatDisplayDate(appointment.start_time, true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-slate-900">Waiting Approval</CardTitle>
                <CardDescription className="text-slate-500">Pending appointment requests</CardDescription>
              </div>
              <Link to="/patient/appointment">
                <Button variant="outline" size="sm" className="h-8 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-slate-100">
                  View all
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingAppointments.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No pending appointments.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.3fr_1.1fr_130px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Service</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & Time</p>
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                </div>
                {pendingAppointments.map((appointment, index) => (
                  <div key={appointment.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.3fr_1.1fr_130px]">
                      <p className="truncate text-sm font-semibold text-slate-900">{appointment.type || appointment.title || 'Clinic Visit'}</p>
                      <p className="text-xs text-slate-500">{formatDisplayDate(appointment.start_time, true)}</p>
                      <div className="flex justify-center">
                        <Badge className="border border-yellow-200 bg-yellow-100 text-yellow-700">Waiting for approval</Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{appointment.type || appointment.title || 'Clinic Visit'}</p>
                        <Badge className="border border-yellow-200 bg-yellow-100 text-yellow-700">Waiting</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{formatDisplayDate(appointment.start_time, true)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Activity</CardTitle>
          <CardDescription className="text-slate-500">Latest updates across your records</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{activity.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDisplayDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;

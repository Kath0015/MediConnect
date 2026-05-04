// Dashboard.jsx - Clinician Dashboard with Real Data
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Users, ClipboardList, Clock, TrendingUp } from 'lucide-react';
import { getClinicianStats } from '../../api/ClinicianDashboard';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';

export const ClinicianDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [pendingCerts, setPendingCerts] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getClinicianStats();
      const data = response.data.data;

      setStats(data.stats);
      setTodaySchedule(data.todaySchedule || []);
      setPendingCerts(data.pendingCerts || []);
      setWeeklyTrends(data.weeklyTrends || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatusLabel = (status = '') => {
    const key = String(status || '').toLowerCase();
    if (key === 'scheduled') return 'Waiting for approval';
    return status;
  };

  if (loading) {
    return <StaffPageSkeleton variant="dashboard" rows={3} />;
  }

  const statCards = [
    { 
      title: "Today's Appointments", 
      value: stats?.todayAppointments || 0, 
      subLabel: 'Scheduled for today',
      change: `${todaySchedule.length} in queue`,
      icon: Calendar, 
      iconWrap: 'bg-cyan-100 text-cyan-700',
      cardClass: 'border-cyan-200/60 bg-gradient-to-b from-white to-cyan-50/40',
      textClass: 'text-cyan-700'
    },
    { 
      title: 'Upcoming (7 days)', 
      value: stats?.upcomingAppointments || 0, 
      subLabel: 'Next 7 days',
      change: (stats?.upcomingAppointments || 0) > 0 ? 'Incoming workload' : 'No upcoming visits',
      icon: TrendingUp, 
      iconWrap: 'bg-emerald-100 text-emerald-700',
      cardClass: 'border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50/40',
      textClass: 'text-emerald-700'
    },
    { 
      title: 'Total Patients', 
      value: stats?.totalPatients || 0, 
      subLabel: 'Assigned to you',
      change: 'Active patient panel',
      icon: Users, 
      iconWrap: 'bg-violet-100 text-violet-700',
      cardClass: 'border-violet-200/60 bg-gradient-to-b from-white to-violet-50/40',
      textClass: 'text-violet-700'
    },
    { 
      title: 'Pending MedCerts', 
      value: stats?.pendingMedCerts || 0, 
      subLabel: 'Needs review',
      change: (stats?.pendingMedCerts || 0) > 0 ? 'Action required' : 'All caught up',
      icon: ClipboardList, 
      iconWrap: 'bg-amber-100 text-amber-700',
      cardClass: 'border-amber-200/60 bg-gradient-to-b from-white to-amber-50/40',
      textClass: 'text-amber-700'
    },
  ];

  return (
    <div className="space-y-6">
      <StaffRoleBanner
        title="Clinician Dashboard"
        subtitle="Track schedules, pending requests, and patient workload in real time."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card className={`${stat.cardClass} shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`} key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{stat.title}</p>
                    <p className={`mt-3 text-3xl font-semibold ${stat.textClass}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{stat.subLabel}</p>
                    <p className={`mt-2 text-xs ${(stat.value || 0) > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{stat.change}</p>
                  </div>
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.iconWrap}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Trends Chart */}
      {weeklyTrends.length > 0 && (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Weekly Appointment Trends</CardTitle>
            <CardDescription className="text-slate-500">Appointments over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, borderColor: '#E2E8F0', fontSize: 12 }}
                  labelStyle={{ color: '#334155', fontWeight: 600 }}
                />
                <Bar dataKey="appointments" fill="#009DD1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-slate-900">Today's Schedule</CardTitle>
                <CardDescription className="text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/clinician/schedule')}
                className="h-8 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                variant="outline"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[0.7fr_1.2fr_1fr_130px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Time</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                </div>
                {todaySchedule.map((appointment, index) => (
                  <div key={appointment.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[0.7fr_1.2fr_1fr_130px]">
                      <div className="inline-flex w-fit items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {appointment.time}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-900">{appointment.patient}</p>
                      <p className="truncate text-xs text-slate-500">{appointment.type}</p>
                      <div className="flex justify-center">
                        <Badge variant="outline" className={getStatusBadgeVariant(appointment.status)}>
                          {formatStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{appointment.patient}</p>
                          <p className="truncate text-xs text-slate-500">{appointment.type}</p>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeVariant(appointment.status)}>
                          {formatStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <div className="inline-flex w-fit items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending MedCert Requests */}
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  Pending MedCert Requests
                  {stats?.pendingMedCerts > 0 && (
                    <Badge variant="destructive" className="rounded-full">
                      {stats.pendingMedCerts}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-500">Requests requiring your approval</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/clinician/requests')}
                className="h-8 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                variant="outline"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingCerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending medical certificate requests</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1fr_1.4fr_0.8fr_100px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Request</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submitted</p>
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Action</p>
                </div>
                {pendingCerts.map((request, index) => (
                  <div key={request.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_1.4fr_0.8fr_100px]">
                      <p className="truncate text-sm font-semibold text-slate-900">{request.patient}</p>
                      <p className="truncate text-xs text-slate-500">{request.type} - {request.purpose}</p>
                      <p className="text-xs text-orange-600">{request.submitted}</p>
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/clinician/requests')}
                          className="h-8 border-[#009DD1] text-[#009DD1] hover:bg-blue-50"
                        >
                          Review
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{request.patient}</p>
                          <p className="truncate text-xs text-slate-500">{request.type} - {request.purpose}</p>
                          <p className="mt-1 text-xs text-orange-600">{request.submitted}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/clinician/requests')}
                          className="h-8 border-[#009DD1] text-[#009DD1] hover:bg-blue-50"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicianDashboard;
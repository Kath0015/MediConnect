// Admin Appointments Overview
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Calendar as CalendarIcon, Search, Filter, ChevronLeft, ChevronRight, Sparkles, ChevronDown, Check, X, Loader2, Layers3, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Calendar as DatePickerCalendar } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAllAppointments } from '../../api/AdminDashboard';
import { updateAppointment } from '../../api/Appointments';
import { getClinicMeta } from '../../api/Clinic';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import AdminPageSkeleton from '../../components/admin/AdminPageSkeleton';

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '17:00';
const DEFAULT_INTERVAL = 30;

const generateTimeSlots = (openTime, closeTime, intervalMinutes) => {
  try {
    const slots = [];
    const start = new Date(`1970-01-01T${openTime}:00`);
    const end = new Date(`1970-01-01T${closeTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return [];
    }
    let pointer = new Date(start);
    while (pointer < end) {
      slots.push(pointer.toTimeString().slice(0, 5));
      pointer = new Date(pointer.getTime() + intervalMinutes * 60000);
    }
    return slots;
  } catch (error) {
    return [];
  }
};

const normalizeDate = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore parse errors.
  }
  return String(value).slice(0, 10);
};

const buildLocalDate = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const formatForApi = (dateObj) => format(dateObj, 'yyyy-MM-dd HH:mm:ss');

const formatTimeSlot = (slot) => {
  try {
    return format(new Date(`1970-01-01T${slot}:00`), 'h:mm a');
  } catch (error) {
    return slot;
  }
};

export const Appointments = () => {
  const APPOINTMENTS_PER_PAGE = 10;

  const [appointments, setAppointments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [closures, setClosures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleMonth, setRescheduleMonth] = useState(new Date());
  const filterMenuRef = useRef(null);

  const STATUS_OPTIONS = useMemo(() => ([
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Waiting for Approval' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'no_show', label: 'No-show' },
  ]), []);

  useEffect(() => {
    loadAppointments();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadClinicMeta();
  }, []);

  const loadAppointments = async () => {
    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setTableLoading(true);
      }
      const params = {
        page: currentPage,
        per_page: APPOINTMENTS_PER_PAGE,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await getAllAppointments(params);
      const payload = response?.data;
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      setAppointments(rows);
      setTotalPages(payload?.last_page || 1);
      setTotalCount(payload?.total ?? rows.length);
      setPageSize(payload?.per_page || APPOINTMENTS_PER_PAGE);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Failed to load appointments');
      setAppointments([]);
      setTotalPages(1);
      setTotalCount(0);
      setPageSize(APPOINTMENTS_PER_PAGE);
    } finally {
      setInitialLoading(false);
      setTableLoading(false);
    }
  };

  const loadClinicMeta = async () => {
    try {
      const response = await getClinicMeta();
      const data = response?.data?.data || {};
      setClinicSettings(data.settings || null);
      setClosures(Array.isArray(data.closures) ? data.closures : []);
    } catch (err) {
      console.error('Failed to load clinic settings:', err);
      setClinicSettings(null);
      setClosures([]);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const statusCounts = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const key = (appointment?.status || '').toLowerCase();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [appointments]);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'no_show':
        return 'bg-gray-200 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatus = (status) => {
    const key = (status || '').toLowerCase();
    switch (key) {
      case 'scheduled':
        return 'Waiting for approval';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      case 'no_show':
        return 'No-show';
      default:
        return status || 'Unknown';
    }
  };

  const resolveAppointmentType = (apt) => {
    if (!apt) return '';
    const related = apt.appointment_type || apt.appointmentType;
    if (related && typeof related === 'object') {
      return related.name || '';
    }
    if (typeof apt.appointment_type === 'string') {
      return apt.appointment_type;
    }
    if (typeof apt.type === 'string') {
      return apt.type;
    }
    return '';
  };

  const getStartDate = (apt) => (apt?.start_time ? new Date(apt.start_time) : null);
  const getEndDate = (apt) => (apt?.end_time ? new Date(apt.end_time) : null);

  const getAppointmentTypeMeta = (apt) => {
    if (!apt) return null;
    if (apt.appointmentType && typeof apt.appointmentType === 'object') return apt.appointmentType;
    if (apt.appointment_type && typeof apt.appointment_type === 'object') return apt.appointment_type;
    return null;
  };

  const getAppointmentDuration = (apt) => {
    const typeMeta = getAppointmentTypeMeta(apt);
    const duration = Number(typeMeta?.estimated_minutes);
    if (Number.isFinite(duration) && duration > 0) return duration;
    return clinicSettings?.appointment_interval || DEFAULT_INTERVAL;
  };

  const isTypeAvailableForDate = (type, dateValue) => {
    if (!type || type.is_active === false) return false;
    if (!dateValue) return true;

    const targetDate = normalizeDate(dateValue);
    const from = type.available_from ? normalizeDate(type.available_from) : '';
    const until = type.available_until ? normalizeDate(type.available_until) : '';

    if (from && targetDate < from) return false;
    if (until && targetDate > until) return false;

    const days = Array.isArray(type.available_days) ? type.available_days : [];
    if (days.length > 0) {
      const dayKey = format(new Date(targetDate), 'eee').slice(0, 3).toLowerCase();
      if (!days.includes(dayKey)) return false;
    }

    return true;
  };

  const isTypeAvailableForTime = (type, dateValue, timeValue, durationMinutes) => {
    if (!timeValue || !type?.available_start_time || !type?.available_end_time || !dateValue) return true;

    const start = buildLocalDate(dateValue, timeValue);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const startBoundary = new Date(`${dateValue}T${String(type.available_start_time).slice(0, 5)}:00`);
    const endBoundary = new Date(`${dateValue}T${String(type.available_end_time).slice(0, 5)}:00`);
    return start >= startBoundary && end <= endBoundary;
  };

  const clinicOpen = clinicSettings?.open_time || DEFAULT_OPEN;
  const clinicClose = clinicSettings?.close_time || DEFAULT_CLOSE;
  const clinicInterval = clinicSettings?.appointment_interval || DEFAULT_INTERVAL;

  const baseTimeSlots = useMemo(() => {
    const generated = generateTimeSlots(clinicOpen, clinicClose, clinicInterval);
    if (generated.length === 0) {
      return generateTimeSlots(DEFAULT_OPEN, DEFAULT_CLOSE, DEFAULT_INTERVAL);
    }
    return generated;
  }, [clinicOpen, clinicClose, clinicInterval]);

  const workingDaysSet = useMemo(() => {
    const days = clinicSettings?.working_days;
    return new Set(Array.isArray(days) ? days : []);
  }, [clinicSettings]);

  const closuresByDate = useMemo(() => {
    const map = new Map();
    closures.forEach((closure) => {
      const key = normalizeDate(closure.date);
      if (!key) return;
      const list = map.get(key) || [];
      list.push(closure);
      map.set(key, list);
    });
    return map;
  }, [closures]);

  const getClosuresForDate = (dateValue) => {
    const target = normalizeDate(dateValue);
    if (!target) return [];
    return closuresByDate.get(target) || [];
  };

  const hasFullDayClosure = (dateValue) =>
    getClosuresForDate(dateValue).some((closure) => !closure.start_time && !closure.end_time);

  const isWorkingDay = (dateValue) => {
    if (!dateValue || workingDaysSet.size === 0) return true;
    try {
      const dayKey = format(new Date(dateValue), 'eee').slice(0, 3).toLowerCase();
      return workingDaysSet.has(dayKey);
    } catch (error) {
      return false;
    }
  };

  const isDateSelectable = (dateValue) => isWorkingDay(dateValue) && !hasFullDayClosure(dateValue);

  const canReschedule = (appointment) => {
    const status = (appointment?.status || '').toLowerCase();
    return status === 'scheduled' || status === 'confirmed';
  };

  const getAvailableSlotsForDate = (dateValue, appointment) => {
    if (!dateValue || !appointment) return [];
    if (!isDateSelectable(dateValue)) return [];

    const typeMeta = getAppointmentTypeMeta(appointment);
    const durationMinutes = getAppointmentDuration(appointment);
    if (typeMeta && !isTypeAvailableForDate(typeMeta, dateValue)) return [];

    const closuresForDay = getClosuresForDate(dateValue)
      .filter((closure) => closure.start_time && closure.end_time)
      .map((closure) => {
        const startTime = closure.start_time.length === 5 ? `${closure.start_time}:00` : closure.start_time;
        const endTime = closure.end_time.length === 5 ? `${closure.end_time}:00` : closure.end_time;
        return {
          start: new Date(`${dateValue}T${startTime}`),
          end: new Date(`${dateValue}T${endTime}`),
        };
      });

    const appointmentsOnDay = appointments
      .filter((apt) => {
        if (!apt.start_time) return false;
        if (appointment && Number(apt.id) === Number(appointment.id)) return false;
        const aptDate = normalizeDate(apt.start_time);
        const status = (apt.status || '').toLowerCase();
        return aptDate === normalizeDate(dateValue) && ['scheduled', 'confirmed', 'in_progress'].includes(status);
      })
      .map((apt) => {
        const aptStart = new Date(apt.start_time);
        const rawEnd = apt.end_time ? new Date(apt.end_time) : new Date(aptStart.getTime() + clinicInterval * 60000);
        const aptEndWithBuffer = new Date(rawEnd.getTime() + clinicInterval * 60000);
        return { start: aptStart, end: aptEndWithBuffer };
      });

    return baseTimeSlots.filter((slot) => {
      const slotStart = new Date(`${dateValue}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      const closeBoundary = new Date(`${dateValue}T${clinicClose}:00`);

      if (Number.isNaN(slotStart.getTime()) || slotEnd > closeBoundary) return false;

      const noClosureConflict = closuresForDay.every((window) => slotEnd <= window.start || slotStart >= window.end);
      const noAppointmentConflict = appointmentsOnDay.every((apt) => slotEnd <= apt.start || slotStart >= apt.end);

      if (!noClosureConflict || !noAppointmentConflict) return false;

      if (typeMeta && !isTypeAvailableForTime(typeMeta, dateValue, slot, durationMinutes)) return false;

      return true;
    });
  };

  const availableSlots = useMemo(() => {
    if (!rescheduleTarget || !rescheduleDate) return [];
    return getAvailableSlotsForDate(rescheduleDate, rescheduleTarget);
  }, [appointments, baseTimeSlots, clinicClose, clinicInterval, closures, rescheduleDate, rescheduleTarget]);

  const fullDateSet = useMemo(() => {
    if (!rescheduleTarget) return new Set();
    const start = startOfWeek(startOfMonth(rescheduleMonth));
    const end = endOfWeek(endOfMonth(rescheduleMonth));
    const days = eachDayOfInterval({ start, end });
    const set = new Set();
    days.forEach((day) => {
      const key = normalizeDate(day);
      if (!isDateSelectable(key)) return;
      const slots = getAvailableSlotsForDate(key, rescheduleTarget);
      if (slots.length === 0) set.add(key);
    });
    return set;
  }, [appointments, baseTimeSlots, clinicClose, clinicInterval, closures, rescheduleMonth, rescheduleTarget, workingDaysSet]);

  const calendarModifiers = useMemo(
    () => ({
      fullyBooked: (date) => fullDateSet.has(normalizeDate(date)),
    }),
    [fullDateSet]
  );

  const minCalendarDate = new Date();
  minCalendarDate.setHours(0, 0, 0, 0);
  const maxCalendarDate = new Date(minCalendarDate.getFullYear() + 1, 11, 31);

  const handleRescheduleDialogChange = (open) => {
    setRescheduleDialogOpen(open);
    if (!open) {
      setRescheduleTarget(null);
      setRescheduleDate('');
      setRescheduleTime('');
      setRescheduleSubmitting(false);
    }
  };

  const handleOpenReschedule = (appointment) => {
    if (!canReschedule(appointment)) {
      toast.error('Only scheduled or confirmed appointments can be rescheduled');
      return;
    }
    const startDate = getStartDate(appointment);
    if (startDate) {
      setRescheduleDate(format(startDate, 'yyyy-MM-dd'));
      setRescheduleTime(format(startDate, 'HH:mm'));
      setRescheduleMonth(startDate);
    } else {
      setRescheduleDate('');
      setRescheduleTime('');
      setRescheduleMonth(new Date());
    }
    setRescheduleTarget(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleDateChange = (value) => {
    if (!value) {
      setRescheduleDate('');
      setRescheduleTime('');
      return;
    }
    const formatted = format(value, 'yyyy-MM-dd');
    if (!isDateSelectable(formatted)) {
      toast.error('Clinic is closed on the selected day');
      return;
    }
    setRescheduleDate(formatted);
    setRescheduleTime('');
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget) return;
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Select a new date and time');
      return;
    }

    if (!availableSlots.includes(rescheduleTime)) {
      toast.error('Selected time is no longer available');
      return;
    }

    try {
      setRescheduleSubmitting(true);
      const durationMinutes = getAppointmentDuration(rescheduleTarget);
      const startDate = buildLocalDate(rescheduleDate, rescheduleTime);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

      await updateAppointment(rescheduleTarget.id, {
        start_time: formatForApi(startDate),
        end_time: formatForApi(endDate),
      });

      toast.success('Appointment rescheduled successfully');
      handleRescheduleDialogChange(false);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to reschedule appointment:', err);
      const message = err.response?.data?.message || 'Failed to reschedule appointment';
      toast.error(message);
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const query = searchTerm.toLowerCase();
    const name = apt.patient?.user?.name?.toLowerCase() || '';
    const email = apt.patient?.user?.email?.toLowerCase() || '';
    const type = resolveAppointmentType(apt)?.toLowerCase() || '';
    const status = (apt.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    if (!matchesStatus) return false;
    if (!query) return true;
    return name.includes(query) || email.includes(query) || type.includes(query);
  });

  const selectedStatusLabel = STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || 'All Statuses';
  const pageStartIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEndIndex = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;

  if (initialLoading) {
    return <AdminPageSkeleton variant="table" rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="hidden rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm md:flex md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
          Appointments panel
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
          <CalendarIcon className="h-4 w-4 text-cyan-600" />
          <span>{format(new Date(), 'PPP')}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-20 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Live appointment pipeline
        </div>
        <h2 className="mt-2 text-2xl font-semibold">Appointments Overview</h2>
        <p className="mt-3 max-w-2xl text-sm text-cyan-100/90">Track status changes, patient schedule load, and appointment trends in one place.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 bg-gradient-to-b from-white to-slate-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{totalCount}</p>
                <p className="mt-1 text-xs text-slate-500">All appointments in current dataset</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-gradient-to-b from-white to-amber-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Waiting Approval</p>
                <p className="mt-3 text-3xl font-semibold text-amber-700">{statusCounts['scheduled'] || 0}</p>
                <p className="mt-1 text-xs text-amber-700/80">Waiting for clinician handling</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Completed</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-700">{statusCounts['completed'] || 0}</p>
                <p className="mt-1 text-xs text-emerald-700/80">Finished and closed appointments</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200/60 bg-gradient-to-b from-white to-rose-50/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">Cancelled</p>
                <p className="mt-3 text-3xl font-semibold text-rose-700">{statusCounts['cancelled'] || 0}</p>
                <p className="mt-1 text-xs text-rose-700/80">Cancelled by patient or staff</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, email, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 pl-10 pr-9 border-slate-200 bg-white transition-all duration-200 focus:border-cyan-500 focus:ring-cyan-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div ref={filterMenuRef} className="relative w-full md:w-56">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all duration-200 hover:border-cyan-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-expanded={isFilterOpen}
                aria-haspopup="listbox"
              >
                <span className="inline-flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {selectedStatusLabel}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              <div
                className={`absolute right-0 z-30 mt-2 w-full origin-top rounded-md border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-200 ${
                  isFilterOpen
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
                role="listbox"
              >
                {STATUS_OPTIONS.map((option) => {
                  const isActive = option.value === statusFilter;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-sm transition ${
                        isActive
                          ? 'bg-cyan-50 text-cyan-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isActive && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{filteredAppointments.length}</span> appointment{filteredAppointments.length === 1 ? '' : 's'}
            {statusFilter !== 'all' ? ` • Filtered: ${selectedStatusLabel}` : ''}
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {tableLoading && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating table...
            </div>
          )}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments found</p>
            </div>
          ) : (
            <>
              <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 p-3">
                <div className="mb-2 hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_140px_120px_140px] gap-3 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:grid">
                  <span>Patient</span>
                  <span>Service</span>
                  <span>Schedule</span>
                  <span className="text-center">Status</span>
                  <span>Created</span>
                  <span className="text-right">Actions</span>
                </div>

                <ul className="space-y-2">
                  {filteredAppointments.map((appointment) => {
                    const startDate = getStartDate(appointment);
                    const endDate = getEndDate(appointment);

                    return (
                      <li
                        key={appointment.id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3 transition-all hover:border-cyan-200 hover:shadow-sm md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_140px_120px_140px] md:items-center md:gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#01377D]">
                            {appointment.patient?.user?.name || 'N/A'} <span className="text-xs text-slate-400">#{appointment.id}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-[#009DD1]">
                            {appointment.patient?.user?.email || 'N/A'}
                          </p>
                        </div>

                        <div className="mt-2 md:mt-0">
                          <p className="text-sm text-slate-800">{resolveAppointmentType(appointment) || 'N/A'}</p>
                        </div>

                        <div className="mt-2 md:mt-0">
                          <p className="text-sm text-slate-800">{startDate ? format(startDate, 'PPP') : 'N/A'}</p>
                          <p className="text-xs text-slate-500">
                            {startDate ? format(startDate, 'h:mm a') : 'N/A'}
                            {endDate ? ` – ${format(endDate, 'h:mm a')}` : ''}
                          </p>
                        </div>

                        <div className="mt-2 md:mt-0 md:justify-self-center">
                          <Badge variant="outline" className={getStatusBadgeVariant(appointment.status)}>
                            {formatStatus(appointment.status)}
                          </Badge>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 md:mt-0">
                          {appointment.created_at ? format(new Date(appointment.created_at), 'PP') : 'N/A'}
                        </div>

                        <div className="mt-2 flex justify-end md:mt-0">
                          {canReschedule(appointment) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReschedule(appointment)}
                              className="h-8 border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                            >
                              Reschedule
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Not available</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing {pageStartIndex}-{pageEndIndex} of {totalCount} appointments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === Math.max(1, totalPages)}
                    className="h-8 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={rescheduleDialogOpen} onOpenChange={handleRescheduleDialogChange}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>Choose a new date and time for this booking.</DialogDescription>
          </DialogHeader>

          {rescheduleTarget && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">
                  {rescheduleTarget.patient?.user?.name || 'Unknown patient'}
                </span>
                <span>#{rescheduleTarget.id}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>{resolveAppointmentType(rescheduleTarget) || 'Service'}</span>
                <span>•</span>
                <span>
                  {rescheduleTarget.start_time
                    ? format(new Date(rescheduleTarget.start_time), 'PPP • h:mm a')
                    : 'No schedule'}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2">
              <Label>New date</Label>
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <DatePickerCalendar
                  mode="single"
                  selected={rescheduleDate ? new Date(`${rescheduleDate}T00:00:00`) : undefined}
                  onSelect={handleRescheduleDateChange}
                  month={rescheduleMonth}
                  onMonthChange={setRescheduleMonth}
                  fromDate={minCalendarDate}
                  toDate={maxCalendarDate}
                  disabled={(date) => !isDateSelectable(date) || fullDateSet.has(normalizeDate(date))}
                  className="rounded-xl bg-white p-0"
                  classNames={{
                    months: 'flex flex-col',
                    month: 'relative flex flex-col gap-0',
                    caption: 'hidden',
                    month_caption: 'hidden',
                    nav: 'hidden',
                    caption_label: 'hidden',
                    month_grid: 'w-full border-collapse',
                    weekdays: 'flex',
                    weekday: 'flex-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600',
                    week: 'mt-1.5 flex w-full',
                    day: 'flex-1 p-0 text-center text-sm',
                    day_button:
                      'h-9 w-full cursor-pointer rounded-xl border border-transparent p-0 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50 aria-selected:rounded-xl aria-selected:border-cyan-400 aria-selected:bg-cyan-500 aria-selected:text-white data-[selected=true]:rounded-xl data-[selected=true]:border-cyan-400 data-[selected=true]:bg-cyan-500 data-[selected=true]:text-white',
                    selected: 'rounded-xl bg-cyan-500 text-white hover:bg-cyan-600',
                    today: 'rounded-xl border border-cyan-200 bg-cyan-100 text-cyan-800',
                    outside: 'text-slate-300',
                    disabled: 'cursor-not-allowed text-slate-300 opacity-60 pointer-events-none',
                  }}
                  modifiers={calendarModifiers}
                  modifiersClassNames={{
                    fullyBooked: 'rounded-xl border border-rose-200 bg-rose-50 text-rose-700',
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">Fully booked days are highlighted and disabled.</p>
            </div>

            <div className="space-y-2">
              <Label>New time</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime} disabled={!rescheduleDate || availableSlots.length === 0}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={rescheduleDate ? 'Select time slot' : 'Pick a date first'} />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900">
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {formatTimeSlot(slot)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rescheduleDate && availableSlots.length === 0 ? (
                <p className="text-xs text-rose-600">No available slots for this date.</p>
              ) : (
                <p className="text-xs text-slate-500">
                  {rescheduleDate ? `${availableSlots.length} slots available` : 'Select a date to see slots.'}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleRescheduleDialogChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReschedule}
              disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime}
            >
              {rescheduleSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;

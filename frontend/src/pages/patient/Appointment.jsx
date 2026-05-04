// Appointment.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { Calendar as DatePickerCalendar } from '../../components/ui/calendar';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, FlaskConical, Loader2, Plus, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { getAppointments, createAppointment, cancelAppointment, updateAppointment } from '../../api/Appointments';
import { getClinicMeta } from '../../api/Clinic';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '17:00';
const DEFAULT_INTERVAL = 30;
const ALL_CATEGORIES = '__all__';
const UNCATEGORIZED = '__uncategorized__';
const defaultForm = { appointmentTypeId: '', date: '', time: '', reason: '' };

const titleCase = (value = '') =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const formatTimeSlot = (slot) => {
  try {
    return format(new Date(`1970-01-01T${slot}:00`), 'h:mm a');
  } catch (error) {
    return slot;
  }
};

const formatPricePhp = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return `PHP ${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getCategoryLabel = (value) => {
  const cleaned = String(value || '').trim();
  return cleaned || 'Other';
};

const buildLocalDate = (dateStr, timeStr) => {
  console.log('buildLocalDate input:', { dateStr, timeStr });
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  console.log('buildLocalDate parsed:', { year, month, day, hours, minutes });
  const result = new Date(year, month - 1, day, hours, minutes, 0, 0);
  console.log('buildLocalDate result:', result.toString(), result.toISOString());
  return result;
};

const formatForApi = (dateObj) => {
  const pad = (value) => String(value).padStart(2, '0');
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  const hours = pad(dateObj.getHours());
  const minutes = pad(dateObj.getMinutes());
  const seconds = pad(dateObj.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

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
  // If it's already YYYY-MM-DD format, return as-is
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // If it's a UTC timestamp, convert to local date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      // Get local date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Fallback to string slicing
  }
  return String(value).slice(0, 10);
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
    case 'no_show':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatAppointmentStatusLabel = (status = '') => {
  const key = (status || '').toLowerCase();
  if (key === 'scheduled') return 'Waiting for approval';
  if (key === 'no_show') return 'No show';
  return titleCase(key || status);
};

export const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [contentView, setContentView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [calendarDraftDate, setCalendarDraftDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [formData, setFormData] = useState(defaultForm);
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null, reason: '', submitting: false });
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [closures, setClosures] = useState([]);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
    loadClinicMeta();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments({ per_page: 50 });
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setAppointments(list);
    } catch (error) {
      console.error('Failed to load appointments', error);
      toast.error('Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadClinicMeta = async () => {
    try {
      setConfigLoading(true);
      const response = await getClinicMeta();
      console.log('✅ Clinic meta loaded successfully');
      const data = response?.data?.data || {};
      setClinicSettings(data.settings || null);
      setClosures(Array.isArray(data.closures) ? data.closures : []);
      setAppointmentTypes(
        Array.isArray(data.appointment_types)
          ? data.appointment_types.filter((type) => type.is_active !== false)
          : []
      );
    } catch (error) {
      console.error('Failed to load clinic configuration:', {
        status: error?.response?.status,
        message: error?.message,
      });
      // Set defaults so dialog still works
      setClinicSettings(null);
      setClosures([]);
      setAppointmentTypes([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const pendingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment) => {
        const start = new Date(appointment.start_time);
        const status = (appointment.status || '').toLowerCase();
        return start >= now && status === 'scheduled';
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [appointments]);

  const confirmedAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment) => {
        const start = new Date(appointment.start_time);
        const status = (appointment.status || '').toLowerCase();
        return start >= now && ['confirmed', 'in_progress'].includes(status);
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = (appointment.status || '').toLowerCase();
        return status === 'completed';
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  const noShowAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment) => {
        const start = new Date(appointment.start_time);
        const status = (appointment.status || '').toLowerCase();
        return start < now && status === 'no_show';
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = (appointment.status || '').toLowerCase();
        return status === 'cancelled';
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  const rejectedAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = (appointment.status || '').toLowerCase();
        return status === 'rejected';
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  const resetForm = () => setFormData(defaultForm);

  const availableAppointmentTypes = useMemo(() => {
    return appointmentTypes.filter((type) => isTypeAvailableForDate(type, formData.date));
  }, [appointmentTypes, formData.date]);
  const serviceOnlyTypes = useMemo(() => availableAppointmentTypes, [availableAppointmentTypes]);

  const selectedServiceTypes = useMemo(() => {
    const selectedSet = new Set(selectedServiceIds.map(String));
    return serviceOnlyTypes.filter((type) => selectedSet.has(String(type.id)));
  }, [selectedServiceIds, serviceOnlyTypes]);

  const orderedSelectedServiceTypes = useMemo(() => {
    const byId = new Map(serviceOnlyTypes.map((type) => [String(type.id), type]));
    return selectedServiceIds.map((id) => byId.get(String(id))).filter(Boolean);
  }, [selectedServiceIds, serviceOnlyTypes]);
  const hasServiceSelection = orderedSelectedServiceTypes.length > 0;

  const categoryOptions = useMemo(() => {
    const unique = new Map();
    serviceOnlyTypes.forEach((type) => {
      const raw = String(type?.category || '').trim();
      if (!raw) {
        unique.set(UNCATEGORIZED, 'Other');
        return;
      }
      const normalized = raw.toLowerCase();
      if (!unique.has(normalized)) {
        unique.set(normalized, raw);
      }
    });
    return [{ value: ALL_CATEGORIES, label: 'All' }, ...Array.from(unique.entries()).map(([value, label]) => ({ value, label }))];
  }, [serviceOnlyTypes]);

  const filteredAppointmentTypes = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return serviceOnlyTypes;
    if (selectedCategory === UNCATEGORIZED) {
      return serviceOnlyTypes.filter((type) => !String(type?.category || '').trim());
    }
    return serviceOnlyTypes.filter(
      (type) => String(type?.category || '').trim().toLowerCase() === selectedCategory
    );
  }, [serviceOnlyTypes, selectedCategory]);

  const searchedAppointmentTypes = useMemo(() => {
    const query = serviceSearchQuery.trim().toLowerCase();
    if (!query) return filteredAppointmentTypes;
    return filteredAppointmentTypes.filter((type) => {
      const text = `${type?.name || ''} ${type?.category || ''} ${type?.description || ''}`.toLowerCase();
      return text.includes(query);
    });
  }, [filteredAppointmentTypes, serviceSearchQuery]);

  useEffect(() => {
    if (selectedCategory === ALL_CATEGORIES) return;
    if (categoryOptions.some((option) => option.value === selectedCategory)) return;
    setSelectedCategory(ALL_CATEGORIES);
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    setSelectedServiceIds((prev) => {
      if (prev.length === 0) return prev;
      const allowed = new Set(serviceOnlyTypes.map((type) => String(type.id)));
      const next = prev.filter((id) => allowed.has(String(id)));
      return next.length === prev.length ? prev : next;
    });
  }, [serviceOnlyTypes]);

  const serviceDuration =
    selectedServiceTypes.reduce(
      (total, type) => total + (Number(type?.estimated_minutes) || clinicSettings?.appointment_interval || DEFAULT_INTERVAL),
      0
    ) || clinicSettings?.appointment_interval || DEFAULT_INTERVAL;
  const clinicOpen = clinicSettings?.open_time || DEFAULT_OPEN;
  const clinicClose = clinicSettings?.close_time || DEFAULT_CLOSE;
  const clinicInterval = clinicSettings?.appointment_interval || DEFAULT_INTERVAL;

  const baseTimeSlots = useMemo(
    () => {
      const generated = generateTimeSlots(clinicOpen, clinicClose, clinicInterval);
      if (generated.length === 0) {
        return generateTimeSlots(DEFAULT_OPEN, DEFAULT_CLOSE, DEFAULT_INTERVAL);
      }
      return generated;
    },
    [clinicOpen, clinicClose, clinicInterval]
  );

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

  const appointmentHighlightSet = useMemo(() => {
    const highlightStatuses = new Set(['scheduled', 'confirmed', 'in_progress', 'completed']);
    const set = new Set();
    appointments.forEach((appointment) => {
      if (!appointment?.start_time) return;
      const status = (appointment.status || '').toLowerCase();
      if (!highlightStatuses.has(status)) return;
      set.add(normalizeDate(appointment.start_time));
    });
    return set;
  }, [appointments]);

  const getAvailableSlotsForDate = (dateValue, { applyServiceRules = true } = {}) => {
    if (!dateValue) return [];
    if (!isDateSelectable(dateValue)) return [];
    if (applyServiceRules && !hasServiceSelection) return [];

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
        const aptDate = normalizeDate(apt.start_time);
        const status = (apt.status || '').toLowerCase();
        return aptDate === normalizeDate(dateValue) && (status === 'confirmed' || status === 'in_progress' || status === 'completed');
      })
      .map((apt) => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);
        const aptEndWithBuffer = new Date(aptEnd.getTime() + clinicInterval * 60000);
        return { start: aptStart, end: aptEndWithBuffer };
      });

    return baseTimeSlots.filter((slot) => {
      const slotStart = new Date(`${dateValue}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
      const closeBoundary = new Date(`${dateValue}T${clinicClose}:00`);

      if (Number.isNaN(slotStart.getTime()) || slotEnd > closeBoundary) return false;

      const noClosureConflict = closuresForDay.every((window) => slotEnd <= window.start || slotStart >= window.end);
      const noAppointmentConflict = appointmentsOnDay.every((apt) => slotEnd <= apt.start || slotStart >= apt.end);

      if (!noClosureConflict || !noAppointmentConflict) return false;

      if (!applyServiceRules) return true;

      const selectedForWindow = orderedSelectedServiceTypes;
      return selectedForWindow.every((type, index) => {
        const priorMinutes = selectedForWindow
          .slice(0, index)
          .reduce((sum, item) => sum + (Number(item?.estimated_minutes) || clinicInterval), 0);
        const duration = Number(type?.estimated_minutes) || clinicInterval;
        const shiftedStart = new Date(slotStart.getTime() + priorMinutes * 60000);
        const shiftedSlot = shiftedStart.toTimeString().slice(0, 5);
        return isTypeAvailableForTime(type, dateValue, shiftedSlot, duration);
      });
    });
  };

  const fullDateSet = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarMonth));
    const end = endOfWeek(endOfMonth(calendarMonth));
    const days = eachDayOfInterval({ start, end });
    const set = new Set();
    days.forEach((day) => {
      const key = format(day, 'yyyy-MM-dd');
      if (!isDateSelectable(key)) return;
      const slots = getAvailableSlotsForDate(key, { applyServiceRules: false });
      if (slots.length === 0) set.add(key);
    });
    return set;
  }, [calendarMonth, appointments, closures, baseTimeSlots, clinicClose, clinicInterval, serviceDuration, isDateSelectable]);

  const calendarAppointmentSet = useMemo(() => {
    const set = new Set(appointmentHighlightSet);
    fullDateSet.forEach((key) => set.delete(key));
    return set;
  }, [appointmentHighlightSet, fullDateSet]);

  const calendarModifiers = useMemo(
    () => ({
      hasAppointment: (date) => calendarAppointmentSet.has(normalizeDate(date)),
      fullyBooked: (date) => fullDateSet.has(normalizeDate(date)),
    }),
    [calendarAppointmentSet, fullDateSet]
  );

  const filteredTimeOptions = useMemo(() => {
    if (!formData.date) return baseTimeSlots;
    return getAvailableSlotsForDate(formData.date, { applyServiceRules: true });
  }, [baseTimeSlots, formData.date, getAvailableSlotsForDate]);

  const handleDateChange = (value) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, date: '', time: '' }));
      return;
    }

    if (!isDateSelectable(value)) {
      toast.error('Clinic is closed on the selected day');
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, date: value, time: '' };
      if (prev.appointmentTypeId) {
        const currentType = appointmentTypes.find((type) => String(type.id) === String(prev.appointmentTypeId));
        if (currentType && !isTypeAvailableForDate(currentType, value)) {
          next.appointmentTypeId = '';
          toast.error('Selected service is not available on that date.');
        }
      }
      return next;
    });
  };

  const handleBookAppointment = async () => {
    const hasSelection = selectedServiceIds.length > 0;
    if (!formData.date || !formData.time || !hasSelection) {
      toast.error('Please complete all required fields');
      return;
    }

    const appointmentTypes = orderedSelectedServiceTypes;
    if (appointmentTypes.length === 0) {
      toast.error('Selected service is no longer available. Please refresh.');
      return;
    }

    const allDateAvailable = appointmentTypes.every((type) => isTypeAvailableForDate(type, formData.date));
    if (!allDateAvailable) {
      toast.error('One or more selected services are not available on the chosen date/time.');
      return;
    }
    if (rescheduleTarget && appointmentTypes.length !== 1) {
      toast.error('Reschedule supports one appointment at a time.');
      return;
    }

    try {
      setAppointment(true);
      const appointmentSegments = [];
      let pointer = buildLocalDate(formData.date, formData.time);
      appointmentTypes.forEach((type) => {
        const duration = Number(type?.estimated_minutes) || clinicInterval;
        const startTime = new Date(pointer);
        const endTime = new Date(pointer.getTime() + duration * 60000);
        pointer = new Date(endTime);
        appointmentSegments.push({ type, startTime, endTime });
      });

      // Double-check for conflicts with current appointment data
      const hasConflict = appointmentSegments.some(({ startTime, endTime }) =>
        appointments.some((apt) => {
          if (!apt.start_time) return false;
          if (rescheduleTarget && Number(apt.id) === Number(rescheduleTarget.id)) return false;
          const aptDate = normalizeDate(apt.start_time);
          const selectedDate = normalizeDate(formData.date);
          const status = (apt.status || '').toLowerCase();

          if (aptDate !== selectedDate || !['scheduled', 'confirmed', 'in_progress'].includes(status)) return false;

          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return !(endTime <= aptStart || startTime >= aptEnd);
        })
      );
      
      if (hasConflict) {
        toast.error('This time slot is no longer available. Please choose another time.');
        setAppointment(false);
        return;
      }

      if (rescheduleTarget) {
        const segment = appointmentSegments[0];
        const payload = {
          appointment_type_id: Number(segment.type.id),
          title: segment.type.name,
          type: segment.type.name,
          description: formData.reason?.trim() || null,
          start_time: formatForApi(segment.startTime),
          end_time: formatForApi(segment.endTime),
        };
        await updateAppointment(rescheduleTarget.id, payload);
      } else {
        for (const { type, startTime, endTime } of appointmentSegments) {
          const payload = {
            appointment_type_id: Number(type.id),
            title: type.name,
            type: type.name,
            description: formData.reason?.trim() || null,
            start_time: formatForApi(startTime),
            end_time: formatForApi(endTime),
            location: 'Campus Clinic',
          };

          await createAppointment(payload);
        }
      }

      toast.success(
        rescheduleTarget
          ? 'Appointment rescheduled successfully.'
          : appointmentSegments.length > 1
          ? `${appointmentSegments.length} service reservations submitted! Waiting for clinic confirmation.`
          : 'Appointment request submitted! Waiting for clinic confirmation.'
      );
      setContentView('list');
      resetForm();
      setSelectedServiceIds([]);
      setRescheduleTarget(null);
      loadAppointments();
    } catch (error) {
      console.error('Failed to create appointment', error);
      const message = error?.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setAppointment(false);
    }
  };

  const handleStartReschedule = (appointment) => {
    const typeId = appointment?.appointment_type_id ? String(appointment.appointment_type_id) : '';
    const start = appointment?.start_time ? new Date(appointment.start_time) : null;
    if (!typeId || !start || Number.isNaN(start.getTime())) {
      toast.error('Unable to prepare reschedule for this item.');
      return;
    }
    setRescheduleTarget(appointment);
    setSelectedServiceIds([typeId]);
    setFormData({
      appointmentTypeId: '',
      date: format(start, 'yyyy-MM-dd'),
      time: format(start, 'HH:mm'),
      reason: appointment?.description || '',
    });
    setContentView('book');
  };

  const openCancelDialog = (appointment) => {
    setCancelDialog({ open: true, appointment, reason: '', submitting: false });
  };

  const handleCancelAppointment = async () => {
    if (!cancelDialog.reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (!cancelDialog.appointment?.id) {
      toast.error('No appointment selected');
      return;
    }

    try {
      setCancelDialog((prev) => ({ ...prev, submitting: true }));
      const response = await cancelAppointment(cancelDialog.appointment.id, cancelDialog.reason.trim());
      console.log('Cancel appointment response:', response);
      
      toast.success('Appointment cancelled successfully');
      
      // Close dialog first
      setCancelDialog({ open: false, appointment: null, reason: '', submitting: false });
      
      // Small delay to ensure backend state is consistent, then reload
      setTimeout(() => {
        loadAppointments();
      }, 300);
    } catch (error) {
      console.error('Failed to cancel appointment', error);
      const message = error?.response?.data?.message || 'Unable to cancel appointment';
      toast.error(message);
      setCancelDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const minCalendarDate = new Date();
  minCalendarDate.setHours(0, 0, 0, 0);
  const maxCalendarDate = new Date(minCalendarDate.getFullYear() + 2, 11, 31);
  const requiredSelectionMissing = selectedServiceIds.length === 0;
  const appointmentDisabled = appointment || configLoading || appointmentTypes.length === 0 || requiredSelectionMissing;
  const cardClass =
    'border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,132,199,0.12)]';
  const formInputClass =
    'h-10 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-none outline-none transition-all duration-200 focus:outline-none focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-0';
  const formTextareaClass =
    'rounded-lg border border-slate-200 bg-white text-slate-700 shadow-none transition-all duration-200 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-0';
  const tabClass = (value) =>
    `rounded-full border px-4 text-xs sm:text-sm ${
      activeTab === value
        ? 'border-[#BFE6FB] bg-[#EAF5FF] text-[#0f2d57]'
        : 'border-[#D8EBFA] bg-white text-[#5A6F8F] hover:bg-[#F8FBFF] hover:text-[#0f2d57]'
    }`;
  const calendarMonthLabel = format(calendarMonth, 'MMMM yyyy');
  const calendarSelectedLabel = calendarDraftDate ? format(calendarDraftDate, 'PPP') : 'No date selected';

  const handleDatePopoverOpenChange = (open) => {
    setIsDatePickerOpen(open);
    if (!open) return;
    const selected = formData.date ? new Date(`${formData.date}T00:00:00`) : null;
    const fallback = selected || minCalendarDate;
    setCalendarDraftDate(selected);
    setCalendarMonth(fallback);
  };

  const handleCalendarPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleCalendarNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderAppointmentList = ({
    items,
    emptyMessage,
    iconWrapClass,
    iconClass,
    allowCancel = false,
    showReason = false,
    allowReschedule = false,
  }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#009DD1]" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Card className={cardClass}>
          <CardContent className="py-10 text-center text-gray-500">{emptyMessage}</CardContent>
        </Card>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
        {/* Desktop admin-like table */}
        <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.5fr_0.7fr_1fr_150px_96px] md:items-center md:gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Booked</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & Time</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Status</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Actions</p>
        </div>
        {items.map((appointment, index) => {
          const status = appointment.status?.toLowerCase();
          const canAct = status !== 'in_progress';
          const typeMeta = appointment?.appointmentType || appointment?.appointment_type || null;
          const category = typeMeta?.category || 'General';
          const priceText = formatPricePhp(typeMeta?.price);
          const duration = typeMeta?.estimated_minutes;
          return (
            <div key={appointment.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
              <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.5fr_0.7fr_1fr_150px_96px]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#01377D]">{appointment.type || 'Clinic Visit'}</p>
                  <p className="truncate text-[11px] text-[#009DD1]">
                    {duration ? `Estimated: ${duration} mins` : 'Estimated: --'}{priceText ? ` • Price: ${priceText}` : ''}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit rounded-full border-cyan-200 bg-cyan-50 px-2 py-0 text-[10px] uppercase tracking-wide text-cyan-700">
                  {category}
                </Badge>
                <div className="inline-flex items-center gap-1 text-xs text-[#5A6F8F]">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(appointment.start_time), 'EEE, MMM d, yyyy • h:mm a')}
                </div>
                <Badge className={`capitalize border ${getStatusStyles(appointment.status)}`}>{formatAppointmentStatusLabel(appointment.status)}</Badge>
                <div className="flex items-center justify-center gap-2">
                  {allowReschedule && canAct ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reschedule appointment"
                      className="h-7 w-7 rounded-md text-cyan-700 hover:bg-cyan-50"
                      onClick={() => handleStartReschedule(appointment)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                  {allowCancel && canAct ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Cancel appointment"
                      className="h-7 w-7 rounded-md text-rose-700 hover:bg-rose-50"
                      onClick={() => openCancelDialog(appointment)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
              {showReason && appointment.cancellation_reason ? (
                <div className="hidden px-4 pb-3 md:block">
                  <div className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
                    <strong>Reason:</strong> {appointment.cancellation_reason}
                  </div>
                </div>
              ) : null}

              {/* Mobile card */}
              <div className="p-3 md:hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 gap-2.5">
                    <div className={`rounded-lg p-2 ${iconWrapClass}`}>
                      <Calendar className={`h-4 w-4 ${iconClass}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#01377D]">{appointment.type || 'Clinic Visit'}</p>
                      <p className="truncate text-[11px] text-[#009DD1]">
                        {duration ? `Estimated: ${duration} mins` : 'Estimated: --'}{priceText ? ` • ${priceText}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge className={`capitalize border ${getStatusStyles(appointment.status)}`}>{formatAppointmentStatusLabel(appointment.status)}</Badge>
                </div>
                <div className="mt-2 text-xs text-[#5A6F8F]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(appointment.start_time), 'EEE, MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                {showReason && appointment.cancellation_reason ? (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
                    <strong>Reason:</strong> {appointment.cancellation_reason}
                  </div>
                ) : null}
                <div className="mt-2 flex justify-end gap-2">
                  {allowReschedule && canAct ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md border-cyan-200 px-2 text-xs text-cyan-700 hover:bg-cyan-50"
                      onClick={() => handleStartReschedule(appointment)}
                    >
                      Reschedule
                    </Button>
                  ) : null}
                  {allowCancel && canAct ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-slate-100"
                      onClick={() => openCancelDialog(appointment)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <PatientRoleBanner
        title="Appointments"
        subtitle="Book, manage, and monitor your appointment requests with quick status tracking."
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        {contentView === 'book' ? (
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2 sm:w-auto"
            onClick={() => {
              setContentView('list');
              resetForm();
              setSelectedServiceIds([]);
              setRescheduleTarget(null);
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Button>
        ) : (
          <Button
            className="flex w-full items-center justify-center gap-2 bg-[#0ea5e9] text-white hover:bg-[#0284c7] sm:w-auto"
            onClick={() => setContentView('book')}
            disabled={configLoading}
          >
            {configLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Book Appointment
              </>
            )}
          </Button>
        )}
      </div>

      {contentView === 'book' ? (
        <Card className={cardClass}>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h2 className="text-lg font-semibold text-[#0f2d57]">
                {rescheduleTarget ? 'Reschedule Appointment' : 'Book New Appointment'}
              </h2>
              <p className="mt-1 text-sm text-[#406A93]">
                {rescheduleTarget
                  ? 'Update service, date, and time then confirm your new schedule.'
                  : 'Choose a service, date, and time to submit your appointment request.'}
              </p>
            </div>
            {configLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#009DD1]" />
              </div>
            ) : (
              <div className="space-y-4">
                {appointmentTypes.length === 0 && (
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
                    No appointment types are configured yet. Please contact the clinic administrator.
                  </div>
                )}

                <div className="rounded border border-dashed border-[#97E7F5] bg-[#f8fafc] p-3 text-sm text-[#01377D]">
                  Your appointment will be reviewed and confirmed by clinic staff.
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-100 text-cyan-700">
                      <FlaskConical className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-[#01377D]">Services Appointment</p>
                      <p className="text-[11px] text-[#5A6F8F]">Select one or more services for your appointment request.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Label>Service *</Label>
                    <div className="relative w-full sm:w-[320px]">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={serviceSearchQuery}
                        onChange={(event) => setServiceSearchQuery(event.target.value)}
                        placeholder="Search services..."
                        className={`${formInputClass} h-8 pl-8 text-xs`}
                      />
                    </div>
                  </div>
                  <>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCategory(option.value)}
                          className={`h-7 rounded-lg border px-2.5 text-[11px] sm:h-8 sm:text-xs ${
                            selectedCategory === option.value
                              ? 'border-cyan-300 bg-cyan-50 text-[#0f2d57] shadow-sm'
                              : 'border-slate-200 bg-white text-[#406A93] hover:border-cyan-200 hover:bg-cyan-50/40'
                          }`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-1 text-[11px] text-[#5A6F8F]">
                      <span>{searchedAppointmentTypes.length} service{searchedAppointmentTypes.length !== 1 ? 's' : ''} found</span>
                      {selectedServiceIds.length > 0 ? (
                        <span className="font-medium text-cyan-700">{selectedServiceIds.length} selected</span>
                      ) : null}
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-1.5 sm:p-2">
                      {searchedAppointmentTypes.length === 0 ? (
                        <p className="px-2 py-6 text-sm text-[#5A6F8F]">No services found for your search/filter.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                          {searchedAppointmentTypes.map((type) => {
                            const isChecked = selectedServiceIds.map(String).includes(String(type.id));
                            return (
                              <label
                                key={type.id}
                                htmlFor={`service-${type.id}`}
                                className={`flex h-full cursor-pointer items-start gap-2 rounded-lg border bg-white p-2 transition ${
                                  isChecked
                                    ? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-[0_4px_12px_rgba(14,165,233,0.15)]'
                                    : 'border-slate-200 hover:border-cyan-200 hover:shadow-sm'
                                }`}
                              >
                                <Checkbox
                                  id={`service-${type.id}`}
                                  checked={isChecked}
                                  className="mt-0.5"
                                  onCheckedChange={(checked) =>
                                    setSelectedServiceIds((prev) => {
                                      const key = String(type.id);
                                      const exists = prev.map(String).includes(key);
                                      if (checked && !exists) return [...prev, key];
                                      if (!checked && exists) return prev.filter((id) => String(id) !== key);
                                      return prev;
                                    })
                                  }
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p
                                    className="text-xs font-semibold leading-4 text-[#0f2d57] sm:text-sm"
                                    style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      minHeight: '2rem',
                                    }}
                                  >
                                    {type.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-[#5A6F8F] sm:text-[11px]">
                                    <Badge variant="outline" className="rounded border-slate-200 bg-slate-50 px-1 py-0 text-[9px] font-medium text-slate-600 sm:text-[10px]">
                                      {getCategoryLabel(type.category)}
                                    </Badge>
                                    {type.estimated_minutes ? <span>{type.estimated_minutes} mins</span> : null}
                                    {formatPricePhp(type.price) ? <span>{formatPricePhp(type.price)}</span> : null}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                  {requiredSelectionMissing && (
                    <p className="text-xs text-amber-700">Select one service before choosing time.</p>
                  )}
                  {formData.date && availableAppointmentTypes.length === 0 && (
                    <p className="text-xs text-red-600">No services configured for this date.</p>
                  )}
                  {selectedServiceTypes.length > 0 && (
                    <p className="text-xs text-[#0f2d57]">
                      Selected services: <span className="font-semibold">{selectedServiceTypes.length}</span> • Total duration:{' '}
                      <span className="font-semibold">{serviceDuration} mins</span> • Estimated total price:{' '}
                      <span className="font-semibold">
                        {formatPricePhp(selectedServiceTypes.reduce((sum, item) => sum + (Number(item?.price) || 0), 0)) || 'PHP 0.00'}
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Popover open={isDatePickerOpen} onOpenChange={handleDatePopoverOpenChange}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          id="date"
                          className={`${formInputClass} flex w-full cursor-pointer items-center justify-between px-3 text-left appearance-none`}
                        >
                          <span className={formData.date ? 'text-slate-700' : 'text-slate-400'}>
                            {formData.date ? format(new Date(`${formData.date}T00:00:00`), 'PPP') : 'Select date'}
                          </span>
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-[min(92vw,360px)] rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_22px_54px_rgba(2,32,71,0.2)]"
                      >
                        <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-3">
                          <p className="text-sm font-semibold text-[#0f2d57]">Select Date</p>
                          <p className="text-xs text-[#406A93]">Pick your preferred appointment day.</p>
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                              onClick={handleCalendarPrevMonth}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-[#0f2d57]">{calendarMonthLabel}</p>
                              <p className="text-[10px] text-[#406A93]">{calendarSelectedLabel}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                              onClick={handleCalendarNextMonth}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1">
                              <DatePickerCalendar
                                mode="single"
                                month={calendarMonth}
                                onMonthChange={setCalendarMonth}
                                fromDate={minCalendarDate}
                                toDate={maxCalendarDate}
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
                                  hasAppointment: 'rounded-xl border border-amber-200 bg-amber-50 text-amber-800',
                                  fullyBooked: 'rounded-xl border border-rose-200 bg-rose-50 text-rose-700',
                                }}
                                selected={calendarDraftDate || undefined}
                                onSelect={(date) => {
                                  if (!date) return;
                                  setCalendarDraftDate(date);
                                  handleDateChange(format(date, 'yyyy-MM-dd'));
                                }}
                                disabled={(date) => {
                                  const normalized = format(date, 'yyyy-MM-dd');
                                  return normalized < today || !isDateSelectable(normalized);
                                }}
                                initialFocus
                              />
                            </div>
                            <div className="w-full sm:w-40">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#406A93]">Legend</p>
                              <div className="mt-2 space-y-2 text-xs text-[#4A6A8F]">
                                <div className="flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-full border border-amber-300 bg-amber-200" />
                                  May appointment
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-full border border-rose-300 bg-rose-200" />
                                  Puno na
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center border-t border-slate-100 px-4 py-3">
                          <Button
                            type="button"
                            className="h-8 cursor-pointer rounded-lg bg-cyan-500 px-3 text-xs text-white hover:bg-cyan-600"
                            onClick={() => {
                              if (!calendarDraftDate) return;
                              handleDateChange(format(calendarDraftDate, 'yyyy-MM-dd'));
                              setIsDatePickerOpen(false);
                            }}
                            disabled={!calendarDraftDate}
                          >
                            Confirm
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {formData.date && getClosuresForDate(formData.date).filter((c) => c.start_time && c.end_time).length > 0 && (
                      <p className="text-xs text-amber-600">⚠️ Partial closure on this date</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
                      disabled={!formData.date || requiredSelectionMissing || filteredTimeOptions.length === 0}
                    >
                      <SelectTrigger
                        id="time"
                        className={`${formInputClass} cursor-pointer bg-slate-50/60 hover:bg-white data-[state=open]:border-cyan-500 data-[state=open]:ring-2 data-[state=open]:ring-cyan-200`}
                      >
                        <SelectValue
                          placeholder={
                            requiredSelectionMissing
                              ? 'Select service first'
                              : !formData.date
                              ? 'Select a date first'
                              : filteredTimeOptions.length === 0
                                ? 'No slots available'
                                : 'Choose time'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 rounded-xl border border-cyan-100 bg-white p-1 shadow-[0_14px_34px_rgba(2,32,71,0.18)]">
                        {filteredTimeOptions.map((slot) => (
                          <SelectItem
                            key={slot}
                            value={slot}
                            className="cursor-pointer rounded-md py-2 text-sm text-slate-700 focus:bg-cyan-50 focus:text-cyan-800"
                          >
                            {formatTimeSlot(slot)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.date && filteredTimeOptions.length === 0 && (
                      <p className="text-xs text-red-600">No open slots for this day. Please pick another date.</p>
                    )}
                    {formData.date && filteredTimeOptions.length > 0 && (
                      <p className="text-xs text-green-600">
                        {filteredTimeOptions.length} available slot{filteredTimeOptions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason / Notes</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={formData.reason}
                    onChange={(event) => setFormData((prev) => ({ ...prev, reason: event.target.value }))}
                    className={formTextareaClass}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-slate-300 px-4 text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setContentView('list');
                      resetForm();
                      setSelectedServiceIds([]);
                      setRescheduleTarget(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookAppointment}
                    className="h-9 rounded-lg border border-cyan-600 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 text-white shadow-sm transition-all hover:from-cyan-600 hover:to-sky-600 hover:shadow-md"
                    disabled={appointmentDisabled}
                  >
                    {appointment ? <Loader2 className="w-4 h-4 animate-spin" /> : rescheduleTarget ? 'Save Reschedule' : 'Confirm Appointment'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2.5 sm:space-y-6">
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="h-10 rounded-xl border border-[#BFE6FB] bg-white px-3.5 text-sm font-medium text-[#01377D] shadow-[0_8px_24px_rgba(2,32,71,0.08)] transition-all duration-200 focus-visible:border-[#009DD1] focus-visible:ring-2 focus-visible:ring-[#97E7F5] data-[state=open]:border-[#009DD1] data-[state=open]:shadow-[0_14px_30px_rgba(2,132,199,0.16)] [&>svg]:text-[#01377D] [&>svg]:opacity-90 [&>svg]:transition-transform [&>svg]:duration-200 data-[state=open]:[&>svg]:rotate-180">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-[#BFE6FB] bg-white p-1 shadow-[0_18px_42px_rgba(2,32,71,0.18)]">
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="pending">Pending ({pendingAppointments.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="confirmed">Confirmed ({confirmedAppointments.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="completed">Completed ({completedAppointments.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="no-show">No Show ({noShowAppointments.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="cancelled">Cancelled ({cancelledAppointments.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="rejected">Rejected ({rejectedAppointments.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden bg-transparent gap-2 flex-wrap p-1 sm:flex">
          <TabsTrigger value="pending" className={tabClass('pending')}>
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className={tabClass('confirmed')}>
            Confirmed ({confirmedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className={tabClass('completed')}>
            Completed ({completedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="no-show" className={tabClass('no-show')}>
            No Show ({noShowAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className={tabClass('cancelled')}>
            Cancelled ({cancelledAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className={tabClass('rejected')}>
            Rejected ({rejectedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: pendingAppointments,
            emptyMessage: 'You have no pending appointments awaiting confirmation.',
            iconWrapClass: 'bg-blue-50',
            iconClass: 'text-[#01377D]',
            allowCancel: true,
            allowReschedule: true,
          })}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: confirmedAppointments,
            emptyMessage: 'You have no confirmed appointments.',
            iconWrapClass: 'bg-green-50',
            iconClass: 'text-green-600',
            allowCancel: true,
            allowReschedule: true,
          })}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: completedAppointments,
            emptyMessage: 'No past appointments recorded yet.',
            iconWrapClass: 'bg-gray-100',
            iconClass: 'text-gray-600',
            showReason: true,
          })}
        </TabsContent>

        <TabsContent value="no-show" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: noShowAppointments,
            emptyMessage: 'No missed appointments recorded.',
            iconWrapClass: 'bg-orange-50',
            iconClass: 'text-orange-600',
          })}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: cancelledAppointments,
            emptyMessage: 'No cancelled appointments.',
            iconWrapClass: 'bg-red-50',
            iconClass: 'text-red-600',
            showReason: true,
          })}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3 pt-1 sm:pt-2">
          {renderAppointmentList({
            items: rejectedAppointments,
            emptyMessage: 'No rejected appointments.',
            iconWrapClass: 'bg-red-50',
            iconClass: 'text-red-600',
            showReason: true,
          })}
        </TabsContent>
      </Tabs>
      )}

      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialog({ open: false, appointment: null, reason: '', submitting: false });
          } else {
            setCancelDialog((prev) => ({ ...prev, open: true }));
          }
        }}
      >
        <DialogContent className="w-[min(90vw,620px)] max-h-[86vh] overflow-y-auto rounded-3xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.34)] [&>button]:hidden">
          <DialogHeader className="rounded-t-3xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="text-xl text-[#01377D]">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-[#4A6A8F]">
              Provide a quick reason so we can notify the clinic.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-3 py-3 sm:space-y-4 sm:px-6 sm:py-4">
            {cancelDialog.appointment && (
              <div className="space-y-1.5 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-2.5 sm:p-3">
                <p className="text-sm font-semibold text-[#01377D]">
                  {cancelDialog.appointment.title || 'Clinic Appointment'}
                </p>
                <p className="text-xs text-[#4A6A8F]">
                  {cancelDialog.appointment.type || 'Visit'}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#4A6A8F]">
                  <Clock className="w-3 h-3" />
                  {cancelDialog.appointment.start_time 
                    ? format(new Date(cancelDialog.appointment.start_time), 'EEEE, MMM d, yyyy • h:mm a')
                    : 'Date/time not available'
                  }
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Reason for Cancellation *
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Please tell us why you're cancelling this appointment..."
                value={cancelDialog.reason}
                onChange={(event) => setCancelDialog((prev) => ({ ...prev, reason: event.target.value }))}
                className="min-h-[92px] rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-none transition-all duration-200 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-200 sm:min-h-[110px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/40 px-3 py-3 sm:justify-end sm:px-6 sm:py-4">
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, appointment: null, reason: '', submitting: false })}
              disabled={cancelDialog.submitting}
              className="h-9 w-full rounded-xl border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100 sm:h-10 sm:w-auto sm:px-4"
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment} 
              disabled={cancelDialog.submitting || !cancelDialog.reason.trim()}
              className="h-9 w-full rounded-xl bg-rose-600 px-3 text-sm text-white hover:bg-rose-700 sm:h-10 sm:w-auto sm:px-4"
            >
              {cancelDialog.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointment;

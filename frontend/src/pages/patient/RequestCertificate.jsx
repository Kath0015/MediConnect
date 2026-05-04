// RequestCertificate.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar as DatePickerCalendar } from '../../components/ui/calendar';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileCheck, Calendar, Clock, Plus, Loader2, Download, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { createMedCert, getMedCerts, downloadMedCert } from '../../api/MedicalCertificates';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import PatientPageSkeleton from '../../components/patient/PatientPageSkeleton';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const statusStyles = {
  approved: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  'no-show': 'bg-gray-100 text-gray-700 border-gray-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
};

const titleCase = (value = '') =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const defaultForm = { type: '', reason: '', startDate: '', endDate: '', recommendations: '' };

export const RequestCertificate = () => {
  const PAGE_SIZE = 10;
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [requests, setRequests] = useState([]);
  const [medcertTypes, setMedcertTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(new Date());
  const [endCalendarMonth, setEndCalendarMonth] = useState(new Date());
  const cardClass =
    'border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,132,199,0.12)]';
  const tabClass = (value) =>
    `rounded-full border px-4 text-xs sm:text-sm ${
      activeTab === value
        ? 'border-[#BFE6FB] bg-[#EAF5FF] text-[#0f2d57]'
        : 'border-[#D8EBFA] bg-white text-[#5A6F8F] hover:bg-[#F8FBFF] hover:text-[#0f2d57]'
    }`;

  const parseYmdToDate = (value) => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDateLabel = (value) => {
    const parsed = parseYmdToDate(value);
    return parsed ? format(parsed, 'PPP') : 'Select date';
  };

  const pickerClassNames = {
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
      'h-9 w-full cursor-pointer rounded-full border border-transparent p-0 text-sm font-medium text-slate-700 transition-colors hover:bg-cyan-50 aria-selected:rounded-full aria-selected:border-cyan-400 aria-selected:bg-cyan-500 aria-selected:text-white data-[selected=true]:rounded-full data-[selected=true]:border-cyan-400 data-[selected=true]:bg-cyan-500 data-[selected=true]:text-white',
    selected: 'rounded-full bg-cyan-500 text-white hover:bg-cyan-600',
    today: 'rounded-full border border-cyan-200 bg-cyan-100 text-cyan-800',
    outside: 'text-slate-300',
    disabled: 'cursor-not-allowed text-slate-300 opacity-60 pointer-events-none',
  };

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMedCerts({ per_page: 50 });
      const payload = response?.data;
      setRequests(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      console.error('Failed to load certificates', error);
      toast.error('Unable to load certificate history');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMedcertTypes = useCallback(async () => {
    try {
      const response = await api.get('/api/medcert/types');
      console.log('Medcert types response:', response);
      
      // Extract types from the correct path in response
      const types = response?.data?.data?.types || response?.data?.types || [];
      
      if (!types || types.length === 0) {
        console.warn('No medical certificate types returned from API');
        toast.warning('No certificate types available. Please contact support.');
        setMedcertTypes([]);
        return;
      }
      
      const formattedTypes = types.map(t => ({
        value: t.type || t.reason || String(t.id),
        label: t.type || t.reason || 'Unknown Type',
      }));
      
      console.log('Formatted types:', formattedTypes);
      setMedcertTypes(formattedTypes);
    } catch (error) {
      console.error('Failed to load medical certificate types', error);
      toast.error('Unable to load certificate types. Please try again later.');
      setMedcertTypes([]);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    loadMedcertTypes();
  }, [loadRequests, loadMedcertTypes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.type || !form.reason || !form.startDate || !form.endDate) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await createMedCert({
        type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        purpose: form.reason,
        recommendations: form.recommendations || undefined,
      });
      toast.success('Certificate request submitted successfully!');
      setForm(defaultForm);
      setDialogOpen(false);
      loadRequests();
    } catch (error) {
      console.error('Failed to submit certificate', error);
      const message = error?.response?.data?.message || 'Unable to submit request';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (request) => {
    try {
      setDownloadingId(request.id);
      const response = await downloadMedCert(request.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `med-cert-${request.certificate_number || request.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate', error);
      toast.error('Unable to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  const displayRequests = requests;
  const pendingRequests = displayRequests.filter(r => r.status === 'pending');
  const approvedRequests = displayRequests.filter(r => r.status === 'approved');
  const rejectedRequests = displayRequests.filter(r => r.status === 'rejected');
  const completedRequests = displayRequests.filter(r => r.status === 'completed');
  const noShowRequests = displayRequests.filter(r => r.status === 'no-show');

  const requestsByStatus = {
    pending: pendingRequests,
    approved: approvedRequests,
    rejected: rejectedRequests,
    completed: completedRequests,
    'no-show': noShowRequests,
  };

  const activeRequests = requestsByStatus[activeTab] || [];
  const totalPages = Math.max(1, Math.ceil(activeRequests.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = activeRequests.length > 0 ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = activeRequests.length > 0 ? Math.min(safeCurrentPage * PAGE_SIZE, activeRequests.length) : 0;
  const paginatedRequests = activeRequests.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatStatusLabel = (status = '') => {
    if (status === 'no-show') return 'No Show';
    return titleCase(status);
  };

  const formatDateSafe = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : format(parsed, 'MMM d, yyyy');
  };

  const renderTable = () => {
    if (activeRequests.length === 0) {
      return (
        <Card className={cardClass}>
          <CardContent className="py-10 text-center text-gray-500">
            No {activeTab} certificate requests.
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
          <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.1fr_1.1fr_1.4fr_140px_120px] md:items-center md:gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Certificate</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Period</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Purpose / Notes</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Status</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Actions</p>
          </div>
          {paginatedRequests.map((request, index) => {
            const status = request.status || activeTab;
            const statusClass = statusStyles[status] || statusStyles.pending;
            const purposeText = request.purpose || request.medical_reason || 'No details provided';
            const periodText = `${formatDateSafe(request.start_date)} - ${formatDateSafe(request.end_date)}`;

            return (
              <div key={request.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.1fr_1.1fr_1.4fr_140px_120px]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#01377D]">{request.type || 'Medical Certificate'}</p>
                    <p className="truncate text-[11px] text-[#009DD1]">Request #{request.id}</p>
                  </div>
                  <p className="text-xs text-[#5A6F8F]">{periodText}</p>
                  <p className="line-clamp-2 text-xs text-[#5A6F8F]">
                    {status === 'rejected' && request.rejection_reason
                      ? `Reason: ${request.rejection_reason}`
                      : status === 'approved' && request.pickup_date
                      ? `Pickup date: ${formatDateSafe(request.pickup_date)}`
                      : purposeText}
                  </p>
                  <div className="flex justify-center">
                    <Badge className={`capitalize border ${statusClass}`}>{formatStatusLabel(status)}</Badge>
                  </div>
                  <div className="flex justify-center">
                    {['approved', 'completed'].includes(status) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                        onClick={() => handleDownload(request)}
                        disabled={downloadingId === request.id}
                      >
                        {downloadingId === request.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Download
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#01377D]">{request.type || 'Medical Certificate'}</p>
                      <p className="truncate text-[11px] text-[#009DD1]">Request #{request.id}</p>
                    </div>
                    <Badge className={`capitalize border ${statusClass}`}>{formatStatusLabel(status)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-[#5A6F8F]">{periodText}</p>
                  <p className="mt-1 text-xs text-[#5A6F8F]">
                    {status === 'rejected' && request.rejection_reason
                      ? `Reason: ${request.rejection_reason}`
                      : status === 'approved' && request.pickup_date
                      ? `Pickup date: ${formatDateSafe(request.pickup_date)}`
                      : purposeText}
                  </p>
                  {['approved', 'completed'].includes(status) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-8 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                      onClick={() => handleDownload(request)}
                      disabled={downloadingId === request.id}
                    >
                      {downloadingId === request.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Download
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {pageStart}-{pageEnd} of {activeRequests.length} requests
          </p>
          <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Back
            </Button>
            <span className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className="h-8 min-w-[78px] justify-self-end border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return <PatientPageSkeleton variant="tabs" rows={4} />;
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <PatientRoleBanner
        title="Medical Certificates"
        subtitle="Request and monitor your certificate status in one place."
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex w-full items-center justify-center gap-2 bg-[#0ea5e9] text-white hover:bg-[#0284c7] sm:w-auto">
              <Plus className="w-4 h-4" />
              Request Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[min(92vw,720px)] max-h-[88vh] overflow-y-auto rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.28)] sm:max-h-none sm:overflow-visible">
            <DialogHeader className="sticky top-0 z-10 rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
              <DialogTitle className="text-xl text-[#01377D]">Request Medical Certificate</DialogTitle>
              <DialogDescription className="text-[#4A6A8F]">
                Fill out this short form to submit your certificate request.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
              <div className="rounded-xl border border-dashed border-[#97E7F5] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#01377D]">
                Your request will be reviewed and approved by clinic staff.
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert-type">Certificate Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger
                    id="cert-type"
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white data-[state=open]:border-cyan-500 data-[state=open]:ring-2 data-[state=open]:ring-cyan-200"
                  >
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-xl border border-cyan-100 bg-white p-1 shadow-[0_14px_34px_rgba(2,32,71,0.18)]">
                    {medcertTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="cursor-pointer rounded-md py-2 text-sm text-slate-700 focus:bg-cyan-50 focus:text-cyan-800"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Popover
                    open={isStartPickerOpen}
                    onOpenChange={(open) => {
                      setIsStartPickerOpen(open);
                      if (open) {
                        setStartCalendarMonth(parseYmdToDate(form.startDate) || new Date());
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        id="start-date"
                        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-left text-sm text-slate-700 hover:bg-white"
                      >
                        <span className={form.startDate ? 'text-slate-700' : 'text-slate-400'}>
                          {formatDateLabel(form.startDate)}
                        </span>
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      sideOffset={8}
                      className="w-[min(92vw,340px)] rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_22px_54px_rgba(2,32,71,0.2)]"
                    >
                      <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f2d57]">Select Start Date</p>
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setStartCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <p className="text-xs font-semibold text-[#0f2d57]">{format(startCalendarMonth, 'MMMM yyyy')}</p>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setStartCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <DatePickerCalendar
                          mode="single"
                          month={startCalendarMonth}
                          onMonthChange={setStartCalendarMonth}
                          selected={parseYmdToDate(form.startDate) || undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            const selected = format(date, 'yyyy-MM-dd');
                            setForm((prev) => {
                              const next = { ...prev, startDate: selected };
                              if (prev.endDate && prev.endDate < selected) {
                                next.endDate = selected;
                              }
                              return next;
                            });
                            setIsStartPickerOpen(false);
                          }}
                          className="rounded-xl bg-white p-0"
                          classNames={pickerClassNames}
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date *</Label>
                  <Popover
                    open={isEndPickerOpen}
                    onOpenChange={(open) => {
                      setIsEndPickerOpen(open);
                      if (open) {
                        setEndCalendarMonth(parseYmdToDate(form.endDate) || parseYmdToDate(form.startDate) || new Date());
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        id="end-date"
                        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-left text-sm text-slate-700 hover:bg-white"
                      >
                        <span className={form.endDate ? 'text-slate-700' : 'text-slate-400'}>
                          {formatDateLabel(form.endDate)}
                        </span>
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      sideOffset={8}
                      className="w-[min(92vw,340px)] rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_22px_54px_rgba(2,32,71,0.2)]"
                    >
                      <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f2d57]">Select End Date</p>
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setEndCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <p className="text-xs font-semibold text-[#0f2d57]">{format(endCalendarMonth, 'MMMM yyyy')}</p>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setEndCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <DatePickerCalendar
                          mode="single"
                          month={endCalendarMonth}
                          onMonthChange={setEndCalendarMonth}
                          selected={parseYmdToDate(form.endDate) || undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            setForm((prev) => ({ ...prev, endDate: format(date, 'yyyy-MM-dd') }));
                            setIsEndPickerOpen(false);
                          }}
                          disabled={(date) => {
                            const minDate = parseYmdToDate(form.startDate);
                            return minDate ? date < minDate : false;
                          }}
                          className="rounded-xl bg-white p-0"
                          classNames={pickerClassNames}
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Purpose *</Label>
                <Textarea
                  id="reason"
                  placeholder="What is the purpose of this certificate?..."
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="min-h-[96px] rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations (Optional)</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Any additional recommendations..."
                  value={form.recommendations}
                  onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value }))}
                  rows={2}
                  className="min-h-[84px] rounded-xl border-slate-200"
                />
              </div>

              <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/40 pt-4 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-lg border-slate-300 sm:w-auto"
                  onClick={() => {
                    setForm(defaultForm);
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 w-full rounded-lg bg-[#009DD1] text-white hover:bg-[#007ea8] sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2.5 sm:space-y-6">
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="h-10 rounded-xl border border-[#BFE6FB] bg-white px-3.5 text-sm font-medium text-[#01377D] shadow-[0_8px_24px_rgba(2,32,71,0.08)] transition-all duration-200 focus-visible:border-[#009DD1] focus-visible:ring-2 focus-visible:ring-[#97E7F5] data-[state=open]:border-[#009DD1]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-[#BFE6FB] bg-white p-1 shadow-[0_18px_42px_rgba(2,32,71,0.18)]">
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="pending">Pending ({pendingRequests.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="approved">Approved ({approvedRequests.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="rejected">Rejected ({rejectedRequests.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="completed">Completed ({completedRequests.length})</SelectItem>
              <SelectItem className="h-10 rounded-lg px-3 text-sm font-medium text-[#01377D] focus:bg-cyan-50 focus:text-[#01377D]" value="no-show">No Show ({noShowRequests.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden bg-transparent gap-2 flex-wrap p-1 sm:flex">
          <TabsTrigger value="pending" className={tabClass('pending')}>
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className={tabClass('approved')}>
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className={tabClass('rejected')}>
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className={tabClass('completed')}>
            Completed ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="no-show" className={tabClass('no-show')}>
            No Show ({noShowRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 pt-1 sm:pt-2">{renderTable()}</TabsContent>
        <TabsContent value="approved" className="space-y-4 pt-1 sm:pt-2">{renderTable()}</TabsContent>
        <TabsContent value="rejected" className="space-y-4 pt-1 sm:pt-2">{renderTable()}</TabsContent>
        <TabsContent value="completed" className="space-y-4 pt-1 sm:pt-2">{renderTable()}</TabsContent>
        <TabsContent value="no-show" className="space-y-4 pt-1 sm:pt-2">{renderTable()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestCertificate;
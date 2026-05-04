// RequestManagement.jsx - Medical Certificate Approval with Real Data
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar as DatePickerCalendar } from '../../components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { FileBadge, Search, CheckCircle, XCircle, Loader2, X, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMedCerts, approveMedCert, rejectMedCert, markMedCertCompleted } from '../../api/ClinicianDashboard';
import { toast } from 'sonner';
import { format } from 'date-fns';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';

export const RequestManagement = () => {
  const [medCerts, setMedCerts] = useState([]);
  const [allMedCerts, setAllMedCerts] = useState([]); // Keep all records for counting
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedCert, setSelectedCert] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [reason, setReason] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [completedId, setCompletedId] = useState(null);
  const [isPickupPickerOpen, setIsPickupPickerOpen] = useState(false);
  const [pickupCalendarMonth, setPickupCalendarMonth] = useState(new Date());

  useEffect(() => {
    loadMedCerts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when tab changes
  }, [activeTab]);

  const loadMedCerts = async () => {
    try {
      setLoading(true);
      // Load ALL medcerts without status filter to get accurate counts
      const response = await getMedCerts({ per_page: 999 });
      const allData = response.data.data || [];
      const visibleData = allData.filter((cert) => cert.status !== 'no-show');

      setAllMedCerts(visibleData);
      setMedCerts(visibleData);
    } catch (err) {
      console.error('Failed to load medical certificates:', err);
      toast.error('Failed to load medical certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCert) return;

    try {
      setProcessing(true);
      await approveMedCert(selectedCert.id, {
        pickup_date: pickupDate || null,
      });
      toast.success('Medical certificate approved successfully');
      setActionDialog({ open: false, type: null });
      setSelectedCert(null);
      setPickupDate('');
      loadMedCerts();
    } catch (err) {
      console.error('Failed to approve medical certificate:', err);
      toast.error(err.response?.data?.message || 'Failed to approve medical certificate');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCert || !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      await rejectMedCert(selectedCert.id, reason);
      toast.success('Medical certificate rejected');
      setActionDialog({ open: false, type: null });
      setSelectedCert(null);
      setReason('');
      loadMedCerts();
    } catch (err) {
      console.error('Failed to reject medical certificate:', err);
      toast.error(err.response?.data?.message || 'Failed to reject medical certificate');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkCompleted = async (certId) => {
    if (!certId) return;

    try {
      setCompletedId(certId);
      await markMedCertCompleted(certId);
      toast.success('Certificate marked as completed');
      loadMedCerts();
    } catch (err) {
      console.error('Failed to mark as completed:', err);
      toast.error(err.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setCompletedId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const parseYmdToDate = (value) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateLabel = (value) => {
    const parsed = parseYmdToDate(value);
    return parsed ? format(parsed, 'PPP') : 'Select pickup date';
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

  const filteredCerts = medCerts.filter(cert => {
    const matchesSearch = 
      cert.patient?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.patient?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab status
    if (activeTab === 'pending') {
      return matchesSearch && cert.status === 'pending';
    } else if (activeTab === 'approved') {
      return matchesSearch && cert.status === 'approved';
    } else if (activeTab === 'rejected') {
      return matchesSearch && cert.status === 'rejected';
    } else if (activeTab === 'completed') {
      return matchesSearch && cert.status === 'completed';
    } else if (activeTab === 'no-show') {
      return matchesSearch && cert.status === 'no-show';
    }

    return matchesSearch;
  });

  // Calculate counts from ALL data (not just filtered)
  const pendingCount = allMedCerts.filter(c => c.status === 'pending').length;
  const approvedCount = allMedCerts.filter(c => c.status === 'approved').length;
  const rejectedCount = allMedCerts.filter(c => c.status === 'rejected').length;
  const completedCount = allMedCerts.filter(c => c.status === 'completed').length;
  const noShowCount = allMedCerts.filter(c => c.status === 'no-show').length;

  // Pagination logic for current tab
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCerts = filteredCerts.slice(startIndex, endIndex);
  const tabTotalPages = Math.max(1, Math.ceil(filteredCerts.length / pageSize));

  useEffect(() => {
    if (currentPage > tabTotalPages) {
      setCurrentPage(tabTotalPages);
    }
  }, [currentPage, tabTotalPages]);

  const renderDataTable = () => {
    if (filteredCerts.length === 0) {
      return (
        <Card className="border-[#97E7F5] shadow-sm bg-white">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <FileBadge className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No {activeTab} certificate requests</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
          <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.2fr_0.9fr_1fr_1.4fr_120px_120px] md:items-center md:gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Period</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Details</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Status</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</p>
          </div>

          {paginatedCerts.map((cert, index) => {
            const detailText =
              activeTab === 'rejected'
                ? cert.rejection_reason || 'No rejection reason provided.'
                : activeTab === 'approved'
                ? cert.pickup_date
                  ? `Pickup: ${format(new Date(cert.pickup_date), 'PP')}`
                  : 'Pickup date not set.'
                : cert.purpose || 'No purpose provided.';

            return (
              <div key={cert.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.2fr_0.9fr_1fr_1.4fr_120px_120px]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#01377D]">{cert.patient?.user?.name || 'N/A'}</p>
                    <p className="truncate text-[11px] text-[#009DD1]">{cert.patient?.user?.email || 'No email'}</p>
                  </div>
                  <p className="truncate text-xs text-[#5A6F8F]">{cert.type || 'N/A'}</p>
                  <p className="text-xs text-[#5A6F8F]">
                    {cert.start_date && cert.end_date
                      ? `${format(new Date(cert.start_date), 'PP')} - ${format(new Date(cert.end_date), 'PP')}`
                      : 'N/A'}
                  </p>
                  <p className="line-clamp-2 text-xs text-[#5A6F8F]">{detailText}</p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className={getStatusBadgeVariant(cert.status)}>
                      {cert.status}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2">
                    {activeTab === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionDialog({ open: true, type: 'approve' });
                          }}
                          className="h-8 w-8 border-green-200 bg-green-50 p-0 text-green-700 hover:bg-green-100"
                          title="Approve request"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionDialog({ open: true, type: 'reject' });
                          }}
                          className="h-8 w-8 border-red-200 bg-red-50 p-0 text-red-700 hover:bg-red-100"
                          title="Reject request"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(cert.id)}
                        disabled={completedId === cert.id}
                        className="h-8 w-8 border-blue-200 bg-blue-50 p-0 text-blue-700 hover:bg-blue-100"
                        title="Mark as completed"
                      >
                        {completedId === cert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 p-3 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#01377D]">{cert.patient?.user?.name || 'N/A'}</p>
                      <p className="text-[11px] text-[#009DD1]">{cert.patient?.user?.email || 'No email'}</p>
                    </div>
                    <Badge variant="outline" className={getStatusBadgeVariant(cert.status)}>
                      {cert.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#5A6F8F]">{cert.type || 'N/A'}</p>
                  <p className="text-xs text-[#5A6F8F]">
                    {cert.start_date && cert.end_date
                      ? `${format(new Date(cert.start_date), 'PP')} - ${format(new Date(cert.end_date), 'PP')}`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-[#5A6F8F]">{detailText}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeTab === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionDialog({ open: true, type: 'approve' });
                          }}
                          className="h-8 w-8 border-green-200 bg-green-50 p-0 text-green-700 hover:bg-green-100"
                          title="Approve request"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionDialog({ open: true, type: 'reject' });
                          }}
                          className="h-8 w-8 border-red-200 bg-red-50 p-0 text-red-700 hover:bg-red-100"
                          title="Reject request"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(cert.id)}
                        disabled={completedId === cert.id}
                        className="h-8 w-8 border-blue-200 bg-blue-50 p-0 text-blue-700 hover:bg-blue-100"
                        title="Mark as completed"
                      >
                        {completedId === cert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredCerts.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredCerts.length)} of {filteredCerts.length} requests
          </p>
          <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Back
            </Button>
            <div className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
              Page {currentPage} of {tabTotalPages}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(tabTotalPages, prev + 1))}
              disabled={currentPage === tabTotalPages}
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
    return <StaffPageSkeleton variant="tabs" rows={4} />;
  }

  return (
    <div className="space-y-6">
      <StaffRoleBanner
        title="Request Management"
        subtitle="Review and process medical certificate requests with clear status controls."
        primaryAction={{ label: 'Open Documents', to: '/clinician/documents' }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 transition-all duration-200 focus:border-cyan-500 focus:ring-cyan-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {filteredCerts.length} result{filteredCerts.length === 1 ? '' : 's'} in this status
        </p>
      </div>

      {/* Status Cards - Clickable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <button
          onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
          className={`text-left rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === 'pending'
              ? 'border-2 border-amber-500 bg-gradient-to-b from-white to-amber-50/70'
              : 'border border-amber-200/60 bg-gradient-to-b from-white to-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">{pendingCount}</p>
              <p className="text-[11px] text-amber-700/80">Awaiting approval</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <FileBadge className="h-4 w-4" />
            </div>
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
          className={`text-left rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === 'approved'
              ? 'border-2 border-emerald-500 bg-gradient-to-b from-white to-emerald-50/70'
              : 'border border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{approvedCount}</p>
              <p className="text-[11px] text-emerald-700/80">Ready for release</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileBadge className="h-4 w-4" />
            </div>
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('rejected'); setCurrentPage(1); }}
          className={`text-left rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === 'rejected'
              ? 'border-2 border-rose-500 bg-gradient-to-b from-white to-rose-50/70'
              : 'border border-rose-200/60 bg-gradient-to-b from-white to-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700">Rejected</p>
              <p className="mt-1 text-2xl font-semibold text-rose-700">{rejectedCount}</p>
              <p className="text-[11px] text-rose-700/80">Need follow-up</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-100 text-rose-700">
              <FileBadge className="h-4 w-4" />
            </div>
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
          className={`text-left rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === 'completed'
              ? 'border-2 border-blue-500 bg-gradient-to-b from-white to-blue-50/70'
              : 'border border-blue-200/60 bg-gradient-to-b from-white to-blue-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Completed</p>
              <p className="mt-1 text-2xl font-semibold text-blue-700">{completedCount}</p>
              <p className="text-[11px] text-blue-700/80">Successfully issued</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-blue-700">
              <FileBadge className="h-4 w-4" />
            </div>
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('no-show'); setCurrentPage(1); }}
          className={`text-left rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === 'no-show'
              ? 'border-2 border-slate-500 bg-gradient-to-b from-white to-slate-50/70'
              : 'border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">No Show</p>
              <p className="mt-1 text-2xl font-semibold text-slate-700">{noShowCount}</p>
              <p className="text-[11px] text-slate-700/80">Unclaimed requests</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <FileBadge className="h-4 w-4" />
            </div>
          </div>
        </button>
      </div>

      {/* DataTable */}
      {renderDataTable()}

      {/* Action Dialogs */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => {
        if (!open) {
          setActionDialog({ open: false, type: null });
          setSelectedCert(null);
          setReason('');
          setPickupDate('');
          setIsPickupPickerOpen(false);
        }
      }}>
        <DialogContent className="w-[min(92vw,700px)] max-h-[88vh] overflow-y-auto rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.28)] [&>button]:hidden">
          <DialogHeader className="sticky top-0 z-10 rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="text-xl text-[#01377D]">
              {actionDialog.type === 'approve' ? 'Approve Medical Certificate' : 'Reject Medical Certificate'}
            </DialogTitle>
            <DialogDescription className="text-[#4A6A8F]">
              {actionDialog.type === 'approve'
                ? 'Review and approve this medical certificate request. Set a pickup date if needed.'
                : 'Please provide a reason for rejecting this medical certificate request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Patient:</span> {selectedCert.patient?.user?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Type:</span> {selectedCert.type}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Purpose:</span> {selectedCert.purpose}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Period:</span> {selectedCert.start_date && selectedCert.end_date ? `${format(new Date(selectedCert.start_date), 'PP')} - ${format(new Date(selectedCert.end_date), 'PP')}` : 'N/A'}
                </p>
              </div>

              {actionDialog.type === 'approve' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#01377D] block">
                    Pickup Date *
                  </label>
                  <Popover
                    open={isPickupPickerOpen}
                    onOpenChange={(open) => {
                      setIsPickupPickerOpen(open);
                      if (open) {
                        setPickupCalendarMonth(parseYmdToDate(pickupDate) || new Date());
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-left text-sm text-slate-700 hover:bg-white"
                      >
                        <span className={pickupDate ? 'text-slate-700' : 'text-slate-400'}>
                          {formatDateLabel(pickupDate)}
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
                        <p className="text-sm font-semibold text-[#0f2d57]">Select Pickup Date</p>
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setPickupCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <p className="text-xs font-semibold text-[#0f2d57]">{format(pickupCalendarMonth, 'MMMM yyyy')}</p>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => setPickupCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <DatePickerCalendar
                          mode="single"
                          month={pickupCalendarMonth}
                          onMonthChange={setPickupCalendarMonth}
                          selected={parseYmdToDate(pickupDate) || undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            setPickupDate(format(date, 'yyyy-MM-dd'));
                            setIsPickupPickerOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="rounded-xl bg-white p-0"
                          classNames={pickerClassNames}
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500">
                    Set the date when the patient can pick up their certificate from the clinic.
                  </p>
                </div>
              )}

              {actionDialog.type === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#01377D] mb-2 block">
                    Rejection Reason *
                  </label>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[100px] rounded-xl border-slate-200 bg-white focus:border-[#009DD1] focus:ring-[#009DD1]"
                    rows={4}
                  />
                </div>
              )}

              <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/40 pt-4 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionDialog({ open: false, type: null });
                    setSelectedCert(null);
                    setReason('');
                    setPickupDate('');
                  }}
                  disabled={processing}
                  className="h-10 w-full rounded-lg border-slate-300 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={actionDialog.type === 'approve' ? handleApprove : handleReject}
                  disabled={processing || (actionDialog.type === 'reject' && !reason.trim()) || (actionDialog.type === 'approve' && !pickupDate.trim())}
                  className={actionDialog.type === 'approve'
                    ? 'h-10 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white sm:w-auto'
                    : 'h-10 w-full rounded-lg bg-red-600 hover:bg-red-700 text-white sm:w-auto'}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionDialog.type === 'approve' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestManagement;
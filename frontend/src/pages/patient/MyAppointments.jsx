import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  Plus,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Eye,
  X,
  Loader2,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAppointments, cancelAppointment } from '../../api/Appointments';
import { sendMessage } from '../../api/Messages';
import { useNavigate } from 'react-router-dom';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null, reason: '' });
  const [detailsModal, setDetailsModal] = useState({ open: false, appointment: null });
  const [messageModal, setMessageModal] = useState({ open: false, appointment: null, message: '', sending: false });

  // Load appointments
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments({ per_page: 100 });
      const data = Array.isArray(response?.data?.data) ? response.data.data : response?.data || [];
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
      toast.error('Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments by status
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const start = new Date(apt.start_time);
        const status = (apt.status || '').toLowerCase();
        return start >= now && ['scheduled', 'confirmed', 'in_progress'].includes(status);
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments
      .filter(apt => (apt.status || '').toLowerCase() === 'completed')
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const status = (apt.status || '').toLowerCase();
        return ['cancelled', 'no_show', 'rejected'].includes(status);
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [appointments]);

  // Filter by search
  const getFilteredAppointments = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(apt =>
      (apt.appointment_type?.name || '').toLowerCase().includes(query) ||
      (apt.clinician?.name || '').toLowerCase().includes(query) ||
      (apt.location || '').toLowerCase().includes(query)
    );
  };

  // Tab data
  const tabData = {
    upcoming: {
      label: 'Upcoming',
      count: upcomingAppointments.length,
      appointments: getFilteredAppointments(upcomingAppointments),
      icon: Calendar,
    },
    completed: {
      label: 'Completed',
      count: completedAppointments.length,
      appointments: getFilteredAppointments(completedAppointments),
    },
    cancelled: {
      label: 'Cancelled',
      count: cancelledAppointments.length,
      appointments: getFilteredAppointments(cancelledAppointments),
    },
  };

  const activeTabData = tabData[selectedTab];

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelDialog.appointment) return;
    try {
      setCancelDialog(prev => ({ ...prev, submitting: true }));
      await cancelAppointment(cancelDialog.appointment.id, cancelDialog.reason);
      toast.success('Appointment cancelled successfully');
      await loadAppointments();
      setCancelDialog({ open: false, appointment: null, reason: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // Handle message staff
  const handleSendMessage = async () => {
    if (!messageModal.message.trim() || !messageModal.appointment) return;
    try {
      setMessageModal(prev => ({ ...prev, sending: true }));
      
      // Get staff/clinician ID from appointment
      const staffId = messageModal.appointment.clinician_id || messageModal.appointment.doctor_id;
      if (!staffId) {
        toast.error('Staff member not found for this appointment');
        return;
      }

      await sendMessage({
        receiver_id: staffId,
        message: messageModal.message.trim(),
      });

      toast.success('Message sent to staff');
      setMessageModal({ open: false, appointment: null, message: '', sending: false });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setMessageModal(prev => ({ ...prev, sending: false }));
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      case 'no_show':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">No Show</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date(0, 0, 0, hours, minutes);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr;
    }
  };

  // Appointment Card Component
  const AppointmentCard = ({ appointment }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#009DD1]" />
              <CardTitle className="text-lg text-slate-900">
                {appointment.appointment_type?.name || 'Appointment'}
              </CardTitle>
            </div>
            <p className="text-sm text-slate-500">Appointment ID: #{appointment.id}</p>
          </div>
          <div>{getStatusBadge(appointment.status)}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Appointment Details Grid */}
        <div className="space-y-3 mb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{formatDate(appointment.start_time)}</p>
              <p className="text-xs text-slate-500">
                {formatTime(appointment.start_time?.split(' ')[1] || '')}
              </p>
            </div>
          </div>

          {/* Doctor/Clinician */}
          {appointment.clinician?.name && (
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-slate-400" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">{appointment.clinician.name}</p>
                <p className="text-xs text-slate-500">{appointment.clinician.title || 'Staff Member'}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-900">{appointment.location}</p>
            </div>
          )}

          {/* Reason/Notes */}
          {appointment.reason && (
            <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
              <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">{appointment.reason}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailsModal({ open: true, appointment })}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>

          {['scheduled', 'confirmed'].includes((appointment.status || '').toLowerCase()) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessageModal({ open: true, appointment, message: '', sending: false })}
                className="flex-1 text-[#009DD1]"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Contact Staff
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setCancelDialog({ open: true, appointment, reason: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#009DD1]" />
            <p className="text-slate-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PatientRoleBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">My Appointments</h1>
            <Button
              onClick={() => navigate('/patient/book-appointment')}
              className="bg-[#009DD1] text-white hover:bg-[#0077A8]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>
          <p className="text-slate-600">View and manage your upcoming and previous appointments.</p>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by type, doctor, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {Object.entries(tabData).map(([key, tab]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedTab === key
                      ? 'bg-[#009DD1] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-white/20">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {activeTabData.appointments.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium mb-1">No appointments found</p>
                <p className="text-slate-500 text-sm mb-4">
                  {searchQuery ? 'Try adjusting your search' : `You have no ${selectedTab} appointments yet`}
                </p>
                {selectedTab === 'upcoming' && (
                  <Button
                    onClick={() => navigate('/patient/book-appointment')}
                    className="bg-[#009DD1] text-white hover:bg-[#0077A8]"
                  >
                    Book Your First Appointment
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            activeTabData.appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModal.open} onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Appointment ID: #{detailsModal.appointment?.id}
            </DialogDescription>
          </DialogHeader>

          {detailsModal.appointment && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Status</h3>
                <div>{getStatusBadge(detailsModal.appointment.status)}</div>
              </div>

              {/* Appointment Type */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Appointment Type</h3>
                <p className="text-slate-700">{detailsModal.appointment.appointment_type?.name || 'N/A'}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Date</h3>
                  <p className="text-slate-700">{formatDate(detailsModal.appointment.start_time)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Time</h3>
                  <p className="text-slate-700">
                    {formatTime(detailsModal.appointment.start_time?.split(' ')[1] || 'N/A')}
                  </p>
                </div>
              </div>

              {/* Clinician */}
              {detailsModal.appointment.clinician && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Healthcare Provider</h3>
                  <p className="text-slate-700">{detailsModal.appointment.clinician.name}</p>
                  {detailsModal.appointment.clinician.title && (
                    <p className="text-sm text-slate-500">{detailsModal.appointment.clinician.title}</p>
                  )}
                </div>
              )}

              {/* Location */}
              {detailsModal.appointment.location && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Location</h3>
                  <p className="text-slate-700">{detailsModal.appointment.location}</p>
                </div>
              )}

              {/* Reason */}
              {detailsModal.appointment.reason && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Reason for Visit</h3>
                  <p className="text-slate-700">{detailsModal.appointment.reason}</p>
                </div>
              )}

              {/* Notes */}
              {detailsModal.appointment.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Notes</h3>
                  <p className="text-slate-700">{detailsModal.appointment.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDetailsModal({ ...detailsModal, open: false })}>
              Close
            </Button>
            {detailsModal.appointment && ['scheduled', 'confirmed'].includes((detailsModal.appointment.status || '').toLowerCase()) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsModal({ ...detailsModal, open: false });
                    setMessageModal({ open: true, appointment: detailsModal.appointment, message: '', sending: false });
                  }}
                  className="text-[#009DD1]"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Staff
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsModal({ ...detailsModal, open: false });
                    setCancelDialog({ open: true, appointment: detailsModal.appointment, reason: '' });
                  }}
                >
                  Cancel Appointment
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="cancel-reason" className="text-slate-700 font-medium">
              Reason for Cancellation (Optional)
            </Label>
            <textarea
              id="cancel-reason"
              placeholder="Tell us why you're cancelling..."
              value={cancelDialog.reason}
              onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="3"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, appointment: null, reason: '' })}
              disabled={cancelDialog.submitting}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={cancelDialog.submitting}
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

      {/* Message Modal */}
      <Dialog open={messageModal.open} onOpenChange={(open) => setMessageModal({ ...messageModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Staff</DialogTitle>
            <DialogDescription>
              Send a message to {messageModal.appointment?.clinician?.name || 'the staff member'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="message" className="text-slate-700 font-medium">
              Your Message
            </Label>
            <textarea
              id="message"
              placeholder="Type your message here..."
              value={messageModal.message}
              onChange={(e) => setMessageModal({ ...messageModal, message: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#009DD1]"
              rows="4"
            />
            <p className="text-xs text-slate-500 mt-2">
              {messageModal.message.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageModal({ open: false, appointment: null, message: '', sending: false })}
              disabled={messageModal.sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={messageModal.sending || !messageModal.message.trim()}
              className="bg-[#009DD1] text-white hover:bg-[#0077A8]"
            >
              {messageModal.sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointments;

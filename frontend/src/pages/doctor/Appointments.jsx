import React, { useState } from 'react';
import { Calendar, Search, Clock, CheckCircle, XCircle, Eye, Plus, Filter, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialAppts = [
  { id: 1, patient: 'Maria Santos', type: 'Follow-up', date: '2026-08-20', time: '10:00 AM', status: 'Confirmed', notes: 'Check BP readings and medication tolerance' },
  { id: 2, patient: 'Juan dela Cruz', type: 'Consultation', date: '2026-08-20', time: '11:00 AM', status: 'Confirmed', notes: 'Diabetes monitoring, HbA1c review' },
  { id: 3, patient: 'Ana Reyes', type: 'Lab Review', date: '2026-08-21', time: '02:00 PM', status: 'Pending', notes: 'CBC and urinalysis results discussion' },
  { id: 4, patient: 'Pedro Lim', type: 'Follow-up', date: '2026-08-22', time: '03:30 PM', status: 'Confirmed', notes: 'Post-ECG cardiovascular review' },
  { id: 5, patient: 'Rosa Garcia', type: 'Consultation', date: '2026-08-18', time: '09:00 AM', status: 'Completed', notes: 'Annual check-up complete' },
];

const statusConfig = {
  Confirmed: 'bg-[#009DD1]/10 text-[#009DD1] border-[#009DD1]/20',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const DoctorAppointments = () => {
  const [appts, setAppts] = useState(initialAppts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patient: '',
    type: 'Consultation',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    notes: '',
  });

  const filtered = appts.filter((a) => {
    const matchesSearch = a.patient.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newAppt.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    const item = {
      id: Date.now(),
      ...newAppt,
      status: 'Confirmed',
    };
    setAppts([item, ...appts]);
    setIsNewModalOpen(false);
    setNewAppt({
      patient: '',
      type: 'Consultation',
      date: new Date().toISOString().split('T')[0],
      time: '09:00 AM',
      notes: '',
    });
    toast.success(`Appointment scheduled for ${item.patient}`);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setAppts(appts.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    if (selectedAppt && selectedAppt.id === id) {
      setSelectedAppt({ ...selectedAppt, status: newStatus });
    }
    toast.success(`Appointment marked as ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#7C3AED]" />
            My Appointments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage scheduled consultations and patient follow-ups.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments by patient or type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500">
            No appointments found matching your criteria.
          </div>
        ) : (
          filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-[#7C3AED]/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{a.patient}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusConfig[a.status] || 'bg-slate-100 text-slate-600'}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{a.type}</p>
                    {a.notes && <p className="text-xs text-slate-400 italic mt-0.5">{a.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-right text-sm text-slate-500">
                    <div className="font-medium text-slate-700">{a.date}</div>
                    <div className="flex items-center gap-1 sm:justify-end mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {a.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedAppt(a)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] text-slate-600 text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                    {a.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'Confirmed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {a.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'Completed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'Cancelled')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppt} onOpenChange={(open) => !open && setSelectedAppt(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Appointment Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Review appointment information and update status.
            </DialogDescription>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedAppt.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Type:</span>
                  <span className="text-sm text-slate-700">{selectedAppt.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date & Time:</span>
                  <span className="text-sm text-slate-700">{selectedAppt.date} at {selectedAppt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusConfig[selectedAppt.status]}`}>
                    {selectedAppt.status}
                  </span>
                </div>
                {selectedAppt.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">Clinical Notes:</span>
                    <p className="text-xs text-slate-700">{selectedAppt.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {selectedAppt.status !== 'Completed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAppt.id, 'Completed')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Book Appointment Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Book New Appointment</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Schedule a consultation or follow-up with a patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newAppt.patient}
                onChange={(e) => setNewAppt({ ...newAppt, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Appointment Type</label>
              <select
                value={newAppt.type}
                onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="Consultation">General Consultation</option>
                <option value="Follow-up">Follow-up Visit</option>
                <option value="Lab Review">Lab Review</option>
                <option value="Emergency Evaluation">Emergency Evaluation</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={newAppt.date}
                  onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Time Slot</label>
                <select
                  value={newAppt.time}
                  onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason / Notes</label>
              <textarea
                rows={2}
                placeholder="Chief complaints or appointment purpose..."
                value={newAppt.notes}
                onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Schedule Appointment
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default DoctorAppointments;


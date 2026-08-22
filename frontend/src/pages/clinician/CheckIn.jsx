import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Search, CheckCircle, Clock, AlertCircle, Plus, User, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialCheckInQueue = [
  { id: 1, patient: 'Maria Santos', time: '10:00 AM', doctor: 'Dr. Santos', status: 'Checked In', arrivalTime: '09:45 AM', vitalsDone: true },
  { id: 2, patient: 'Juan dela Cruz', time: '11:00 AM', doctor: 'Dr. Reyes', status: 'Waiting', arrivalTime: '10:30 AM', vitalsDone: false },
  { id: 3, patient: 'Ana Reyes', time: '02:00 PM', doctor: 'Dr. Cruz', status: 'Scheduled', arrivalTime: '—', vitalsDone: false },
];

const ClinicianCheckIn = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(initialCheckInQueue);
  const [search, setSearch] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient: '',
    time: '10:30 AM',
    doctor: 'Dr. Santos',
  });

  const filtered = queue.filter((p) =>
    p.patient.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckInNow = (id, patientName) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setQueue(queue.map((p) => (p.id === id ? { ...p, status: 'Checked In', arrivalTime: now } : p)));
    toast.success(`${patientName} has been checked in at ${now}!`);
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const item = {
      id: Date.now(),
      patient: newPatient.patient,
      time: newPatient.time,
      doctor: newPatient.doctor,
      status: 'Checked In',
      arrivalTime: now,
      vitalsDone: false,
    };
    setQueue([item, ...queue]);
    setIsRegisterModalOpen(false);
    setNewPatient({ patient: '', time: '10:30 AM', doctor: 'Dr. Santos' });
    toast.success(`${item.patient} registered and added to active clinic queue!`);
  };

  const handleToggleVitals = (id, currentVitals) => {
    setQueue(queue.map((p) => (p.id === id ? { ...p, vitalsDone: !currentVitals } : p)));
    toast.success(`Vital signs status updated`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#26B170]" />
            Patient Check-In
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage daily patient arrival queue and check-in status.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/clinician/vitals')}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Go to Vital Signs
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 bg-[#26B170] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a8a55] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Check-In Walk-in Patient
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient in queue..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Scheduled Time</th>
              <th className="px-5 py-3">Assigned Doctor</th>
              <th className="px-5 py-3">Arrival Time</th>
              <th className="px-5 py-3">Vital Signs</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No patients in queue matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.patient}</td>
                  <td className="px-5 py-4 text-slate-600">{p.time}</td>
                  <td className="px-5 py-4 text-slate-600">{p.doctor}</td>
                  <td className="px-5 py-4 text-slate-600">{p.arrivalTime}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleVitals(p.id, p.vitalsDone)}
                      className="cursor-pointer hover:underline"
                    >
                      {p.vitalsDone ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Taken (Click to toggle)
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending (Click to take)
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      p.status === 'Checked In'
                        ? 'bg-emerald-100 text-emerald-700'
                        : p.status === 'Waiting'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {p.status === 'Waiting' || p.status === 'Scheduled' ? (
                      <button
                        onClick={() => handleCheckInNow(p.id, p.patient)}
                        className="bg-[#26B170] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#1a8a55] transition-colors shadow-sm"
                      >
                        Check-In Now
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">Ready for Doctor</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Walk-in Patient Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#26B170]" /> Check-In Walk-in Patient
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Directly assign an arriving walk-in patient to today's doctor queue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterPatient} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Juan dela Cruz"
                value={newPatient.patient}
                onChange={(e) => setNewPatient({ ...newPatient, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Physician</label>
              <select
                value={newPatient.doctor}
                onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              >
                <option value="Dr. Santos">Dr. Santos (General Physician)</option>
                <option value="Dr. Reyes">Dr. Reyes (Internal Medicine)</option>
                <option value="Dr. Cruz">Dr. Cruz (Pediatrics)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Scheduled / Approximate Time</label>
              <select
                value={newPatient.time}
                onChange={(e) => setNewPatient({ ...newPatient, time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="01:30 PM">01:30 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:30 PM">03:30 PM</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#26B170] hover:bg-[#1a8a55] text-white text-xs font-semibold"
              >
                Check-In Patient
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianCheckIn;


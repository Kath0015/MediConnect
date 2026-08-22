import React, { useState } from 'react';
import { Stethoscope, Search, UserPlus, Eye, Star, Calendar, Mail, Phone, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialDoctors = [
  { id: 1, name: 'Dr. Jose Santos', specialty: 'Internal Medicine', contact: '09171110001', email: 'jsantos@mediconnect.ph', patients: 142, status: 'Active', schedule: 'Mon, Wed, Fri', room: 'Room 201' },
  { id: 2, name: 'Dr. Elena Reyes', specialty: 'Pediatrics', contact: '09282220002', email: 'ereyes@mediconnect.ph', patients: 98, status: 'Active', schedule: 'Tue, Thu', room: 'Room 204' },
  { id: 3, name: 'Dr. Marco Cruz', specialty: 'Cardiology', contact: '09393330003', email: 'mcruz@mediconnect.ph', patients: 75, status: 'Active', schedule: 'Mon–Fri', room: 'Room 302' },
  { id: 4, name: 'Dr. Ana Flores', specialty: 'OB-Gynecology', contact: '09404440004', email: 'aflores@mediconnect.ph', patients: 114, status: 'On Leave', schedule: 'Wed, Fri', room: 'Room 205' },
];

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: 'Internal Medicine',
    email: '',
    contact: '',
    schedule: 'Mon, Wed, Fri',
    room: 'Room 201',
  });

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.email.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    const created = {
      id: Date.now(),
      name: newDoc.name.startsWith('Dr.') ? newDoc.name : `Dr. ${newDoc.name}`,
      specialty: newDoc.specialty,
      contact: newDoc.contact || '09170000000',
      email: newDoc.email,
      patients: 0,
      status: 'Active',
      schedule: newDoc.schedule,
      room: newDoc.room,
    };
    setDoctors([created, ...doctors]);
    setIsAddOpen(false);
    setNewDoc({ name: '', specialty: 'Internal Medicine', email: '', contact: '', schedule: 'Mon, Wed, Fri', room: 'Room 201' });
    toast.success(`${created.name} has been added to doctors panel!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#7C3AED]" /> Doctors
          </h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage all doctors in the clinic.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or specialty..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            No doctors found matching your query.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-[#7C3AED]/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{d.name}</h3>
                    <p className="text-sm text-[#7C3AED] font-medium">{d.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      d.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {d.status}
                  </span>
                  <button
                    onClick={() => setSelectedDoc(d)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#7C3AED] transition-colors"
                    title="View Doctor Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm text-slate-500">
                <span>
                  <span className="font-medium text-slate-700">{d.patients}</span> Patients
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {d.schedule}
                </span>
                <span className="col-span-2 text-xs text-slate-400">{d.email}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#7C3AED]" /> Add New Physician
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a licensed physician to MediConnect clinic roster.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDoctor} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Doctor Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Juan Santos"
                value={newDoc.name}
                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Medical Specialty</label>
              <select
                value={newDoc.specialty}
                onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="General Practice">General Practice</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="OB-Gynecology">OB-Gynecology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Ophthalmology">Ophthalmology</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="doctor@mediconnect.ph"
                  value={newDoc.email}
                  onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={newDoc.contact}
                  onChange={(e) => setNewDoc({ ...newDoc, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Consultation Schedule</label>
                <input
                  type="text"
                  placeholder="Mon, Wed, Fri"
                  value={newDoc.schedule}
                  onChange={(e) => setNewDoc({ ...newDoc, schedule: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Clinic Room / Suite</label>
                <input
                  type="text"
                  placeholder="Room 201"
                  value={newDoc.room}
                  onChange={(e) => setNewDoc({ ...newDoc, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Save Doctor
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Doctor Profile Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#7C3AED]" /> Physician Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Doctor credentials and practice schedule.
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 pt-2">
              <div className="bg-purple-50/50 p-4 rounded-xl space-y-2 border border-purple-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Full Name:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedDoc.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Specialty:</span>
                  <span className="text-sm font-semibold text-[#7C3AED]">{selectedDoc.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Email Address:</span>
                  <span className="text-sm text-slate-700">{selectedDoc.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Phone:</span>
                  <span className="text-sm text-slate-700">{selectedDoc.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Schedule:</span>
                  <span className="text-sm text-slate-700">{selectedDoc.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Clinic Room:</span>
                  <span className="text-sm text-slate-700">{selectedDoc.room || 'Room 201'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                    {selectedDoc.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;


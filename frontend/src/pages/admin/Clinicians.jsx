import React, { useState } from 'react';
import { HeartPulse, Search, UserPlus, Calendar, Eye, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialClinicians = [
  { id: 1, name: 'Nurse Maria Lopez', role: 'Head Nurse', contact: '09170001111', email: 'mlopez@mediconnect.ph', status: 'Active', shift: 'Morning (6AM–2PM)', department: 'Triage & Vital Signs' },
  { id: 2, name: 'Nurse Roberto Tan', role: 'Staff Nurse', contact: '09280002222', email: 'rtan@mediconnect.ph', status: 'Active', shift: 'Afternoon (2PM–10PM)', department: 'In-Patient Ward' },
  { id: 3, name: 'Nurse Claire Delos Santos', role: 'Staff Nurse', contact: '09390003333', email: 'cdelos@mediconnect.ph', status: 'Active', shift: 'Morning (6AM–2PM)', department: 'Outpatient Clinic' },
  { id: 4, name: 'Nurse Kevin Bautista', role: 'Medical Technologist', contact: '09400004444', email: 'kbautista@mediconnect.ph', status: 'On Leave', shift: 'Morning (6AM–2PM)', department: 'Diagnostic Lab' },
];

const AdminClinicians = () => {
  const [clinicians, setClinicians] = useState(initialClinicians);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Staff Nurse',
    contact: '',
    email: '',
    shift: 'Morning (6AM–2PM)',
    department: 'Triage & Vital Signs',
  });

  const filtered = clinicians.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    const created = {
      id: Date.now(),
      name: newStaff.name.startsWith('Nurse') ? newStaff.name : `Nurse ${newStaff.name}`,
      role: newStaff.role,
      contact: newStaff.contact || '09170000000',
      email: newStaff.email,
      status: 'Active',
      shift: newStaff.shift,
      department: newStaff.department,
    };
    setClinicians([created, ...clinicians]);
    setIsAddOpen(false);
    setNewStaff({ name: '', role: 'Staff Nurse', contact: '', email: '', shift: 'Morning (6AM–2PM)', department: 'Triage & Vital Signs' });
    toast.success(`${created.name} added to Clinic Staff roster!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-[#26B170]" /> Clinic Staff
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage nurses and clinic staff members.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#26B170] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a8a55] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Name', 'Role', 'Department', 'Shift', 'Contact', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No clinic staff found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{c.role}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{c.department || 'Outpatient'}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{c.shift}</td>
                  <td className="px-5 py-4 text-slate-600">{c.contact}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedStaff(c)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#26B170] transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#26B170]" /> Add Clinic Staff
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a nurse or clinical staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Lopez"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Staff Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                >
                  <option value="Head Nurse">Head Nurse</option>
                  <option value="Staff Nurse">Staff Nurse</option>
                  <option value="Triage Nurse">Triage Nurse</option>
                  <option value="Medical Technologist">Medical Technologist</option>
                  <option value="Clinic Receptionist">Clinic Receptionist</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                >
                  <option value="Triage & Vital Signs">Triage & Vital Signs</option>
                  <option value="Outpatient Clinic">Outpatient Clinic</option>
                  <option value="In-Patient Ward">In-Patient Ward</option>
                  <option value="Diagnostic Lab">Diagnostic Lab</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@mediconnect.ph"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={newStaff.contact}
                  onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Shift</label>
              <select
                value={newStaff.shift}
                onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              >
                <option value="Morning (6AM–2PM)">Morning (6AM–2PM)</option>
                <option value="Afternoon (2PM–10PM)">Afternoon (2PM–10PM)</option>
                <option value="Night (10PM–6AM)">Night (10PM–6AM)</option>
                <option value="Regular (8AM–5PM)">Regular (8AM–5PM)</option>
              </select>
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
                className="px-4 py-2 rounded-xl bg-[#26B170] hover:bg-[#1a8a55] text-white text-xs font-semibold"
              >
                Save Staff
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff Profile Modal */}
      <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#26B170]" /> Staff Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Clinical team member profile & duties.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4 pt-2">
              <div className="bg-emerald-50/50 p-4 rounded-xl space-y-2 border border-emerald-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Full Name:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedStaff.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Role:</span>
                  <span className="text-sm font-semibold text-[#26B170]">{selectedStaff.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Department:</span>
                  <span className="text-sm text-slate-700">{selectedStaff.department || 'Outpatient'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Shift Schedule:</span>
                  <span className="text-sm text-slate-700">{selectedStaff.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Email:</span>
                  <span className="text-sm text-slate-700">{selectedStaff.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Contact:</span>
                  <span className="text-sm text-slate-700">{selectedStaff.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                    {selectedStaff.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedStaff(null)}
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

export default AdminClinicians;


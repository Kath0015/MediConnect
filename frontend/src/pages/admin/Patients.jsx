import React, { useState } from 'react';
import { Users, Search, Filter, Phone, Mail, Calendar, Eye, UserPlus, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialPatients = [
  { id: 1, name: 'Maria Santos', age: 34, gender: 'Female', contact: '09171234567', email: 'maria@email.com', address: 'Malolos, Bulacan', bloodType: 'O+', lastVisit: '2026-08-10', status: 'Active' },
  { id: 2, name: 'Juan dela Cruz', age: 52, gender: 'Male', contact: '09281234567', email: 'juan@email.com', address: 'Guiguinto, Bulacan', bloodType: 'A+', lastVisit: '2026-08-05', status: 'Active' },
  { id: 3, name: 'Ana Reyes', age: 28, gender: 'Female', contact: '09351234567', email: 'ana@email.com', address: 'Calumpit, Bulacan', bloodType: 'B+', lastVisit: '2026-07-28', status: 'Inactive' },
  { id: 4, name: 'Pedro Lim', age: 61, gender: 'Male', contact: '09461234567', email: 'pedro@email.com', address: 'Plaridel, Bulacan', bloodType: 'AB+', lastVisit: '2026-08-15', status: 'Active' },
  { id: 5, name: 'Rosa Garcia', age: 45, gender: 'Female', contact: '09571234567', email: 'rosa@email.com', address: 'Balagtas, Bulacan', bloodType: 'O-', lastVisit: '2026-07-20', status: 'Active' },
];

const AdminPatients = () => {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '30',
    gender: 'Female',
    contact: '',
    address: '',
    bloodType: 'O+',
  });

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  );

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim() || !newPatient.email.trim()) {
      toast.error('Please fill in patient name and email');
      return;
    }
    const created = {
      id: Date.now(),
      name: newPatient.name,
      email: newPatient.email,
      age: parseInt(newPatient.age) || 30,
      gender: newPatient.gender,
      contact: newPatient.contact || '09170000000',
      address: newPatient.address || 'Bulacan',
      bloodType: newPatient.bloodType,
      lastVisit: 'Today (New)',
      status: 'Active',
    };
    setPatients([created, ...patients]);
    setIsAddOpen(false);
    setNewPatient({ name: '', email: '', age: '30', gender: 'Female', contact: '', address: '', bloodType: 'O+' });
    toast.success(`Patient record created for ${created.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#009DD1]" /> Patients
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage all registered patients in the system.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#01377D] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#009DD1] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name, email, or contact number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Name', 'Age / Gender', 'Contact', 'Address', 'Last Visit', 'Status', 'Actions'].map((h) => (
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
                  No patient records found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {p.age} / {p.gender}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{p.contact}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{p.address}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{p.lastVisit}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="View Details"
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

      {/* Add Patient Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#009DD1]" /> Register New Patient
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add a new patient record into the MediConnect database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPatient} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="patient@email.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={newPatient.contact}
                  onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="30"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Blood Type</label>
                <select
                  value={newPatient.bloodType}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Complete Address</label>
              <input
                type="text"
                placeholder="Barangay, City, Province"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
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
                className="px-4 py-2 rounded-xl bg-[#01377D] hover:bg-[#009DD1] text-white text-xs font-semibold"
              >
                Register Patient
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Profile Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#009DD1]" /> Patient Summary
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Registered patient details & clinical contact info.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 pt-2">
              <div className="bg-[#009DD1]/5 p-4 rounded-xl space-y-2 border border-[#009DD1]/20">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Full Name:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Email:</span>
                  <span className="text-sm text-slate-700">{selectedPatient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Contact:</span>
                  <span className="text-sm text-slate-700">{selectedPatient.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Age / Gender:</span>
                  <span className="text-sm text-slate-700">
                    {selectedPatient.age} yrs old · {selectedPatient.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Blood Type:</span>
                  <span className="text-sm font-bold text-rose-600">{selectedPatient.bloodType || 'O+'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Address:</span>
                  <span className="text-sm text-slate-700">{selectedPatient.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                    {selectedPatient.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedPatient(null)}
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

export default AdminPatients;


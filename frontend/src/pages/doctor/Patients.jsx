import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, FileText, Pill, Plus } from 'lucide-react';

const mockPatients = [
  { id: 1, name: 'Maria Santos', age: 34, gender: 'Female', contact: '09171234567', lastVisit: '2026-08-10', condition: 'Hypertension', status: 'Active' },
  { id: 2, name: 'Juan dela Cruz', age: 52, gender: 'Male', contact: '09281234567', lastVisit: '2026-08-08', condition: 'Type 2 Diabetes', status: 'Active' },
  { id: 3, name: 'Ana Reyes', age: 28, gender: 'Female', contact: '09351234567', lastVisit: '2026-07-28', condition: 'Asthma', status: 'Active' },
  { id: 4, name: 'Pedro Lim', age: 61, gender: 'Male', contact: '09461234567', lastVisit: '2026-08-15', condition: 'Post-ECG Eval', status: 'Active' },
];

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#7C3AED]" />
            My Patients
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Patients under your care and consultation history.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or medical condition..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Age / Gender</th>
              <th className="px-5 py-3">Condition</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Last Visit</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-900">{p.name}</td>
                <td className="px-5 py-4 text-slate-600">{p.age} yrs / {p.gender}</td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 text-[#7C3AED]">
                    {p.condition}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{p.contact}</td>
                <td className="px-5 py-4 text-slate-600">{p.lastVisit}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate('/doctor/medical-records')}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                      title="View Medical Records"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate('/doctor/prescriptions')}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                      title="Write Prescription"
                    >
                      <Pill className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorPatients;


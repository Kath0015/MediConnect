import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, FileText, Pill, Plus } from 'lucide-react';
import { getPatients } from '../../api/Patients';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getPatients({ per_page: 100 })
      .then((response) => {
        if (active) {
          setPatients(response.data?.data || []);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load patients.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => patients.filter((p) => {
    const name = p.user?.name || '';
    const condition = p.medical_notes || '';

    return name.toLowerCase().includes(search.toLowerCase()) ||
      condition.toLowerCase().includes(search.toLowerCase());
  }), [patients, search]);

  const age = (dateOfBirth) => {
    if (!dateOfBirth) return '—';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const birthdayPassed = today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!birthdayPassed) years -= 1;
    return `${years} yrs`;
  };

  const lastVisit = (appointments = []) => {
    const completed = appointments
      .filter((appointment) => appointment.status === 'completed')
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    return completed[0]?.start_time
      ? new Date(completed[0].start_time).toISOString().slice(0, 10)
      : '—';
  };

  const gender = (patient) => {
    return patient.gender || '—';
  };

  const patientName = (patient) => patient.user?.name || 'Unknown patient';

  const patientContact = (patient) => patient.phone || patient.user?.phone || '—';

  const patientCondition = (patient) => patient.medical_notes || 'General consultation';

  const displayPatients = filtered.map((patient) => ({
    ...patient,
    name: patientName(patient),
    age: age(patient.date_of_birth),
    gender: gender(patient),
    contact: patientContact(patient),
    lastVisit: lastVisit(patient.appointments),
    condition: patientCondition(patient),
  }));

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
            {loading && (
              <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">Loading patients...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan="6" className="px-5 py-8 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && displayPatients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-900">{p.name}</td>
                <td className="px-5 py-4 text-slate-600">{p.age} / {p.gender}</td>
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
            {!loading && !error && displayPatients.length === 0 && (
              <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorPatients;

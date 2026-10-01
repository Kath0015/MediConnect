import React, { useState } from 'react';
import { User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Doctor Availability Component
 * Shows available doctors for appointment assignment
 */
const DoctorAvailability = ({ appointment, onAssignDoctor }) => {
  // Mock available doctors - in real app, fetch from API
  const [assignedDoctor, setAssignedDoctor] = useState(appointment?.clinician_id || null);

  const availableDoctors = [
    {
      id: 1,
      name: 'Dr. Jose Santos',
      specialty: 'General Practice',
      status: 'available',
      nextAvailable: 'Now',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Dr. Maria Reyes',
      specialty: 'Internal Medicine',
      status: 'available',
      nextAvailable: 'Now',
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Dr. Juan Cruz',
      specialty: 'Cardiology',
      status: 'busy',
      nextAvailable: '2:30 PM',
      rating: 4.7,
    },
  ];

  const handleAssign = (doctor) => {
    setAssignedDoctor(doctor.id);
    if (onAssignDoctor) {
      onAssignDoctor(doctor);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'available') {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    } else if (status === 'busy') {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-cyan-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <User className="w-4 h-4 text-[#009DD1]" />
        Available Physicians
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {availableDoctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => handleAssign(doctor)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              assignedDoctor === doctor.id
                ? 'border-[#009DD1] bg-white shadow-md'
                : 'border-slate-200 bg-white hover:border-[#009DD1]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-slate-900">{doctor.name}</p>
                  {getStatusIcon(doctor.status)}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{doctor.specialty}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>Next: <span className="font-semibold text-slate-700">{doctor.nextAvailable}</span></span>
                  <span>★ {doctor.rating}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssign(doctor);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  assignedDoctor === doctor.id
                    ? 'bg-[#009DD1] text-white'
                    : 'bg-[#009DD1]/10 text-[#009DD1] hover:bg-[#009DD1] hover:text-white'
                }`}
              >
                {assignedDoctor === doctor.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {assignedDoctor && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Physician assigned to this appointment</span>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;

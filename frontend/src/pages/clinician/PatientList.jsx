// PatientList.jsx - Unified Patient Management with Search & Filters
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Search, Eye, FileText, Loader2, X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getPatientDetails } from '../../api/ClinicianDashboard';
import { toast } from 'sonner';
import { format } from 'date-fns';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';


export const PatientList = () => {
  const PAGE_SIZE = 10;
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  
  const [filters, setFilters] = useState({
    search: ''
  });

  useEffect(() => {
    loadPatients();
  }, [currentPage]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients({ page: currentPage, per_page: PAGE_SIZE });
      const payload = response.data;
      const patientData = Array.isArray(payload?.data) ? payload.data : [];

      setPatients(patientData);
      setTotalPages(payload?.last_page || 1);
      setTotalPatients(payload?.total || patientData.length);
    } catch (err) {
      console.error('Failed to load patients:', err);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      setDetailsLoading(true);
      const response = await getPatientDetails(patientId);
      setSelectedPatient(response.data);
    } catch (err) {
      console.error('Failed to load patient details:', err);
      toast.error('Failed to load patient details');
    } finally {
      setDetailsLoading(false);
    }
  };


  const filteredPatients = patients.filter(patient => {
    // Search filter
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      patient.user?.name?.toLowerCase().includes(searchLower) ||
      patient.user?.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower) ||
      patient.address?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const clearFilters = () => {
    setFilters({ search: '' });
  };

  const hasActiveFilters = filters.search;

  if (loading) {
    return <StaffPageSkeleton variant="tabs" rows={4} />;
  }

  return (
    <div className="space-y-6">
      <StaffRoleBanner
        title="Patient List"
        subtitle="Quickly search, review, and open patient records with a responsive workflow."
        primaryAction={{ label: 'Open Schedule', to: '/clinician/schedule' }}
      />

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, phone, or address..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 transition-all duration-200 focus:border-cyan-500 focus:ring-cyan-500"
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
      </p>

      {/* Results Card */}
      <Card className="border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
        <CardHeader>
          <CardTitle className="text-[#01377D]">Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No patients found matching your criteria</p>
              {hasActiveFilters && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="text-[#009DD1] mt-2"
                >
                  Clear filters to see all patients
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.2fr_1.4fr_0.9fr_1fr_90px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DOB</p>
                  <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Action</p>
                </div>
                {filteredPatients.map((patient, index) => (
                  <div key={patient.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.2fr_1.4fr_0.9fr_1fr_90px]">
                      <p className="truncate text-sm font-semibold text-[#01377D]">{patient.user?.name || 'N/A'}</p>
                      <p className="truncate text-xs text-[#5A6F8F]">{patient.user?.email || 'N/A'}</p>
                      <p className="truncate text-xs text-[#5A6F8F]">{patient.phone || 'N/A'}</p>
                      <p className="truncate text-xs text-[#5A6F8F]">
                        {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <div className="flex justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadPatientDetails(patient.id)}
                              className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[min(92vw,900px)] max-h-[88vh] overflow-y-auto rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.24)]">
                            <DialogHeader className="rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
                              <DialogTitle className="text-[#01377D] text-xl">
                                {patient.user?.name}
                              </DialogTitle>
                              <DialogDescription className="text-gray-600">
                                Patient ID: PT-{patient.id?.toString().padStart(5, '0')}
                              </DialogDescription>
                            </DialogHeader>
                            {detailsLoading ? (
                              <div className="flex items-center justify-center px-4 py-12 sm:px-6">
                                <Loader2 className="w-8 h-8 animate-spin text-[#009DD1]" />
                              </div>
                            ) : selectedPatient ? (
                              <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-5">
                                {/* Personal Information */}
                                <div className="border-b pb-4">
                                  <h3 className="text-lg font-semibold text-[#01377D] mb-4">Personal Information</h3>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                                      <p className="text-[#01377D] font-medium mt-1">
                                        {selectedPatient.user?.name || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                      <p className="text-[#01377D] mt-1">
                                        {selectedPatient.user?.email || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                      <p className="text-[#01377D] mt-1">
                                        {selectedPatient.phone || 'N/A'}
                                      </p>
                                    </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
                                    <p className="text-[#01377D] mt-1">
                                      {selectedPatient.date_of_birth 
                                        ? format(new Date(selectedPatient.date_of_birth), 'PPP')
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>                                  {/* Patient Profile */}
                              <div className="border-b pb-4">
                                <h3 className="text-lg font-semibold text-[#01377D] mb-4">Patient Profile</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                                    <p className="text-[#01377D] font-medium mt-1">
                                      {selectedPatient.age ?? (selectedPatient.date_of_birth
                                        ? Math.max(
                                            0,
                                            Math.floor(
                                              (Date.now() - new Date(selectedPatient.date_of_birth).getTime()) /
                                                (1000 * 60 * 60 * 24 * 365.25)
                                            )
                                          )
                                        : 'N/A')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Blood Type</p>
                                    <p className="text-[#01377D] mt-1">{selectedPatient.blood_type || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">PWD / Senior Status</p>
                                    <p className="text-[#01377D] mt-1">
                                      {selectedPatient.pwd_senior_status ||
                                        (selectedPatient.is_pwd ? 'PWD' : selectedPatient.is_senior ? 'Senior Citizen' : 'No special status')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                                    <p className="text-[#01377D] mt-1">{selectedPatient.address || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Name</p>
                                    <p className="text-[#01377D] mt-1">{selectedPatient.emergency_contact_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Number</p>
                                    <p className="text-[#01377D] mt-1">
                                      {selectedPatient.emergency_contact_number || selectedPatient.emergency_contact_phone || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Medical Information */}
                              {(selectedPatient.medical_history || selectedPatient.allergies) && (
                                <div className="border-b pb-4">
                                  <h3 className="text-lg font-semibold text-[#01377D] mb-4">Medical Information</h3>
                                  <div className="space-y-4">
                                    {selectedPatient.medical_history && (
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Medical History</p>
                                        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                                          {selectedPatient.medical_history}
                                        </div>
                                      </div>
                                    )}
                                    {selectedPatient.allergies && (
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Allergies</p>
                                        <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                                          {selectedPatient.allergies}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex justify-center gap-2 pt-4">
                                <Button 
                                  size="sm" 
                                  className="h-10 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#009DD1] hover:bg-[#01377D] text-white"
                                  onClick={() => navigate(`/staff/patient-records/${patient.id}`)}
                                >
                                  <FileText className="w-4 h-4" />
                                  View Full Records
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="px-4 py-8 text-center text-gray-500 sm:px-6">
                              No details available
                            </p>
                          )}
                        </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#01377D]">{patient.user?.name || 'N/A'}</p>
                          <p className="truncate text-xs text-[#5A6F8F]">{patient.user?.email || 'N/A'}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadPatientDetails(patient.id)}
                              className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[min(92vw,900px)] max-h-[88vh] overflow-y-auto rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.24)]">
                              <DialogHeader className="rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
                                <DialogTitle className="text-[#01377D] text-xl">
                                  {patient.user?.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                  Patient ID: PT-{patient.id?.toString().padStart(5, '0')}
                                </DialogDescription>
                              </DialogHeader>
                              {detailsLoading ? (
                                <div className="flex items-center justify-center px-4 py-12 sm:px-6">
                                  <Loader2 className="w-8 h-8 animate-spin text-[#009DD1]" />
                                </div>
                              ) : selectedPatient ? (
                                <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-5">
                                  {/* Personal Information */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold text-[#01377D] mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                                        <p className="text-[#01377D] font-medium mt-1">
                                          {selectedPatient.user?.name || 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                        <p className="text-[#01377D] mt-1">
                                          {selectedPatient.user?.email || 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                        <p className="text-[#01377D] mt-1">
                                          {selectedPatient.phone || 'N/A'}
                                        </p>
                                      </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
                                      <p className="text-[#01377D] mt-1">
                                        {selectedPatient.date_of_birth 
                                          ? format(new Date(selectedPatient.date_of_birth), 'PPP')
                                          : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>                                  {/* Patient Profile */}
                                  <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold text-[#01377D] mb-4">Patient Profile</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                                        <p className="text-[#01377D] font-medium mt-1">
                                          {selectedPatient.age ?? (selectedPatient.date_of_birth
                                            ? Math.max(
                                                0,
                                                Math.floor(
                                                  (Date.now() - new Date(selectedPatient.date_of_birth).getTime()) /
                                                    (1000 * 60 * 60 * 24 * 365.25)
                                                )
                                              )
                                            : 'N/A')}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Blood Type</p>
                                        <p className="text-[#01377D] mt-1">{selectedPatient.blood_type || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">PWD / Senior Status</p>
                                        <p className="text-[#01377D] mt-1">
                                          {selectedPatient.pwd_senior_status ||
                                            (selectedPatient.is_pwd ? 'PWD' : selectedPatient.is_senior ? 'Senior Citizen' : 'No special status')}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                                        <p className="text-[#01377D] mt-1">{selectedPatient.address || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Name</p>
                                        <p className="text-[#01377D] mt-1">{selectedPatient.emergency_contact_name || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Number</p>
                                        <p className="text-[#01377D] mt-1">
                                          {selectedPatient.emergency_contact_number || selectedPatient.emergency_contact_phone || 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Medical Information */}
                                  {(selectedPatient.medical_history || selectedPatient.allergies) && (
                                    <div className="border-b pb-4">
                                      <h3 className="text-lg font-semibold text-[#01377D] mb-4">Medical Information</h3>
                                      <div className="space-y-4">
                                        {selectedPatient.medical_history && (
                                          <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Medical History</p>
                                            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                                              {selectedPatient.medical_history}
                                            </div>
                                          </div>
                                        )}
                                        {selectedPatient.allergies && (
                                          <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Allergies</p>
                                            <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                                              {selectedPatient.allergies}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex justify-center gap-2 pt-4">
                                    <Button 
                                      size="sm" 
                                      className="h-10 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#009DD1] hover:bg-[#01377D] text-white"
                                      onClick={() => navigate(`/staff/patient-records/${patient.id}`)}
                                    >
                                      <FileText className="w-4 h-4" />
                                      View Full Records
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="px-4 py-8 text-center text-gray-500 sm:px-6">
                                  No details available
                                </p>
                              )}
                            </DialogContent>
                          </Dialog>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#5A6F8F]">
                        <p className="truncate">Phone: {patient.phone || 'N/A'}</p>
                        <p className="truncate">Address: {patient.address || 'N/A'}</p>
                        <p className="col-span-2 truncate">
                          DOB: {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing {filteredPatients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
                  {filteredPatients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + filteredPatients.length} of{' '}
                  {filters.search ? filteredPatients.length : totalPatients} patients
                </p>
                <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <span className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 min-w-[78px] justify-self-end border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
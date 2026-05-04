import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle, User, FolderOpen } from 'lucide-react';
import { getPatientDetails } from '../../api/ClinicianDashboard';
import api from '../../api/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';

export const PatientRecords = () => {
  const PAGE_SIZE = 10;
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medCerts, setMedCerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [medCertsPage, setMedCertsPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const cardClass =
    'border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,132,199,0.12)]';

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, appointmentsRes, medCertsRes, documentsRes] = await Promise.all([
        getPatientDetails(patientId),
        api.get(`/api/appointments?patient_id=${patientId}&per_page=100`),
        api.get(`/api/med-certs?patient_id=${patientId}&per_page=100`),
        api.get(`/api/patients/${patientId}/documents`)
      ]);

      setPatient(patientRes.data);
      
      // Handle paginated response from appointments API
      let appointmentData = [];
      if (appointmentsRes.data?.data) {
        appointmentData = appointmentsRes.data.data;
      } else if (Array.isArray(appointmentsRes.data)) {
        appointmentData = appointmentsRes.data;
      }
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      
      // Handle paginated response from med-certs API
      let medCertData = [];
      if (medCertsRes.data?.data) {
        medCertData = medCertsRes.data.data;
      } else if (Array.isArray(medCertsRes.data)) {
        medCertData = medCertsRes.data;
      }
      setMedCerts(Array.isArray(medCertData) ? medCertData : []);
      
      // Handle documents response
      let documentData = [];
      if (documentsRes.data?.data) {
        documentData = documentsRes.data.data;
      } else if (Array.isArray(documentsRes.data)) {
        documentData = documentsRes.data;
      }
      setDocuments(Array.isArray(documentData) ? documentData : []);

      // Debug logs
      console.log('Raw appointments response:', appointmentsRes.data);
      console.log('Processed appointments:', appointmentData);
      console.log('Medical Certificates:', medCertData);
      console.log('Documents:', documentData);
    } catch (err) {
      console.error('Failed to load patient data:', err);
      toast.error('Failed to load patient records');
      navigate('/clinician/patients');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', icon: CheckCircle, className: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Confirmed', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-100 text-red-800' },
      in_progress: { label: 'In Progress', icon: AlertCircle, className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusMap[status?.toLowerCase()] || {
      label: status,
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-800'
    };

    const IconComponent = config.icon;
    return (
      <Badge className={`${config.className} border-0 flex items-center gap-1 w-fit`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const computeAge = (dob) => {
    if (!dob) return 'N/A';
    const parsed = new Date(dob);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return Math.max(
      0,
      Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    );
  };

  const appointmentsTotalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const medCertsTotalPages = Math.max(1, Math.ceil(medCerts.length / PAGE_SIZE));
  const documentsTotalPages = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));

  const safeAppointmentsPage = Math.min(appointmentsPage, appointmentsTotalPages);
  const safeMedCertsPage = Math.min(medCertsPage, medCertsTotalPages);
  const safeDocumentsPage = Math.min(documentsPage, documentsTotalPages);

  const paginatedAppointments = appointments.slice(
    (safeAppointmentsPage - 1) * PAGE_SIZE,
    safeAppointmentsPage * PAGE_SIZE
  );
  const paginatedMedCerts = medCerts.slice(
    (safeMedCertsPage - 1) * PAGE_SIZE,
    safeMedCertsPage * PAGE_SIZE
  );
  const paginatedDocuments = documents.slice(
    (safeDocumentsPage - 1) * PAGE_SIZE,
    safeDocumentsPage * PAGE_SIZE
  );

  useEffect(() => {
    if (appointmentsPage > appointmentsTotalPages) setAppointmentsPage(appointmentsTotalPages);
  }, [appointmentsPage, appointmentsTotalPages]);

  useEffect(() => {
    if (medCertsPage > medCertsTotalPages) setMedCertsPage(medCertsTotalPages);
  }, [medCertsPage, medCertsTotalPages]);

  useEffect(() => {
    if (documentsPage > documentsTotalPages) setDocumentsPage(documentsTotalPages);
  }, [documentsPage, documentsTotalPages]);

  const renderPagination = (totalItems, page, totalPages, onPrev, onNext, noun) => {
    const start = totalItems > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
    const end = totalItems > 0 ? Math.min(page * PAGE_SIZE, totalItems) : 0;

    return (
      <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing {start}-{end} of {totalItems} {noun}
        </p>
        <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={page === 1}
            className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Back
          </Button>
          <span className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={page === totalPages}
            className="h-8 min-w-[78px] justify-self-end border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <StaffPageSkeleton variant="tabs" rows={4} />;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Button
          variant="link"
          onClick={() => navigate('/clinician/patients')}
          className="text-[#009DD1] mt-4"
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaffRoleBanner
        title={`${patient.user?.name || 'Patient'} Records`}
        subtitle="Review reservations, certificates, and documents in one place."
        primaryAction={{ label: 'Back to Patients', to: '/clinician/patients' }}
      />

      {/* Tabs */}
      <Card className={cardClass}>
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-0 border-b border-[#97E7F5] bg-[#F0F9FF] sm:justify-start">
          <button
            onClick={() => setActiveTab('overview')}
            title="Overview"
            aria-label="Overview"
            className={`flex-1 px-3 py-3 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors sm:flex-none sm:px-6 ${
              activeTab === 'overview'
                ? 'border-[#009DD1] text-[#009DD1]'
                : 'border-transparent text-gray-600 hover:text-[#009DD1]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            title="Reservations"
            aria-label="Reservations"
            className={`flex-1 px-3 py-3 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors sm:flex-none sm:px-6 ${
              activeTab === 'appointments'
                ? 'border-[#009DD1] text-[#009DD1]'
                : 'border-transparent text-gray-600 hover:text-[#009DD1]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Reservations</span>
          </button>
          <button
            onClick={() => setActiveTab('medcerts')}
            title="Med Certs"
            aria-label="Med Certs"
            className={`flex-1 px-3 py-3 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors sm:flex-none sm:px-6 ${
              activeTab === 'medcerts'
                ? 'border-[#009DD1] text-[#009DD1]'
                : 'border-transparent text-gray-600 hover:text-[#009DD1]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Med Certs</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            title="Documents"
            aria-label="Documents"
            className={`flex-1 px-3 py-3 font-medium flex items-center justify-center gap-2 border-b-2 transition-colors sm:flex-none sm:px-6 ${
              activeTab === 'documents'
                ? 'border-[#009DD1] text-[#009DD1]'
                : 'border-transparent text-gray-600 hover:text-[#009DD1]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Documents</span>
          </button>
        </div>

        {/* Tab Content */}
        <CardContent className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.user?.name || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.user?.email || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.phone || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
                  <p className="text-[#01377D] font-medium mt-2">
                    {patient.date_of_birth
                      ? format(new Date(patient.date_of_birth), 'PPP')
                      : 'N/A'}
                  </p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.age ?? computeAge(patient.date_of_birth)}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Blood Type</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.blood_type || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">PWD / Senior Status</p>
                  <p className="text-[#01377D] font-medium mt-2">
                    {patient.pwd_senior_status ||
                      (patient.is_pwd ? 'PWD' : patient.is_senior ? 'Senior Citizen' : 'No special status')}
                  </p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.address || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Name</p>
                  <p className="text-[#01377D] font-medium mt-2">{patient.emergency_contact_name || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-[#009DD1] pl-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Contact Number</p>
                  <p className="text-[#01377D] font-medium mt-2">
                    {patient.emergency_contact_number || patient.emergency_contact_phone || 'N/A'}
                  </p>
                </div>
              </div>

              {patient.medical_history && (
                <div>
                  <h3 className="text-lg font-semibold text-[#01377D] mb-3">Medical History</h3>
                  <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded border border-blue-200">
                    {patient.medical_history}
                  </div>
                </div>
              )}

              {patient.allergies && (
                <div>
                  <h3 className="text-lg font-semibold text-[#01377D] mb-3">Allergies</h3>
                  <div className="text-sm text-red-700 bg-red-50 p-4 rounded border border-red-200">
                    {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No reservations found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                  <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1fr_1.2fr_130px_1.3fr] md:items-center md:gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & Time</p>
                    <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                  </div>
                  {paginatedAppointments.map((apt, index) => (
                    <div key={apt.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                      <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_1.2fr_130px_1.3fr]">
                        <p className="truncate text-sm font-semibold text-[#01377D]">
                          {apt.appointment_type?.name || apt.type || 'N/A'}
                        </p>
                        <p className="text-xs text-[#5A6F8F]">
                          {apt.start_time ? format(new Date(apt.start_time), 'PPP p') : 'N/A'}
                        </p>
                        <div className="flex justify-center">{getStatusBadge(apt.status)}</div>
                        <p className="truncate text-xs text-[#5A6F8F]">{apt.cancellation_reason || apt.notes || '-'}</p>
                      </div>
                      <div className="space-y-2 p-3 md:hidden">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-[#01377D]">
                            {apt.appointment_type?.name || apt.type || 'N/A'}
                          </p>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-xs text-[#5A6F8F]">
                          {apt.start_time ? format(new Date(apt.start_time), 'PPP p') : 'N/A'}
                        </p>
                        <p className="text-xs text-[#5A6F8F]">{apt.cancellation_reason || apt.notes || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {renderPagination(
                appointments.length,
                safeAppointmentsPage,
                appointmentsTotalPages,
                () => setAppointmentsPage((prev) => Math.max(1, prev - 1)),
                () => setAppointmentsPage((prev) => Math.min(appointmentsTotalPages, prev + 1)),
                'reservations'
              )}
            </div>
          )}

          {/* Medical Certificates Tab */}
          {activeTab === 'medcerts' && (
            <div>
              {medCerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No medical certificates found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                  <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1fr_1fr_130px_1.3fr] md:items-center md:gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reason</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Requested Date</p>
                    <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                  </div>
                  {paginatedMedCerts.map((cert, index) => (
                    <div key={cert.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                      <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_1fr_130px_1.3fr]">
                        <p className="truncate text-sm font-semibold text-[#01377D]">{cert.reason || cert.type || 'N/A'}</p>
                        <p className="text-xs text-[#5A6F8F]">
                          {cert.created_at ? format(new Date(cert.created_at), 'PPP') : 'N/A'}
                        </p>
                        <div className="flex justify-center">{getStatusBadge(cert.status)}</div>
                        <p className="truncate text-xs text-[#5A6F8F]">{cert.notes || cert.reason || '-'}</p>
                      </div>
                      <div className="space-y-2 p-3 md:hidden">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-[#01377D]">{cert.reason || cert.type || 'N/A'}</p>
                          {getStatusBadge(cert.status)}
                        </div>
                        <p className="text-xs text-[#5A6F8F]">
                          {cert.created_at ? format(new Date(cert.created_at), 'PPP') : 'N/A'}
                        </p>
                        <p className="text-xs text-[#5A6F8F]">{cert.notes || cert.reason || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {renderPagination(
                medCerts.length,
                safeMedCertsPage,
                medCertsTotalPages,
                () => setMedCertsPage((prev) => Math.max(1, prev - 1)),
                () => setMedCertsPage((prev) => Math.min(medCertsTotalPages, prev + 1)),
                'certificates'
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedDocuments.map((doc) => (
                    <Card key={doc.id} className="border-[#D8EBFA] p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#01377D]">{doc.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Uploaded {doc.created_at ? format(new Date(doc.created_at), 'PPP p') : 'N/A'}
                          </p>
                          {doc.documentType?.name && (
                            <Badge variant="outline" className="mt-2">
                              {doc.documentType.name}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#009DD1] hover:bg-[#01377D] text-white"
                          onClick={() => navigate('/clinician/previous-laboratory')}
                        >
                          View in Previous Laboratory
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {renderPagination(
                documents.length,
                safeDocumentsPage,
                documentsTotalPages,
                () => setDocumentsPage((prev) => Math.max(1, prev - 1)),
                () => setDocumentsPage((prev) => Math.min(documentsTotalPages, prev + 1)),
                'documents'
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecords;

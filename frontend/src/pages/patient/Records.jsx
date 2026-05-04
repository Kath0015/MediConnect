// Records.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { FileText, Download, Search, Calendar, User, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { getDocuments, downloadDocument } from '../../api/Documents';
import { getMedCerts } from '../../api/MedicalCertificates';
import { getAppointments } from '../../api/Appointments';
import { normalizePaginated } from '../../api/PatientPortal';
import PatientPageSkeleton from '../../components/patient/PatientPageSkeleton';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const mockDocuments = [
  {
    id: 'mock-doc-1',
    name: 'CBC Result - March 2026.pdf',
    description: 'Routine laboratory blood test results',
    created_at: '2026-03-01T08:30:00.000Z',
    tags: ['Laboratory', 'Verified'],
    file_name: 'cbc-result-march-2026.pdf',
  },
  {
    id: 'mock-doc-2',
    name: 'Chest X-Ray Interpretation.pdf',
    description: 'Radiology report for annual checkup',
    created_at: '2026-02-20T09:45:00.000Z',
    tags: ['Radiology'],
    file_name: 'chest-xray-interpretation.pdf',
  },
];

const mockCertificates = [
  {
    id: 'mock-cert-1',
    type: 'fit_to_work',
    status: 'approved',
    created_at: '2026-03-02T08:00:00.000Z',
    start_date: '2026-03-03',
    end_date: '2026-03-05',
    medical_reason: 'Viral syndrome recovery',
    pickup_date: '2026-03-06',
  },
  {
    id: 'mock-cert-2',
    type: 'medical_leave',
    status: 'pending',
    created_at: '2026-03-04T10:00:00.000Z',
    start_date: '2026-03-07',
    end_date: '2026-03-08',
    medical_reason: 'Follow-up consultation',
    pickup_date: null,
  },
];

const mockVisits = [
  {
    id: 'mock-visit-1',
    title: 'Follow-up Consultation',
    type: 'consultation',
    status: 'completed',
    start_time: '2026-02-15T10:30:00.000Z',
    clinician: { name: 'Dr. Maria Santos' },
  },
  {
    id: 'mock-visit-2',
    title: 'General Checkup',
    type: 'checkup',
    status: 'confirmed',
    start_time: '2026-03-12T14:00:00.000Z',
    clinician: { name: 'Dr. John Cruz' },
  },
];

const titleCase = (value = '') =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const Records = () => {
  const PAGE_SIZE = 10;
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.patient?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const [documentsPage, setDocumentsPage] = useState(1);
  const [certificatesPage, setCertificatesPage] = useState(1);
  const [visitsPage, setVisitsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState({ data: [], meta: {} });
  const [certificates, setCertificates] = useState({ data: [], meta: {} });
  const [visits, setVisits] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const cardClass =
    'border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,132,199,0.12)]';
  const tabClass = (value) =>
    `rounded-full border px-4 text-xs sm:text-sm ${
      activeTab === value
        ? 'border-[#BFE6FB] bg-[#EAF5FF] text-[#0f2d57]'
        : 'border-[#D8EBFA] bg-white text-[#5A6F8F] hover:bg-[#F8FBFF] hover:text-[#0f2d57]'
    }`;

  useEffect(() => {
    if (authLoading) return;
    if (!patientId) {
      setLoading(false);
      setDocuments({ data: [], meta: {} });
      setCertificates({ data: [], meta: {} });
      setVisits([]);
      return;
    }

    const loadRecords = async () => {
      try {
        setLoading(true);
        const [documentsRes, certificatesRes, visitsRes] = await Promise.all([
          getDocuments(patientId, { per_page: 50 }),
          getMedCerts({ per_page: 50 }),
          getAppointments({ per_page: 50 }),
        ]);

        setDocuments(normalizePaginated(documentsRes));
        setCertificates(normalizePaginated(certificatesRes));
        const visitsPayload = visitsRes?.data;
        setVisits(Array.isArray(visitsPayload?.data) ? visitsPayload.data : []);
      } catch (error) {
        console.error('Failed to load records', error);
        toast.error('Unable to load medical records');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [authLoading, patientId]);

  const searchLower = searchQuery.toLowerCase();
  const docsSource = documents.data.length > 0 ? documents.data : mockDocuments;
  const certsSource = certificates.data.length > 0 ? certificates.data : mockCertificates;
  const visitsSource = visits.length > 0 ? visits : mockVisits;

  const filteredDocuments = useMemo(() => {
    if (!searchLower) return docsSource;
    return docsSource.filter((doc) =>
      doc.name?.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower)
    );
  }, [docsSource, searchLower]);

  const filteredCertificates = useMemo(() => {
    if (!searchLower) return certsSource;
    return certsSource.filter((cert) =>
      cert.type?.toLowerCase().includes(searchLower) ||
      cert.status?.toLowerCase().includes(searchLower)
    );
  }, [certsSource, searchLower]);

  const filteredVisits = useMemo(() => {
    if (!searchLower) return visitsSource;
    return visitsSource.filter((visit) =>
      visit?.clinician?.name?.toLowerCase().includes(searchLower) ||
      visit.title?.toLowerCase().includes(searchLower)
    );
  }, [visitsSource, searchLower]);

  const documentsTotalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
  const certificatesTotalPages = Math.max(1, Math.ceil(filteredCertificates.length / PAGE_SIZE));
  const visitsTotalPages = Math.max(1, Math.ceil(filteredVisits.length / PAGE_SIZE));

  const safeDocumentsPage = Math.min(documentsPage, documentsTotalPages);
  const safeCertificatesPage = Math.min(certificatesPage, certificatesTotalPages);
  const safeVisitsPage = Math.min(visitsPage, visitsTotalPages);

  const paginatedDocuments = filteredDocuments.slice(
    (safeDocumentsPage - 1) * PAGE_SIZE,
    safeDocumentsPage * PAGE_SIZE
  );
  const paginatedCertificates = filteredCertificates.slice(
    (safeCertificatesPage - 1) * PAGE_SIZE,
    safeCertificatesPage * PAGE_SIZE
  );
  const paginatedVisits = filteredVisits.slice(
    (safeVisitsPage - 1) * PAGE_SIZE,
    safeVisitsPage * PAGE_SIZE
  );

  useEffect(() => {
    setDocumentsPage(1);
    setCertificatesPage(1);
    setVisitsPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (documentsPage > documentsTotalPages) {
      setDocumentsPage(documentsTotalPages);
    }
  }, [documentsPage, documentsTotalPages]);

  useEffect(() => {
    if (certificatesPage > certificatesTotalPages) {
      setCertificatesPage(certificatesTotalPages);
    }
  }, [certificatesPage, certificatesTotalPages]);

  useEffect(() => {
    if (visitsPage > visitsTotalPages) {
      setVisitsPage(visitsTotalPages);
    }
  }, [visitsPage, visitsTotalPages]);

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      const response = await downloadDocument(doc.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name || `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document', error);
      toast.error('Unable to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  const searchPlaceholder = {
    documents: 'Search documents…',
    certificates: 'Search certificates…',
    visits: 'Search visits…',
  }[activeTab];

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
            size="sm"
            variant="outline"
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
            size="sm"
            variant="outline"
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

  if (authLoading || loading) {
    return <PatientPageSkeleton variant="tabs" rows={4} />;
  }

  return (
    <div className="space-y-6">
      <PatientRoleBanner
        title="Medical Records"
        subtitle="Review documents, certificates, and visit history with quick access to downloads."
      />

      <div>
        <h1 className="text-xl font-semibold text-[#0f2d57]">Manage Your Records</h1>
        <p className="mt-1 text-sm text-[#406A93]">Download files, track certificates, and check visit history.</p>
      </div>

      {!patientId && (
        <Card className={cardClass}>
          <CardContent className="py-4 text-sm text-amber-700">
            Wala pang linked patient record sa account mo, kaya limited ang records na makikita.
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 " />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent gap-2 flex-wrap p-1">
          <TabsTrigger value="documents" className={tabClass('documents')}>
            Documents ({documents.meta?.total ?? docsSource.length})
          </TabsTrigger>
          <TabsTrigger value="certificates" className={tabClass('certificates')}>
            Certificates ({certificates.meta?.total ?? certsSource.length})
          </TabsTrigger>
          <TabsTrigger value="visits" className={tabClass('visits')}>
            Visits ({visitsSource.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 pt-1 sm:pt-2">
          {filteredDocuments.length === 0 ? (
            <Card className={cardClass}>
              <CardContent className="py-10 text-center text-gray-500">
                No documents found.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.6fr_1fr_1.2fr_120px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">File</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Uploaded</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Action</p>
                </div>

                {paginatedDocuments.map((doc, index) => (
                  <div key={doc.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.6fr_1fr_1.2fr_120px]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-cyan-700" />
                          <p className="truncate text-sm font-semibold text-[#01377D]">{doc.name}</p>
                        </div>
                        <p className="line-clamp-1 pl-6 text-xs text-[#5A6F8F]">{doc.description || 'No description'}</p>
                      </div>
                      <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
                        {doc.documentType?.name || doc.tags?.[0] || 'Document'}
                      </Badge>
                      <p className="text-xs text-[#5A6F8F]">{format(new Date(doc.created_at), 'MMM d, yyyy')}</p>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id || String(doc.id).startsWith('mock-')}
                          className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                        >
                          {downloadingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#01377D]">{doc.name}</p>
                          <p className="line-clamp-2 text-xs text-[#5A6F8F]">{doc.description || 'No description'}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id || String(doc.id).startsWith('mock-')}
                          className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                        >
                          {downloadingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5A6F8F]">
                        <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 text-[11px]">
                          {doc.documentType?.name || doc.tags?.[0] || 'Document'}
                        </Badge>
                        <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination(
                filteredDocuments.length,
                safeDocumentsPage,
                documentsTotalPages,
                () => setDocumentsPage((prev) => Math.max(1, prev - 1)),
                () => setDocumentsPage((prev) => Math.min(documentsTotalPages, prev + 1)),
                'documents'
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4 pt-1 sm:pt-2">
          {filteredCertificates.length === 0 ? (
            <Card className={cardClass}>
              <CardContent className="py-10 text-center text-gray-500">
                No certificates available.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.2fr_1.3fr_1.5fr_130px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Certificate</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Details</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Status</p>
                </div>

                {paginatedCertificates.map((cert, index) => (
                  <div key={cert.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.2fr_1.3fr_1.5fr_130px]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#01377D]">{titleCase(cert.type)}</p>
                        <p className="truncate text-[11px] text-[#5A6F8F]">
                          Requested {format(new Date(cert.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-xs text-[#5A6F8F]">
                        {format(new Date(cert.start_date), 'MMM d, yyyy')} - {format(new Date(cert.end_date), 'MMM d, yyyy')}
                      </p>
                      <div className="text-xs text-[#5A6F8F]">
                        {cert.pickup_date ? (
                          <p>Pickup: {format(new Date(cert.pickup_date), 'MMM d, yyyy')}</p>
                        ) : (
                          <p>{cert.medical_reason || 'No additional details'}</p>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <Badge className={`capitalize border ${getStatusColor(cert.status)}`}>
                          {titleCase(cert.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#01377D]">{titleCase(cert.type)}</p>
                          <p className="text-[11px] text-[#5A6F8F]">
                            {format(new Date(cert.start_date), 'MMM d, yyyy')} - {format(new Date(cert.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={`capitalize border ${getStatusColor(cert.status)}`}>
                          {titleCase(cert.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6F8F]">
                        {cert.pickup_date
                          ? `Pickup: ${format(new Date(cert.pickup_date), 'MMM d, yyyy')}`
                          : cert.medical_reason || 'No additional details'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination(
                filteredCertificates.length,
                safeCertificatesPage,
                certificatesTotalPages,
                () => setCertificatesPage((prev) => Math.max(1, prev - 1)),
                () => setCertificatesPage((prev) => Math.min(certificatesTotalPages, prev + 1)),
                'certificates'
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="visits" className="space-y-4 pt-1 sm:pt-2">
          {filteredVisits.length === 0 ? (
            <Card className={cardClass}>
              <CardContent className="py-10 text-center text-gray-500">
                No visits recorded yet.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.2fr_1.2fr_1.4fr_130px] md:items-center md:gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visit</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Clinician</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Schedule</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Status</p>
                </div>

                {paginatedVisits.map((visit, index) => (
                  <div key={visit.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                    <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.2fr_1.2fr_1.4fr_130px]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#01377D]">{visit.title || titleCase(visit.type)}</p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs text-[#5A6F8F]">
                        <User className="h-3.5 w-3.5" />
                        {visit?.clinician?.name || 'Assigned Clinician'}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs text-[#5A6F8F]">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(visit.start_time), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="flex justify-center">
                        <Badge className={`capitalize border ${getStatusColor(visit.status)}`}>
                          {titleCase(visit.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#01377D]">{visit.title || titleCase(visit.type)}</p>
                          <p className="text-xs text-[#5A6F8F]">{visit?.clinician?.name || 'Assigned Clinician'}</p>
                        </div>
                        <Badge className={`capitalize border ${getStatusColor(visit.status)}`}>
                          {titleCase(visit.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6F8F]">{format(new Date(visit.start_time), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination(
                filteredVisits.length,
                safeVisitsPage,
                visitsTotalPages,
                () => setVisitsPage((prev) => Math.max(1, prev - 1)),
                () => setVisitsPage((prev) => Math.min(visitsTotalPages, prev + 1)),
                'visits'
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const getStatusColor = (status = '') => {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'completed':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default Records;
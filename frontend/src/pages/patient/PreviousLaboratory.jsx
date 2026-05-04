import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { FileText, Download, Loader2, Search, Calendar, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { getDocuments, downloadDocument } from '../../api/Documents';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';
import PatientPageSkeleton from '../../components/patient/PatientPageSkeleton';

const mockLaboratoryDocuments = [
  {
    id: 'mock-lab-1',
    name: 'Complete Blood Count Result',
    description: 'Routine annual physical exam panel.',
    created_at: '2026-03-03T10:20:00Z',
    documentType: { name: 'Laboratory Result' },
  },
  {
    id: 'mock-lab-2',
    name: 'Urinalysis Report',
    description: 'Requested for pre-employment requirements.',
    created_at: '2026-02-20T08:15:00Z',
    documentType: { name: 'Laboratory Result' },
  },
  {
    id: 'mock-lab-3',
    name: 'Lipid Profile',
    description: 'Follow-up after dietary adjustment plan.',
    created_at: '2026-01-28T13:05:00Z',
    documentType: { name: 'Chemistry' },
  },
  {
    id: 'mock-lab-4',
    name: 'Fasting Blood Sugar',
    description: 'Screening due to family history.',
    created_at: '2026-01-10T09:42:00Z',
    documentType: { name: 'Laboratory Result' },
  },
];

const PreviousLaboratory = () => {
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.patient?.id;
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewingId, setPreviewingId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    if (authLoading) return;
    if (!patientId) {
      setLoading(false);
      setDocuments([]);
      return;
    }

    const loadLaboratoryDocuments = async () => {
      try {
        setLoading(true);
        const response = await getDocuments(patientId, {
          per_page: 100,
          laboratory_only: true,
        });
        const payload = response?.data;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load laboratory documents:', error);
        toast.error('Unable to load previous laboratory files');
      } finally {
        setLoading(false);
      }
    };

    loadLaboratoryDocuments();
  }, [authLoading, patientId]);

  const displayDocuments = documents.length > 0 ? documents : mockLaboratoryDocuments;

  const filteredDocuments = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    if (!lowered) return displayDocuments;
    return displayDocuments.filter((doc) => {
      const name = String(doc?.name || '').toLowerCase();
      const description = String(doc?.description || '').toLowerCase();
      const type = String(doc?.documentType?.name || '').toLowerCase();
      return name.includes(lowered) || description.includes(lowered) || type.includes(lowered);
    });
  }, [displayDocuments, query]);

  const latestLaboratory = useMemo(() => {
    if (displayDocuments.length === 0) return null;
    return [...displayDocuments].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];
  }, [displayDocuments]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      const response = await downloadDocument(doc.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.file_name || doc.name || 'laboratory-document';
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download laboratory file:', error);
      toast.error('Unable to download laboratory file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (doc) => {
    if (String(doc.id).startsWith('mock-')) {
      setPreviewData({
        name: doc.name,
        mime: 'text/plain',
        url: null,
        text: doc.description || 'Sample laboratory file preview.',
      });
      return;
    }

    try {
      setPreviewingId(doc.id);
      const response = await downloadDocument(doc.id);
      const mime = response.headers['content-type'] || doc.mime_type || 'application/octet-stream';
      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      setPreviewData({
        name: doc.file_name || doc.name || 'Laboratory File',
        mime,
        url,
        text: '',
      });
    } catch (error) {
      console.error('Failed to preview laboratory file:', error);
      toast.error('Unable to preview laboratory file');
    } finally {
      setPreviewingId(null);
    }
  };

  const closePreview = () => {
    if (previewData?.url) {
      window.URL.revokeObjectURL(previewData.url);
    }
    setPreviewData(null);
  };

  if (authLoading || loading) {
    return <PatientPageSkeleton variant="list" rows={4} />;
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <PatientRoleBanner
        title="Previous Laboratory"
        subtitle="Browse and download your historical laboratory files and recent uploads."
      />

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search previous laboratory files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 transition-all duration-200 focus:border-cyan-500 focus:ring-cyan-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!patientId && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="py-4 text-sm text-amber-900">
            Wala pang linked patient record sa account mo. Paki-contact ang clinic para ma-link ang profile mo.
          </CardContent>
        </Card>
      )}

      {latestLaboratory && (
        <Card className="border-green-200 bg-green-50/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Latest Laboratory File</CardTitle>
            <CardDescription>
              Uploaded {format(new Date(latestLaboratory.created_at), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#01377D]">{latestLaboratory.name}</p>
              {latestLaboratory.description && (
                <p className="text-sm text-gray-600 mt-1">{latestLaboratory.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(latestLaboratory)}
                disabled={previewingId === latestLaboratory.id}
                className="h-8 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                {previewingId === latestLaboratory.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(latestLaboratory)}
                disabled={downloadingId === latestLaboratory.id}
                className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
              >
                {downloadingId === latestLaboratory.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDocuments.length === 0 ? (
        <Card className="border-[#97E7F5] shadow-sm bg-white">
          <CardContent className="py-10 text-center text-gray-500">
            No previous laboratory files found.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
            <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.6fr_1fr_1.4fr_170px] md:items-center md:gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">File</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Uploaded</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Action</p>
            </div>

            {paginatedDocuments.map((doc, index) => (
              <div key={doc.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.6fr_1fr_1.4fr_170px]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#01377D]">{doc.name}</p>
                    <p className="line-clamp-2 text-xs text-[#5A6F8F]">{doc.description || 'No description'}</p>
                  </div>
                  <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
                    {doc.documentType?.name || 'Laboratory'}
                  </Badge>
                  <div className="inline-flex items-center gap-1 text-xs text-[#5A6F8F]">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        disabled={previewingId === doc.id}
                        className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                      >
                        {previewingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                      >
                        {downloadingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-3 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#01377D]">{doc.name}</p>
                      <p className="text-xs text-[#5A6F8F]">{doc.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        disabled={previewingId === doc.id}
                        className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                      >
                        {previewingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className="h-8 w-8 border-cyan-200 p-0 text-cyan-700 hover:bg-cyan-50"
                      >
                        {downloadingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5A6F8F]">
                    <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 text-[11px]">
                      {doc.documentType?.name || 'Laboratory'}
                    </Badge>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredDocuments.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredDocuments.length)} of {filteredDocuments.length} files
            </p>
            <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Back
              </Button>
              <span className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
                Page {safePage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="h-8 min-w-[78px] justify-self-end border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      <Dialog open={Boolean(previewData)} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="w-[min(92vw,860px)] max-h-[88vh] overflow-y-auto rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.24)]">
          <DialogHeader className="rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="text-lg text-[#01377D]">
              {previewData?.name || 'Laboratory Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {previewData?.url && previewData?.mime?.startsWith('image/') ? (
              <img src={previewData.url} alt={previewData.name} className="max-h-[70vh] w-full rounded-xl object-contain bg-slate-50" />
            ) : previewData?.url && previewData?.mime?.includes('pdf') ? (
              <iframe src={previewData.url} title={previewData.name} className="h-[70vh] w-full rounded-xl border border-slate-200" />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {previewData?.text || 'Preview not available for this file type. You can still download it.'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviousLaboratory;

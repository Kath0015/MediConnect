import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, Loader2, FileText, Download, Eye, Trash2, Filter, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';

const PAGE_SIZE = 10;
const mockDocuments = [
  {
    id: 'mock-doc-1',
    name: 'CBC Result - March 2026.pdf',
    file_name: 'cbc-result-march-2026.pdf',
    mime_type: 'application/pdf',
    documentType: { name: 'Lab Result' },
    patient: { user: { name: 'Sample Patient One' } },
    created_at: '2026-03-01T09:20:00.000Z',
  },
  {
    id: 'mock-doc-2',
    name: 'X-Ray Report - Chest.png',
    file_name: 'xray-chest.png',
    mime_type: 'image/png',
    documentType: { name: 'Image' },
    patient: { user: { name: 'Sample Patient Two' } },
    created_at: '2026-03-03T14:05:00.000Z',
  },
  {
    id: 'mock-doc-3',
    name: 'Prescription Follow-up.txt',
    file_name: 'prescription-followup.txt',
    mime_type: 'text/plain',
    documentType: { name: 'Prescription' },
    patient: { user: { name: 'Sample Patient Three' } },
    created_at: '2026-03-06T08:50:00.000Z',
  },
];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hiddenMockIds, setHiddenMockIds] = useState([]);

  useEffect(() => {
    loadDocuments();
    loadDocumentTypes();
  }, []);

  useEffect(() => {
    // Filter documents based on search query and selected type
    const sourceDocuments =
      documents.length > 0
        ? documents
        : mockDocuments.filter((doc) => !hiddenMockIds.includes(doc.id));
    let filtered = sourceDocuments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(query) ||
        doc.documentType?.name?.toLowerCase().includes(query) ||
        doc.patient?.user?.name?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(doc => doc.document_type_id === parseInt(selectedType));
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, documents, selectedType, hiddenMockIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/clinician/documents');
      
      console.log('Documents API Response:', response.data);
      
      // Handle paginated response
      const documentData = response.data?.data || response.data || [];
      console.log('Document Data:', documentData);
      console.log('Is Array:', Array.isArray(documentData));
      
      setDocuments(Array.isArray(documentData) ? documentData : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await api.get('/api/document-types');
      const types = response.data?.data || [];
      setDocumentTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error('Failed to load document types:', err);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/api/documents/${document.id}/download`, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.file_name || document.name || 'document');
      window.document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      setViewLoading(true);
      setViewingDocument(doc);

      // Determine file type and handle accordingly
      const fileType = doc.mime_type?.toLowerCase() || '';
      const fileName = doc.file_name?.toLowerCase() || '';

      if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        // For PDFs, fetch from API and create data URL
        try {
          const response = await api.get(`/api/documents/${doc.id}/download`, {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(response.data);
          setDocumentContent(url);
        } catch {
          setDocumentContent('');
        }
      } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // For images, fetch from API and create data URL
        try {
          const response = await api.get(`/api/documents/${doc.id}/download`, {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(response.data);
          setDocumentContent(url);
        } catch {
          setDocumentContent('');
        }
      } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
        // For text files, fetch and display content
        try {
          const response = await api.get(`/api/documents/${doc.id}/download`, {
            responseType: 'text',
          });
          setDocumentContent(response.data);
        } catch {
          setDocumentContent('Unable to load file content');
        }
      } else {
        // For other types, try to fetch as blob and create URL
        try {
          const response = await api.get(`/api/documents/${doc.id}/download`, {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(response.data);
          setDocumentContent(url);
        } catch {
          setDocumentContent('');
        }
      }
    } catch (err) {
      console.error('Failed to view document:', err);
      toast.error('Failed to view document');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const idText = String(documentId);
    if (idText.startsWith('mock-')) {
      setHiddenMockIds((prev) => [...prev, documentId]);
      setDeleteConfirmId(null);
      toast.success('Preview document removed');
      return;
    }

    try {
      setDeletingId(documentId);
      await api.delete(`/api/documents/${documentId}`);
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete document');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const getDocumentTypeBadge = (documentType) => {
    const typeName = typeof documentType === 'string' ? documentType : documentType?.name;
    
    const typeMap = {
      pdf: { className: 'bg-red-100 text-red-800', label: 'PDF' },
      image: { className: 'bg-blue-100 text-blue-800', label: 'Image' },
      document: { className: 'bg-orange-100 text-orange-800', label: 'Document' },
      prescription: { className: 'bg-green-100 text-green-800', label: 'Prescription' },
      lab_result: { className: 'bg-purple-100 text-purple-800', label: 'Lab Result' },
    };

    const config = typeMap[typeName?.toLowerCase()] || {
      className: 'bg-gray-100 text-gray-800',
      label: typeName || 'Document'
    };

    return (
      <Badge className={`${config.className} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const renderDeleteControl = (documentId) => {
    const isConfirming = deleteConfirmId === documentId;
    const isDeleting = deletingId === documentId;

    return (
      <div className="relative ml-1 h-8 w-[76px] overflow-hidden">
        <div
          className={`absolute right-0 top-0 flex items-center gap-1 transition-all duration-200 ${
            isConfirming ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 pointer-events-none'
          }`}
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-lg border-emerald-300 bg-emerald-50 p-0 text-emerald-700 hover:bg-emerald-100"
            onClick={() => handleDelete(documentId)}
            title="Confirm delete"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-lg border-slate-300 p-0 text-slate-600 hover:bg-slate-100"
            onClick={() => setDeleteConfirmId(null)}
            disabled={isDeleting}
            title="Cancel delete"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div
          className={`absolute right-0 top-0 transition-all duration-200 ${
            isConfirming ? '-translate-y-1 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-lg border-rose-200 p-0 text-rose-700 hover:bg-rose-50"
            onClick={() => setDeleteConfirmId(documentId)}
            disabled={isDeleting}
            title="Delete document"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <StaffPageSkeleton variant="tabs" rows={4} />;
  }

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = filteredDocuments.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = filteredDocuments.length > 0 ? Math.min(safePage * PAGE_SIZE, filteredDocuments.length) : 0;
  const paginatedDocuments = filteredDocuments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <StaffRoleBanner
        title="Documents"
        subtitle="Manage patient-uploaded files with fast filtering, preview, and secure download."
        primaryAction={{ label: 'Previous Laboratory', to: '/clinician/previous-laboratory' }}
      />

      {/* Search Bar */}
      <Card className="border-[#97E7F5] shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by document name, type, or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#97E7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009DD1] text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-[#97E7F5] ${showFilters ? 'bg-[#F0F9FF]' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            {(selectedType || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                  setShowFilters(false);
                }}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#97E7F5]">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#01377D] mb-2">Document Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#97E7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009DD1] text-sm"
                  >
                    <option value="">All Types</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="border-[#97E7F5] shadow-sm bg-white">
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
              <div className="hidden bg-slate-50/80 px-4 py-2 md:grid md:grid-cols-[1.4fr_0.9fr_1fr_1fr_170px] md:items-center md:gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Document</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Patient</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Uploaded</p>
                <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Action</p>
              </div>
              {paginatedDocuments.map((document, index) => (
                <div key={document.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                  <div className="hidden items-center gap-3 px-4 py-3 md:grid md:grid-cols-[1.4fr_0.9fr_1fr_1fr_170px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <p className="truncate text-sm font-semibold text-[#01377D]">
                          {document.name || document.title || 'Unnamed'}
                        </p>
                      </div>
                    </div>
                    {getDocumentTypeBadge(document.documentType)}
                    <p className="truncate text-xs text-[#5A6F8F]">{document.patient?.user?.name || 'Unknown'}</p>
                    <div className="text-xs text-[#5A6F8F]">
                      <p>{format(new Date(document.created_at), 'MMM dd, yyyy')}</p>
                      <p>{format(new Date(document.created_at), 'HH:mm:ss')}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 rounded-lg border-emerald-200 p-0 text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                        onClick={() => handleDownload(document)}
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 rounded-lg border-cyan-200 p-0 text-cyan-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-50"
                        onClick={() => handleViewDocument(document)}
                        title="View document"
                        disabled={viewLoading}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {renderDeleteControl(document.id)}
                    </div>
                  </div>

                  <div className="space-y-2 p-3 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#01377D]">{document.name || document.title || 'Unnamed'}</p>
                        <p className="truncate text-xs text-[#5A6F8F]">{document.patient?.user?.name || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-lg border-emerald-200 p-0 text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-lg border-cyan-200 p-0 text-cyan-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-50"
                          onClick={() => handleViewDocument(document)}
                          disabled={viewLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {renderDeleteControl(document.id)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5A6F8F]">
                      {getDocumentTypeBadge(document.documentType)}
                      <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing {pageStart}-{pageEnd} of {filteredDocuments.length} documents
        </p>
        <div className="grid w-full max-w-sm grid-cols-3 items-center gap-2 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="h-8 min-w-[78px] justify-self-start border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <span className="min-w-[86px] justify-self-center text-center text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="h-8 min-w-[78px] justify-self-end border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[#01377D] truncate">
                {viewingDocument.name || viewingDocument.title || 'Document Viewer'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (documentContent && documentContent.startsWith('blob:')) {
                    window.URL.revokeObjectURL(documentContent);
                  }
                  setViewingDocument(null);
                  setDocumentContent('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {viewLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-[#009DD1]" />
                </div>
              ) : (
                <>
                  {viewingDocument.mime_type?.includes('pdf') || viewingDocument.file_name?.endsWith('.pdf') ? (
                    documentContent ? (
                      <embed
                        src={documentContent}
                        type="application/pdf"
                        className="w-full h-96"
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Unable to load PDF</p>
                      </div>
                    )
                  ) : viewingDocument.mime_type?.includes('image') || viewingDocument.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    documentContent ? (
                      <div className="flex justify-center">
                        <img
                          src={documentContent}
                          alt={viewingDocument.name}
                          className="max-w-full max-h-96 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Unable to load image</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-96 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                      {documentContent || 'Unable to load file content'}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <div className="border-t border-[#97E7F5] p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleDownload(viewingDocument)}
                className="border-[#97E7F5]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (documentContent && documentContent.startsWith('blob:')) {
                    window.URL.revokeObjectURL(documentContent);
                  }
                  setViewingDocument(null);
                  setDocumentContent('');
                }}
                className="bg-[#009DD1] text-white hover:bg-[#007ea8]"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Documents;

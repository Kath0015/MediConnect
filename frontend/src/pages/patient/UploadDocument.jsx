//UploadDocument.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Upload, FileText, Image as ImageIcon, FileCheck, Calendar, Trash2, Loader2, Check, X, CircleHelp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import PatientPageSkeleton from '../../components/patient/PatientPageSkeleton';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const mockUploadedDocuments = [
  {
    id: 'mock-doc-1',
    title: 'CBC Laboratory Result',
    name: 'cbc-result-march.pdf',
    document_type: { name: 'Laboratory Result' },
    created_at: '2026-03-08T09:30:00Z',
    status: 'verified',
    file_path: null,
  },
  {
    id: 'mock-doc-2',
    title: 'Chest X-Ray',
    name: 'xray-chest.png',
    type: 'Imaging',
    created_at: '2026-03-05T13:10:00Z',
    status: 'pending',
    file_path: null,
  },
  {
    id: 'mock-doc-3',
    title: 'Insurance Card',
    name: 'insurance-card.jpg',
    type: 'Insurance',
    created_at: '2026-02-25T08:45:00Z',
    status: 'verified',
    file_path: null,
  },
  {
    id: 'mock-doc-4',
    title: 'Urinalysis Report',
    name: 'urinalysis-report.pdf',
    document_type: { name: 'Laboratory Result' },
    created_at: '2026-02-20T10:15:00Z',
    status: 'pending',
    file_path: null,
  },
];

const staticDocumentTypeSuggestions = [
  'Laboratory Result',
  'X-Ray / Imaging',
  'Prescription',
  'Medical Certificate',
  'Vaccination Record',
  'Discharge Summary',
  'Insurance Document',
  'Referral Letter',
];

export const UploadDocument = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [isDocumentTypeMenuOpen, setIsDocumentTypeMenuOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [mockDocuments, setMockDocuments] = useState(mockUploadedDocuments);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const cardClass =
    'border-[#D8EBFA] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(2,132,199,0.12)]';

  useEffect(() => {
    loadDocumentTypes();
    loadUploadedDocuments();
  }, []);

  const loadDocumentTypes = async () => {
    try {
      const response = await api.get('/api/document-types');
      const types = response.data?.data || [];
      setDocumentTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error('Failed to load document types:', err);
      toast.error('Failed to load document types');
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedDocuments = async () => {
    try {
      const response = await api.get('/api/documents');
      const docs = response.data?.data || [];
      setUploadedDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const typedDocumentType = customDocumentType.trim();
    if ((!documentType && !typedDocumentType) || !selectedFile) {
      toast.error('Please select a document type and file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      if (documentType && documentType !== '__custom__') {
        formData.append('document_type_id', documentType);
      } else {
        formData.append('document_type_name', typedDocumentType);
      }
      formData.append('file', selectedFile);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success || response.status === 201) {
        toast.success('Document uploaded successfully');
        setDocumentType('');
        setCustomDocumentType('');
        setDescription('');
        setSelectedFile(null);
        await loadUploadedDocuments();
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload document';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (uploadedDocuments.length === 0) {
      setMockDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      setDeleteConfirmId(null);
      toast.success('Document deleted successfully');
      return;
    }

    try {
      setDeletingId(docId);
      await api.delete(`/api/documents/${docId}`);
      toast.success('Document deleted successfully');
      setDeleteConfirmId(null);
      await loadUploadedDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    if (filename.endsWith('.jpg') || filename.endsWith('.png')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    return <FileCheck className="w-5 h-5 text-gray-600" />;
  };

  const displayDocuments = uploadedDocuments.length > 0 ? uploadedDocuments : mockDocuments;
  const limitedDocuments = displayDocuments.slice(0, 4);
  const filteredDocumentTypes = documentTypes.filter((type) =>
    String(type?.name || '')
      .toLowerCase()
      .includes(customDocumentType.trim().toLowerCase())
  );
  const existingTypeNames = new Set(
    documentTypes.map((type) => String(type?.name || '').trim().toLowerCase())
  );
  const filteredStaticTypeSuggestions = staticDocumentTypeSuggestions.filter((name) => {
    const lowered = name.toLowerCase();
    const query = customDocumentType.trim().toLowerCase();
    if (existingTypeNames.has(lowered)) return false;
    return query ? lowered.includes(query) : true;
  });
  const hasExactTypeMatch = documentTypes.some(
    (type) => String(type?.name || '').trim().toLowerCase() === customDocumentType.trim().toLowerCase()
  );

  if (loading) {
    return <PatientPageSkeleton variant="form" rows={3} />;
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <PatientRoleBanner
        title="Upload Document"
        subtitle="Securely submit medical files and keep your records updated in one place."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        {/* Upload Form */}
        <Card className={`${cardClass} h-full lg:flex lg:flex-col`}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload New Document
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGuidelinesModal(true)}
                className="h-8 w-8 rounded-full p-0 text-cyan-700 hover:bg-cyan-100"
                title="View upload guidelines"
              >
                <CircleHelp className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Upload medical documents, test results, or insurance information</CardDescription>
          </CardHeader>
          <CardContent className="lg:flex lg:flex-1 lg:flex-col">
            <form onSubmit={handleSubmit} className="space-y-4 lg:flex lg:h-full lg:flex-col">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <div
                    className="relative"
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDocumentTypeMenuOpen(false);
                      }
                    }}
                  >
                    <Input
                      id="documentType"
                      value={customDocumentType}
                      onFocus={() => setIsDocumentTypeMenuOpen(true)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomDocumentType(value);
                        setIsDocumentTypeMenuOpen(true);
                        const matchedType = documentTypes.find(
                          (type) => String(type.name || '').trim().toLowerCase() === value.trim().toLowerCase()
                        );
                        if (matchedType) {
                          setDocumentType(String(matchedType.id));
                        } else {
                          setDocumentType(value.trim() ? '__custom__' : '');
                        }
                      }}
                      placeholder="Select or type document type"
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 pr-10 hover:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsDocumentTypeMenuOpen((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Toggle document type options"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {isDocumentTypeMenuOpen && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-cyan-100 bg-white p-1 shadow-[0_14px_34px_rgba(2,32,71,0.18)]">
                        {!hasExactTypeMatch && customDocumentType.trim() && (
                          <button
                            type="button"
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-cyan-700 hover:bg-cyan-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setDocumentType('__custom__');
                              setCustomDocumentType(customDocumentType.trim());
                              setIsDocumentTypeMenuOpen(false);
                            }}
                          >
                            Use "{customDocumentType.trim()}"
                          </button>
                        )}

                        {filteredDocumentTypes.length > 0 ? (
                          filteredDocumentTypes.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setDocumentType(String(type.id));
                                setCustomDocumentType(type.name);
                                setIsDocumentTypeMenuOpen(false);
                              }}
                            >
                              {type.name}
                            </button>
                          ))
                        ) : null}

                        {filteredStaticTypeSuggestions.length > 0 ? (
                          <>
                            {filteredDocumentTypes.length > 0 && (
                              <div className="my-1 border-t border-slate-100" />
                            )}
                            {filteredStaticTypeSuggestions.map((name) => (
                              <button
                                key={name}
                                type="button"
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-cyan-700 hover:bg-cyan-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setDocumentType('__custom__');
                                  setCustomDocumentType(name);
                                  setIsDocumentTypeMenuOpen(false);
                                }}
                              >
                                {name}
                              </button>
                            ))}
                          </>
                        ) : null}

                        {filteredDocumentTypes.length === 0 && filteredStaticTypeSuggestions.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-slate-500">No matching document types.</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Type freely or choose from dropdown suggestions.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File *</Label>
                  <div className="rounded-xl border-2 border-dashed border-[#BFDDF4] bg-[#f8fbff] p-6 text-center transition-colors hover:border-[#0ea5e9] hover:bg-white">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-[#406A93] mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any relevant notes about this document..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="rounded-xl border border-dashed border-[#97E7F5] bg-[#f8fbff] px-3 py-2.5">
                  <p className="text-sm text-blue-900">
                    <strong>Privacy Notice:</strong> All uploaded documents are encrypted and only accessible 
                    to you and your authorized healthcare providers.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-1 h-10 w-full bg-[#0ea5e9] text-white hover:bg-[#0284c7] lg:mt-auto"
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Document'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <div className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <Card className={`${cardClass} h-full lg:flex lg:min-h-0 lg:flex-1 lg:flex-col`}>
              <CardHeader>
              <CardTitle className="text-[#0f2d57]">Uploaded Documents</CardTitle>
              <CardDescription className="text-[#406A93]">Your previously uploaded files</CardDescription>
            </CardHeader>
            <CardContent className="lg:min-h-0 lg:flex lg:flex-1 lg:flex-col">
              {displayDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 lg:flex-1 lg:grid lg:place-items-center">
                  <div>
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                  {limitedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start justify-between rounded-xl border border-[#D8EBFA] bg-white p-3 transition-all duration-300 hover:border-[#9FD5F5] hover:bg-[#F8FBFF]">
                      <div className="flex gap-3 flex-1">
                        <div className="mt-1">
                          {getFileIcon(doc.file_path || doc.name)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#01377D] mb-1 font-medium">{doc.title || doc.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{doc.document_type?.name || doc.type || 'Document'}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(doc.created_at || doc.uploadDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          {doc.status && (
                            <Badge
                              className={`mt-2 text-xs capitalize ${
                                doc.status === 'verified'
                                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                  : 'border-amber-200 bg-amber-100 text-amber-700'
                              }`}
                            >
                              {doc.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {doc.file_path && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/storage/${doc.file_path}`, '_blank')}
                          >
                            <FileText className="w-4 h-4 text-[#009DD1]" />
                          </Button>
                        )}
                        <div className="relative h-8 w-[76px] overflow-hidden">
                          <div
                            className={`absolute right-0 top-0 flex items-center gap-2 transition-all duration-200 ${
                              deleteConfirmId === doc.id ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 pointer-events-none'
                            }`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === doc.id}
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="h-8 w-8 rounded-lg p-0 text-emerald-700 hover:bg-emerald-100"
                              title="Confirm delete"
                            >
                              {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === doc.id}
                              onClick={() => setDeleteConfirmId(null)}
                              className="h-8 w-8 rounded-lg p-0 text-slate-600 hover:bg-slate-100"
                              title="Cancel delete"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div
                            className={`absolute right-0 top-0 transition-all duration-200 ${
                              deleteConfirmId === doc.id ? '-translate-y-1 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                            }`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(doc.id)}
                              disabled={deletingId === doc.id}
                              className="h-8 w-8 rounded-lg border-rose-200 p-0 text-rose-700 hover:bg-rose-50"
                              title="Delete document"
                            >
                              {deletingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {displayDocuments.length > 4 && (
                <p className="mt-3 text-xs text-slate-500">Showing latest 4 documents.</p>
              )}
              <div className="mt-4 border-t border-slate-100 pt-3 lg:mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patient/previous-laboratory')}
                  className="h-10 w-full rounded-lg border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                >
                  Open Previous Laboratory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showGuidelinesModal} onOpenChange={setShowGuidelinesModal}>
        <DialogContent className="w-[min(92vw,560px)] rounded-2xl border border-cyan-100 bg-white p-0 shadow-[0_24px_65px_rgba(2,32,71,0.24)]">
          <DialogHeader className="rounded-t-2xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="text-lg text-[#01377D]">Upload Guidelines</DialogTitle>
          </DialogHeader>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <ul className="space-y-2 text-sm text-[#406A93]">
              <li>• Ensure documents are clear and legible</li>
              <li>• File size should not exceed 10MB</li>
              <li>• Supported formats: PDF, JPG, PNG</li>
              <li>• Remove any sensitive personal information if not needed</li>
              <li>• Documents are reviewed within 24-48 hours</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocument;
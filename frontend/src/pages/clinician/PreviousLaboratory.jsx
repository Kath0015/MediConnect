import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Download, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import StaffRoleBanner from '../../components/staff/StaffRoleBanner';
import StaffPageSkeleton from '../../components/staff/StaffPageSkeleton';

const PreviousLaboratory = () => {
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Laboratory tests - exact list from the physical form
  const labTestsData = {
    'CLINICAL CHEMISTRY': ['FBS', 'CHOLESTEROL', 'TRIGLYCERIDE', 'HDL', 'LDL', 'BLOOD URIC ACID (BUA)', 'BLOOD UREA NITROGEN (BUN)', 'CREATININE', 'SGOT', 'SGPT', 'CHEM 10', 'LIPID PROFILE'],
    'THYROID TEST': ['T3', 'T4', 'TSH', 'FT3', 'FT4'],
    'CLINICAL MICROSCOPY': ['URINALYSIS', 'FECALYSIS', 'URINE PREGNANCY TEST', 'POBT'],
    'HEMATOLOGY': ['CBC W/ PLATELETS', 'ESR', 'BLOOD TYPING', 'CLOTTING TIME', 'BLEEDING TIME'],
    'SEROLOGY': ['SERUM PREGNANCY TEST', 'DENGUE DUO', 'TYPHOID DOT', 'HBSAG', 'SYPHILIS SCREENING', 'HCV SCREENING', 'HIV SCREENING', 'COVID ANTIGEN TEST'],
    'OTHER TESTS': ['SERUM ELECTROLYTES', 'SODIUM', 'POTASSIUM', 'CHLORIDE', 'IONIZED CALCIUM', 'HBA1C', 'CRP', 'PSA', 'BILIRUBIN', 'ECG'],
  };

  useEffect(() => {
    const loadLaboratoryDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/clinician/documents', {
          params: {
            per_page: 200,
            laboratory_only: true,
          },
        });
        const payload = response?.data;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setDocuments(data);
      } catch (error) {
        // Silently handle - documents are optional
        console.error('Failed to load clinician laboratory documents:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadLaboratoryDocuments();
  }, []);

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      const response = await api.get(`/api/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name || doc.name || 'laboratory-document');
      window.document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download laboratory file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <StaffPageSkeleton variant="list" rows={4} />;
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .lab-form {
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="no-print space-y-6">
        <StaffRoleBanner
          title="Laboratory Request Form"
          subtitle="Print the laboratory request form."
          primaryAction={{ label: 'Open Documents', to: '/clinician/documents' }}
        />

        {/* ACTION BUTTON */}
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handlePrint}
            className="w-full bg-[#009DD1] hover:bg-[#00b8eb] text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Form
          </Button>
        </div>

        {/* PREVIOUS LABORATORY RECORDS */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-[#01377D]">Laboratory Records</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No previous laboratory files found.</div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex gap-3">
                      <FileText className="mt-1 w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-[#01377D]">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          Patient: {doc?.patient?.user?.name || 'Unknown Patient'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy • h:mm a') : 'N/A'}
                        </p>
                        {doc.documentType?.name && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {doc.documentType.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                    >
                      {downloadingId === doc.id ? (
                        <span className="animate-spin">⌛</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PRINTABLE LABORATORY FORM - ONLY THIS PRINTS */}
      <div className="lab-form max-w-3xl mx-auto p-8 bg-white border-2 border-gray-400">
        {/* HEADER */}
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-900">
          {/* Logo Circle */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-full border-4 border-yellow-600 bg-yellow-50 flex items-center justify-center text-3xl font-bold text-red-600">
              ⊕
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">RAPHA LABORATORY AND DIAGNOSTIC CENTER</h1>
          <p className="text-xs text-orange-600 font-semibold mt-1">ADMINISTRATIVE ST., POBLACION BAGUMBAYAN, ROYAS, ORIENTAL MINDORO</p>
        </div>

        {/* PATIENT INFO - Single line format like physical form */}
        <div className="grid grid-cols-2 gap-6 mb-3 text-sm">
          <div className="border-b border-gray-900">
            <span className="font-bold">NAME:</span> <span className="ml-2">_______________________________</span>
          </div>
          <div className="border-b border-gray-900">
            <span className="font-bold">DATE:</span> <span className="ml-2">{format(new Date(), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
          <div className="border-b border-gray-900">
            <span className="font-bold">AGE:</span> <span className="ml-2">_____</span>
          </div>
          <div className="border-b border-gray-900">
            <span className="font-bold">GENDER:</span> <span className="ml-2">_____________</span>
          </div>
          <div className="border-b border-gray-900">
          </div>
        </div>

        <div className="mb-4 pb-2 border-b border-gray-900 text-sm">
          <span className="font-bold">REQ. PHYSICIAN:</span> <span className="ml-2">_______________________________</span>
        </div>

        {/* TITLE */}
        <div className="text-center font-bold text-lg mb-4 tracking-widest">
          LABORATORY TEST
        </div>

        {/* TWO COLUMN TEST LAYOUT - EXACTLY LIKE PHYSICAL FORM */}
        <div className="grid grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* CLINICAL CHEMISTRY */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">CLINICAL CHEMISTRY</div>
              <div className="space-y-1 text-xs">
                {labTestsData['CLINICAL CHEMISTRY'].slice(0, 6).map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs mt-2">
                {labTestsData['CLINICAL CHEMISTRY'].slice(6).map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CLINICAL MICROSCOPY */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">CLINICAL MICROSCOPY</div>
              <div className="space-y-1 text-xs">
                {labTestsData['CLINICAL MICROSCOPY'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HEMATOLOGY */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">HEMATOLOGY</div>
              <div className="space-y-1 text-xs">
                {labTestsData['HEMATOLOGY'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* THYROID TEST */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">THYROID TEST</div>
              <div className="space-y-1 text-xs">
                {labTestsData['THYROID TEST'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SEROLOGY */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">SEROLOGY</div>
              <div className="space-y-1 text-xs">
                {labTestsData['SEROLOGY'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OTHER TESTS */}
            <div>
              <div className="bg-gray-900 text-white font-bold text-xs py-1 px-2 tracking-widest mb-2">OTHER TESTS</div>
              <div className="space-y-1 text-xs">
                {labTestsData['OTHER TESTS'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs font-semibold mt-6 pt-3 border-t border-gray-900">
          CONTACT US: 📧 raphalab0623@gmail.com | ☎ 09956571331
        </div>
      </div>
    </div>
  );
};

export default PreviousLaboratory;

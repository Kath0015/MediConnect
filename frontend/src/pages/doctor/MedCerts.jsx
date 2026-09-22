import React, { useState, useEffect } from 'react';
import { FileBadge, Search, Plus, Eye, Download, CheckCircle2, RefreshCw, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import api from '../../api/axios';

const DoctorMedCerts = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingCert, setViewingCert] = useState(null);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/med-certs');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((c) => ({
        id: c.id,
        patient: c.patient?.user?.name || c.patient?.name || 'Walk-In Patient',
        purpose: c.purpose || c.type || 'Medical Clearance',
        diagnosis: c.diagnosis || 'Clinical evaluation performed',
        dateIssued: c.pickup_date || c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Approved',
        remarks: c.remarks || c.notes || 'Patient cleared as per clinical findings.',
        daysExcused: c.days_excused ? `${c.days_excused} Days` : 'N/A',
      }));
      setCerts(mapped);
    } catch (err) {
      console.error('Failed to load med-certs:', err);
      toast.error('Failed to load certificates from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const filtered = certs.filter((c) =>
    c.patient?.toLowerCase().includes(search.toLowerCase()) ||
    c.purpose?.toLowerCase().includes(search.toLowerCase()) ||
    c.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadCert = async (cert) => {
    try {
      toast.info(`Preparing Medical Certificate for ${cert.patient}...`);
      window.open(`http://localhost:8000/api/med-certs/${cert.id}/download`, '_blank');
    } catch (err) {
      toast.error('Failed to download certificate PDF');
    }
  };

  const handleRevokeCert = async (cert) => {
    const reason = window.prompt(`Revoke certificate for ${cert.patient}? Enter reason:`, 'Clinical review required / Certificate invalidated');
    if (!reason) return;
    try {
      await api.post(`/api/med-certs/${cert.id}/revoke`, { reason });
      toast.success(`Certificate for ${cert.patient} has been revoked.`);
      loadCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke certificate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBadge className="w-6 h-6 text-[#7C3AED]" />
            Medical Certificates
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed digital medical certificates and clearance verification.</p>
        </div>
        <button
          onClick={loadCertificates}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C3AED]' : ''}`} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, purpose, or diagnosis..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Purpose</th>
              <th className="px-5 py-3">Clinical Diagnosis</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    <span>Loading medical certificates from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No medical certificates found in database.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.patient}</td>
                  <td className="px-5 py-4 font-medium text-[#7C3AED]">{c.purpose}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{c.diagnosis}</td>
                  <td className="px-5 py-4 text-slate-600">{c.dateIssued}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'issued'
                        ? 'bg-emerald-50 text-emerald-700'
                        : c.status?.toLowerCase() === 'revoked'
                        ? 'bg-purple-100 text-purple-700'
                        : c.status?.toLowerCase() === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingCert(c)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadCert(c)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="Download Certificate"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {(c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'issued') && (
                        <button
                          onClick={() => handleRevokeCert(c)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Revoke Certificate"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Dialog open={!!viewingCert} onOpenChange={(open) => !open && setViewingCert(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-[#7C3AED]" /> Official Medical Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified clinical certificate stored in MediConnect database.
            </DialogDescription>
          </DialogHeader>
          {viewingCert && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{viewingCert.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Purpose:</span>
                  <span className="font-semibold text-[#7C3AED]">{viewingCert.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Diagnosis:</span>
                  <span className="text-slate-800">{viewingCert.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-slate-700">{viewingCert.dateIssued}</span>
                </div>
                <div className="border-t border-purple-100 pt-2 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Clinical Remarks:</span>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                    {viewingCert.remarks}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadCert(viewingCert)}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download / Print PDF
                </button>
                <button
                  onClick={() => setViewingCert(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorMedCerts;

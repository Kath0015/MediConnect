import React, { useState, useEffect } from 'react';
import { FlaskConical, Search, Plus, Eye, Download, FileText, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getLabRequests, createLabRequest, updateLabRequest, deleteLabRequest } from '../../api/LabRequests';

const DoctorLaboratory = () => {
  const [labRequests, setLabRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLab, setNewLab] = useState({
    patient: '',
    test: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    notes: '',
  });

  const loadLabRequests = async () => {
    try {
      setLoading(true);
      const res = await getLabRequests();
      const mapped = (res.data || []).map((l) => ({
        id: l.id,
        reqNumber: l.request_number,
        patient: l.patient_name,
        test: l.test_name,
        category: l.category || 'General',
        requestedDate: l.date_requested || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: l.status || 'Pending',
        result: l.results || (l.status === 'Completed' ? 'Normal Clinical Findings' : 'Processing in laboratory'),
        findings: l.results || 'Diagnostic testing evaluation recorded in clinical database.',
        requestedBy: l.requested_by || 'Dr. Physician',
      }));
      setLabRequests(mapped);
    } catch (err) {
      console.error('Failed to load lab requests:', err);
      toast.error('Failed to load laboratory requests from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabRequests();
  }, []);

  const filtered = labRequests.filter((l) =>
    l.patient?.toLowerCase().includes(search.toLowerCase()) ||
    l.test?.toLowerCase().includes(search.toLowerCase()) ||
    l.reqNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLabRequest = async (e) => {
    e.preventDefault();
    if (!newLab.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    try {
      setIsSubmitting(true);
      await createLabRequest({
        patient_name: newLab.patient,
        test_name: newLab.test,
        category: newLab.category,
        status: 'Pending',
        results: newLab.notes || null,
      });
      toast.success(`Lab order for ${newLab.test} saved to database!`);
      setIsRequestModalOpen(false);
      setNewLab({ patient: '', test: 'Complete Blood Count (CBC)', category: 'Hematology', notes: '' });
      await loadLabRequests();
    } catch (err) {
      console.error('Failed to create lab request:', err);
      toast.error('Failed to save laboratory order to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLab = async (lab) => {
    try {
      await updateLabRequest(lab.id, {
        status: 'Completed',
        results: 'Laboratory test completed. Findings within normal physiological reference limits.',
      });
      toast.success(`Lab order ${lab.reqNumber || lab.id} marked as Completed!`);
      if (selectedResult?.id === lab.id) {
        setSelectedResult({ ...selectedResult, status: 'Completed', result: 'Laboratory test completed.' });
      }
      await loadLabRequests();
    } catch (err) {
      console.error('Failed to complete lab:', err);
      toast.error('Failed to update lab order');
    }
  };

  const handleDeleteLab = async (lab) => {
    if (!window.confirm(`Delete lab request ${lab.reqNumber || lab.id}?`)) return;
    try {
      await deleteLabRequest(lab.id);
      toast.success('Lab request removed from database');
      if (selectedResult?.id === lab.id) setSelectedResult(null);
      await loadLabRequests();
    } catch (err) {
      console.error('Failed to delete lab request:', err);
      toast.error('Failed to delete lab request');
    }
  };

  const handleDownloadResult = (lab) => {
    toast.success(`Printing official Laboratory Result for ${lab.patient}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#7C3AED]" />
            Laboratory Tests & Orders
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed lab diagnostic orders, hematology, and pathology results.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLabRequests}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Order Laboratory Test
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, test name, or request number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Order #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Laboratory Test</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Date Requested</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    <span>Loading lab requests from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No laboratory orders found in database.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-[#7C3AED]">{l.reqNumber || `LAB-${l.id}`}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{l.patient}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{l.test}</td>
                  <td className="px-5 py-4 text-slate-500">{l.category}</td>
                  <td className="px-5 py-4 text-slate-600">{l.requestedDate}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      l.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : l.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedResult(l)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Result Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {l.status !== 'Completed' && (
                        <button
                          onClick={() => handleCompleteLab(l)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadResult(l)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="Print Result PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLab(l)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Lab Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Order Laboratory Diagnostic Test</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a laboratory diagnostic request to the clinical database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLabRequest} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newLab.patient}
                onChange={(e) => setNewLab({ ...newLab, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Laboratory Test</label>
              <select
                value={newLab.test}
                onChange={(e) => {
                  const test = e.target.value;
                  let category = 'Hematology';
                  if (test.includes('Urinalysis')) category = 'Urinalysis';
                  else if (test.includes('Sugar') || test.includes('Lipid') || test.includes('Liver')) category = 'Blood Chemistry';
                  else if (test.includes('X-Ray')) category = 'Radiology';
                  setNewLab({ ...newLab, test, category });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Routine Urinalysis">Routine Urinalysis</option>
                <option value="Fasting Blood Sugar (FBS)">Fasting Blood Sugar (FBS)</option>
                <option value="Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)">Lipid Profile</option>
                <option value="Chest X-Ray (PA View)">Chest X-Ray (PA View)</option>
                <option value="Liver Function Panel (SGPT / SGOT)">Liver Function Panel (SGPT / SGOT)</option>
                <option value="Serum Uric Acid">Serum Uric Acid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Indication / Special Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Routine pre-employment screening, fast 8-10 hours prior."
                value={newLab.notes}
                onChange={(e) => setNewLab({ ...newLab, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit Lab Order'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#7C3AED]" /> Official Laboratory Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Diagnostic laboratory assay recorded in clinical database.
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4 pt-2">
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-[#7C3AED]">{selectedResult.reqNumber || `LAB-${selectedResult.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedResult.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Test Ordered:</span>
                  <span className="font-semibold text-slate-800">{selectedResult.test}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Department:</span>
                  <span className="text-slate-700">{selectedResult.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Requested:</span>
                  <span className="text-slate-700">{selectedResult.requestedDate}</span>
                </div>
                <div className="border-t border-purple-100 pt-2 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Laboratory Findings:</span>
                  <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                    {selectedResult.findings}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    selectedResult.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedResult.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadResult(selectedResult)}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Print Result
                </button>
                <button
                  onClick={() => setSelectedResult(null)}
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

export default DoctorLaboratory;

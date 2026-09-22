import React, { useState, useEffect } from 'react';
import { FlaskConical, Search, Eye, Download, Plus, Clock, FileCheck, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getLabRequests, createLabRequest, updateLabRequest, deleteLabRequest } from '../../api/LabRequests';

const statusConfig = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-blue-100 text-blue-700',
};

const AdminLaboratory = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLab, setNewLab] = useState({
    patient: '',
    test: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    requestedBy: 'Dr. Jose Santos',
  });

  const loadAllLabs = async () => {
    try {
      setLoading(true);
      const res = await getLabRequests();
      const mapped = (res.data || []).map((l) => ({
        id: l.id,
        reqNumber: l.request_number,
        patient: l.patient_name,
        test: l.test_name,
        requestedBy: l.requested_by || 'Dr. Physician',
        date: l.date_requested || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: l.status || 'Pending',
        result: l.status === 'Completed' ? 'Completed' : 'Pending',
        values: l.results || 'Specimen sample awaiting technician assay evaluation.',
      }));
      setLabs(mapped);
    } catch (err) {
      console.error('Failed to load lab requests:', err);
      toast.error('Failed to load laboratory records from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllLabs();
  }, []);

  const filtered = labs.filter((l) =>
    l.patient?.toLowerCase().includes(search.toLowerCase()) ||
    l.test?.toLowerCase().includes(search.toLowerCase()) ||
    l.requestedBy?.toLowerCase().includes(search.toLowerCase()) ||
    l.reqNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOrderLab = async (e) => {
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
        requested_by: newLab.requestedBy,
        category: newLab.category,
        status: 'Pending',
      });
      toast.success(`Diagnostic order for ${newLab.test} saved to database!`);
      setIsOrderOpen(false);
      setNewLab({ patient: '', test: 'Complete Blood Count (CBC)', category: 'Hematology', requestedBy: 'Dr. Jose Santos' });
      await loadAllLabs();
    } catch (err) {
      console.error('Failed to order lab:', err);
      toast.error('Failed to save laboratory order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLab = async (lab) => {
    try {
      await updateLabRequest(lab.id, {
        status: 'Completed',
        results: 'Evaluation completed. All measured parameters within reference intervals.',
      });
      toast.success(`Order ${lab.reqNumber || lab.id} marked Completed!`);
      if (selectedLab?.id === lab.id) {
        setSelectedLab({ ...selectedLab, status: 'Completed', result: 'Completed' });
      }
      await loadAllLabs();
    } catch (err) {
      console.error('Failed to update lab:', err);
      toast.error('Failed to update laboratory order');
    }
  };

  const handleDeleteLab = async (lab) => {
    if (!window.confirm(`Delete lab record ${lab.reqNumber || lab.id}?`)) return;
    try {
      await deleteLabRequest(lab.id);
      toast.success('Lab record deleted from database');
      if (selectedLab?.id === lab.id) setSelectedLab(null);
      await loadAllLabs();
    } catch (err) {
      console.error('Failed to delete lab:', err);
      toast.error('Failed to delete lab');
    }
  };

  const handleDownloadReport = (lab) => {
    toast.success(`Printing diagnostic laboratory report for ${lab.patient}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#009DD1]" /> Laboratory Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed diagnostic lab testing, hematology, and pathology assays.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllLabs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#009DD1]' : ''}`} />
          </button>
          <button
            onClick={() => setIsOrderOpen(true)}
            className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Order Laboratory Test
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient, test name, doctor, or order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Order #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Test</th>
              <th className="px-5 py-3">Requested By</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#009DD1]" />
                    <span>Loading lab orders from database...</span>
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
                  <td className="px-5 py-4 font-mono text-xs text-[#009DD1] font-semibold">{l.reqNumber || `LAB-${l.id}`}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{l.patient}</td>
                  <td className="px-5 py-4 text-slate-800">{l.test}</td>
                  <td className="px-5 py-4 text-slate-600">{l.requestedBy}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{l.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[l.status] || 'bg-slate-100 text-slate-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex items-center gap-1">
                    <button
                      onClick={() => setSelectedLab(l)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {l.status !== 'Completed' && (
                      <button
                        onClick={() => handleCompleteLab(l)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Mark Completed"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadReport(l)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="Print Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLab(l)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Modal */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#009DD1]" /> Order Laboratory Test
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create an official diagnostic lab requisition in the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrderLab} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newLab.patient}
                onChange={(e) => setNewLab({ ...newLab, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Laboratory Test</label>
              <select
                value={newLab.test}
                onChange={(e) => setNewLab({ ...newLab, test: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Routine Urinalysis">Routine Urinalysis</option>
                <option value="Fasting Blood Sugar (FBS)">Fasting Blood Sugar (FBS)</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="12-Lead Electrocardiogram (ECG)">12-Lead ECG</option>
                <option value="Serum Creatinine / BUN">Serum Creatinine / BUN</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Requesting Doctor</label>
              <input
                type="text"
                required
                value={newLab.requestedBy}
                onChange={(e) => setNewLab({ ...newLab, requestedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOrderOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedLab} onOpenChange={(open) => !open && setSelectedLab(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#009DD1]" /> Official Laboratory Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Diagnostic test record stored in clinical database.
            </DialogDescription>
          </DialogHeader>
          {selectedLab && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-[#009DD1]">{selectedLab.reqNumber || `LAB-${selectedLab.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedLab.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Test:</span>
                  <span className="text-slate-800">{selectedLab.test}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Requested By:</span>
                  <span className="text-slate-700">{selectedLab.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-slate-700">{selectedLab.date}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Results / Values:</span>
                  <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedLab.values}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusConfig[selectedLab.status]}`}>
                    {selectedLab.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadReport(selectedLab)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Print Report
                </button>
                <button
                  onClick={() => setSelectedLab(null)}
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

export default AdminLaboratory;

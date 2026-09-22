import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, DollarSign, Calendar, Search, Eye, Download, CheckCircle, Clock, XCircle, Plus, FileText, Printer, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getInvoices, createInvoice, markInvoicePaid, deleteInvoice } from '../../api/Invoices';

const statusConfig = {
  Paid: { icon: CheckCircle, color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  Unpaid: { icon: XCircle, color: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
  Pending: { icon: Clock, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
};

const AdminBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBill, setNewBill] = useState({
    patient: '',
    service: 'General Medical Consultation',
    amount: '500',
    method: 'Cash',
    status: 'Paid',
  });

  const fetchInvoicesList = async () => {
    try {
      setLoading(true);
      const res = await getInvoices();
      const mapped = (res.data || []).map((b) => ({
        id: b.invoice_number || `INV-${b.id}`,
        dbId: b.id,
        patient: b.patient_name,
        service: b.service,
        amount: parseFloat(b.amount) || 0,
        date: b.date || b.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: b.status || 'Pending',
        method: b.payment_method || '—',
        reference: b.reference_number || '—',
        cashier: b.cashier || 'Admin',
      }));
      setBills(mapped);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error('Failed to load invoices from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesList();
  }, []);

  const totalRevenue = bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);

  const filtered = bills.filter((b) =>
    b.patient?.toLowerCase().includes(search.toLowerCase()) ||
    b.id?.toLowerCase().includes(search.toLowerCase()) ||
    b.service?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newBill.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await createInvoice({
        patient_name: newBill.patient,
        service: newBill.service,
        amount: parseFloat(newBill.amount) || 500,
        payment_method: newBill.method,
        status: newBill.status,
      });
      toast.success(`Billing receipt ${res.invoice_number || 'INV'} generated & saved to database!`);
      setIsInvoiceOpen(false);
      setNewBill({ patient: '', service: 'General Medical Consultation', amount: '500', method: 'Cash', status: 'Paid' });
      await fetchInvoicesList();
    } catch (err) {
      console.error('Failed to create invoice:', err);
      toast.error('Failed to save invoice to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPaid = async (bill) => {
    try {
      await markInvoicePaid(bill.dbId, {
        payment_method: bill.method === '—' ? 'Cash' : bill.method,
      });
      toast.success(`Invoice ${bill.id} marked as Paid in database!`);
      if (selectedBill && selectedBill.id === bill.id) {
        setSelectedBill({ ...selectedBill, status: 'Paid' });
      }
      await fetchInvoicesList();
    } catch (err) {
      console.error('Failed to mark invoice paid:', err);
      toast.error('Failed to update invoice status');
    }
  };

  const handleDeleteInvoice = async (bill) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${bill.id}?`)) return;
    try {
      await deleteInvoice(bill.dbId);
      toast.success(`Invoice ${bill.id} deleted from database`);
      if (selectedBill?.id === bill.id) setSelectedBill(null);
      await fetchInvoicesList();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      toast.error('Failed to delete invoice');
    }
  };

  const handlePrintReceipt = (bill) => {
    toast.success(`Printing official receipt for Invoice ${bill.id}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#009DD1]" /> Billing & Payments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed patient billing, revenue collection, and payment methods.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvoicesList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#009DD1]' : ''}`} />
          </button>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Invoice / Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Unpaid Invoices', value: bills.filter((b) => b.status === 'Unpaid').length, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
          { label: 'Pending Processing', value: bills.filter((b) => b.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} flex items-center gap-4`}>
              <Icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by invoice number, patient name, or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Invoice #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#009DD1]" />
                    <span>Loading invoices from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No invoices found in database.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.Pending;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-[#009DD1] font-semibold">{b.id}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{b.patient}</td>
                    <td className="px-5 py-4 text-slate-600">{b.service}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">₱{b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{b.date}</td>
                    <td className="px-5 py-4 text-slate-600">{b.method}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.badge}`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-4 flex items-center gap-1">
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(b)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(b)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#009DD1]" /> Create Billing Statement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Generate an official patient billing invoice saved directly to the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newBill.patient}
                onChange={(e) => setNewBill({ ...newBill, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Medical Service / Consultation</label>
              <select
                value={newBill.service}
                onChange={(e) => setNewBill({ ...newBill, service: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="General Medical Consultation">General Medical Consultation (₱500)</option>
                <option value="Follow-up Consultation">Follow-up Consultation (₱350)</option>
                <option value="Consultation + Complete Blood Count">Consultation + Complete Blood Count (₱850)</option>
                <option value="Consultation + Urinalysis">Consultation + Urinalysis (₱650)</option>
                <option value="Consultation + Lipid Profile">Consultation + Lipid Profile (₱900)</option>
                <option value="Specialist Consultation (Cardiology)">Specialist Consultation (₱800)</option>
                <option value="Medical Certificate Issuance Fee">Medical Certificate Fee (₱250)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (PHP)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={newBill.method}
                  onChange={(e) => setNewBill({ ...newBill, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="PhilHealth / HMO">PhilHealth / HMO</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={newBill.status}
                onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to DB...' : 'Generate Receipt'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#009DD1]" /> Official Billing Receipt
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              MediConnect Clinic payment invoice & database record.
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Invoice Number:</span>
                  <span className="text-sm font-mono font-bold text-[#009DD1]">{selectedBill.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedBill.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Service Rendered:</span>
                  <span className="text-sm text-slate-700">{selectedBill.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Amount:</span>
                  <span className="text-base font-bold text-emerald-700">₱{selectedBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Payment Method:</span>
                  <span className="text-sm text-slate-700">{selectedBill.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Reference:</span>
                  <span className="text-sm font-mono text-slate-700">{selectedBill.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-sm text-slate-700">{selectedBill.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${(statusConfig[selectedBill.status] || statusConfig.Pending).badge}`}>
                    {selectedBill.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {selectedBill.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(selectedBill)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => handlePrintReceipt(selectedBill)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
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

export default AdminBilling;

import React, { useState } from 'react';
import { CreditCard, TrendingUp, DollarSign, Calendar, Search, Eye, Download, CheckCircle, Clock, XCircle, Plus, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialBills = [
  { id: 'INV-001', patient: 'Maria Santos', service: 'Consultation + CBC', amount: 850, date: '2026-08-10', status: 'Paid', method: 'GCash', reference: 'GCASH-987654321', cashier: 'Staff Lopez' },
  { id: 'INV-002', patient: 'Juan dela Cruz', service: 'Follow-up Consultation', amount: 500, date: '2026-08-08', status: 'Paid', method: 'Cash', reference: 'CASH-REC-002', cashier: 'Staff Lopez' },
  { id: 'INV-003', patient: 'Ana Reyes', service: 'Consultation + Urinalysis', amount: 650, date: '2026-08-05', status: 'Unpaid', method: '—', reference: '—', cashier: 'Pending' },
  { id: 'INV-004', patient: 'Pedro Lim', service: 'Emergency Consultation', amount: 1500, date: '2026-08-15', status: 'Pending', method: '—', reference: '—', cashier: 'Pending' },
  { id: 'INV-005', patient: 'Rosa Garcia', service: 'Consultation + Lipid Profile', amount: 900, date: '2026-08-09', status: 'Paid', method: 'GCash', reference: 'GCASH-123456789', cashier: 'Staff Lopez' },
];

const statusConfig = {
  Paid: { icon: CheckCircle, color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  Unpaid: { icon: XCircle, color: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
  Pending: { icon: Clock, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
};

const AdminBilling = () => {
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [newBill, setNewBill] = useState({
    patient: '',
    service: 'General Consultation',
    amount: '500',
    method: 'Cash',
  });

  const totalRevenue = bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);

  const filtered = bills.filter((b) =>
    b.patient.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newBill.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    const idNum = String(bills.length + 1).padStart(3, '0');
    const item = {
      id: `INV-${idNum}`,
      patient: newBill.patient,
      service: newBill.service,
      amount: parseFloat(newBill.amount) || 500,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      method: newBill.method,
      reference: `${newBill.method.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      cashier: 'Admin Billing',
    };
    setBills([item, ...bills]);
    setIsInvoiceOpen(false);
    setNewBill({ patient: '', service: 'General Consultation', amount: '500', method: 'Cash' });
    toast.success(`Billing receipt ${item.id} generated!`);
  };

  const handleMarkPaid = (billId) => {
    setBills(bills.map((b) => (b.id === billId ? { ...b, status: 'Paid', method: 'GCash / Cash' } : b)));
    if (selectedBill) setSelectedBill({ ...selectedBill, status: 'Paid', method: 'GCash / Cash' });
    toast.success(`Invoice ${billId} marked as Paid!`);
  };

  const handlePrintReceipt = (bill) => {
    toast.success(`Printing official receipt for Invoice ${bill.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#009DD1]" /> Billing & Payments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Track patient billing, revenue collection, and payment methods.</p>
        </div>
        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Invoice / Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Unpaid Invoices', value: bills.filter((b) => b.status === 'Unpaid').length, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
          { label: 'Pending Processing', value: bills.filter((b) => b.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} flex items-center gap-4`}>
              <Icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-slate-600 font-medium">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, invoice ID, or medical service..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Invoice #', 'Patient', 'Service', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const sc = statusConfig[b.status];
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-[#009DD1] font-semibold">{b.id}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{b.patient}</td>
                    <td className="px-5 py-4 text-slate-600">{b.service}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">₱{b.amount.toLocaleString()}</td>
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
              Generate an official patient billing invoice.
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
                  placeholder="500"
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
                  <option value="HMO / Insurance">HMO / Insurance</option>
                </select>
              </div>
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
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold"
              >
                Generate Receipt
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
              MediConnect Clinic payment invoice & transaction details.
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
                  <span className="text-xs text-slate-500">Amount Due / Paid:</span>
                  <span className="text-base font-bold text-emerald-700">₱{selectedBill.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Payment Method:</span>
                  <span className="text-sm text-slate-700">{selectedBill.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-sm text-slate-700">{selectedBill.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusConfig[selectedBill.status].badge}`}>
                    {selectedBill.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {selectedBill.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(selectedBill.id)}
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


import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MessageCircle, Search, BookOpen, Shield, Settings, Users, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const faqs = [
  { id: 1, category: 'User Management', q: 'How do I add a new user to the system?', a: 'Go to User Management or Doctors/Staff/Patients section in the sidebar, then click the "Add" button. Fill in the required credentials and assign the appropriate role.' },
  { id: 2, category: 'System Config', q: 'How do I configure system settings?', a: 'Navigate to System Settings. From there you can update clinic information, operating hours, notification templates, and security rules.' },
  { id: 3, category: 'Documentation', q: 'How do I generate and export reports?', a: 'Go to the Reports section. You can generate appointment summaries, patient demographics, and revenue graphs. Use the date range filters and click "Export Report".' },
  { id: 4, category: 'Security & Audit', q: 'Where can I view system activity logs?', a: 'Navigate to Audit Logs in the sidebar. All system events including logins, credential updates, and patient profile edits are recorded here with exact timestamps.' },
  { id: 5, category: 'Billing', q: 'How do I manage billing and payments?', a: 'Go to Billing & Payments. You can view all invoices, mark payments as complete, and print official clinic receipts from that table.' },
];

const AdminHelp = () => {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [ticket, setTicket] = useState({ subject: '', category: 'Technical Support', details: '' });

  const filtered = faqs.filter((f) => {
    const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || f.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.details.trim()) {
      toast.error('Please enter a subject and inquiry description');
      return;
    }
    setIsTicketOpen(false);
    setTicket({ subject: '', category: 'Technical Support', details: '' });
    toast.success('Support ticket submitted successfully! A tech engineer will contact you shortly.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#01377D]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#01377D]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Administrator Help & Knowledge Base</h1>
        <p className="text-slate-500 mt-2">Clinic system guides, system administration documentation, and technical support.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documentation and administrative answers..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#01377D]/30 focus:border-[#01377D] shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'User Management', color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/10' },
          { icon: Shield, label: 'Security & Audit', color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10' },
          { icon: Settings, label: 'System Config', color: 'text-[#26B170]', bg: 'bg-[#26B170]/10' },
          { icon: BookOpen, label: 'Documentation', color: 'text-[#01377D]', bg: 'bg-[#01377D]/10' },
        ].map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCat === c.label;
          return (
            <div
              key={c.label}
              onClick={() => setSelectedCat(isSelected ? 'All' : c.label)}
              className={`rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 ${
                isSelected ? 'border-[#01377D] bg-[#01377D]/5 shadow-sm' : 'border-slate-100 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-800">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Frequently Asked Questions</h2>
          {selectedCat !== 'All' && (
            <button onClick={() => setSelectedCat('All')} className="text-xs text-[#009DD1] hover:underline">
              Show All
            </button>
          )}
        </div>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
              No matching documentation found.
            </div>
          ) : (
            filtered.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#01377D]/10 text-[#01377D] px-2 py-0.5 rounded-full font-medium">
                      {faq.category}
                    </span>
                    <span className="font-medium text-slate-800 text-sm">{faq.q}</span>
                  </div>
                  {openId === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-[#01377D] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: 'Technical Hotline', value: '(044) 123-4567', sub: 'Mon–Fri 8AM–5PM', color: 'text-[#26B170]', bg: 'bg-[#26B170]/10', action: () => toast.info('Connecting to technical hotline: (044) 123-4567') },
          { icon: Mail, label: 'Email Helpdesk', value: 'admin@mediconnect.ph', sub: 'Response within 4 hours', color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/10', action: () => setIsTicketOpen(true) },
          { icon: MessageCircle, label: 'Support Ticket', value: 'Open IT Ticket', sub: '24/7 priority queuing', color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10', action: () => setIsTicketOpen(true) },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={c.action}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-md hover:border-[#01377D]/20 transition-all text-left w-full"
            >
              <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${c.color}`} />
              </div>
              <p className="font-semibold text-slate-800 text-sm text-center">{c.label}</p>
              <p className={`text-sm mt-1 font-semibold text-center ${c.color}`}>{c.value}</p>
              <p className="text-xs text-slate-400 mt-1 text-center">{c.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Support Ticket Modal */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#009DD1]" /> Technical Support Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit an issue or inquiry to the MediConnect engineering & support team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Technical Support">Technical Support / Bug</option>
                <option value="User Account & Security">User Account & Security</option>
                <option value="Billing & Financial Module">Billing & Financial Module</option>
                <option value="Hardware / Lab Integration">Hardware / Lab Integration</option>
                <option value="General Question">General Question</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of issue"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Inquiry / Error Description</label>
              <textarea
                rows={3}
                required
                placeholder="Please describe what happened..."
                value={ticket.details}
                onChange={(e) => setTicket({ ...ticket, details: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTicketOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#01377D] hover:bg-[#009DD1] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Ticket
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelp;


import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Mail, Send, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const faqs = [
  { id: 1, q: 'How do I check-in an arriving patient?', a: 'Go to "Patient Check-In" from the sidebar, locate the patient in today\'s queue, and click "Check-In Now". You can also update their arrival time.' },
  { id: 2, q: 'How do I record patient vital signs?', a: 'Navigate to "Vital Signs", click "Record Vitals", select or enter the patient, input systolic/diastolic BP, heart rate, temperature, weight, and height (BMI will calculate automatically), then click Save.' },
  { id: 3, q: 'How do I review laboratory documents?', a: 'Go to "Laboratory" or "Documents" in the sidebar to search and download historical lab files uploaded by patients or clinic technicians.' },
  { id: 4, q: 'How do I message the doctor regarding patient triage?', a: 'Navigate to "Messages" in the sidebar, select the attending doctor, type your message, and hit Send.' },
];

const ClinicianHelp = () => {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'System Support',
    message: '',
  });

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.message.trim()) {
      toast.error('Please enter both subject and message');
      return;
    }
    toast.success('Internal support inquiry submitted to IT Admin!');
    setIsContactOpen(false);
    setTicket({ subject: '', category: 'System Support', message: '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#26B170]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#26B170]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Clinic Staff Help & Support</h1>
        <p className="text-slate-500 mt-2">Guides for patient check-in, vital signs, and clinic queue management.</p>
        <button
          onClick={() => setIsContactOpen(true)}
          className="mt-4 inline-flex items-center gap-2 bg-[#26B170] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1a8a55] transition-colors shadow-sm"
        >
          <Mail className="w-4 h-4" /> Contact Clinic Administrator
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help topics..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170] shadow-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((faq) => (
          <div key={faq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-800 text-sm">{faq.q}</span>
              {openId === faq.id ? <ChevronUp className="w-4 h-4 text-[#26B170]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openId === faq.id && (
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-emerald-50/20">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#26B170]" /> Contact Admin / IT Desk
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit an internal IT inquiry or clinic operations assistance request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              >
                <option value="System Support">EMR & System Operations</option>
                <option value="Patient Queue">Queue & Check-In Discrepancy</option>
                <option value="Laboratory Access">Laboratory Upload Permissions</option>
                <option value="Account Issue">Staff Account Access</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary..."
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the issue..."
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#26B170] hover:bg-[#1a8a55] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Request
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianHelp;


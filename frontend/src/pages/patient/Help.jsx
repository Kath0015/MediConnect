import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Search, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const faqs = [
  { id: 1, q: 'How do I book an appointment?', a: 'Go to "My Appointments" in the sidebar, then click "Book New Appointment". Select your preferred doctor, date, and time slot, then confirm.' },
  { id: 2, q: 'How do I view my laboratory results?', a: 'Navigate to "Laboratory Results" in the sidebar. Your lab results will appear here once they have been processed and uploaded by the clinic staff.' },
  { id: 3, q: 'Can I cancel or reschedule my appointment?', a: 'Yes. Go to "My Appointments", find the appointment you wish to cancel or reschedule, and use the options menu. Cancellations must be made at least 24 hours before the scheduled time.' },
  { id: 4, q: 'How do I request a medical certificate?', a: 'Go to your profile or use the "Request Certificate" option. Fill in the purpose, and the clinic will process your request within 1-3 working days.' },
  { id: 5, q: 'I forgot my password. What should I do?', a: 'On the login page, click "Forgot Password". Enter your registered email address and follow the instructions sent to your inbox to reset your password.' },
  { id: 6, q: 'How do I update my personal information?', a: 'Click "Profile Settings" in the sidebar or click your name at the top of the sidebar. From there you can update your contact information, address, and other details.' },
  { id: 7, q: 'What payment methods are accepted?', a: 'The clinic accepts cash and GCash. Payment is made during your visit. You can view your billing summary from the Billing section (if available).' },
];

const Help = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'Appointment Inquiry',
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
      toast.error('Please fill in both subject and message');
      return;
    }
    toast.success('Your support message has been sent to clinic staff! We will respond within 24 hours.');
    setIsContactOpen(false);
    setTicket({ subject: '', category: 'Appointment Inquiry', message: '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#009DD1]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#009DD1]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-500 mt-2">Find answers to common questions or reach out to us directly.</p>
        <button
          onClick={() => setIsContactOpen(true)}
          className="mt-4 inline-flex items-center gap-2 bg-[#009DD1] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#01377D] transition-colors shadow-sm"
        >
          <Mail className="w-4 h-4" /> Send Message to Clinic Support
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for help..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1] shadow-sm"
        />
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <p>No results found for "{search}"</p>
            </div>
          ) : (
            filtered.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-800 text-sm pr-4">{faq.q}</span>
                  {openId === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-[#009DD1] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-[#009DD1]/2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#26B170]/10 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-[#26B170]" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">Call Us</p>
          <a href="tel:0441234567" className="text-sm mt-1 font-medium text-[#26B170] block hover:underline">
            (044) 123-4567
          </a>
          <p className="text-xs text-slate-400 mt-1">Mon–Fri, 8AM–5PM</p>
        </div>

        <div
          onClick={() => setIsContactOpen(true)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-md transition-all cursor-pointer hover:border-[#009DD1]/40 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#009DD1]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
            <Mail className="w-6 h-6 text-[#009DD1]" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">Email Us</p>
          <p className="text-sm mt-1 font-medium text-[#009DD1]">support@mediconnect.ph</p>
          <p className="text-xs text-slate-400 mt-1">Click to send ticket</p>
        </div>


      </div>

      {/* Contact Support Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#009DD1]" /> Contact Support
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Send a query to the MediConnect clinic administrative desk.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Inquiry Category</label>
              <select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Appointment Inquiry">Appointment & Scheduling</option>
                <option value="Lab Result Assistance">Laboratory & Diagnostics</option>
                <option value="Medical Certificate">Medical Certificate Request</option>
                <option value="Prescription Refill">Prescriptions & Pharmacy</option>
                <option value="Billing & GCash">Billing & Payment Questions</option>
                <option value="Account Access">Account & Login Support</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your question..."
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your inquiry in detail..."
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
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
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Help;


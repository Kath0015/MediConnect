import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MessageCircle, Search } from 'lucide-react';

const faqs = [
  { id: 1, q: 'How do I issue an electronic prescription?', a: 'Navigate to Prescriptions in the sidebar, click "Create Prescription", select the patient, fill in medication details, and click Save. The patient will be able to view and download it immediately.' },
  { id: 2, q: 'How do I request a laboratory test for a patient?', a: 'Go to Laboratory Requests in your sidebar, click "Request Lab Test", choose the patient and requested panels (e.g. CBC, FBS, Urinalysis), and submit.' },
  { id: 3, q: 'How do I view a patient\'s full medical history?', a: 'Click "My Patients" or "Medical Records" from the sidebar, find the patient, and click the eye icon to view past SOAP notes, lab results, and previous prescriptions.' },
];

const DoctorHelp = () => {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#7C3AED]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Doctor Help & Support</h1>
        <p className="text-slate-500 mt-2">Guidance on managing patient records, prescriptions, and lab requests.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help topics..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] shadow-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((faq) => (
          <div key={faq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800 text-sm">{faq.q}</span>
              {openId === faq.id ? <ChevronUp className="w-4 h-4 text-[#7C3AED]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openId === faq.id && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorHelp;

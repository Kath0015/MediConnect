import React, { useState } from 'react';
import { MessageCircle, Send, Search } from 'lucide-react';

const mockConversations = [
  { id: 1, name: 'Nurse Maria Lopez', role: 'Clinic Staff', lastMessage: 'CBC results for Ms. Santos are ready.', time: '09:35 AM', unread: 1, avatar: 'ML' },
  { id: 2, name: 'Maria Santos', role: 'Patient', lastMessage: 'Doc, should I take the med before eating?', time: 'Yesterday', unread: 0, avatar: 'MS' },
];

const mockMessages = [
  { id: 1, sender: 'Nurse Maria Lopez', text: 'Good morning Doc. CBC results for Ms. Santos are ready in the portal.', time: '09:35 AM', mine: false },
];

const DoctorMessages = () => {
  const [selected, setSelected] = useState(mockConversations[0]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const filtered = mockConversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#7C3AED]" />
          Messages
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Direct communications with patients and clinic staff.</p>
      </div>

      <div className="flex gap-4 h-[580px]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)} className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50/50 transition-colors ${selected.id === c.id ? 'bg-[#7C3AED]/5 border-l-2 border-[#7C3AED]' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500 truncate">{c.lastMessage}</span>
                    {c.unread > 0 && <span className="bg-[#7C3AED] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-1">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Pane */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-sm font-bold">{selected.avatar}</div>
            <div>
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.role}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {mockMessages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm rounded-2xl px-4 py-2.5 text-sm ${m.mine ? 'bg-[#7C3AED] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.mine ? 'text-white/60' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <form onSubmit={(e) => { e.preventDefault(); setInput(''); }} className="flex items-center gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]" />
              <button type="submit" disabled={!input.trim()} className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#5B21B6] transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;

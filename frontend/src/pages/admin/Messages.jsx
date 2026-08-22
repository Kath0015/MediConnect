import React, { useState } from 'react';
import { MessageCircle, Send, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

const initialConversations = [
  { id: 1, name: 'Dr. Jose Santos', role: 'Doctor', lastMessage: 'Please send the patient list for today.', time: '10:30 AM', unread: 2, avatar: 'JS' },
  { id: 2, name: 'Nurse Maria Lopez', role: 'Clinic Staff', lastMessage: 'Check-in complete for morning shift.', time: '09:15 AM', unread: 0, avatar: 'ML' },
  { id: 3, name: 'Maria Santos', role: 'Patient', lastMessage: 'When will my results be available?', time: 'Yesterday', unread: 1, avatar: 'MS' },
  { id: 4, name: 'System Support', role: 'Support', lastMessage: 'Ticket #1023 has been resolved.', time: '2 days ago', unread: 0, avatar: 'SS' },
];

const initialMessages = {
  1: [
    { id: 1, sender: 'Dr. Jose Santos', text: 'Please send the patient list for today.', time: '10:25 AM', mine: false },
    { id: 2, sender: 'Me', text: "Sure, I'll send it right away.", time: '10:27 AM', mine: true },
    { id: 3, sender: 'Dr. Jose Santos', text: 'Also, please reschedule Mr. Lim to 3 PM.', time: '10:30 AM', mine: false },
  ],
  2: [
    { id: 1, sender: 'Nurse Maria Lopez', text: 'Good morning! Morning shift triage queue is active.', time: '08:45 AM', mine: false },
    { id: 2, sender: 'Me', text: 'Thank you Maria. Let me know if you need more supplies.', time: '09:00 AM', mine: true },
    { id: 3, sender: 'Nurse Maria Lopez', text: 'Check-in complete for morning shift.', time: '09:15 AM', mine: false },
  ],
  3: [
    { id: 1, sender: 'Maria Santos', text: 'Hello, I had my blood test yesterday.', time: 'Yesterday', mine: false },
    { id: 2, sender: 'Maria Santos', text: 'When will my results be available?', time: 'Yesterday', mine: false },
  ],
  4: [
    { id: 1, sender: 'System Support', text: 'Database optimization routine completed.', time: '2 days ago', mine: false },
    { id: 2, sender: 'System Support', text: 'Ticket #1023 has been resolved.', time: '2 days ago', mine: false },
  ],
};

const AdminMessages = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState(initialConversations[0]);
  const [messagesMap, setMessagesMap] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = messagesMap[selected.id] || [];

  const handleSelectConv = (c) => {
    setSelected(c);
    setConversations(conversations.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item)));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Me',
      text: input.trim(),
      time: timeStr,
      mine: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, lastMessage: input.trim(), time: 'Just now' } : c))
    );

    setInput('');
    toast.success('Message sent');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#009DD1]" /> Messages
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Internal clinical communications & staff messaging.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[620px]">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff, doctors, patients..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConv(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                  selected.id === c.id ? 'bg-[#009DD1]/5 border-l-4 border-[#009DD1]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#01377D] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500 truncate">{c.lastMessage}</span>
                    {c.unread > 0 && (
                      <span className="bg-[#009DD1] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#01377D] text-white flex items-center justify-center text-sm font-bold">
              {selected.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="text-xs text-[#009DD1] font-medium">{selected.role}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
            {currentMessages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.mine ? 'bg-[#01377D] text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 text-right ${m.mine ? 'text-white/60' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${selected.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-[#01377D] text-white flex items-center justify-center hover:bg-[#009DD1] transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;


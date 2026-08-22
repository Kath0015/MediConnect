import React, { useState } from 'react';
import { MessageCircle, Send, Search } from 'lucide-react';
import { toast } from 'sonner';

const mockConversations = [
  { id: 1, name: 'Dr. Jose Santos', role: 'Doctor', lastMessage: 'Please prepare Maria Santos for check-up.', time: '09:40 AM', unread: 0, avatar: 'JS' },
  { id: 2, name: 'Admin Office', role: 'Admin', lastMessage: 'Update clinic schedule for holiday.', time: 'Yesterday', unread: 0, avatar: 'AO' },
];

const initialMessages = [
  { id: 1, sender: 'Dr. Jose Santos', text: 'Please prepare Maria Santos for check-up.', time: '09:40 AM', mine: false },
];

const ClinicianMessages = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [selected, setSelected] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'Staff',
      text: input.trim(),
      time: now,
      mine: true,
    };

    setMessages([...messages, newMsg]);
    setInput('');
    toast.success('Message sent');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#26B170]" />
          Messages
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Internal messages with doctors and administration.</p>
      </div>

      <div className="flex gap-4 h-[580px]">
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50/50 transition-colors ${
                  selected.id === c.id ? 'bg-[#26B170]/5 border-l-2 border-[#26B170]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#26B170] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.time}</span>
                  </div>
                  <span className="text-xs text-slate-500 truncate block mt-0.5">{c.lastMessage}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#26B170] text-white flex items-center justify-center text-sm font-bold">
              {selected.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.role}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                    m.mine ? 'bg-[#26B170] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.mine ? 'text-white/60' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-[#26B170] text-white flex items-center justify-center hover:bg-[#1a8a55] transition-colors disabled:opacity-50"
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

export default ClinicianMessages;


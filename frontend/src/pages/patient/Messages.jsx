import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Search, Plus, Stethoscope, Loader2, HeartPulse, User } from 'lucide-react';
import { getConversations, getContacts, getMessages, sendMessage } from '../../api/Messages';
import { toast } from 'sonner';

const PatientMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Fetch conversations
  const fetchConversations = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoadingConversations(true);
      const res = await getConversations();
      const data = res.data || [];
      setConversations(data);

      // Default select first conversation if none selected yet
      setSelectedUser((prev) => {
        if (prev) {
          const updated = data.find((c) => c.id === prev.id);
          return updated ? { ...prev, ...updated } : prev;
        }
        return data.length > 0 ? data[0] : null;
      });
    } catch (err) {
      console.error('Failed to load patient conversations:', err);
      if (!isPolling) toast.error('Failed to load conversations');
    } finally {
      if (!isPolling) setLoadingConversations(false);
    }
  }, []);

  // Fetch doctors and clinicians available for chat
  const fetchContacts = useCallback(async () => {
    try {
      const res = await getContacts();
      const data = res.data || [];
      setContacts(data);
    } catch (err) {
      console.error('Failed to load doctors list:', err);
    }
  }, []);

  // Fetch messages with the selected doctor/staff
  const fetchActiveMessages = useCallback(async (userId, isPolling = false) => {
    if (!userId) return;
    try {
      if (!isPolling) setLoadingMessages(true);
      const res = await getMessages(userId);
      const newMessages = res.data?.messages || [];
      setMessages(newMessages);

      if (res.data?.partner) {
        setSelectedUser((prev) => ({
          ...(prev || {}),
          ...res.data.partner,
        }));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      if (!isPolling) toast.error('Failed to load messages');
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, [fetchConversations, fetchContacts]);

  // When selectedUser changes, load their messages
  useEffect(() => {
    if (selectedUser?.id) {
      fetchActiveMessages(selectedUser.id);
    } else {
      setMessages([]);
    }
  }, [selectedUser?.id, fetchActiveMessages]);

  // Auto-scroll on new message
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // Periodic polling every 3.5 seconds
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(() => {
      fetchConversations(true);
      if (selectedUser?.id) {
        fetchActiveMessages(selectedUser.id, true);
      }
    }, 3500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedUser?.id, fetchConversations, fetchActiveMessages]);

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selectedUser?.id || sending) return;

    setSending(true);
    try {
      const res = await sendMessage({
        receiver_id: selectedUser.id,
        message: trimmed,
      });

      const sentMsg = res.data;
      setMessages((prev) => [...prev, sentMsg]);
      setInput('');

      fetchConversations(true);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.last_message && c.last_message.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  const startChatWithContact = (contact) => {
    setSelectedUser(contact);
    setShowNewChat(false);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#009DD1]" />
            Doctor & Clinic Messages
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Directly communicate with your attending doctor and medical staff.
          </p>
        </div>
        <button
          onClick={() => {
            setShowNewChat(!showNewChat);
            setSearch('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#009DD1] hover:bg-[#0077A8] text-white text-sm font-medium rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showNewChat ? 'View Conversations' : 'Message Doctor'}
        </button>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={showNewChat ? 'Search doctors & staff...' : 'Search conversations...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
              />
            </div>
            {showNewChat && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Select your doctor to chat
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {showNewChat ? (
              filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No doctors or clinic staff found.
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => startChatWithContact(contact)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#009DD1] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {contact.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-3 h-3 text-[#009DD1]" />
                        <span className="text-xs text-slate-500 truncate">{contact.role}</span>
                      </div>
                    </div>
                  </button>
                ))
              )
            ) : loadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#009DD1]" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm space-y-2">
                <p>No conversations yet.</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-xs text-[#009DD1] font-semibold hover:underline cursor-pointer"
                >
                  Message your doctor now
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedUser(c);
                    setShowNewChat(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50/50 transition-colors cursor-pointer ${
                    selectedUser?.id === c.id
                      ? 'bg-[#009DD1]/5 border-l-4 border-[#009DD1]'
                      : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#009DD1] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-slate-500 truncate">
                        {c.last_message}
                      </span>
                      {c.unread > 0 && (
                        <span className="bg-[#009DD1] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Pane */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#009DD1] text-white flex items-center justify-center text-sm font-bold">
                    {selectedUser.avatar || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedUser.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{selectedUser.role}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span className="text-[11px] text-emerald-600 font-medium">Clinic Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#009DD1]" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-1">
                    <MessageCircle className="w-10 h-10 text-slate-300 stroke-1" />
                    <p className="font-medium text-slate-600">Start conversation</p>
                    <p className="text-xs">Type a question or message to {selectedUser.name}.</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          m.mine
                            ? 'bg-[#009DD1] text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                            m.mine ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          <span>{m.time}</span>
                          {m.mine && (
                            <span>{m.is_read ? '✓✓' : '✓'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${selectedUser.name}...`}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-[#009DD1] text-white flex items-center justify-center hover:bg-[#0077A8] transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-300 stroke-1 mb-2" />
              <h3 className="font-semibold text-slate-700">Doctor Messaging</h3>
              <p className="text-sm mt-1 max-w-sm">
                Click "Message Doctor" to start a direct chat with Dr. Jose Santos or clinic staff.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMessages;

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FlaskConical, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';
import { MEDIBOT_FALLBACK, MEDIBOT_KNOWLEDGE_BASE } from '../../data/medibotKnowledgeBase';

const CHAT_STORAGE_KEY = 'medibot_history';
const MAX_CHAT_HISTORY = 60;

const DEFAULT_MESSAGES = [
  {
    id: 'assistant-intro',
    role: 'assistant',
    text: 'Hi, I am MediBot, your MediConnect assistant. Ask me about appointments, medicines, consultations, delivery, payments, or account support.',
  },
  {
    id: 'assistant-hint',
    role: 'assistant',
    text: 'Try: "How can I book an appointment?", "Do you accept GCash?", or "I forgot my password."',
  },
];

const FALLBACK_SUGGESTIONS = [
  'How can I book an appointment?',
  'Do you accept GCash?',
  'I forgot my password.',
];

const EMERGENCY_PATTERN = /chest pain|shortness of breath|difficulty breathing|severe bleeding|stroke|fainting/;

const chatbotFeatures = [
  {
    id: 'appointments',
    title: 'Appointments and consultations',
    description: 'Booking help and online consult support.',
    icon: Calendar,
  },
  {
    id: 'medicines',
    title: 'Medicines and delivery',
    description: 'Availability checks and delivery guidance.',
    icon: FlaskConical,
  },
  {
    id: 'accounts',
    title: 'Payments and account help',
    description: 'GCash, passwords, and support contacts.',
    icon: MessageCircle,
  },
];

const chatbotQuickPrompts = [
  { id: 'book', label: 'Book appointment', value: 'How can I book an appointment?' },
  { id: 'medicine', label: 'Medicine availability', value: 'Is paracetamol available?' },
  { id: 'consult', label: 'Online consultation', value: 'Do you offer online consultation?' },
  { id: 'delivery', label: 'Delivery time', value: 'How long is the delivery?' },
  { id: 'payment', label: 'Payment methods', value: 'Do you accept GCash?' },
  { id: 'password', label: 'Forgot password', value: 'I forgot my password.' },
];

const normalizeForMatch = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const keywordMatches = (normalizedMessage, keyword) => {
  const normalizedKeyword = normalizeForMatch(keyword);
  if (!normalizedKeyword) return false;
  if (normalizedKeyword.includes(' ')) {
    return normalizedMessage.includes(normalizedKeyword);
  }
  const matcher = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, 'i');
  return matcher.test(normalizedMessage);
};

const scoreIntent = (intent, normalizedMessage) => {
  if (!intent?.keywords?.length) return 0;
  return intent.keywords.reduce((score, keyword) => {
    if (!keywordMatches(normalizedMessage, keyword)) return score;
    const normalizedKeyword = normalizeForMatch(keyword);
    return score + (normalizedKeyword.includes(' ') ? 2 : 1);
  }, 0);
};

const findBestIntent = (normalizedMessage) => {
  let bestIntent = null;
  let bestScore = 0;

  MEDIBOT_KNOWLEDGE_BASE.forEach((intent) => {
    const score = scoreIntent(intent, normalizedMessage);
    if (score > bestScore || (score === bestScore && (intent.priority || 0) > (bestIntent?.priority || 0))) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  return bestIntent;
};

const loadStoredMessages = () => {
  if (typeof window === 'undefined') return DEFAULT_MESSAGES;
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return DEFAULT_MESSAGES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MESSAGES;
    return parsed;
  } catch (error) {
    return DEFAULT_MESSAGES;
  }
};

const MediBot = () => {
  const { branding } = useBranding();
  const [chatMessages, setChatMessages] = useState(() => loadStoredMessages());
  const [chatInput, setChatInput] = useState('');
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const chatEndRef = useRef(null);
  const displayShortBrand = branding.brandShortName;
  const assistantName = displayShortBrand ? `${displayShortBrand} MediBot` : 'MediBot';

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatIsTyping]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trimmed = chatMessages.slice(-MAX_CHAT_HISTORY);
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  }, [chatMessages]);

  const createChatMessage = (role, text) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  });

  const getBotResponse = (message) => {
    const normalized = normalizeForMatch(message);

    if (EMERGENCY_PATTERN.test(normalized)) {
      return {
        reply: 'If you are experiencing severe symptoms, call emergency services or go to the nearest ER right away.',
        suggestions: ['Contact support', 'Clinic hours'],
      };
    }

    const intent = findBestIntent(normalized);
    if (intent) {
      if (intent.id === 'contact-support') {
        const phone = branding.contactPhone?.trim();
        const email = branding.contactEmail?.trim();
        const lines = [];
        if (phone) lines.push(`Phone: ${phone}`);
        if (email) lines.push(`Email: ${email}`);
        if (lines.length) {
          return { reply: `You can reach us at:\n${lines.join('\n')}`, suggestions: intent.suggestions || [] };
        }
      }

      return { reply: intent.response, suggestions: intent.suggestions || [] };
    }

    return { reply: MEDIBOT_FALLBACK, suggestions: FALLBACK_SUGGESTIONS };
  };

  const sendChatMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, createChatMessage('user', trimmed)]);
    setChatIsTyping(true);
    const { reply, suggestions } = getBotResponse(trimmed);
    setSmartSuggestions(suggestions || []);
    window.setTimeout(() => {
      setChatMessages((prev) => [...prev, createChatMessage('assistant', reply)]);
      setChatIsTyping(false);
    }, 500);
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    sendChatMessage(chatInput);
  };

  const handleQuickPrompt = (promptValue) => {
    sendChatMessage(promptValue);
  };

  const promptChips = smartSuggestions.length
    ? smartSuggestions.map((value, index) => ({ id: `smart-${index}`, label: value, value }))
    : chatbotQuickPrompts;

  return (
    <div className="space-y-6">
      <PatientRoleBanner
        title="MediBot AI Assistant"
        subtitle="Chat 24/7 for appointments, medicines, consultations, delivery, and account support."
        primaryAction={{ to: '/patient/appointment', label: 'Book appointment' }}
        secondaryAction={{ to: '/patient/symptom-checker', label: 'Check symptoms' }}
      />

      <section className="chatbot-shell rounded-3xl border border-[#D8EBFA] shadow-lg overflow-hidden">
        <div className="chatbot-orb chatbot-orb-left" aria-hidden="true"></div>
        <div className="chatbot-orb chatbot-orb-right" aria-hidden="true"></div>
        <div className="chatbot-body p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <div className="chatbot-fade-up">
              <p className="chatbot-kicker">24/7 AI Medical Chatbot</p>
              <h2 className="chatbot-heading text-3xl sm:text-4xl mb-3">Meet {assistantName}</h2>
              <p className="text-base text-[#35507A] max-w-xl">
                Get instant answers about appointments, medicines, consultations, delivery timelines, payments, and account support.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chatbotFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="chatbot-feature-card chatbot-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                      <div className="chatbot-feature-icon">
                        <Icon className="w-5 h-5 text-[#009DD1]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#01377D] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#35507A]">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 chatbot-appointment-card">
                <h3 className="text-base font-semibold text-[#01377D] mb-3">Appointment help in three steps</h3>
                <ol className="space-y-2 text-sm text-[#35507A]">
                  <li>1. Share the clinic or service you need.</li>
                  <li>2. Choose a preferred date and time.</li>
                  <li>3. Confirm your details and contact info.</li>
                </ol>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/patient/appointment"
                    className="bg-[#26B170] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#7ED348] transition-all duration-300 text-center"
                  >
                    Book appointment
                  </Link>
                  <Link
                    to="/patient/request-certificate"
                    className="border border-[#009DD1] text-[#009DD1] px-5 py-3 rounded-lg font-semibold hover:bg-[#009DD1] hover:text-white transition-all duration-300 text-center"
                  >
                    Request certificate
                  </Link>
                </div>
              </div>
            </div>
            <div className="chatbot-panel p-6 chatbot-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between border-b border-[#D8EBFA] pb-4">
                <div className="flex items-center gap-3">
                  <div className="chatbot-avatar">
                    <Sparkles className="w-5 h-5 text-[#009DD1]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#01377D]">{assistantName}</p>
                    <p className="text-xs text-[#35507A]">Online now</p>
                  </div>
                </div>
                <span className="chatbot-status">24/7</span>
              </div>
              <div className="chatbot-messages" role="log" aria-live="polite">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`chatbot-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`chatbot-bubble ${message.role === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-assistant'}`}>
                      <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
                {chatIsTyping && (
                  <div className="chatbot-message flex justify-start">
                    <div className="chatbot-bubble chatbot-bubble-assistant">
                      <div className="chatbot-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {promptChips.map((prompt) => (
                  <button key={prompt.id} type="button" className="chatbot-chip" onClick={() => handleQuickPrompt(prompt.value)}>
                    {prompt.label}
                  </button>
                ))}
              </div>
              <form className="mt-4 flex items-center gap-3" onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask about appointments, medicines, delivery, payments, or account support..."
                  className="flex-1 rounded-lg border border-[#D8EBFA] bg-white px-4 py-3 text-sm text-[#01377D] focus:border-[#009DD1] focus:outline-none focus:ring-2 focus:ring-[#97E7F5]"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="flex items-center justify-center rounded-lg bg-[#01377D] px-4 py-3 text-white transition-all duration-300 hover:bg-[#009DD1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <p className="mt-3 text-xs text-[#35507A]">
                This assistant shares general information only and does not replace professional medical advice. For emergencies, call your local emergency number.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediBot;

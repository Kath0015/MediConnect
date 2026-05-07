import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Users,
  Shield,
  Settings,
  PenTool,
  Search,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  MessageCircle,
  FlaskConical,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';
import { MEDIBOT_FALLBACK, MEDIBOT_KNOWLEDGE_BASE } from '../data/medibotKnowledgeBase';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'resources', label: 'Resources' },
  { id: 'libraries', label: 'Features' },
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'symptom-checker', label: 'Symptom Checker' },
  { id: 'access', label: 'Quick Access' },
];

const serviceCards = [
  {
    id: 'patients',
    title: 'Patients',
    icon: Users,
    color: 'text-[#009DD1]',
    iconBg: 'bg-[#009DD1]/10',
    description: 'Book appointments, access records, and manage health documents online.',
    highlights: ['Online appointment', 'Records access', 'Certificate requests'],
  },
  {
    id: 'clinicians',
    title: 'Clinicians',
    icon: Shield,
    color: 'text-[#26B170]',
    iconBg: 'bg-[#26B170]/10',
    description: 'Manage schedules, review requests, and streamline patient workflows.',
    highlights: ['Patient queue', 'Request approvals', 'Schedule controls'],
  },
  {
    id: 'administrators',
    title: 'Administrators',
    icon: Settings,
    color: 'text-[#7ED348]',
    iconBg: 'bg-[#7ED348]/20',
    description: 'Configure services and keep clinic operations secure and efficient.',
    highlights: ['Reports', 'User management', 'System settings'],
  },
  {
    id: 'staff',
    title: 'Medical Staff',
    icon: PenTool,
    color: 'text-[#009DD1]',
    iconBg: 'bg-[#009DD1]/10',
    description: 'Capture visit updates and coordinate care in real time.',
    highlights: ['Visit notes', 'Document updates', 'Care coordination'],
  },
];

const chatbotFeatures = [
  {
    id: 'appointments',
    title: 'Appointments and consultations',
    description: 'Booking help and online consult guidance.',
    icon: Calendar,
  },
  {
    id: 'medicines',
    title: 'Medicines and delivery',
    description: 'Availability checks and delivery timelines.',
    icon: FlaskConical,
  },
  {
    id: 'accounts',
    title: 'Payments and account help',
    description: 'GCash, password reset, and support access.',
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

const medibotTopics = ['Appointments', 'Medicines', 'Consultations', 'Delivery', 'Payments', 'Account help'];

const FALLBACK_SUGGESTIONS = [
  'How can I book an appointment?',
  'Do you accept GCash?',
  'I forgot my password.',
];

const EMERGENCY_PATTERN = /chest pain|shortness of breath|difficulty breathing|severe bleeding|stroke|fainting/;

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

const findBestIntent = (normalizedMessage, knowledgeBase) => {
  let bestIntent = null;
  let bestScore = 0;

  knowledgeBase.forEach((intent) => {
    const score = scoreIntent(intent, normalizedMessage);
    if (score > bestScore || (score === bestScore && (intent.priority || 0) > (bestIntent?.priority || 0))) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  return bestIntent;
};

const symptomFeatures = [
  {
    id: 'triage',
    title: 'Symptom triage',
    description: 'Add symptoms, duration, and severity in minutes.',
    icon: Stethoscope,
  },
  {
    id: 'alerts',
    title: 'Urgency alerts',
    description: 'Highlights warning signs that need immediate care.',
    icon: AlertTriangle,
  },
  {
    id: 'next-steps',
    title: 'Next steps',
    description: 'Clear guidance for labs, visits, and follow-ups.',
    icon: ClipboardList,
  },
];

const symptomPreview = {
  symptoms: ['Headache', 'Fatigue', 'Sore throat'],
  details: [
    { label: 'Duration', value: '2-3 days' },
    { label: 'Severity', value: 'Moderate' },
    { label: 'Age', value: '24' },
  ],
  steps: ['Rest and hydrate', 'Monitor symptoms', 'Book a visit if symptoms persist'],
};

const Home = () => {
  const { branding } = useBranding();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [selectedService, setSelectedService] = useState('patients');
  const [chatMessages, setChatMessages] = useState(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Hi, I am MediBot, your MediConnect assistant. Ask me about appointments, medicines, consultations, delivery, payments, or account support.',
    },
    {
      id: 'assistant-hint',
      role: 'assistant',
      text: 'Try: "Do you accept GCash?", "How long is delivery?", or "I forgot my password."',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => item.id);
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatIsTyping]);

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (!q) return serviceCards;
    return serviceCards.filter((card) => `${card.title} ${card.description} ${card.highlights.join(' ')}`.toLowerCase().includes(q));
  }, [serviceQuery]);

  const focusedService = serviceCards.find((item) => item.id === selectedService) || serviceCards[0];
  const displayBrand = branding.brandName;
  const displayShortBrand = branding.brandShortName;
  const displayBrandLabel = displayBrand ? `RUR ${displayBrand}` : 'RUR';
  const displayShortBrandLabel = displayShortBrand ? `RUR ${displayShortBrand}` : 'RUR';
  const displaySystemTitle = branding.systemTitle;
  const displaySystemSubtitle = branding.systemSubtitle;
  const assistantName = displayShortBrand ? `${displayShortBrand} MediBot` : 'MediBot';

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

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

    const intent = findBestIntent(normalized, MEDIBOT_KNOWLEDGE_BASE);
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
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-[#01377D] shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <button className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={`${displayBrand} logo`} className="h-8 w-8 rounded-md object-cover" />
              ) : (
                <Activity className="w-8 h-8 text-[#d2ffb6]" />
              )}
              <span className="hidden sm:inline text-xl font-bold text-white">{displayBrandLabel}</span>
              <span className="sm:hidden text-sm font-semibold text-white">{displayShortBrandLabel}</span>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`font-medium transition-colors duration-300 pb-1 ${activeSection === id ? 'text-[#d2ffb6] border-b-2 border-[#d2ffb6]' : 'text-[#97E7F5] hover:text-[#d2ffb6]'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/auth/login"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#97E7F5] hover:text-[#d2ffb6] font-medium transition-all duration-300 border border-[#97E7F5]/50 sm:border-0 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="px-3 sm:px-6 py-2 text-xs sm:text-sm bg-[#26B170] text-white rounded-md sm:rounded-lg font-semibold hover:bg-[#d2ffb6] hover:text-[#26B170] transition-all duration-300"
              >
                Sign Up
              </Link>
              <button className="md:hidden p-2 text-[#97E7F5] hover:text-[#d2ffb6]" onClick={() => setMobileMenuOpen((p) => !p)} aria-label="Toggle navigation menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div
            className={`md:hidden border-t border-[#1f4f93] bg-[#01377D] px-4 overflow-hidden transition-all duration-300 ease-out ${
              mobileMenuOpen ? 'max-h-80 py-3 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-1'
            }`}
          >
            <div className="flex flex-col gap-2">
              {navItems.map(({ id, label }) => (
                <button
                  key={`m-${id}`}
                  onClick={() => scrollToSection(id)}
                  className={`w-full rounded-md px-4 py-2.5 text-sm text-left font-medium transition-colors ${
                    activeSection === id ? 'bg-[#0d4e9b] text-[#d2ffb6]' : 'text-[#97E7F5] hover:bg-[#0d4e9b]/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="home" className="bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#009DD1] mb-6 leading-tight">
                <span className="block">Welcome to </span>
                <span className="block text-[#01377D]">Renato Umali Reyes Hospital</span>
              </h1>
              <p className="text-xl text-[#01377D] mb-8 max-w-2xl">Simplifying healthcare management for better patient care with appointment, records, and documents in one place.</p>
              <div className="mb-8 max-w-xl mx-auto lg:mx-0">
                <div className="relative group">
                  <input
                    type="text"
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    onFocus={() => scrollToSection('resources')}
                    placeholder="Search services or roles..."
                    className="w-full px-6 py-4 pl-12 rounded-lg border-2 border-[#009DD1]/30 focus:border-[#26B170] focus:ring-4 focus:ring-[#97E7F5]/50 transition-all duration-300 text-lg shadow-lg group-hover:shadow-xl bg-white"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#009DD1] w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth/signup" className="bg-[#26B170] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#7ED348] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                  <Users className="w-5 h-5" />
                  Get Started
                </Link>
                <button onClick={() => scrollToSection('resources')} className="border-2 border-[#009DD1] text-[#009DD1] px-8 py-4 rounded-lg font-semibold hover:bg-[#009DD1] hover:text-white hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Explore Services
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-0 transform hover:scale-105 transition-transform duration-500">
                <div className="relative rounded-xl overflow-hidden">
                  <img src="https://i.pinimg.com/1200x/55/81/80/558180f961f4da7db384c55903ae464c.jpg" alt="Healthcare Management" className="w-full h-[600px] object-cover transform hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-end z-10">
                    <div className="p-4 text-[#009DD1] bg-white/90 w-full">
                      <h3 className="text-lg font-bold">{displaySystemTitle}</h3>
                      <p className="text-sm opacity-90">{displaySystemSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="resources" className="py-20 bg-[#97E7F5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#01377D] mb-4"><span className="text-[#009DD1]">Our</span> Services</h2>
            <p className="text-xl text-[#01377D] max-w-3xl mx-auto">Interactive service cards to quickly understand each role.</p>
          </div>
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {serviceCards.map((card) => (
              <button key={card.id} onClick={() => setSelectedService(card.id)} className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedService === card.id ? 'border-[#009DD1] bg-[#EAF5FF] text-[#01377D]' : 'border-[#D8EBFA] bg-white text-[#35507A]'}`}>{card.title}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredServices.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.id} onClick={() => setSelectedService(card.id)} className={`bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${selectedService === card.id ? 'border-[#26B170]' : 'border-transparent'}`}>
                  <div className={`w-20 h-20 ${card.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-8 h-8 ${card.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#01377D] mb-4">{card.title}</h3>
                  <p className="text-[#01377D] leading-relaxed">{card.description}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-8 rounded-2xl border border-[#D8EBFA] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#01377D] mb-3">{focusedService.title} Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {focusedService.highlights.map((item) => (
                <div key={item} className="rounded-lg bg-[#F7FBFF] border border-[#E1F1FC] px-4 py-3 text-[#35507A]">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="libraries" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[#97E7F5]/30 via-[#009DD1]/10 to-[#26B170]/10 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg"><BookOpen className="w-10 h-10 text-[#009DD1] mb-4" /><h4 className="font-semibold text-[#01377D]">Digital Records</h4></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg"><Calendar className="w-10 h-10 text-[#26B170] mb-4" /><h4 className="font-semibold text-[#01377D]">Easy Appointment</h4></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg"><Search className="w-10 h-10 text-[#7ED348] mb-4" /><h4 className="font-semibold text-[#01377D]">Quick Access</h4></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg"><Clock className="w-10 h-10 text-[#009DD1] mb-4" /><h4 className="font-semibold text-[#01377D]">24/7 Available</h4></div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-[#01377D] mb-6"><span className="text-[#009DD1]">Our</span> Features</h2>
              <p className="text-lg text-[#01377D] mb-8 leading-relaxed">Access medical history, book appointments, and manage health documents in one secure platform.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#26B170]"><CheckCircle className="w-5 h-5" /><span>Secure electronic health records</span></div>
                <div className="flex items-center gap-3 text-[#26B170]"><CheckCircle className="w-5 h-5" /><span>Online appointment scheduling</span></div>
                <div className="flex items-center gap-3 text-[#26B170]"><CheckCircle className="w-5 h-5" /><span>Instant certificate requests</span></div>
              </div>
              <div className="mt-8">
                <Link to="/auth/signup" className="inline-flex bg-[#26B170] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#7ED348] shadow-lg transition-all duration-300 items-center gap-3">
                  <ArrowRight className="w-5 h-5" />
                  Explore Features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="assistant" className="chatbot-shell py-20">
        <div className="chatbot-orb chatbot-orb-left" aria-hidden="true"></div>
        <div className="chatbot-orb chatbot-orb-right" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 chatbot-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="chatbot-fade-up">
              <p className="chatbot-kicker">MediConnect AI Assistant</p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="chatbot-heading text-4xl sm:text-5xl">Meet {assistantName}</h2>
                <span className="chatbot-pill">Always on</span>
              </div>
              <p className="mt-4 text-lg text-[#35507A] max-w-xl">
                Get fast answers for MediConnect services with smart suggestions, clear next steps, and friendly support.
              </p>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f3d73]">MediConnect focus</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {medibotTopics.map((topic) => (
                    <span key={topic} className="chatbot-topic-chip">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chatbotFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="chatbot-feature-card chatbot-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                      <div className="chatbot-feature-icon">
                        <Icon className="w-5 h-5 text-[#009DD1]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#01377D] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#35507A]">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 chatbot-guardrail">
                <div className="chatbot-guardrail-icon">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#01377D]">MediConnect-only answers</p>
                  <p className="text-sm text-[#35507A]">{MEDIBOT_FALLBACK}</p>
                </div>
              </div>
              <div className="mt-8 chatbot-appointment-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#01377D]">Smart support flow</h3>
                    <p className="text-sm text-[#35507A]">
                      Keyword recognition routes questions to the FAQ database, and admins can keep responses up to date.
                    </p>
                  </div>
                  <span className="chatbot-pill chatbot-pill-accent">Auto reply</span>
                </div>
                <ol className="mt-4 space-y-2 text-sm text-[#35507A]">
                  <li className="flex items-start gap-2"><span className="chatbot-step">1</span>Ask a MediConnect question.</li>
                  <li className="flex items-start gap-2"><span className="chatbot-step">2</span>Get a clear answer with next steps.</li>
                  <li className="flex items-start gap-2"><span className="chatbot-step">3</span>Use quick actions to book or reach support.</li>
                </ol>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="chatbot-mini-card">
                    <p className="chatbot-mini-kicker">Smart suggestions</p>
                    <p className="text-sm text-[#35507A]">Follow-up options appear based on each answer.</p>
                  </div>
                  <div className="chatbot-mini-card">
                    <p className="chatbot-mini-kicker">Chat history</p>
                    <p className="text-sm text-[#35507A]">Conversations stay visible for quick reference.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/auth/login"
                    className="bg-[#26B170] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#7ED348] transition-all duration-300 text-center"
                  >
                    Chat with MediBot
                  </Link>
                  <button
                    onClick={() => scrollToSection('access')}
                    className="border border-[#009DD1] text-[#009DD1] px-5 py-3 rounded-lg font-semibold hover:bg-[#009DD1] hover:text-white transition-all duration-300"
                  >
                    See quick access
                  </button>
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

      <section id="symptom-checker" className="symptom-shell py-20">
        <div className="symptom-orb symptom-orb-left" aria-hidden="true"></div>
        <div className="symptom-orb symptom-orb-right" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 symptom-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="chatbot-fade-up">
              <p className="symptom-kicker">AI Symptom Checker</p>
              <h2 className="symptom-heading text-4xl sm:text-5xl mb-4">Check symptoms with confidence</h2>
              <p className="text-lg text-[#2f3f59] max-w-xl">
                Describe what you are feeling to get preliminary guidance, urgency alerts, and recommended next steps.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {symptomFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="symptom-card chatbot-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
                      <div className="symptom-icon">
                        <Icon className="w-5 h-5 text-[#0f3779]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#0f3779] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#2f3f59]">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/auth/login"
                  className="bg-[#0f3779] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#009DD1] transition-all duration-300 text-center"
                >
                  Start symptom check
                </Link>
                <Link
                  to="/auth/signup"
                  className="border border-[#0f3779] text-[#0f3779] px-6 py-3 rounded-lg font-semibold hover:bg-[#0f3779] hover:text-white transition-all duration-300 text-center"
                >
                  Create an account
                </Link>
              </div>
            </div>
            <div className="symptom-panel p-6 chatbot-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between border-b border-[#D7E4F5] pb-4">
                <div>
                  <p className="text-sm font-semibold text-[#0f3779]">AI Symptom Checker</p>
                  <p className="text-xs text-[#4b5f7a]">Private and confidential</p>
                </div>
                <span className="symptom-status">Preview</span>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#4b5f7a]">Selected symptoms</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {symptomPreview.symptoms.map((symptom) => (
                    <span key={symptom} className="symptom-chip">{symptom}</span>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {symptomPreview.details.map((detail) => (
                  <div key={detail.label} className="rounded-xl bg-white/90 border border-[#D7E4F5] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6a7b93]">{detail.label}</p>
                    <p className="text-sm font-semibold text-[#0f3779] mt-1">{detail.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 symptom-card">
                <p className="text-xs uppercase tracking-[0.2em] text-[#4b5f7a]">Suggested next steps</p>
                <ul className="mt-3 space-y-2 text-sm text-[#2f3f59]">
                  {symptomPreview.steps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <span className="symptom-bullet" aria-hidden="true"></span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs text-[#4b5f7a]">
                This tool offers general guidance only and does not replace professional medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="py-20 bg-[#97E7F5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#01377D] mb-4"><span className="text-[#009DD1]">Quick</span> Access</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/auth/login" className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#26B170]">
              <Search className="w-6 h-6 text-[#009DD1] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Book Appointment</h3>
              <p className="text-[#01377D] text-sm">Schedule your visit quickly.</p>
            </Link>
            <Link to="/auth/login" className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#7ED348]">
              <Clock className="w-6 h-6 text-[#7ED348] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Clinic Hours</h3>
              <p className="text-[#01377D] text-sm">Mon-Fri: 8AM-5PM, Sat: 9AM-12PM.</p>
            </Link>
            <Link to="/auth/signup" className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#26B170]">
              <Users className="w-6 h-6 text-[#26B170] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Get Started</h3>
              <p className="text-[#01377D] text-sm">Create your account in minutes.</p>
            </Link>
            <Link to="/auth/login" className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#009DD1]">
              <Calendar className="w-6 h-6 text-[#009DD1] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">My Records</h3>
              <p className="text-[#01377D] text-sm">View your health history securely.</p>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#01377D] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={`${displayBrand} logo`} className="h-8 w-8 rounded-md object-cover" />
                ) : (
                  <Activity className="w-8 h-8 text-[#7ED348]" />
                )}
                <span className="text-xl font-bold">{displayBrandLabel}</span>
              </div>
              <p className="text-[#97E7F5]">{branding.footerDescription}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-[#97E7F5]">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-[#7ED348]">Home</button></li>
                <li><button onClick={() => scrollToSection('resources')} className="hover:text-[#7ED348]">Services</button></li>
                <li><button onClick={() => scrollToSection('libraries')} className="hover:text-[#7ED348]">Features</button></li>
                <li><button onClick={() => scrollToSection('assistant')} className="hover:text-[#7ED348]">AI Assistant</button></li>
                <li><button onClick={() => scrollToSection('symptom-checker')} className="hover:text-[#7ED348]">Symptom Checker</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-[#97E7F5]"><li>{displaySystemSubtitle}</li><li>{branding.contactEmail}</li><li>{branding.contactPhone}</li></ul>
            </div>
          </div>
          <div className="border-t border-[#009DD1] mt-8 pt-8 text-center text-[#97E7F5]"><p>© 2026 Renato Umali Reyes. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
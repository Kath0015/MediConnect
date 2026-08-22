import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Users,
  Search,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Menu,
  X,
  Shield,
  Lock,
  UserCircle,
} from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';
import { MEDIBOT_FALLBACK, MEDIBOT_KNOWLEDGE_BASE } from '../data/medibotKnowledgeBase';
import AuthModals from '../components/auth/AuthModals';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'libraries', label: 'Features' },
  { id: 'roles', label: 'Get Started' },
  { id: 'assistant', label: 'AI Assistant' },
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
    id: 'doctors',
    title: 'Doctors',
    icon: Stethoscope,
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#7C3AED]/10',
    description: 'Manage patients, write prescriptions, and issue medical certificates.',
    highlights: ['Patient management', 'Prescriptions', 'Medical certificates'],
  },
  {
    id: 'clinicians',
    title: 'Clinic Staff',
    icon: HeartPulse,
    color: 'text-[#26B170]',
    iconBg: 'bg-[#26B170]/10',
    description: 'Manage schedules, check-in patients, and record vital signs.',
    highlights: ['Patient check-in', 'Vital signs', 'Schedule controls'],
  },
  {
    id: 'administrators',
    title: 'Administrators',
    icon: Shield,
    color: 'text-[#7ED348]',
    iconBg: 'bg-[#7ED348]/20',
    description: 'Configure services and keep clinic operations secure and efficient.',
    highlights: ['Reports', 'User management', 'System settings'],
  },
];

const roleCards = [
  {
    id: 'patient',
    emoji: '👤',
    title: 'Patient',
    description: 'Book appointments, view medical records, lab results, and prescriptions.',
    color: 'from-[#009DD1] to-[#0077A8]',
    border: 'border-[#009DD1]/30 hover:border-[#009DD1]',
    bg: 'bg-[#009DD1]/5 hover:bg-[#009DD1]/10',
    loginPath: '/auth/login',
    registerPath: '/auth/signup',
    features: ['My Appointments', 'Medical Records', 'Lab Results', 'Prescriptions'],
  },
  {
    id: 'doctor',
    emoji: '👨‍⚕️',
    title: 'Doctor',
    description: 'Manage patients, write prescriptions, request labs, and issue medical certificates.',
    color: 'from-[#7C3AED] to-[#5B21B6]',
    border: 'border-[#7C3AED]/30 hover:border-[#7C3AED]',
    bg: 'bg-[#7C3AED]/5 hover:bg-[#7C3AED]/10',
    loginPath: '/auth/login',
    registerPath: null,
    features: ['My Patients', 'Prescriptions', 'Lab Requests', 'Medical Certificates'],
  },
  {
    id: 'clinician',
    emoji: '🩺',
    title: 'Clinic Staff',
    description: 'Handle patient check-in, record vital signs, manage documents, and assist in daily clinic operations.',
    color: 'from-[#26B170] to-[#1a8a55]',
    border: 'border-[#26B170]/30 hover:border-[#26B170]',
    bg: 'bg-[#26B170]/5 hover:bg-[#26B170]/10',
    loginPath: '/auth/login',
    registerPath: null,
    features: ['Patient Check-In', 'Vital Signs', 'Appointments', 'Documents'],
  },
  {
    id: 'admin',
    emoji: '🛡️',
    title: 'Administrator',
    description: 'Full system oversight — manage users, view reports, configure settings, and audit activity.',
    color: 'from-[#01377D] to-[#012060]',
    border: 'border-[#01377D]/30 hover:border-[#01377D]',
    bg: 'bg-[#01377D]/5 hover:bg-[#01377D]/10',
    loginPath: '/auth/login',
    registerPath: null,
    features: ['User Management', 'Reports', 'Audit Logs', 'System Settings'],
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
    id: 'accounts',
    title: 'Payments and account help',
    description: 'GCash, password reset, and support access.',
    icon: MessageCircle,
  },
];

const chatbotQuickPrompts = [
  { id: 'book', label: 'Book appointment', value: 'How can I book an appointment?' },
  { id: 'consult', label: 'Online consultation', value: 'Do you offer online consultation?' },
  { id: 'payment', label: 'Payment methods', value: 'Do you accept GCash?' },
  { id: 'password', label: 'Forgot password', value: 'I forgot my password.' },
];

const medibotTopics = ['Appointments', 'Consultations', 'Payments', 'Account help'];

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

const Home = () => {
  const { branding } = useBranding();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialScreen, setModalInitialScreen] = useState('portal');
  const [modalInitialRole, setModalInitialRole] = useState(null);
  const openModalAs = (screen, roleId = null) => {
    setModalInitialScreen(screen);
    setModalInitialRole(roleId);
    setModalOpen(true);
  };
  const [chatMessages, setChatMessages] = useState(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Hi, I am MediBot, your MediConnect assistant. Ask me about appointments, consultations, payments, or account support.',
    },
    {
      id: 'assistant-hint',
      role: 'assistant',
      text: 'Try: "How can I book an appointment?", "Do you accept GCash?", or "I forgot my password."',
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
    if (chatMessages.length > 2 || chatIsTyping) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, chatIsTyping]);


  const displayBrand = branding?.brandName;
const displayShortBrand = branding?.shortBrandName || branding?.shortBrand;
const displayBrandLabel = displayBrand || 'Pareñas Medical Clinic';
const displayShortBrandLabel = displayShortBrand || 'Pareñas Medical Clinic';
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
      <AuthModals
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalInitialScreen('portal'); setModalInitialRole(null); }}
        initialScreen={modalInitialScreen}
        initialRole={modalInitialRole}
      />
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
              <button
                onClick={() => openModalAs('portal')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#97E7F5] hover:text-[#d2ffb6] font-medium transition-all duration-300 border border-[#97E7F5]/50 sm:border-0 rounded-md"
              >
                Login
              </button>
              <button
                onClick={() => openModalAs('patient-register', 'patient')}
                className="px-3 sm:px-6 py-2 text-xs sm:text-sm bg-[#26B170] text-white rounded-md sm:rounded-lg font-semibold hover:bg-[#d2ffb6] hover:text-[#26B170] transition-all duration-300"
              >
                Sign Up
              </button>
              <button className="md:hidden p-2 text-[#97E7F5] hover:text-[#d2ffb6]" onClick={() => setMobileMenuOpen((p) => !p)} aria-label="Toggle navigation menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div
            className={`md:hidden border-t border-[#1f4f93] bg-[#01377D] px-4 overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? 'max-h-80 py-3 opacity-100 translate-y-0' : 'max-h-0 py-0 opacity-0 -translate-y-1'
              }`}
          >
            <div className="flex flex-col gap-2">
              {navItems.map(({ id, label }) => (
                <button
                  key={`m-${id}`}
                  onClick={() => scrollToSection(id)}
                  className={`w-full rounded-md px-4 py-2.5 text-sm text-left font-medium transition-colors ${activeSection === id ? 'bg-[#0d4e9b] text-[#d2ffb6]' : 'text-[#97E7F5] hover:bg-[#0d4e9b]/60'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#009DD1] mb-4 leading-tight">
                <span className="block mb-2">Welcome to </span>
                <span className="block text-[#01377D] mb-2">MediConnect</span>
                <span className="block text-2xl lg:text-3xl font-semibold text-[#35507A] leading-snug">
                  A Digital Web-Based Medical and Laboratory Management System with Appointment Scheduling and Decision Support
                </span>
              </h1>
              <p className="text-xl text-[#01377D] mb-8 max-w-2xl">Simplifying healthcare management for better patient care with appointment, records, and documents in one place.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => openModalAs('portal')} className="bg-[#26B170] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#7ED348] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                  <Users className="w-5 h-5" />
                  Get Started
                </button>
                <button onClick={() => scrollToSection('libraries')} className="border-2 border-[#009DD1] text-[#009DD1] px-8 py-4 rounded-lg font-semibold hover:bg-[#009DD1] hover:text-white hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Explore Features
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



      {/* Features Section */}
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
                <button onClick={() => openModalAs('portal')} className="inline-flex bg-[#26B170] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#7ED348] shadow-lg transition-all duration-300 items-center gap-3">
                  <ArrowRight className="w-5 h-5" />
                  Access Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Access / Get Started Section */}
      <section id="roles" className="py-20 bg-gradient-to-br from-[#01377D] via-[#012f6b] to-[#011d4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#97E7F5] text-sm font-semibold uppercase tracking-widest mb-3">Role Selection</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Choose Your Role</h2>
            <p className="text-lg text-[#97E7F5] max-w-2xl mx-auto">Select your role to get started with MediConnect. Each role has a dedicated dashboard tailored to your needs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCards.map((role) => (
              <div
                key={role.id}
                className={`relative rounded-2xl border-2 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 group cursor-default ${role.border} hover:-translate-y-1 hover:shadow-2xl hover:bg-white/10`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} shadow-lg mb-4 text-2xl`}>
                  {role.emoji}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                <p className="text-[#97E7F5] text-sm mb-5 leading-relaxed">{role.description}</p>
                <ul className="space-y-1.5 mb-6">
                  {role.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-[#d2ffb6] text-sm">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#26B170]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openModalAs(role.id === 'patient' ? 'patient-login' : 'staff-login', role.id)}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${role.color} text-white hover:opacity-90 transition-all duration-200 shadow-md`}
                  >
                    <Lock className="w-4 h-4" />
                    Login as {role.title}
                  </button>
                  {role.registerPath && (
                    <button
                      onClick={() => openModalAs('patient-register', 'patient')}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <UserCircle className="w-4 h-4" />
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant (MediBot) Section */}
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
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openModalAs('portal')}
                    className="bg-[#26B170] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#7ED348] transition-all duration-300 text-center"
                  >
                    Chat with MediBot
                  </button>
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
                  placeholder="Ask about appointments, consultations, payments, or account support..."
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

      {/* Quick Access Section */}
      <section id="access" className="py-20 bg-[#97E7F5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#01377D] mb-4"><span className="text-[#009DD1]">Quick</span> Access</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={() => openModalAs('portal')} className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#26B170] text-left w-full">
              <Search className="w-6 h-6 text-[#009DD1] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Book Appointment</h3>
              <p className="text-[#01377D] text-sm">Schedule your visit quickly.</p>
            </button>
            <div className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent">
              <Clock className="w-6 h-6 text-[#7ED348] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Clinic Hours</h3>
              <p className="text-[#01377D] text-sm">Mon-Fri: 8AM-5PM, Sat: 9AM-12PM.</p>
            </div>
            <button onClick={() => openModalAs('portal')} className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#26B170] text-left w-full">
              <Users className="w-6 h-6 text-[#26B170] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">Get Started</h3>
              <p className="text-[#01377D] text-sm">Create your account in minutes.</p>
            </button>
            <button onClick={() => openModalAs('portal')} className="p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#009DD1] text-left w-full">
              <Calendar className="w-6 h-6 text-[#009DD1] mb-4" />
              <h3 className="text-xl font-semibold text-[#01377D] mb-2">My Records</h3>
              <p className="text-[#01377D] text-sm">View your health history securely.</p>
            </button>
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
                <li><button onClick={() => scrollToSection('libraries')} className="hover:text-[#7ED348]">Features</button></li>
                <li><button onClick={() => scrollToSection('roles')} className="hover:text-[#7ED348]">Get Started</button></li>
                <li><button onClick={() => scrollToSection('assistant')} className="hover:text-[#7ED348]">AI Assistant</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-[#97E7F5]"><li>{displaySystemSubtitle}</li><li>{branding.contactEmail}</li><li>{branding.contactPhone}</li></ul>
            </div>
          </div>
          <div className="border-t border-[#009DD1] mt-8 pt-8 text-center text-[#97E7F5]"><p>© 2026 Pareñas Medical Clinic. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
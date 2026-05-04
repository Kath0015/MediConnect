import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FlaskConical, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import PatientRoleBanner from '../../components/patient/PatientRoleBanner';

const chatbotFeatures = [
  {
    id: 'questions',
    title: 'Common questions',
    description: 'Clinic hours, what to bring, and basic requirements.',
    icon: MessageCircle,
  },
  {
    id: 'lab-prep',
    title: 'Lab prep guidance',
    description: 'Fasting, urine, stool, and imaging prep tips.',
    icon: FlaskConical,
  },
  {
    id: 'booking',
    title: 'Appointment support',
    description: 'Pick a department, choose a time, and get reminders.',
    icon: Calendar,
  },
];

const chatbotQuickPrompts = [
  { id: 'fasting', label: 'Fasting blood test prep', value: 'How do I prepare for a fasting blood test?' },
  { id: 'cbc', label: 'CBC preparation', value: 'Do I need to fast for a CBC?' },
  { id: 'book', label: 'Book an appointment', value: 'I want to book an appointment.' },
  { id: 'hours', label: 'Clinic hours', value: 'What are your clinic hours?' },
];

const MediBot = () => {
  const { branding } = useBranding();
  const [chatMessages, setChatMessages] = useState(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Hi, I am MediBot, your 24/7 medical assistant. Ask me about appointments, lab prep, or common questions.',
    },
    {
      id: 'assistant-hint',
      role: 'assistant',
      text: 'Try: "fasting blood test", "clinic hours", or "book appointment".',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const displayShortBrand = branding.brandShortName;
  const assistantName = displayShortBrand ? `${displayShortBrand} MediBot` : 'MediBot';

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatIsTyping]);

  const createChatMessage = (role, text) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  });

  const getBotResponse = (message) => {
    const text = message.toLowerCase();

    if (/chest pain|shortness of breath|difficulty breathing|severe bleeding|stroke|fainting/.test(text)) {
      return 'If you are experiencing severe symptoms, call emergency services or go to the nearest ER right away.';
    }

    if (/appointment|book|schedule|reschedule|cancel/.test(text)) {
      return 'I can help start your appointment. Share the department, preferred date and time, and whether this is a new or follow-up visit. Open Appointments to finish booking.';
    }

    if (/fasting|fast|lipid|cholesterol|glucose|blood sugar|fbs/.test(text)) {
      return 'For fasting blood tests (lipid panel, fasting glucose):\n- Avoid food for 8 to 12 hours\n- Water is ok\n- Avoid alcohol for 24 hours\n- Take meds unless your clinician said otherwise\nIf you are diabetic or pregnant, confirm the plan with your clinician.';
    }

    if (/cbc|complete blood count/.test(text)) {
      return 'CBC tests usually do not require fasting. You can eat and drink normally unless your clinician advised otherwise.';
    }

    if (/urinalysis|urine/.test(text)) {
      return 'For urinalysis:\n- Use a clean, midstream sample\n- Avoid heavy exercise for 24 hours before\n- Tell us if you are on antibiotics or menstruating\nFollow any kit instructions provided.';
    }

    if (/stool|fecal/.test(text)) {
      return 'For stool tests:\n- Use the sterile container\n- Avoid bismuth or antibiotics unless instructed\n- Keep the sample cool if dropping off later\nLet us know about recent travel or new medications.';
    }

    if (/thyroid|tsh/.test(text)) {
      return 'Thyroid labs usually do not require fasting. If you take thyroid medication, take it after the blood draw unless told otherwise.';
    }

    if (/pregnancy|hcg/.test(text)) {
      return 'Pregnancy testing does not require fasting. In clinic, any time is ok. For home tests, first morning urine is usually best.';
    }

    if (/x-ray|xray|ultrasound|imaging/.test(text)) {
      return 'Imaging prep depends on the study. Wear comfortable clothing and avoid jewelry. Tell me the study name and I will check the prep steps.';
    }

    if (/clinic hours|opening hours|open|closing|close|hours/.test(text)) {
      return 'Clinic hours are Mon-Fri 8AM-5PM and Sat 9AM-12PM.';
    }

    if (/bring|documents|requirements|what should i bring|what to bring/.test(text)) {
      return 'Bring a valid ID, your appointment confirmation, a list of medications, and any prior records. If insured, bring your card.';
    }

    if (/contact|phone|email|call/.test(text)) {
      const phone = branding.contactPhone?.trim();
      const email = branding.contactEmail?.trim();
      const lines = [];
      if (phone) lines.push(`Phone: ${phone}`);
      if (email) lines.push(`Email: ${email}`);
      if (lines.length) return `You can reach us at:\n${lines.join('\n')}`;
      return 'Please contact the front desk for assistance.';
    }

    if (/result|results|report|lab result/.test(text)) {
      return 'Lab results usually appear in the patient portal within 1 to 2 business days. If you have not received results, contact the front desk.';
    }

    if (/insurance|billing|payment|cost|fee|price/.test(text)) {
      return 'Coverage and fees depend on your plan and services. I can connect you to billing or you can call the front desk.';
    }

    return 'I can help with appointment booking, lab prep, and common questions. Try: "fasting blood test", "book appointment", or "clinic hours".';
  };

  const sendChatMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, createChatMessage('user', trimmed)]);
    setChatIsTyping(true);
    const reply = getBotResponse(trimmed);
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

  return (
    <div className="space-y-6">
      <PatientRoleBanner
        title="MediBot AI Assistant"
        subtitle="Chat 24/7 for lab prep guidance, clinic FAQs, and appointment help."
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
                Get instant answers to common questions, step-by-step lab prep guidance, and a quick path to booking appointments.
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
                {chatbotQuickPrompts.map((prompt) => (
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
                  placeholder="Ask about lab prep, appointments, or clinic info..."
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

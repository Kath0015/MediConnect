export const MEDIBOT_FALLBACK =
  "I'm sorry, I can only assist with MediConnect-related services such as appointments, medicines, consultations, delivery, and account concerns.";

export const MEDIBOT_KNOWLEDGE_BASE = [
  {
    id: 'appointment-booking',
    label: 'Appointment Booking',
    keywords: ['appointment', 'book appointment', 'booking', 'schedule', 'reschedule', 'cancel'],
    response:
      'You can book an appointment by going to the Appointments section, selecting a doctor, and choosing your preferred schedule.',
    suggestions: ['Book an appointment', 'Reschedule appointment', 'Clinic hours'],
  },
  {
    id: 'medicine-availability',
    label: 'Medicine Availability',
    keywords: ['medicine', 'medicines', 'pharmacy', 'drug', 'meds', 'paracetamol', 'availability', 'stock'],
    response: 'You can check medicine availability in the Pharmacy section of MediConnect.',
    suggestions: ['Is paracetamol available?', 'How long is delivery?'],
  },
  {
    id: 'online-consultation',
    label: 'Online Consultation',
    keywords: ['online consultation', 'teleconsult', 'telemedicine', 'virtual consult', 'online consult'],
    response: 'Yes, MediConnect supports online consultations with partnered healthcare providers.',
    suggestions: ['How do I start an online consultation?', 'Book an appointment'],
  },
  {
    id: 'delivery-service',
    label: 'Delivery Service',
    keywords: ['delivery', 'deliver', 'shipping', 'courier', 'how long is delivery', 'delivery time'],
    response: 'Delivery usually takes 1-3 days depending on your location.',
    suggestions: ['How long is delivery?', 'Do you deliver medicines?'],
  },
  {
    id: 'payment-methods',
    label: 'Payment Methods',
    keywords: ['gcash', 'payment method', 'payment methods', 'pay with', 'credit', 'debit', 'wallet', 'card'],
    response: 'Yes, MediConnect accepts GCash and other supported online payment methods.',
    suggestions: ['Do you accept GCash?', 'What payment methods are supported?'],
  },
  {
    id: 'account-concerns',
    label: 'Account Concerns',
    keywords: ['forgot password', 'reset password', 'password', 'login issue', 'account'],
    response: "Please click the 'Forgot Password' option on the login page to reset your password.",
    suggestions: ['I forgot my password', 'How do I reset my password?'],
  },
  {
    id: 'contact-support',
    label: 'Contact Support',
    keywords: ['customer support', 'support', 'contact', 'help desk', 'help'],
    response: 'You may contact our support team through the Contact Us page.',
    suggestions: ['I need customer support', 'How can I contact you?'],
  },
  {
    id: 'clinic-hours',
    label: 'Clinic Hours',
    keywords: ['clinic hours', 'opening hours', 'open', 'closing', 'close', 'hours'],
    response: 'Clinic hours are Mon-Fri 8AM-5PM and Sat 9AM-12PM.',
    suggestions: ['What are your clinic hours?', 'Book an appointment'],
  },
  {
    id: 'lab-prep-fasting',
    label: 'Fasting Blood Test Prep',
    keywords: ['fasting', 'fast', 'lipid', 'cholesterol', 'glucose', 'blood sugar', 'fbs'],
    response:
      'For fasting blood tests (lipid panel, fasting glucose):\n- Avoid food for 8 to 12 hours\n- Water is ok\n- Avoid alcohol for 24 hours\n- Take meds unless your clinician said otherwise\nIf you are diabetic or pregnant, confirm the plan with your clinician.',
    suggestions: ['Do I need to fast for a CBC?', 'What should I bring?'],
  },
  {
    id: 'lab-prep-cbc',
    label: 'CBC Preparation',
    keywords: ['cbc', 'complete blood count'],
    response: 'CBC tests usually do not require fasting. You can eat and drink normally unless your clinician advised otherwise.',
    suggestions: ['Do I need to fast for a CBC?', 'Fasting blood test prep'],
  },
  {
    id: 'lab-prep-urinalysis',
    label: 'Urinalysis Prep',
    keywords: ['urinalysis', 'urine'],
    response:
      'For urinalysis:\n- Use a clean, midstream sample\n- Avoid heavy exercise for 24 hours before\n- Tell us if you are on antibiotics or menstruating\nFollow any kit instructions provided.',
    suggestions: ['Urine test prep', 'What should I bring?'],
  },
  {
    id: 'lab-prep-stool',
    label: 'Stool Test Prep',
    keywords: ['stool', 'fecal'],
    response:
      'For stool tests:\n- Use the sterile container\n- Avoid bismuth or antibiotics unless instructed\n- Keep the sample cool if dropping off later\nLet us know about recent travel or new medications.',
    suggestions: ['Stool test prep', 'Clinic hours'],
  },
  {
    id: 'lab-prep-thyroid',
    label: 'Thyroid Test Prep',
    keywords: ['thyroid', 'tsh'],
    response: 'Thyroid labs usually do not require fasting. If you take thyroid medication, take it after the blood draw unless told otherwise.',
    suggestions: ['Thyroid test prep', 'Book an appointment'],
  },
  {
    id: 'lab-prep-pregnancy',
    label: 'Pregnancy Test Prep',
    keywords: ['pregnancy', 'hcg'],
    response: 'Pregnancy testing does not require fasting. In clinic, any time is ok. For home tests, first morning urine is usually best.',
    suggestions: ['Pregnancy test prep', 'Clinic hours'],
  },
  {
    id: 'imaging-prep',
    label: 'Imaging Prep',
    keywords: ['x-ray', 'xray', 'ultrasound', 'imaging', 'scan'],
    response: 'Imaging prep depends on the study. Wear comfortable clothing and avoid jewelry. Tell me the study name and I will check the prep steps.',
    suggestions: ['Imaging prep', 'Book an appointment'],
  },
  {
    id: 'documents-required',
    label: 'What To Bring',
    keywords: ['bring', 'documents', 'requirements', 'what should i bring', 'what to bring'],
    response: 'Bring a valid ID, your appointment confirmation, a list of medications, and any prior records. If insured, bring your card.',
    suggestions: ['What should I bring?', 'Clinic hours'],
  },
  {
    id: 'lab-results',
    label: 'Lab Results',
    keywords: ['result', 'results', 'report', 'lab result'],
    response: 'Lab results usually appear in the patient portal within 1 to 2 business days. If you have not received results, contact the front desk.',
    suggestions: ['Lab result status', 'Contact support'],
  },
  {
    id: 'insurance-billing',
    label: 'Insurance And Billing',
    keywords: ['insurance', 'billing', 'cost', 'fee', 'price', 'coverage'],
    response: 'Coverage and fees depend on your plan and services. I can connect you to billing or you can call the front desk.',
    suggestions: ['What payment methods are supported?', 'Contact support'],
  },
];

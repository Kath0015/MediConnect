import { format, isValid, parseISO } from 'date-fns';

export const formatAdminDate = (value, fallback = 'N/A') => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : parseISO(String(value));
  return isValid(date) ? format(date, 'MMM dd, yyyy') : fallback;
};
export const toTitleCase = (value, fallback = 'N/A') => {
  if (!value) return fallback;

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const formatPrescriptionDate = (value, fallback = 'Not specified') => {
  if (!value) return fallback;
  const text = String(value).split('T')[0];
  const date = text ? parseISO(text) : null;
  return date && isValid(date) ? format(date, 'MMM dd, yyyy') : fallback;
};

export const formatDoctorName = (value, fallback = 'Attending Physician') => {
  const name = String(value || '').replace(/\s+/g, ' ').trim();
  if (!name) return fallback;
  if (/^dr\.?/i.test(name)) return name;
  return `Dr. ${name}`;
};

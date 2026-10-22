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

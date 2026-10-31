import { site } from '../config/site';

/** "30 November 2026" style date. UTC so the day never shifts with the build machine's time zone. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(site.lang === 'fr' ? 'fr-FR' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

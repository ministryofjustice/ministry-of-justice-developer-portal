const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC', // introduced for consistency
};

const EVENT_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
};

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function formatLongDate(value: string) {
  const date = parseDate(value);
  if (!date) return '';

  return date.toLocaleDateString('en-GB', LONG_DATE_FORMAT);
}

export function formatEventDateTime(value: string) {
  const date = parseDate(value);
  if (!date) return '';

  return date.toLocaleString('en-GB', EVENT_DATE_TIME_FORMAT);
}

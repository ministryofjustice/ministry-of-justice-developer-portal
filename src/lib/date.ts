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

export function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) return value;

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

export function normaliseDateValue(value: unknown): string | undefined {
  const date =
    typeof value === 'string' || value instanceof Date
      ? parseDate(value)
      : null;

  return date?.toISOString().slice(0, 10);
}

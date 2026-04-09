const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

export function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', LONG_DATE_FORMAT);
}

export function formatEventDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', EVENT_DATE_TIME_FORMAT);
}
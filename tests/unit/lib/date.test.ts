import { describe, it, expect } from 'vitest';
import { formatLongDate, formatEventDateTime } from '@/lib/date';

describe('formatLongDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatLongDate('2024-01-15')).toBe('15 January 2024');
  });

  it('returns empty string for invalid date', () => {
    expect(formatLongDate('not-a-date')).toBe('');
  });
});

describe('formatEventDateTime', () => {
  it('formats a valid ISO datetime in UTC', () => {
    expect(formatEventDateTime('2024-01-15T10:30:00Z')).toContain('15 January 2024');
  });

  it('includes time and timezone', () => {
    const result = formatEventDateTime('2024-01-15T10:30:00Z');

    expect(result).toContain('10:30');
    expect(result).toMatch(/UTC|GMT/);
  });

  it('returns empty string for invalid date', () => {
    expect(formatEventDateTime('invalid')).toBe('');
  });
});

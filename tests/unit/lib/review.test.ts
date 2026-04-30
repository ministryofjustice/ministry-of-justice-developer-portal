import { describe, expect, it } from 'vitest';
import { getReviewStatus } from '@/lib/review';

describe('getReviewStatus', () => {
  it('returns null when lastReviewedOn is missing', () => {
    expect(getReviewStatus(undefined, '6')).toBeNull();
  });

  it('returns null when reviewIn is missing', () => {
    expect(getReviewStatus('2025-01-01', undefined)).toBeNull();
  });

  it('returns null when lastReviewedOn is invalid', () => {
    expect(getReviewStatus('not-a-date', '6')).toBeNull();
  });

  it('returns ok when review is not near due', () => {
    expect(getReviewStatus('2025-01-01', '6', new Date(2025, 3, 1))).toBe('ok');
  });

  it('returns warning when within one month of due date', () => {
    expect(getReviewStatus('2025-01-01', '6', new Date(2025, 5, 15))).toBe('warning');
  });

  it('returns overdue when due date has passed', () => {
    expect(getReviewStatus('2025-01-01', '6', new Date(2025, 7, 1))).toBe('overdue');
  });

  it('defaults review period to 6 months when reviewIn is invalid', () => {
    expect(getReviewStatus('2025-01-01', 'banana', new Date(2025, 5, 15))).toBe('warning');
  });

  it('returns warning exactly on the due date because comparison is strict greater-than', () => {
    expect(getReviewStatus('2025-01-01', '6', new Date(2025, 6, 1))).toBe('warning');
  });

  it('returns ok exactly one month before the due date', () => {
    expect(getReviewStatus('2025-01-01', '6', new Date(2025, 5, 1))).toBe('ok');
  });
});

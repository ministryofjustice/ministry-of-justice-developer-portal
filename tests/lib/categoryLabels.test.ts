import { describe, it, expect } from 'vitest';
import { getProductCategoryLabel, getCommunityCategoryLabel } from '@/lib/categoryLabels';

describe.each([
  ['platforms', 'Platform'],
  ['apis', 'API'],
  ['tools', 'Tool'],
  ['security', 'Security'],
  ['data', 'Data'],
])('known categories', (input, expected) => {
  it(`maps ${input} → ${expected}`, () => {
    expect(getProductCategoryLabel(input)).toBe(expected);
  });
});

describe('unknown categories', () => {
  it('returns original value when category is not mapped', () => {
    expect(getProductCategoryLabel('unknown')).toBe('unknown');
    expect(getProductCategoryLabel('random')).toBe('random');
    expect(getProductCategoryLabel('something-else')).toBe('something-else');
  });
});

describe.each([
  ['chat', 'Chat'],
  ['code', 'Code'],
  ['learn', 'Learn'],
  ['events', 'Events'],
])('known categories', (input, expected) => {
  it(`maps ${input} → ${expected}`, () => {
    expect(getCommunityCategoryLabel(input)).toBe(expected);
  });
});

describe('unknown categories', () => {
  it('returns original value when category is not mapped', () => {
    expect(getCommunityCategoryLabel('unknown')).toBe('unknown');
    expect(getCommunityCategoryLabel('random')).toBe('random');
    expect(getCommunityCategoryLabel('something-else')).toBe('something-else');
  });
});

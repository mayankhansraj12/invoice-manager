import { describe, it, expect } from 'vitest';
import { formatAmount, formatDate, formatWhole } from './format';

describe('formatAmount', () => {
  it('groups digits the Indian way and always shows two decimals', () => {
    expect(formatAmount(1234567.5)).toBe('12,34,567.50');
  });

  it('formats zero with two decimals', () => {
    expect(formatAmount(0)).toBe('0.00');
  });
});

describe('formatWhole', () => {
  it('groups digits the Indian way without decimals', () => {
    expect(formatWhole(1050000)).toBe('10,50,000');
  });
});

describe('formatDate', () => {
  it('formats as month, day and year by default', () => {
    expect(formatDate('2025-02-10T12:00:00.000Z')).toBe('Feb 10, 2025');
  });

  it('accepts a custom date-fns pattern', () => {
    expect(formatDate('2025-02-10T12:00:00.000Z', 'MMM dd, yyyy HH:mm')).toMatch(
      /^Feb 10, 2025 \d{2}:\d{2}$/,
    );
  });
});

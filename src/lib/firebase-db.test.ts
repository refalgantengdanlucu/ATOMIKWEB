import { describe, expect, it } from 'vitest';
import { getJakartaDateParts } from './firebase-db';

describe('presensi dates in Jakarta time', () => {
  it('uses the WIB calendar date across the UTC year boundary', () => {
    expect(getJakartaDateParts(new Date('2024-12-31T17:30:00.000Z'))).toEqual({
      year: 2025,
      month: 1,
      day: 1,
      dateKey: '2025-01-01',
    });
  });
});

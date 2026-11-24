import { describe, expect, it } from 'vitest';
import { isValidInstitutionId } from './access-context';

describe('institution assignment identifiers', () => {
  it('accepts canonical IDs and rejects empty, oversized, or user-formatted values', () => {
    expect(isValidInstitutionId('school_01')).toBe(true);
    expect(isValidInstitutionId('school-01')).toBe(true);
    expect(isValidInstitutionId('')).toBe(false);
    expect(isValidInstitutionId('school 01')).toBe(false);
    expect(isValidInstitutionId('x'.repeat(81))).toBe(false);
    expect(isValidInstitutionId(null)).toBe(false);
  });
});

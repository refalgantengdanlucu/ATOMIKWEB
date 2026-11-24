import { describe, expect, it } from 'vitest';
import {
  compareNuclides,
  formatNuclide,
  getBohrShells,
  getElectronCount,
  getMaxPositiveCharge,
  getNeutronCount,
  isValidCharge,
  validateParticleInput,
} from './chemistry';

describe('chemical particle calculations', () => {
  it('calculates p, n, and e relationships for ions', () => {
    expect(getNeutronCount(23, 11)).toBe(12);
    expect(getElectronCount(11, 1)).toBe(10);
    expect(getElectronCount(17, -1)).toBe(18);
    expect(getElectronCount(20, 2)).toBe(18);
    expect(getElectronCount(1, 1)).toBe(0);
  });

  it('accepts charge only when it leaves a non-negative integer electron count', () => {
    expect(getMaxPositiveCharge(1)).toBe(1);
    expect(isValidCharge(1, 1)).toBe(true);
    expect(isValidCharge(1, 2)).toBe(false);
    expect(isValidCharge(17, -1)).toBe(true);
    expect(validateParticleInput(17, 35, -1)).toBeNull();
    expect(validateParticleInput(1, 1, 2)).toMatchObject({
      field: 'charge',
      message: expect.stringContaining('maksimum untuk unsur ini adalah +1'),
    });
    expect(validateParticleInput(11, 23, 1)).toBeNull();
    expect(validateParticleInput(17, 35, -1)).toBeNull();
    expect(validateParticleInput(20, 40, 2)).toBeNull();
    expect(() => getElectronCount(1, 2)).toThrow(RangeError);
  });

  it('rejects invalid atomic and mass numbers before calculating particles', () => {
    expect(validateParticleInput(0, 1, 0)).toMatchObject({ field: 'atomicNumber' });
    expect(validateParticleInput(1.5, 2, 0)).toMatchObject({ field: 'atomicNumber' });
    expect(validateParticleInput(1, 0, 0)).toMatchObject({ field: 'massNumber' });
    expect(validateParticleInput(1, 1.5, 0)).toMatchObject({ field: 'massNumber' });
    expect(validateParticleInput(1, 1, Number.NaN)).toMatchObject({ field: 'charge' });
    expect(() => getNeutronCount(0, 1)).toThrow(RangeError);
    expect(() => getNeutronCount(1, 2)).toThrow(RangeError);
  });

  it('distributes up to 20 electrons in simplified Bohr shells', () => {
    expect(getBohrShells(11)).toEqual([2, 8, 1, 0]);
    expect(getBohrShells(20)).toEqual([2, 8, 8, 2]);
    expect(getBohrShells(22)).toEqual([2, 8, 8, 4]);
    expect(getBohrShells(0)).toEqual([0, 0, 0, 0]);
  });

  it('identifies isotope, isobar, and isotone pairs separately', () => {
    expect(compareNuclides({ atomicNumber: 6, massNumber: 12 }, { atomicNumber: 6, massNumber: 14 })).toBe('isotop');
    expect(compareNuclides({ atomicNumber: 6, massNumber: 14 }, { atomicNumber: 7, massNumber: 14 })).toBe('isobar');
    expect(compareNuclides({ atomicNumber: 6, massNumber: 14 }, { atomicNumber: 7, massNumber: 15 })).toBe('isoton');
  });

  it('formats nuclear notation with charge', () => {
    expect(formatNuclide('Na', 23, 1)).toBe('23Na+');
    expect(formatNuclide('O', 16, -2)).toBe('16O2−');
  });
});

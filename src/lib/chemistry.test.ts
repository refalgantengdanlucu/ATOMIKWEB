import { describe, expect, it } from 'vitest';
import {
  compareNuclides,
  formatNuclide,
  getBohrShells,
  getElectronCount,
  getNeutronCount,
} from './chemistry';

describe('chemical particle calculations', () => {
  it('calculates p, n, and e relationships for ions', () => {
    expect(getNeutronCount(23, 11)).toBe(12);
    expect(getElectronCount(11, 1)).toBe(10);
    expect(getElectronCount(17, -1)).toBe(18);
  });

  it('distributes up to 20 electrons in simplified Bohr shells', () => {
    expect(getBohrShells(11)).toEqual([2, 8, 1, 0]);
    expect(getBohrShells(20)).toEqual([2, 8, 8, 2]);
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

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  defaultMassNumber: number;
}

export const ELEMENTS: ChemicalElement[] = [
  { atomicNumber: 1, symbol: 'H', name: 'Hidrogen', defaultMassNumber: 1 },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', defaultMassNumber: 4 },
  { atomicNumber: 3, symbol: 'Li', name: 'Litium', defaultMassNumber: 7 },
  { atomicNumber: 4, symbol: 'Be', name: 'Berilium', defaultMassNumber: 9 },
  { atomicNumber: 5, symbol: 'B', name: 'Boron', defaultMassNumber: 11 },
  { atomicNumber: 6, symbol: 'C', name: 'Karbon', defaultMassNumber: 12 },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', defaultMassNumber: 14 },
  { atomicNumber: 8, symbol: 'O', name: 'Oksigen', defaultMassNumber: 16 },
  { atomicNumber: 9, symbol: 'F', name: 'Fluorin', defaultMassNumber: 19 },
  { atomicNumber: 10, symbol: 'Ne', name: 'Neon', defaultMassNumber: 20 },
  { atomicNumber: 11, symbol: 'Na', name: 'Natrium', defaultMassNumber: 23 },
  { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', defaultMassNumber: 24 },
  { atomicNumber: 13, symbol: 'Al', name: 'Aluminium', defaultMassNumber: 27 },
  { atomicNumber: 14, symbol: 'Si', name: 'Silikon', defaultMassNumber: 28 },
  { atomicNumber: 15, symbol: 'P', name: 'Fosfor', defaultMassNumber: 31 },
  { atomicNumber: 16, symbol: 'S', name: 'Sulfur', defaultMassNumber: 32 },
  { atomicNumber: 17, symbol: 'Cl', name: 'Klorin', defaultMassNumber: 35 },
  { atomicNumber: 18, symbol: 'Ar', name: 'Argon', defaultMassNumber: 40 },
  { atomicNumber: 19, symbol: 'K', name: 'Kalium', defaultMassNumber: 39 },
  { atomicNumber: 20, symbol: 'Ca', name: 'Kalsium', defaultMassNumber: 40 },
];

export function getElement(atomicNumber: number): ChemicalElement | undefined {
  return ELEMENTS.find((element) => element.atomicNumber === atomicNumber);
}

export function getNeutronCount(massNumber: number, atomicNumber: number): number {
  return massNumber - atomicNumber;
}

export function getElectronCount(atomicNumber: number, charge: number): number {
  return atomicNumber - charge;
}

export function getBohrShells(electronCount: number): number[] {
  let remaining = Math.max(0, Math.floor(electronCount));
  const capacities = [2, 8, 8, Number.POSITIVE_INFINITY];
  return capacities.map((capacity) => {
    const count = Math.min(remaining, capacity);
    remaining -= count;
    return count;
  });
}

export type NuclideRelation = 'isotop' | 'isobar' | 'isoton' | 'berbeda';

export function compareNuclides(
  first: { atomicNumber: number; massNumber: number },
  second: { atomicNumber: number; massNumber: number },
): NuclideRelation {
  if (first.atomicNumber === second.atomicNumber && first.massNumber !== second.massNumber) {
    return 'isotop';
  }
  if (first.massNumber === second.massNumber && first.atomicNumber !== second.atomicNumber) {
    return 'isobar';
  }
  if (
    getNeutronCount(first.massNumber, first.atomicNumber) ===
      getNeutronCount(second.massNumber, second.atomicNumber) &&
    first.atomicNumber !== second.atomicNumber
  ) {
    return 'isoton';
  }
  return 'berbeda';
}

export function formatNuclide(symbol: string, massNumber: number, charge = 0): string {
  const chargeLabel = charge === 0 ? '' : charge === 1 ? '+' : charge === -1 ? '−' : `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
  return `${massNumber}${symbol}${chargeLabel}`;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return crypto.randomUUID();
}

export function convertUnitQuantity(qty: number, fromUnit?: string, toUnit?: string): number {
  if (!qty || isNaN(qty)) return 0;
  if (!fromUnit || !toUnit) return qty;

  const cleanFrom = fromUnit.trim().toUpperCase().replace(/[^A-Z]/g, '');
  const cleanTo = toUnit.trim().toUpperCase().replace(/[^A-Z]/g, '');

  if (cleanFrom === cleanTo || !cleanFrom || !cleanTo) return qty;

  // Mass conversion factors to KGS
  const toKgsMap: Record<string, number> = {
    'KG': 1,
    'KGS': 1,
    'KILOGRAM': 1,
    'KILOGRAMS': 1,
    'TON': 1000,
    'TONS': 1000,
    'MT': 1000,
    'TONNE': 1000,
    'TONNES': 1000,
    'QUINTAL': 100,
    'QUINTALS': 100,
    'G': 0.001,
    'GRAM': 0.001,
    'GRAMS': 0.001,
    'LB': 0.453592,
    'LBS': 0.453592
  };

  // Length conversion factors to METERS
  const toMetersMap: Record<string, number> = {
    'MTR': 1,
    'MTRS': 1,
    'METER': 1,
    'METERS': 1,
    'M': 1,
    'KM': 1000,
    'CM': 0.01,
    'MM': 0.001
  };

  if (toKgsMap[cleanFrom] !== undefined && toKgsMap[cleanTo] !== undefined) {
    const qtyInKgs = qty * toKgsMap[cleanFrom];
    return qtyInKgs / toKgsMap[cleanTo];
  }

  if (toMetersMap[cleanFrom] !== undefined && toMetersMap[cleanTo] !== undefined) {
    const qtyInMeters = qty * toMetersMap[cleanFrom];
    return qtyInMeters / toMetersMap[cleanTo];
  }

  return qty;
}

export function parseDateToYYYYMMDD(rawDate: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str) return '';

  // ISO date or standard YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const cleanStr = str.split(/[T ]/)[0];
    const parts = cleanStr.split(/[-/]/);
    const yyyy = parts[0];
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    const cleanStr = str.split(/[T ]/)[0];
    const parts = cleanStr.split(/[-/]/);
    const dd = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    const yyyy = parts[2];
    return `${yyyy}-${mm}-${dd}`;
  }

  // JS Date fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return str;
}

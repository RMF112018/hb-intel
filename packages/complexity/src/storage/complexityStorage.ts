import type { IComplexityPreference } from '../types/IComplexityPreference';
import { COMPLEXITY_STORAGE_KEY } from '../types/IComplexityPreference';
import { getStorage } from './getStorage';

/**
 * Reads the stored complexity preference synchronously (D-01).
 * Returns null if no preference is stored (brand-new user).
 */
export function readPreference(isSpfx: boolean): IComplexityPreference | null {
  try {
    const raw = getStorage(isSpfx).getItem(COMPLEXITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IComplexityPreference;
    // Basic shape validation — reject corrupt values
    if (!parsed.tier || !['essential', 'standard', 'expert'].includes(parsed.tier)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes the complexity preference to storage (D-01).
 * Also fires the StorageEvent to other tabs (D-05) — this happens automatically
 * because localStorage.setItem triggers the native 'storage' event in other tabs.
 */
export function writePreference(pref: IComplexityPreference, isSpfx: boolean): void {
  try {
    getStorage(isSpfx).setItem(COMPLEXITY_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] Failed to persist preference to storage.');
    }
  }
}

/**
 * Clears the stored preference. Used in logout flows and tests.
 */
export function clearPreference(isSpfx: boolean): void {
  try {
    getStorage(isSpfx).removeItem(COMPLEXITY_STORAGE_KEY);
  } catch {
    // Silent — nothing to clear
  }
}

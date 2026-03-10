// Full implementation in T03
import type { IVersionDiff } from '../types';
export function computeDiff<T extends Record<string, unknown>>(
  _previous: T,
  _current: T,
  _excludeFields?: string[]
): IVersionDiff[] {
  throw new Error('diffEngine not yet implemented — see T03');
}

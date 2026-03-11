/**
 * CanvasApi — D-SF13-T01
 *
 * Stub API for canvas user configuration persistence. Full implementation in T03.
 */
import type { ICanvasUserConfig } from '../types/index.js';

/** Retrieves the user's canvas configuration for a given project */
export function getConfig(
  _userId: string,
  _projectId: string,
): Promise<ICanvasUserConfig | null> {
  // Stub — T03 implementation
  return Promise.resolve(null);
}

/** Saves the user's canvas configuration for a given project */
export function saveConfig(_config: ICanvasUserConfig): Promise<void> {
  // Stub — T03 implementation
  return Promise.resolve();
}

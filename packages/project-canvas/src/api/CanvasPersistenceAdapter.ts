import type { ICanvasUserConfig } from '../types/index.js';

/**
 * Shared persistence contract for governed canvas user configuration.
 *
 * Consumers may supply a lane-specific adapter when the default API-backed
 * persistence model is not the correct runtime seam.
 */
export interface ICanvasPersistenceAdapter {
  getConfig(projectId: string, userId: string): Promise<ICanvasUserConfig | null>;
  saveConfig(config: ICanvasUserConfig): Promise<void>;
  resetConfig(projectId: string, userId: string): Promise<void>;
}

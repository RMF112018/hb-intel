/**
 * Registers My Work Hub tiles in the @hbc/project-canvas tile registry.
 *
 * Called once during app bootstrap (sourceAssembly) before rendering.
 * Idempotent guard: skips registration if tiles are already registered
 * (prevents duplicate-key errors on HMR in development).
 */
import { registerMany, get } from '@hbc/project-canvas';
import { myWorkTileDefinitions } from './myWorkTileDefinitions.js';

let registered = false;

export function registerMyWorkTiles(): void {
  if (registered) return;
  // Guard against partial prior registration (e.g. HMR)
  if (get(myWorkTileDefinitions[0].tileKey)) {
    registered = true;
    return;
  }
  registerMany(myWorkTileDefinitions);
  registered = true;
}

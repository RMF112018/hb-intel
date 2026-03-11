/**
 * registerReferenceTiles — D-SF13-T07, D-09 (cross-package integration)
 *
 * Idempotent registration entry point for all reference tile definitions.
 * Consumers call this once at app startup to populate the TileRegistry.
 */
import { registerMany } from '../registry/index.js';
import { referenceTiles } from './referenceTileDefinitions.js';

let _registered = false;

/**
 * Registers all 12 reference tile definitions into the TileRegistry.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function registerReferenceTiles(): void {
  if (_registered) {
    return;
  }
  registerMany(referenceTiles);
  _registered = true;
}

/** @internal — test-only reset helper for registration flag */
export function _resetRegistrationFlagForTests(): void {
  _registered = false;
}

/**
 * TileRegistry — D-SF13-T03, D-01 (TileRegistry), D-05 (governance), D-06 (complexity)
 *
 * Map-based singleton registry for canvas tile definitions.
 */
import type { ICanvasTileDefinition } from '../types/index.js';

const _registry = new Map<string, ICanvasTileDefinition>();

/** Validates all 3 complexity variants are present — D-06 */
function validateVariants(tile: ICanvasTileDefinition): void {
  const { essential, standard, expert } = tile.component;
  if (!essential || !standard || !expert) {
    throw new Error(
      `[project-canvas] Tile "${tile.tileKey}" must provide essential, standard, and expert component variants.`,
    );
  }
}

/** Register a single tile — throws on duplicate key */
export function register(tile: ICanvasTileDefinition): void {
  if (_registry.has(tile.tileKey)) {
    throw new Error(
      `[project-canvas] Tile "${tile.tileKey}" is already registered. Duplicate registration is not allowed.`,
    );
  }
  validateVariants(tile);
  _registry.set(tile.tileKey, tile);
}

/** Register multiple tiles — D-01 batch registration */
export function registerMany(tiles: ICanvasTileDefinition[]): void {
  for (const tile of tiles) {
    register(tile);
  }
}

/** Get a single tile by key */
export function get(tileKey: string): ICanvasTileDefinition | undefined {
  return _registry.get(tileKey);
}

/** Get all registered tiles */
export function getAll(): ICanvasTileDefinition[] {
  return Array.from(_registry.values());
}

/** @internal — test-only clear helper */
export function _clearRegistryForTests(): void {
  _registry.clear();
}

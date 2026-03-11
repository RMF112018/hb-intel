/**
 * TileRegistry — D-SF13-T01, D-01 (TileRegistry)
 *
 * Stub registry for canvas tile definitions. Full implementation in T03.
 */
import type { ICanvasTileDefinition } from '../types/index.js';

/** Registers a tile definition in the global registry */
export function register(_definition: ICanvasTileDefinition): void {
  // Stub — T03 implementation
}

/** Returns all registered tile definitions */
export function getAll(): ICanvasTileDefinition[] {
  // Stub — T03 implementation
  return [];
}

/** Returns a single tile definition by key, or undefined if not registered */
export function get(_tileKey: string): ICanvasTileDefinition | undefined {
  // Stub — T03 implementation
  return undefined;
}

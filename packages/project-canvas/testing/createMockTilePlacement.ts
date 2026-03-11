/**
 * createMockTilePlacement — D-SF13-T01, D-10 (testing sub-path)
 *
 * Factory for mock ICanvasTilePlacement instances with Partial overrides.
 */
import type { ICanvasTilePlacement } from '../src/types/IProjectCanvas.js';

export function createMockTilePlacement(
  overrides: Partial<ICanvasTilePlacement> = {},
): ICanvasTilePlacement {
  return {
    tileKey: 'mock-tile',
    colStart: 1,
    colSpan: 4,
    rowStart: 1,
    rowSpan: 1,
    isLocked: false,
    ...overrides,
  };
}

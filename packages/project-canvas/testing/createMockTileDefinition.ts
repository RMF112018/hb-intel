/**
 * createMockTileDefinition — D-SF13-T01, D-10 (testing sub-path)
 *
 * Factory for mock ICanvasTileDefinition instances with Partial overrides.
 */
import React from 'react';
import type { ICanvasTileDefinition, ICanvasTileProps } from '../src/types/IProjectCanvas.js';

const LazyPlaceholder = React.lazy(
  () => Promise.resolve({ default: (_props: ICanvasTileProps) => null as unknown as React.ReactElement }),
);

export function createMockTileDefinition(
  overrides: Partial<ICanvasTileDefinition> = {},
): ICanvasTileDefinition {
  return {
    tileKey: 'mock-tile',
    title: 'Mock Tile',
    description: 'A mock tile for testing',
    defaultForRoles: ['Project Manager'],
    mandatory: false,
    component: {
      essential: LazyPlaceholder,
      standard: LazyPlaceholder,
      expert: LazyPlaceholder,
    },
    defaultColSpan: 4,
    defaultRowSpan: 1,
    lockable: false,
    ...overrides,
  };
}

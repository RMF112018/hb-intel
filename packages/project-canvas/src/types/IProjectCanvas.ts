/**
 * Project Canvas type contracts — D-SF13-T01, D-01 (TileRegistry), D-07 (SPFx constraints)
 *
 * Defines the core interfaces for the role-based configurable project dashboard canvas.
 * See PH7-SF-13 spec lines 72–124 for the authoritative contract.
 */
import type React from 'react';

/** Complexity tier governing tile variant selection */
export type ComplexityTier = 'essential' | 'standard' | 'expert';

/** Data-source badge displayed on each tile */
export type DataSourceBadge = 'Live' | 'Manual' | 'Hybrid';

/** Definition of a registerable canvas tile — D-01 TileRegistry */
export interface ICanvasTileDefinition {
  /** Unique tile identifier */
  tileKey: string;
  /** Display title */
  title: string;
  /** Description shown in tile catalog */
  description: string;
  /** Roles for which this tile appears in the default set */
  defaultForRoles: string[];
  /** Minimum complexity tier required */
  minComplexity?: ComplexityTier;
  /** Whether the tile is mandatory for the role (admin-controlled) */
  mandatory?: boolean;
  /** Tile component variants (Essential / Standard / Expert) */
  component: {
    essential: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
    standard: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
    expert: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  };
  /** Optional AI container registration */
  aiComponent?: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  /** Default size in a 12-column grid */
  defaultColSpan: 3 | 4 | 6 | 12;
  defaultRowSpan: 1 | 2;
  /** Whether admin can lock this tile (prevent user removal) */
  lockable: boolean;
}

/** Props passed to every rendered canvas tile */
export interface ICanvasTileProps {
  projectId: string;
  tileKey: string;
  isLocked?: boolean;
  dataSource?: DataSourceBadge;
}

/** Persisted per-user, per-project canvas configuration */
export interface ICanvasUserConfig {
  userId: string;
  projectId: string;
  /** Ordered list of tile placements */
  tiles: ICanvasTilePlacement[];
}

/** Grid placement of a single tile within the canvas */
export interface ICanvasTilePlacement {
  tileKey: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  isLocked?: boolean;
}

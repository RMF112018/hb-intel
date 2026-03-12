/**
 * Complexity gating integration adapter.
 *
 * Defines the contract for D-07 complexity-tier visibility gating
 * without importing @hbc/complexity directly.
 *
 * @design D-07, SF17-T07
 */

/** Complexity tiers governing Admin Intelligence surface visibility. */
export type AdminComplexityTier = 'essential' | 'standard' | 'expert';

/** Visibility flags controlled by complexity gating. */
export interface IAdminComplexityGating {
  /** Alert badge is visible. */
  readonly badgeVisible: boolean;
  /** Full alert dashboard is visible. */
  readonly dashboardVisible: boolean;
  /** Implementation truth panel is visible. */
  readonly truthVisible: boolean;
  /** Simulation/what-if controls are visible. */
  readonly simulationVisible: boolean;
}

/** Adapter interface for complexity gating resolution. */
export interface IAdminComplexityGatingAdapter {
  /** Resolve visibility flags for the given complexity tier. */
  resolveGating(tier: AdminComplexityTier): IAdminComplexityGating;
}

/**
 * Reference implementation of D-07 gating rules:
 * - essential: badge only
 * - standard: badge + dashboard
 * - expert: all surfaces visible
 */
export class ReferenceComplexityGatingAdapter implements IAdminComplexityGatingAdapter {
  resolveGating(tier: AdminComplexityTier): IAdminComplexityGating {
    switch (tier) {
      case 'essential':
        return {
          badgeVisible: true,
          dashboardVisible: false,
          truthVisible: false,
          simulationVisible: false,
        };
      case 'standard':
        return {
          badgeVisible: true,
          dashboardVisible: true,
          truthVisible: false,
          simulationVisible: false,
        };
      case 'expert':
        return {
          badgeVisible: true,
          dashboardVisible: true,
          truthVisible: true,
          simulationVisible: true,
        };
    }
  }
}

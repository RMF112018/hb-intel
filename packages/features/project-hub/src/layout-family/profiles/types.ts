/**
 * Project Hub Profile System — type contracts.
 *
 * Profiles are a governed selection layer on top of the three layout families.
 * Each profile configures a layout family with role-appropriate emphasis,
 * mandatory surfaces, and region collapse defaults — without duplicating
 * the underlying runtime implementation.
 *
 * Architecture:
 *   5 profile IDs → 3 layout families → 1 Project Hub runtime
 *
 * @see packages/features/project-hub/src/layout-family/types.ts (family contracts)
 * @see docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/ (wireframe specs)
 */

import type { ProjectHubLayoutFamily, ProjectHubRegionId } from '../types.js';

// ── Profile Identifiers ────────────────────────────────────────────

/**
 * The five canonical Project Hub profile IDs.
 *
 * - `hybrid-operating-layer`: Spec 01. Daily PM/PE work surface combining
 *   canvas tile grid with command rail module posture. Default for desktop
 *   project-manager and project-executive roles.
 *
 * - `canvas-first-operating-layer`: Spec 02. Canvas-dominant surface for
 *   roles that primarily manage tile-driven workflows (QA/QC, Safety).
 *   Right rail collapsed by default; canvas fills center.
 *
 * - `next-move-hub`: Spec 04. Action-oriented surface for field-adjacent
 *   roles on desktop (superintendent, field-engineer). Foregrounds work
 *   queue and next moves over canvas tiles.
 *
 * - `executive-cockpit`: Spec 05. Watchlist-driven health/risk intervention
 *   surface for portfolio executives and leadership.
 *
 * - `field-tablet-split-pane`: Spec 07. Location-first split-pane for
 *   tablet devices in field contexts. Touch-density, quick-action bar,
 *   sync-state prominence.
 */
export type ProjectHubProfileId =
  | 'hybrid-operating-layer'
  | 'canvas-first-operating-layer'
  | 'next-move-hub'
  | 'executive-cockpit'
  | 'field-tablet-split-pane';

// ── Device Classes ─────────────────────────────────────────────────

/**
 * Device class for profile resolution.
 * Maps from viewport/input detection to a governed category.
 */
export type ProjectHubDeviceClass =
  | 'desktop'
  | 'tablet'
  | 'narrow';

// ── Profile Roles ──────────────────────────────────────────────────

/**
 * Extended role set for profile resolution.
 * Adds field-oriented and domain-specific roles beyond the base layout roles.
 */
export type ProjectHubProfileRole =
  | 'project-manager'
  | 'project-executive'
  | 'portfolio-executive'
  | 'superintendent'
  | 'field-engineer'
  | 'leadership'
  | 'qa-qc'
  | 'safety-leadership';

// ── Region Collapse Configuration ──────────────────────────────────

/**
 * Per-region collapse override for a profile.
 * Overrides the layout family's default collapse state.
 */
export interface ProfileRegionCollapse {
  readonly region: ProjectHubRegionId;
  readonly defaultCollapsed: boolean;
}

// ── Profile Definition ─────────────────────────────────────────────

/**
 * Static definition of a Project Hub profile.
 *
 * A profile selects and configures a layout family without changing
 * the family's region structure. It controls:
 * - which layout family renders the shell
 * - which regions are collapsed by default
 * - which surfaces are mandatory (cannot be removed by user)
 * - which surfaces are optional (can be toggled)
 * - how the center region behaves (canvas-dominant vs action-dominant)
 */
export interface ProjectHubProfileDefinition {
  /** Canonical profile identifier. */
  readonly profileId: ProjectHubProfileId;
  /** Human-readable label. */
  readonly label: string;
  /** Short description for profile switcher UI. */
  readonly description: string;
  /** Wireframe spec reference. */
  readonly specRef: string;
  /** The layout family this profile configures. */
  readonly layoutFamily: ProjectHubLayoutFamily;
  /** Roles that can use this profile. */
  readonly supportedRoles: readonly ProjectHubProfileRole[];
  /** Device classes that can use this profile. */
  readonly supportedDeviceClasses: readonly ProjectHubDeviceClass[];
  /** Region collapse overrides (applied on top of family defaults). */
  readonly regionCollapseOverrides: readonly ProfileRegionCollapse[];
  /** Region IDs that the user cannot collapse or remove. */
  readonly mandatoryRegions: readonly ProjectHubRegionId[];
  /** Center region emphasis mode. */
  readonly centerEmphasis: 'canvas' | 'action-stack' | 'risk-canvas';
  /** Interaction posture hint for density/touch behavior. */
  readonly interactionPosture: 'desktop' | 'touch';
  /** Persistence version — increment to invalidate stale cached profile state. */
  readonly persistenceVersion: number;
}

// ── Resolution Contracts ───────────────────────────────────────────

/**
 * Inputs to the profile resolver.
 */
export interface ProjectHubProfileResolutionInput {
  readonly role: ProjectHubProfileRole;
  readonly deviceClass: ProjectHubDeviceClass;
  /** User's persisted profile preference (may be rejected by policy). */
  readonly userOverride?: ProjectHubProfileId | null;
}

/**
 * Result of profile resolution.
 */
export interface ProjectHubProfileResolutionResult {
  readonly profileId: ProjectHubProfileId;
  readonly definition: ProjectHubProfileDefinition;
  /** The underlying layout family selected by this profile. */
  readonly layoutFamily: ProjectHubLayoutFamily;
  /** True when the user's override was rejected by governance. */
  readonly overrideRejected: boolean;
  /** Reason the override was rejected, if applicable. */
  readonly overrideRejectionReason?: string;
}

// ── Persistence Contracts ──────────────────────────────────────────

/**
 * Persisted profile preference.
 * Keyed by userId + deviceClass to prevent collisions.
 */
export interface ProjectHubProfilePreference {
  readonly userId: string;
  readonly deviceClass: ProjectHubDeviceClass;
  readonly profileId: ProjectHubProfileId;
  readonly persistenceVersion: number;
  readonly savedAt: string;
}

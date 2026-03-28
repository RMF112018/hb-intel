/**
 * Project Hub Profile Registry — static definitions for all 5 canonical profiles.
 *
 * Each profile configures one of the 3 layout families with role-appropriate
 * emphasis, region collapse defaults, and mandatory surfaces.
 *
 * Architecture: 5 profiles → 3 layout families → 1 Project Hub runtime.
 */

import type { ProjectHubProfileDefinition, ProjectHubProfileId } from './types.js';

// ── Profile Definitions ────────────────────────────────────────────

export const HYBRID_OPERATING_LAYER: ProjectHubProfileDefinition = {
  profileId: 'hybrid-operating-layer',
  label: 'Hybrid Operating Layer',
  description:
    'Daily work surface combining canvas tiles with command rail module posture. ' +
    'Both rails open by default for full operational visibility.',
  specRef: '01_Project_Hub_Hybrid_Operating_Layer_Wireframe_Spec.md',
  layoutFamily: 'project-operating',
  supportedRoles: ['project-manager', 'project-executive', 'superintendent'],
  supportedDeviceClasses: ['desktop'],
  regionCollapseOverrides: [
    { region: 'left', defaultCollapsed: false },
    { region: 'right', defaultCollapsed: false },
    { region: 'bottom', defaultCollapsed: true },
  ],
  mandatoryRegions: ['header', 'center', 'left'],
  centerEmphasis: 'canvas',
  interactionPosture: 'desktop',
  persistenceVersion: 1,
};

export const CANVAS_FIRST_OPERATING_LAYER: ProjectHubProfileDefinition = {
  profileId: 'canvas-first-operating-layer',
  label: 'Canvas-First Operating Layer',
  description:
    'Canvas-dominant surface for tile-driven workflows. ' +
    'Right rail collapsed by default to maximize canvas area.',
  specRef: '02_Project_Hub_Canvas_First_Operating_Layer_Wireframe_Spec.md',
  layoutFamily: 'project-operating',
  supportedRoles: ['project-manager', 'project-executive', 'qa-qc', 'safety-leadership'],
  supportedDeviceClasses: ['desktop', 'tablet', 'narrow'],
  regionCollapseOverrides: [
    { region: 'left', defaultCollapsed: true },
    { region: 'right', defaultCollapsed: true },
    { region: 'bottom', defaultCollapsed: true },
  ],
  mandatoryRegions: ['header', 'center'],
  centerEmphasis: 'canvas',
  interactionPosture: 'desktop',
  persistenceVersion: 1,
};

export const NEXT_MOVE_HUB: ProjectHubProfileDefinition = {
  profileId: 'next-move-hub',
  label: 'Next Move Hub',
  description:
    'Action-oriented surface foregrounding work queue and next moves. ' +
    'Right rail open by default showing immediate actions.',
  specRef: '04_Project_Hub_Next_Move_Hub_Wireframe_Spec.md',
  layoutFamily: 'project-operating',
  supportedRoles: ['superintendent', 'field-engineer', 'qa-qc'],
  supportedDeviceClasses: ['desktop', 'narrow'],
  regionCollapseOverrides: [
    { region: 'left', defaultCollapsed: true },
    { region: 'right', defaultCollapsed: false },
    { region: 'bottom', defaultCollapsed: false },
  ],
  mandatoryRegions: ['header', 'center', 'right'],
  centerEmphasis: 'canvas',
  interactionPosture: 'desktop',
  persistenceVersion: 1,
};

export const EXECUTIVE_COCKPIT: ProjectHubProfileDefinition = {
  profileId: 'executive-cockpit',
  label: 'Executive Cockpit',
  description:
    'Watchlist-driven health and risk intervention surface for leadership. ' +
    'Multi-zone risk canvas with intervention rail.',
  specRef: '05_Project_Hub_Health_Risk_Executive_Cockpit_Wireframe_Spec.md',
  layoutFamily: 'executive',
  supportedRoles: ['portfolio-executive', 'leadership'],
  supportedDeviceClasses: ['desktop', 'tablet'],
  regionCollapseOverrides: [
    { region: 'left', defaultCollapsed: false },
    { region: 'right', defaultCollapsed: false },
    { region: 'bottom', defaultCollapsed: true },
  ],
  mandatoryRegions: ['header', 'center', 'left', 'right'],
  centerEmphasis: 'risk-canvas',
  interactionPosture: 'desktop',
  persistenceVersion: 1,
};

export const FIELD_TABLET_SPLIT_PANE: ProjectHubProfileDefinition = {
  profileId: 'field-tablet-split-pane',
  label: 'Field Tablet Split-Pane',
  description:
    'Location-first field surface with split-pane area/action stack. ' +
    'Touch-density defaults and always-visible quick-action bar.',
  specRef: '07_Project_Hub_Field_Tablet_Split_Pane_Hub_Wireframe_Spec.md',
  layoutFamily: 'field-tablet',
  supportedRoles: ['superintendent', 'field-engineer', 'qa-qc', 'safety-leadership'],
  supportedDeviceClasses: ['tablet'],
  regionCollapseOverrides: [],
  mandatoryRegions: ['header', 'left', 'center', 'bottom'],
  centerEmphasis: 'action-stack',
  interactionPosture: 'touch',
  persistenceVersion: 1,
};

// ── Registry ───────────────────────────────────────────────────────

/**
 * The governed set of Project Hub profiles.
 * This is the single source of truth for which profiles exist.
 */
export const PROJECT_HUB_PROFILE_REGISTRY: Readonly<
  Record<ProjectHubProfileId, ProjectHubProfileDefinition>
> = {
  'hybrid-operating-layer': HYBRID_OPERATING_LAYER,
  'canvas-first-operating-layer': CANVAS_FIRST_OPERATING_LAYER,
  'next-move-hub': NEXT_MOVE_HUB,
  'executive-cockpit': EXECUTIVE_COCKPIT,
  'field-tablet-split-pane': FIELD_TABLET_SPLIT_PANE,
};

/**
 * Ordered list of all governed profile IDs.
 */
export const PROJECT_HUB_PROFILE_IDS: readonly ProjectHubProfileId[] = [
  'hybrid-operating-layer',
  'canvas-first-operating-layer',
  'next-move-hub',
  'executive-cockpit',
  'field-tablet-split-pane',
];

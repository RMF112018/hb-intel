/**
 * Project Hub Layout Family — static definitions.
 *
 * Defines the three governed layout families and their region contracts.
 * These definitions are consumed by the resolver and by layout components
 * to determine which regions to render.
 */

import type { ProjectHubLayoutFamily, ProjectHubLayoutFamilyDefinition } from './types.js';

// ── Family Definitions ──────────────────────────────────────────────

/**
 * project-operating: Merges wireframe specs 02 (Canvas-First) and
 * 03 (Control Center + Command Rail) into a single governed family.
 *
 * Why merged:
 * - Both target the same role set (PM, PE, Superintendent).
 * - Both live at the same canonical route (/project-hub/{projectId}).
 * - They differ only in layout emphasis: 02 foregrounds the canvas tile
 *   grid while 03 foregrounds the command rail with module posture.
 *   These are presentation modes of the same operating surface, not
 *   independent page architectures.
 *
 * Regions: header (project context), left (command rail), center
 * (canvas or control center), right (context rail), bottom (activity strip).
 */
export const PROJECT_OPERATING_DEFINITION: ProjectHubLayoutFamilyDefinition = {
  family: 'project-operating',
  label: 'Project Operating Surface',
  description:
    'Daily work surface for PM, PE, and Superintendent. ' +
    'Combines canvas tile grid with command rail module posture.',
  regions: [
    { region: 'header', role: 'project-context', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'left', role: 'command-rail', required: false, collapsible: true, defaultCollapsed: false },
    { region: 'center', role: 'canvas', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'right', role: 'context-rail', required: false, collapsible: true, defaultCollapsed: true },
    { region: 'bottom', role: 'activity-strip', required: false, collapsible: true, defaultCollapsed: true },
  ],
};

/**
 * executive: Wireframe spec 05 (Health/Risk Executive Cockpit).
 *
 * Why separate:
 * - Targets a distinct role set (Portfolio Executive, Leadership).
 * - Oriented toward watchlist-driven intervention, not daily operational work.
 * - The left region is a watchlist (projects/signals), not a module nav.
 * - The right region is an intervention rail (escalate/assign), not
 *   a context/related-items rail.
 * - The center is a multi-zone risk canvas, not a working surface.
 */
export const EXECUTIVE_DEFINITION: ProjectHubLayoutFamilyDefinition = {
  family: 'executive',
  label: 'Executive Cockpit',
  description:
    'Leadership intervention surface. Watchlist-driven health assessment ' +
    'and risk intervention across projects.',
  regions: [
    { region: 'header', role: 'project-context', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'left', role: 'watchlist', required: false, collapsible: true, defaultCollapsed: false },
    { region: 'center', role: 'risk-canvas', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'right', role: 'intervention-rail', required: false, collapsible: true, defaultCollapsed: false },
    { region: 'bottom', role: 'trend-zone', required: false, collapsible: true, defaultCollapsed: true },
  ],
};

/**
 * field-tablet: Wireframe spec 07 (Field Tablet Split-Pane Hub).
 *
 * Why separate:
 * - Location-first paradigm vs. module-first or watchlist-first.
 * - Requires touch-density defaults, always-visible quick-action bar,
 *   and sync-state prominence — fundamentally different interaction model.
 * - The left region is an area/sheet pane, not module nav or watchlist.
 * - The bottom region is a quick-action bar, not a timeline.
 */
export const FIELD_TABLET_DEFINITION: ProjectHubLayoutFamilyDefinition = {
  family: 'field-tablet',
  label: 'Field Tablet Hub',
  description:
    'Location-first field surface. Split-pane with area/sheet context ' +
    'driving an action stack. Touch-density defaults.',
  regions: [
    { region: 'header', role: 'project-context', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'left', role: 'area-sheet', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'center', role: 'action-stack', required: true, collapsible: false, defaultCollapsed: false },
    { region: 'right', role: 'action-stack', required: false, collapsible: true, defaultCollapsed: true },
    { region: 'bottom', role: 'quick-action-bar', required: true, collapsible: false, defaultCollapsed: false },
  ],
};

// ── Registry ────────────────────────────────────────────────────────

/**
 * Layout family registry — the governed set.
 * This is the single source of truth for which families exist.
 * Adding a new family requires architecture review.
 */
export const PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS: Readonly<
  Record<ProjectHubLayoutFamily, ProjectHubLayoutFamilyDefinition>
> = {
  'project-operating': PROJECT_OPERATING_DEFINITION,
  'executive': EXECUTIVE_DEFINITION,
  'field-tablet': FIELD_TABLET_DEFINITION,
};

/**
 * Ordered list of all governed families.
 */
export const PROJECT_HUB_LAYOUT_FAMILIES: readonly ProjectHubLayoutFamily[] = [
  'project-operating',
  'executive',
  'field-tablet',
];

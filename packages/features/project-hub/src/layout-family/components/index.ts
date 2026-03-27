/**
 * Project Hub Layout Family — domain-owned components.
 *
 * Orchestrators (thin wrappers over @hbc/ui-kit layout primitives):
 *   - ProjectOperatingSurface
 *   - ExecutiveCockpitSurface
 *   - FieldTabletSurface
 *
 * PH-domain components (not extracted to ui-kit):
 *   - CanvasCenter (module preview rendering)
 *   - WatchlistPanel (executive watchlist signals)
 *   - RiskExposureCanvas (5-zone risk display)
 *   - InterventionRail (executive intervention cards)
 *   - FieldFocusRail (field work area selection)
 *   - FieldActionStack (field categorized action cards)
 */

// Orchestrators
export { ProjectOperatingSurface } from './ProjectOperatingSurface.js';
export type { ProjectOperatingSurfaceProps } from './ProjectOperatingSurface.js';
export { ExecutiveCockpitSurface } from './ExecutiveCockpitSurface.js';
export type { ExecutiveCockpitSurfaceProps } from './ExecutiveCockpitSurface.js';
export { FieldTabletSurface } from './FieldTabletSurface.js';
export type { FieldTabletSurfaceProps } from './FieldTabletSurface.js';

// PH-domain components
export { CanvasCenter } from './CanvasCenter.js';
export type { CanvasCenterProps } from './CanvasCenter.js';
export { WatchlistPanel } from './WatchlistPanel.js';
export type { WatchlistPanelProps } from './WatchlistPanel.js';
export { RiskExposureCanvas } from './RiskExposureCanvas.js';
export type { RiskExposureCanvasProps } from './RiskExposureCanvas.js';
export { InterventionRail } from './InterventionRail.js';
export type { InterventionRailProps } from './InterventionRail.js';
export { FieldFocusRail } from './FieldFocusRail.js';
export type { FieldFocusRailProps } from './FieldFocusRail.js';
export { FieldActionStack } from './FieldActionStack.js';
export type { FieldActionStackProps } from './FieldActionStack.js';

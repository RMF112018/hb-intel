// =============================================================================
// HB Homepage shell — public export surface
// -----------------------------------------------------------------------------
// Everything exported from this barrel is shell-owned API intended for the
// shell orchestrator, shell tests, shell harnesses, and a future governed
// HB Homepage control panel. Consumers should never re-export shell internals
// from a child zone or feature package.
//
// Shell-owned concerns surfaced here: layout types and schema, occupant
// registry, breakpoint policy, protected decisions, approved preset library,
// validation and normalization, persistence sanitization, container sizing,
// and slot-comfort resolution. The shell does not expose child-module
// internals; it only exposes the governance surface a shell consumer needs.
//
// See `../hbHomepageContract.ts` for the authoritative shell-vs-child
// ownership boundary. See `./protectedDecisions.ts` for the non-negotiable
// decisions a control panel may not override.
// =============================================================================

export type {
  BandSemanticRole,
  ColumnSpan,
  DiagnosticSeverity,
  DominanceRule,
  ModuleConfigSlices,
  OccupantComfort,
  OccupantDescriptor,
  OccupantId,
  OccupantStatus,
  ProminenceCeiling,
  RendererContext,
  ShellBand,
  ShellDiagnostic,
  ShellEntryState,
  ShellEntryStateId,
  ShellLayoutInput,
  ShellLayoutState,
  ShellPreset,
  ShellProtectedDecisions,
  ShellSlot,
  SlotRole,
} from './shellTypes.js';

export {
  OCCUPANT_REGISTRY,
  areOccupantsPairableInBand,
  canOccupantPairAtWidth,
  getActiveOccupants,
  getFirstLaneEligibleOccupants,
  getOccupant,
  isOccupantAllowedInSlot,
} from './occupantRegistry.js';

export {
  SHELL_ENTRY_STATES,
  SHORT_HEIGHT_THRESHOLD_PX,
  getEntryState,
  isFirstLanePairingAllowed,
  resolveEntryState,
  resolveEntryStateWithReason,
} from './breakpointPolicy.js';
export type {
  ContainerDimensions,
  EntryStateSelectionReason,
  ResolvedEntryState,
} from './breakpointPolicy.js';

export {
  CONFIGURABLE_DECISIONS,
  PROTECTED_ENTRY_STATE_RULES,
  SHELL_PROTECTED_DECISIONS,
  isConfigurableDecision,
  isProtectedEntryStateRule,
} from './protectedDecisions.js';
export type { ConfigurableDecision, ProtectedEntryStateRule } from './protectedDecisions.js';

export {
  CONFIGURABLE_ENTRY_STACK_REFERENCES,
  ENTRY_STACK_POLICY_BY_ENTRY_STATE,
  PROTECTED_ENTRY_STACK_RULES,
  getEntryStackPolicy,
  isHeroHeightWithinBudget,
  isVisibleActionCountWithinBudget,
  resolveEntryStackPolicy,
} from './entryStackPolicy.js';
export type {
  ConfigurableEntryStackReference,
  CountBudgetRange,
  EntryStackPolicy,
  EntryStackSpacingBudget,
  FirstLaneFirstViewExpectation,
  OverflowPosture,
  PixelBudgetRange,
  ProtectedEntryStackRule,
  ShortHeightPosture,
} from './entryStackPolicy.js';

export { DEFAULT_PRESET } from './defaultPreset.js';

export {
  APPROVED_PRESETS,
  EDITORIAL_FOCUS_PRESET,
  getPreset,
  getPresetOrDefault,
} from './presetLibrary.js';

export {
  PersistedShellStateSchema,
  applyOccupantVisibility,
  createDefaultPersistedState,
  hydratePersistedState,
  serializeShellState,
} from './shellPersistence.js';
export type { PersistedShellState } from './shellPersistence.js';

export {
  extractModuleConfigSlices,
  parseShellLayout,
  validatePresetStructure,
} from './shellValidation.js';

export { useShellContainer } from './useShellContainer.js';
export type { ShellContainerState } from './useShellContainer.js';

export {
  SHELL_BREAKPOINT_MATRIX,
  runShellConformanceMatrix,
  runShellHarnessCase,
  runShellHarnessMatrix,
  summarizeHarnessProof,
} from './shellHarness.js';
export type {
  ShellBreakpointMatrixCase,
  ShellBreakpointMatrixOutcome,
  ShellConformanceMatrixOutcome,
  ShellHarnessBandProof,
  ShellHarnessInput,
  ShellHarnessProof,
  ShellHarnessSlotProof,
} from './shellHarness.js';

export {
  resolveShellConformance,
  toShellConformanceDataAttributes,
} from './shellConformance.js';
export type {
  BandConformance,
  ShellConformanceDataAttributes,
  ShellConformanceInput,
  ShellConformanceReport,
  ShellLayoutMode,
  SlotConformance,
  SlotConformanceState,
} from './shellConformance.js';

export { resolveBandLayout } from './slotComfortResolver.js';
export type {
  BandLayoutResult,
  PairingDecision,
  PairingDecisionReason,
  ResolvedSlot,
  SlotComfortResult,
} from './slotComfortResolver.js';

export {
  BandSemanticRoleSchema,
  ColumnSpanSchema,
  ModuleConfigSlicesSchema,
  OccupantIdSchema,
  ShellBandSchema,
  ShellLayoutInputSchema,
  ShellPresetSchema,
  ShellSlotSchema,
  SlotRoleSchema,
} from './shellSchema.js';

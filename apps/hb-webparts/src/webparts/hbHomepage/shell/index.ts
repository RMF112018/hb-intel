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
  getEntryState,
  isFirstLanePairingAllowed,
  resolveEntryState,
} from './breakpointPolicy.js';
export type { ContainerDimensions } from './breakpointPolicy.js';

export {
  CONFIGURABLE_DECISIONS,
  PROTECTED_ENTRY_STATE_RULES,
  SHELL_PROTECTED_DECISIONS,
  isConfigurableDecision,
  isProtectedEntryStateRule,
} from './protectedDecisions.js';
export type { ConfigurableDecision, ProtectedEntryStateRule } from './protectedDecisions.js';

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

export { resolveBandLayout } from './slotComfortResolver.js';
export type { SlotComfortResult, BandLayoutResult, ResolvedSlot } from './slotComfortResolver.js';

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

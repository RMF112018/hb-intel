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
  getActiveOccupants,
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

export { SHELL_PROTECTED_DECISIONS } from './protectedDecisions.js';

export { DEFAULT_PRESET } from './defaultPreset.js';

export {
  extractModuleConfigSlices,
  parseShellLayout,
  validatePresetStructure,
} from './shellValidation.js';

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

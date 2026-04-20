import type { HomepageIdentityInput } from '../../../homepage/helpers/identity.js';
import type { ProfilePhotoResolver } from '../../../homepage/helpers/peopleCultureSplitModel.js';

// ---------------------------------------------------------------------------
// Occupant identity
// ---------------------------------------------------------------------------

export type OccupantId =
  | 'company-pulse'
  | 'leadership-message'
  | 'project-portfolio-spotlight'
  | 'people-culture-public'
  | 'hb-kudos'
  | 'safety-field-excellence';

export type OccupantStatus = 'active' | 'inactive-candidate';

// ---------------------------------------------------------------------------
// Slot & band primitives
// ---------------------------------------------------------------------------

export type SlotRole = 'primary' | 'secondary' | 'compact';

export type ColumnSpan = 'full' | 'major' | 'minor';

export type BandSemanticRole =
  | 'communications-newsroom'
  | 'communications-editorial'
  | 'operational-spotlight'
  | 'people-culture'
  | 'recognition';

export type ShellBandRecipeId =
  | 'feature-pair'
  | 'balanced-two-up'
  | 'asymmetric-two-up'
  | 'feature-utility-strip'
  | 'stacked-full'
  | 'stacked-secondary-strip'
  | 'single-column-fallback';

export interface ShellSlot {
  readonly id: string;
  readonly occupantId: OccupantId | null;
  readonly role: SlotRole;
  readonly columnSpan: ColumnSpan;
}

export type BandOrientation = 'left-dominant' | 'right-dominant';

export interface ShellBand {
  readonly id: string;
  readonly semanticRole: BandSemanticRole;
  readonly recipe: ShellBandRecipeId;
  readonly slots: readonly ShellSlot[];
  readonly maxDominantOccupants: number;
  /**
   * Preset-declared handedness for paired bands. `undefined` is treated as
   * `left-dominant` by downstream consumers. Ignored for `stacked-full` bands.
   */
  readonly orientation?: BandOrientation;
}

/**
 * Resolve the effective orientation for a band. Paired bands default to
 * `left-dominant`; stacked-full bands report `left-dominant` as a stable
 * default (CSS ignores orientation on single-column bands).
 */
export function effectiveBandOrientation(band: ShellBand): BandOrientation {
  return band.orientation ?? 'left-dominant';
}

export interface ShellPreset {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly bands: readonly ShellBand[];
}

// ---------------------------------------------------------------------------
// Occupant descriptor
// ---------------------------------------------------------------------------

export type ProminenceCeiling = 'anchor' | 'supporting' | 'contextual';

export interface OccupantComfort {
  readonly minWidth: number;
  readonly preferredWidth: number;
  readonly narrowestStablePairedWidth: number;
  readonly supportsCompact: boolean;
  readonly supportsStandard: boolean;
  readonly supportsSummaryCollapse: boolean;
}

export type HostedShellFitMode = 'standard' | 'compact' | 'summary-collapsed';
export type HostedShellFitFallback = 'force-stack' | 'deny-pairing' | 'deny-recipe';

export interface HostedShellFitContract {
  /** Narrowest width where the occupant remains stable in shell-managed contexts. */
  readonly narrowestStableShellWidth: number;
  /** Narrowest slot width where paired placement remains stable. */
  readonly narrowestStablePairedWidth: number;
  /** Shell-fit modes this hosted surface can safely honor. */
  readonly supportedModes: readonly HostedShellFitMode[];
  /** Whether this surface may participate in paired layouts. */
  readonly pairedLayoutEligible: boolean;
  /** Shell-mandated fallback posture when the fit contract is violated. */
  readonly fallbackWhenUnsafe: HostedShellFitFallback;
  /** Protected fit constraints that shell resolvers must preserve. */
  readonly protectedConstraints: readonly string[];
}

export type ReorderDomain = 'locked' | 'within-band' | 'within-compatible-bands';

export interface VisibilityEligibility {
  readonly removable: boolean;
  readonly hideableByMaintainer: boolean;
}

/**
 * Inspectable anchor metadata: which target row and slot this occupant
 * is authored to occupy under the locked three-row composition. Present
 * on every active occupant after Wave-01 Prompt-03. Informational — the
 * runtime enforcement is `SHELL_PROTECTED_DECISIONS.protectedRowPairings`.
 */
export interface OccupantLockedRow {
  readonly bandSemanticRole: BandSemanticRole;
  readonly role: SlotRole;
}

export interface OccupantDescriptor {
  readonly id: OccupantId;
  readonly status: OccupantStatus;
  readonly displayName: string;
  readonly renderKey: string;
  readonly allowedSlotRoles: readonly SlotRole[];
  readonly prominenceCeiling: ProminenceCeiling;
  readonly firstLaneEligible: boolean;
  /** Lower value means higher promotion priority in first-lane resolver. */
  readonly firstLanePromotionRank: number;
  readonly comfort: OccupantComfort;
  readonly pairingRestrictions?: readonly OccupantId[];
  readonly allowedBandSemantics: readonly BandSemanticRole[];
  readonly shellFit: HostedShellFitContract;
  readonly reorderDomain: ReorderDomain;
  readonly visibilityEligibility: VisibilityEligibility;
  readonly persistedPolicyKeys: readonly string[];
  /** Target-row anchor metadata. Optional for back-compat with synthetic
   *  test descriptors, but every production occupant publishes one. */
  readonly lockedToRow?: OccupantLockedRow;
}

// ---------------------------------------------------------------------------
// Governance taxonomy
// ---------------------------------------------------------------------------

export type GovernanceCategory =
  | 'protected'
  | 'bounded-configurable'
  | 'descriptive'
  | 'shell-fit';

// ---------------------------------------------------------------------------
// Entry-state breakpoint policy
// ---------------------------------------------------------------------------

export type ShellEntryStateId =
  | 'ultrawide-desktop'
  | 'standard-laptop'
  | 'tablet-landscape'
  | 'tablet-portrait-large'
  | 'tablet-portrait'
  | 'phone-portrait'
  | 'phone-landscape';

export type DominanceRule = 'left-dominant' | 'equal' | 'single';

export interface ShellEntryState {
  readonly id: ShellEntryStateId;
  readonly label: string;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly firstLaneColumns: 1 | 2;
  readonly firstLanePairingAllowed: boolean;
  readonly dominanceRule: DominanceRule;
}

// ---------------------------------------------------------------------------
// Protected decisions
// ---------------------------------------------------------------------------

/**
 * A code-governed row pairing. Captures the target composition for one
 * of the three flagship rows below the launcher so validation can catch
 * silent drift (wrong occupants, wrong handedness, missing row).
 */
export interface ProtectedRowPairing {
  readonly rowKey: 'row-1' | 'row-2' | 'row-3';
  readonly bandSemanticRole: BandSemanticRole;
  readonly primaryOccupantId: OccupantId;
  readonly secondaryOccupantId: OccupantId;
  readonly orientation: BandOrientation;
}

export interface ShellProtectedDecisions {
  readonly postHeroBoundary: true;
  readonly maxDominantPerBand: number;
  readonly prohibitedPairings: ReadonlyArray<readonly [OccupantId, OccupantId]>;
  readonly protectedBandSemantics: readonly BandSemanticRole[];
  readonly protectedRowPairings: readonly ProtectedRowPairing[];
}

// ---------------------------------------------------------------------------
// Validation diagnostics
// ---------------------------------------------------------------------------

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface ShellDiagnostic {
  readonly severity: DiagnosticSeverity;
  readonly code: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// Validated shell layout state (output of parse/validate pipeline)
// ---------------------------------------------------------------------------

export interface ShellLayoutState {
  readonly preset: ShellPreset;
  readonly diagnostics: readonly ShellDiagnostic[];
  readonly normalizedFromDefault: boolean;
}

// ---------------------------------------------------------------------------
// Contract separation: renderer context vs module config vs layout
// ---------------------------------------------------------------------------

export interface RendererContext {
  readonly identity?: HomepageIdentityInput;
  readonly assetBaseUrl?: string;
  readonly siteUrl?: string;
  readonly getGraphToken?: () => Promise<string>;
  readonly getApiToken?: () => Promise<string>;
  readonly profilePhotoResolver?: ProfilePhotoResolver;
  readonly kudosListHostUrl?: string;
}

export interface ModuleConfigSlices {
  readonly companyPulse?: Record<string, unknown>;
  readonly leadershipMessage?: Record<string, unknown>;
  readonly projectPortfolioSpotlight?: Record<string, unknown>;
  readonly peopleCulturePublic?: Record<string, unknown>;
  readonly hbKudos?: Record<string, unknown>;
  readonly safetyFieldExcellence?: Record<string, unknown>;
  readonly activeAudience?: string;
}

export interface ShellLayoutInput {
  readonly presetId?: string;
  readonly bandOverrides?: ReadonlyArray<{
    readonly bandId: string;
    readonly slots?: ReadonlyArray<{
      readonly slotId: string;
      readonly occupantId?: string;
      readonly role?: string;
      readonly columnSpan?: string;
    }>;
  }>;
}

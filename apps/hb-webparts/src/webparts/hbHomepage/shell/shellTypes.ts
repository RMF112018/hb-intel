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

export interface ShellSlot {
  readonly id: string;
  readonly occupantId: OccupantId | null;
  readonly role: SlotRole;
  readonly columnSpan: ColumnSpan;
}

export interface ShellBand {
  readonly id: string;
  readonly semanticRole: BandSemanticRole;
  readonly slots: readonly ShellSlot[];
  readonly maxDominantOccupants: number;
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

export interface OccupantDescriptor {
  readonly id: OccupantId;
  readonly status: OccupantStatus;
  readonly displayName: string;
  readonly renderKey: string;
  readonly allowedSlotRoles: readonly SlotRole[];
  readonly prominenceCeiling: ProminenceCeiling;
  readonly firstLaneEligible: boolean;
  readonly comfort: OccupantComfort;
  readonly pairingRestrictions?: readonly OccupantId[];
}

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

export interface ShellProtectedDecisions {
  readonly postHeroBoundary: true;
  readonly maxDominantPerBand: number;
  readonly prohibitedPairings: ReadonlyArray<readonly [OccupantId, OccupantId]>;
  readonly protectedBandSemantics: readonly BandSemanticRole[];
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

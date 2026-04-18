import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { ProfilePhotoResolver } from '../../homepage/helpers/peopleCultureSplitModel.js';
import type { ModuleConfigSlices, RendererContext, ShellLayoutInput } from './shell/shellTypes.js';
import type {
  HbHomepageWrapperConfig,
  HbHomepageWrapperRailConfig,
} from './hbHomepageWrapperConfig.js';

export type { ModuleConfigSlices, RendererContext, ShellLayoutInput };
// Re-export wrapper-facing integration types. These describe composition
// inputs the homepage wrapper owns (e.g. embedded rail enablement, bandKey,
// audience propagation). They are intentionally disjoint from
// `ModuleConfigSlices`, which stays shell-semantic.
export type { HbHomepageWrapperConfig, HbHomepageWrapperRailConfig };

// =============================================================================
// HB Homepage wrapper + shell — authoritative ownership boundary (contract)
// -----------------------------------------------------------------------------
// This contract layer is the single canonical place in code that names what
// the HB Homepage wrapper owns, what the HB Homepage shell owns, and what
// each must NOT own. If another document or comment disagrees with the
// statements below, treat this file as the source of truth and update the
// other source.
//
// Flagship homepage runtime composition (post-hero):
//   1. `HbHomepage` wrapper — composition layer owned by this package
//      (see `HbHomepageEntryStack`). Renders a wrapper-owned pre-shell
//      region that embeds `PriorityActionsRail` as a React surface. The
//      embedded rail is NOT a shell occupant, preset slot, or band
//      member. Wrapper-facing integration config lives in
//      `hbHomepageWrapperConfig.ts` and is intentionally disjoint from
//      shell `ModuleConfigSlices`.
//   2. `HbHomepageShell` — post-actions operating layer. Receives
//      `HbHomepageProps` and renders a bounded set of child zones. It
//      is strictly an orchestration layer, not a module remediation
//      layer.
//
// The shell never becomes a command-band host. The standalone
// `PriorityActionsRail` webpart remains independently mountable for
// non-flagship hosts; on the flagship page it is composed by the
// wrapper rather than dispatched separately through `mount.tsx`.
//
// Shell-owned responsibilities (code-governed in this package):
//   - placement: which occupants sit in which bands and slots
//   - layout governance: band composition, column spans, band order
//   - breakpoint governance: entry-state resolution, container-aware sizing,
//     short-height handling, first-lane column rules
//   - pairing / stacking decisions: when occupants may share a row, and when
//     they must stack for comfort or comply with prohibited pairings
//   - preset governance: the approved preset library, preset selection,
//     and preset fallback behavior
//   - normalization and diagnostics: schema validation, override sanitization,
//     persisted-state hydration, and developer-visible diagnostics
//   - shell-facing entry-stack policy integration: how the hero, priority
//     actions, and the first shell lane relate as a governed first screen
//
// Child-owned responsibilities (explicitly NOT shell concerns):
//   - module-specific UI redesign inside any zone or webpart
//   - module-specific data model redesign inside any zone or webpart
//   - child interaction-pattern overhauls inside a zone
//   - child data-fetching strategies, caching, or authentication choices
//   - child-surface parity work, accessibility polish inside a zone body,
//     or visual theming inside a zone body
// The shell must never solve a fit problem by reaching into a child module
// and redesigning its internals. If a child cannot fit at a given width,
// the shell stacks, reflows, or falls back — it does not mutate the child.
//
// Post-hero boundary (invariant):
//   The wrapper begins immediately after the hero. Hero composition and
//   hero-internal behavior are the hero webpart's responsibility. The
//   wrapper renders the actions region, then the shell. The shell does
//   not own hero visuals or the actions region; it owns how its first
//   lane relates to the hero+actions through the entry-stack policy
//   contract.
//
// Control-panel boundary (future-readiness):
//   A future HB Homepage control panel is bounded to the configurable
//   decisions declared in `shell/protectedDecisions.ts` (see
//   `CONFIGURABLE_DECISIONS`). It must never become a freeform page editor.
//   Decisions listed in `SHELL_PROTECTED_DECISIONS` and
//   `PROTECTED_ENTRY_STATE_RULES` are non-negotiable and code-governed.
// =============================================================================

export const HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf';
/**
 * Wrapper-owned outer page-canvas envelope budget for the flagship homepage.
 * This numeric contract is consumed by `HbHomepageEntryStack` and surfaced as
 * an inspectable data attribute/CSS variable seam so outer-envelope authority
 * is explicit in code.
 */
export const HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX = 2200;
/**
 * Stable id for the wrapper-owned outer-envelope containment contract.
 * Both wrapper actions strip and shell region must reference this id so the
 * shared page-canvas containment relationship is inspectable at runtime.
 */
export const HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID =
  'hb-homepage-wrapper-outer-envelope-v1' as const;

// ---------------------------------------------------------------------------
// External props — what mount.tsx passes in.
// `config` remains Record<string, unknown> for backward compatibility;
// the shell validation layer parses it into ModuleConfigSlices + ShellLayoutInput.
// ---------------------------------------------------------------------------

export interface HbHomepageProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  getApiToken?: () => Promise<string>;
  kudosListHostUrl?: string;
}

// ---------------------------------------------------------------------------
// Zone props — what each zone wrapper receives from the shell.
// Config is now typed as ModuleConfigSlices instead of Record<string, unknown>.
// ---------------------------------------------------------------------------

export interface HbHomepageZoneProps {
  moduleConfig: ModuleConfigSlices;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  profilePhotoResolver?: ProfilePhotoResolver;
  kudosListHostUrl?: string;
}

/**
 * kudosRuntimeContract — HB Kudos split-runtime containment contract.
 *
 * Phase-21 Wave 4 drift-risk reduction. The HB Kudos product ships
 * two separate SharePoint webparts sharing one local product layer:
 *
 *   1. The employee-facing public surface (`HbKudos`).
 *   2. The HR Approval Companion (`HbKudosCompanion`).
 *
 * Historically the split was implicit: the webpart IDs, the mount-map
 * entries, and the runtime components referenced the IDs as inline
 * string literals. Any drift (renamed manifest, mis-pasted GUID, new
 * adjacency) was invisible until runtime.
 *
 * This module is the single source of truth for:
 *   - the webpart IDs that tie manifests to `mount.tsx` renderers;
 *   - a machine-readable ownership map naming what each runtime owns
 *     and what must remain shared;
 *   - exported constants that tests can import to assert invariants
 *     (Wave 4 doctrine guard test).
 *
 * Do not change these values without updating all three of:
 *   - `HbKudosWebPart.manifest.json`
 *   - `HbKudosCompanionWebPart.manifest.json`
 *   - `mount.tsx`
 */

/** Employee-facing public HB Kudos webpart id. */
export const HB_KUDOS_WEBPART_ID = 'f14e59a3-4d6b-43b2-952e-ba02dea11dad' as const;

/** HR Approval Companion webpart id. */
export const HB_KUDOS_COMPANION_WEBPART_ID = 'a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97' as const;

export interface KudosRuntimeOwnership {
  /** Webpart id routed through this runtime. */
  readonly webpartId: string;
  /** SPFx manifest alias mirrored in the packaged solution. */
  readonly manifestAlias: string;
  /** One-line description of what this runtime owns. */
  readonly owns: readonly string[];
  /** Concerns this runtime MUST NOT own (owned by the other runtime). */
  readonly doesNotOwn: readonly string[];
  /** Shared local seams this runtime composes with the other runtime. */
  readonly shares: readonly string[];
}

/**
 * Explicit ownership map. Keeping it in source (not just docs) means
 * Wave-4 doctrine tests can reflect on it and future readers cannot
 * miss the split contract.
 */
export const KUDOS_RUNTIME_OWNERSHIP: {
  public: KudosRuntimeOwnership;
  companion: KudosRuntimeOwnership;
} = {
  public: {
    webpartId: HB_KUDOS_WEBPART_ID,
    manifestAlias: 'HbKudosWebPart',
    owns: [
      'featured spotlight + recent rail composition',
      'archive zone (expand/collapse/search)',
      'article reader panel (viewer-role safe)',
      'composer flyout + draft discard dialog',
      'celebrate mutation (public-side)',
      'recipient photo hydration for public-visible entries',
      'hosted bottom-right assistant safe-zone sentinel',
    ],
    doesNotOwn: [
      'governance queue filter model / reducer',
      'governance patch planning or audit dispatch',
      'bulk approve behavior',
      'revisionRequested / flagged / removed workflow transitions',
      'detail panel with audit timeline (governance role only)',
    ],
    shares: [
      '@hbc/ui-kit/homepage curated lucide icons via ./kudosIcons',
      'KUDOS_GOV_TOKENS + KUDOS_INTENT alias layer',
      'kudosSurface / kudosFlyout / kudosReader CSS modules',
      'kudosVariants.ts (cva) and kudosSurfaceFamily.ts index',
      'governance.module.css and governance primitive variants',
      'kudosGovernanceWriter.submitKudosGovernanceAction (celebrate path)',
      'homepage list config via usePeopleCultureData',
    ],
  },
  companion: {
    webpartId: HB_KUDOS_COMPANION_WEBPART_ID,
    manifestAlias: 'HbKudosCompanionWebPart',
    owns: [
      'queue filter model + reducer (tabs, search, ownership, flags)',
      'governance patch planning + dispatch',
      'KudosGovernanceInputDialog workflow (reject/revise/flag/pin/remove/updateContent)',
      'bulk approve flow',
      'role-aware detail panel with audit timeline',
      'overdue reminder derivation + announcements',
    ],
    doesNotOwn: [
      'public-facing masthead / featured / recent / archive composition',
      'composer draft flow',
      'homepage article reader',
      'celebrate affordance (public-only)',
      'SharePoint-hosted assistant safe-zone (public-only)',
    ],
    shares: [
      '@hbc/ui-kit/homepage curated lucide icons via ./kudosIcons',
      'KUDOS_GOV_TOKENS + KUDOS_INTENT alias layer',
      'governance.module.css + governance variants',
      'companion.module.css for workspace-specific grammar',
      'kudosGovernanceWriter.submitKudosGovernanceAction (full governance surface)',
      'homepage list config via usePeopleCultureData',
    ],
  },
} as const;

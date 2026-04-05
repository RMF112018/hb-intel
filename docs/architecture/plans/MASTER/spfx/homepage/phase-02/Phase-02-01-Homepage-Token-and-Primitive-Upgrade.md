# Phase 02-01 — Homepage Token and Primitive Upgrade

## Objective

Upgrade the homepage-specific design foundation so `apps/hb-webparts` has a real premium visual substrate instead of relying on scattered inline styling and lightly-skinned `HbcCard` usage.

## Required pre-read

Before making changes, read:
- all Phase 01 completion notes
- `Homepage-Product-Boundary.md`
- `Homepage-Shared-Seam-Taxonomy.md`
- `Homepage-Per-Webpart-Contract-Reference.md`
- `Homepage-Acceptance-Checklist.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md`
- `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md`

Do not re-read files that are already in your current context window or memory unless they changed or you need exact wording for a targeted edit.

## Repo-truth findings this prompt must honor

- The homepage lane is already stabilized as a bounded product. Do not re-litigate package ownership.
- Local shared homepage composition primitives are allowed and intentionally remain local until reuse outside homepage is proven.
- The homepage entry point already exposes homepage brand, typography, spacing, accessibility, density, and import-guardrail constants.
- Import discipline is already enforced and must remain intact.
- Phase 01 acceptance tests already lock mount/dispatch and source import posture.

## Implementation target

Create a stronger homepage-specific visual token and primitive system that Phase 02 and later phases can build on.

## Work scope

### 1. Audit the current homepage styling layer
Perform a repo-truth audit of:
- homepage shared primitives in `src/homepage/shared/`
- direct inline styles inside each of the 10 webparts
- reliance on generic `HbcCard` presentation without homepage-specific visual differentiation
- current use of homepage constants from `@hbc/ui-kit/homepage`

Capture the styling debt in a completion note or supporting reference doc.

### 2. Upgrade the homepage token map
Without breaking Phase 00/01 import rules, strengthen the homepage surface by adding or refining homepage-facing tokens/aliases for:
- section spacing rhythm
- card interior spacing
- editorial card padding
- utility tile density
- radius tiers
- elevation tiers
- divider/subsurface treatment
- overlay strength
- CTA emphasis
- hover/focus states
- skeleton/loading surface treatment

Use the existing homepage entry surface and shared ui-kit theme discipline. Do not introduce uncontrolled hardcoded hex/rgb/pixel literals in homepage source.

### 3. Upgrade local shared composition primitives
Refactor the homepage shared primitive family so it visibly owns presentation quality instead of acting like a thin pass-through layer.

At minimum evaluate and improve:
- `HomepageSectionShell`
- `HomepageTopBandPair`
- `HomepageEditorialCard`
- `HomepageSpotlightCard`
- `HomepageUtilityTile`
- `HomepageUtilityDenseGroup`
- `HomepageCuratedContentCluster`
- `HomepageOperationalAwarenessCluster`
- `HomepageDiscoveryCluster`
- `HomepageEmptyState`
- `HomepageLoadingState`

Targets:
- stronger visual differentiation by zone
- disciplined spacing and alignment
- consistent title/summary/metadata hierarchy
- reusable CTA styling
- reusable badge placement rules
- branded loading/empty treatments

### 4. Replace ad hoc inline presentation where it is clearly primitive-owned
When styling is really a shared-pattern concern, move it into shared composition primitives or structured token-backed style helpers.
Do not move truly one-off webpart-specific choices into global shared layers unless reuse is clear.

### 5. Preserve all existing contract behavior
Do not break:
- loading state semantics
- empty/noData vs invalid distinction
- stale/noResults behavior
- independent mountability of each webpart
- audience filtering and normalization behavior
- top-band asymmetries that Phase 01 explicitly documented as intentional

## Deliverables

Create or update, at minimum:
- upgraded homepage token map / primitive implementation
- any homepage-specific style helper layer you judge necessary
- completion note for this prompt
- any updated reference doc needed to preserve repo truth

Recommended new or updated docs:
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Homepage-Design-Token-Map.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Phase-02-01-Completion-Note.md`

## Acceptance criteria

- homepage shared primitives clearly own more of the visual system
- inline style debt is materially reduced where reuse is obvious
- spacing, hierarchy, radius, elevation, and CTA treatments feel systematic
- loading and empty treatments no longer feel scaffold-grade
- Phase 01 behavior and acceptance guarantees remain intact

## Verification

Run and report:
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`

If build impact is significant, also run:
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Final response format

Return:
1. concise repo-truth findings
2. exact files changed
3. exact docs created or updated
4. verification results
5. any remaining risks deferred to Prompt 02-02

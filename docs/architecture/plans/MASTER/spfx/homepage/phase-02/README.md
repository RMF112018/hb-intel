# Phase 02 Prompt Package — Homepage Design Foundation Upgrade

This package converts the Phase 02 objective into a concrete code-agent execution set for `apps/hb-webparts`.

## Package intent

Phase 01 stabilized the homepage lane as a **bounded product**:
- product boundary is defined
- package inventory exists
- shared seam taxonomy exists
- all 10 webparts have contract documentation
- acceptance coverage and import-discipline checks exist
- full verification passed

Phase 02 must **not** redo those tasks. It must use the stabilized product lane as the baseline and upgrade the homepage from contract-complete to visually premium.

## Governing inputs to read first

1. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Phase-01-01-Completion-Note.md`
2. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Phase-01-02-Completion-Note.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Phase-01-03-Completion-Note.md`
4. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Phase-01-04-Completion-Note.md`
5. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Product-Boundary.md`
6. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Package-Inventory.md`
7. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Shared-Seam-Taxonomy.md`
8. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Per-Webpart-Contract-Reference.md`
9. `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Acceptance-Checklist.md`
10. `docs/reference/ui-kit/entry-points.md`
11. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
12. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
13. `docs/reference/sharepoint-homepage-shell-boundaries.md`
14. `docs/architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md`
15. `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md`

## Sequence

1. `Phase-02-01-Homepage-Token-and-Primitive-Upgrade.md`
2. `Phase-02-02-Top-Band-and-Editorial-Surface-System.md`
3. `Phase-02-03-Motion-Media-and-Accessibility-Polish-Rules.md`

Run in order. Do not skip.

## Hard constraints

- Do not re-read files that are already in your current context window or memory unless they changed or you need exact wording for a targeted edit.
- Preserve Phase 01 product-lane boundaries.
- Preserve `@hbc/ui-kit/homepage` import discipline.
- Preserve per-webpart contract behavior, empty/loading states, and independent renderability.
- Do not drift into shell-extension scope, async data integration, property-pane implementation, or content-governance automation.
- Prefer upgrading local homepage composition primitives first; promote to `@hbc/ui-kit` only where Phase 00/01 rules justify it.
- Replace ad hoc inline styling with governed tokens/primitives where it materially improves consistency.

## Expected outputs

- strengthened homepage token map
- upgraded shared composition primitives
- premium top-band and card-family styling pass
- branded loading/empty treatments
- motion/media/focus/contrast rules wired into the homepage lane
- Phase 02 completion notes and any new reference docs needed to preserve repo truth

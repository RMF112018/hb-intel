# README — Wave D Grid, Bento, Card Hierarchy, and Layout Primitives

## Objective

Execute PCC Phase 3 Wave 15A / Wave D as a staged, evidence-backed remediation of layout primitives and surface composition. The goal is not cosmetic polish; it is to make PCC’s card/grid system support doctrine-conformant command-center surfaces inside SharePoint chrome.

## Current Audit Posture

## Confirmed Findings

1. **Shared bento/card primitives exist and are already partially remediated.** `PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, `useContainerBreakpoint`, and `useBentoRowSpan` exist under `apps/project-control-center/src/layout/`. Current code includes container-width modes, protected footprint spans, CSS grid variables, and row-span diagnostics.
2. **Wave 15A Prompt 04 has already changed the primitive layer.** The closeout records changes to `footprints.ts`, `PccBentoGrid`, `PccDashboardCard`, their CSS modules, `useBentoRowSpan`, and focused tests. Treat that closeout as baseline, not as final proof of product-grade surface composition.
3. **Card hierarchy is structurally shallow.** `PccDashboardCard` supports `hierarchy='primary' | 'standard' | 'supporting'` and `density='comfortable' | 'compact'`, but current surface usage generally relies on footprint names (`full`, `wide`, `standard`) rather than a doctrine-grade Tier 1 / Tier 2 / Tier 3 contract.
4. **Visual hierarchy remains dominated by footprint and card count.** Several routed surfaces render many peer `PccDashboardCard` children through fragments, with limited shared grouping semantics for command/operational/reference regions.
5. **Team & Access still needs explicit layout adoption.** The lane shell renders header, restricted-state card, Team Viewer, Permission Request, and Access Manager lanes as peer cards. A severe narrow-column collapse is a known evidence-backed issue from the Wave A baseline and Prompt 04 residual evidence, but current source now includes primitive fixes that must be verified against the specific Team & Access route.
6. **Project Readiness and Approvals are card-heavy surfaces.** Project Readiness combines framework, lifecycle, permit/inspection, responsibility matrix, constraints log, buyout log, Procore, and unified lifecycle regions. Approvals renders home, queue, my approvals, registry, escalation, admin verification, policy, module integration, decision history, lineage, and HBI boundary cards. Both require explicit command/operational/reference layout grouping.
7. **Documents, External Systems, Settings, and Site Health use meaningful cards but still need hierarchy normalization.** These surfaces expose header/summary/lane/queue/config/status cards; the package should standardize tiers and layout patterns without changing their read-model scope or command posture.
8. **Responsive proof exists at unit/component level but is not complete as product evidence.** Tests assert footprint spans, min spans, non-dense grid behavior, row span floor, and collapse resistance. Screenshot and tenant-hosted constrained-width proof remain incomplete/deferred.
9. **Accessibility heading structure is not currently enforced by the primitive contract.** `PccDashboardCard` emits an `h3` when given `title`. Surface-internal cards/subsections sometimes use `h4`. There is no explicit tier-aware heading-level contract in the primitive API.
10. **Shell host-fit and surface context dependencies are partially complete.** Prompt 03 introduced the shared `PccSurfaceContextHeader`; Prompt 04 remediated primitives; Prompt 05 remediated state/copy. This Wave D package must not undo those baselines and must document any remaining dependency on Wave B/C-style shell/context work.

## Recommended First Prompt

Start with:

```text
prompts/Prompt_01_Grid_Card_Layout_Scope_Lock_And_File_Map.md
```

Prompt 01 must re-confirm local repo truth before any implementation changes. Do not skip it because Prompt 04 closeout exists; that closeout is evidence of prior work, not proof that every current routed surface now has a product-grade hierarchy.

## Operating Assumptions

- Current source is at or near `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`.
- Wave 15A Prompt 03, Prompt 04, and Prompt 05 closeouts exist in `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/`.
- Shared primitive fixes may already exist; the local agent must verify whether additional changes are needed or whether the task is surface adoption, tests, screenshots, and closeout.
- The package must be landed under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/` unless repo truth identifies a more current Wave 15A package path.

## What This Wave May Improve

- Layout/grid composition.
- Card hierarchy and density.
- Visual hierarchy and scan path.
- Responsive/container behavior.
- Shell/host fit where layout interacts with the shell.
- Product confidence/executive polish.

## What This Wave Must Not Claim

- Final 56/56 readiness.
- Tenant-hosted production readiness.
- Accessibility completion without keyboard and screen-reader evidence.
- Completion of backend/read-model/write capability.
- Completion of later surface waves.

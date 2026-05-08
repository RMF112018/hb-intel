# Prompt 06 — Phase 4 Handoff Inventory

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are documenting the Phase 04 duplicate-card extraction/removal handoff.

## Objective

Create a comprehensive handoff inventory for duplicate/header cards that remain after Phase 03.

This prompt is documentation-first. Do not remove runtime cards.

## Recommended Output Path

Use an existing Phase 03 / Wave 15A planning location if current repo truth shows one. If no precise folder exists, create:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/phase-03-conditional-command-header-content/Phase_04_Duplicate_Header_Card_Handoff_Inventory.md
```

If you choose a different path, explain why.

## Required Inventory

Document these items:

```text
Project Home — PccProjectIntelligenceCard
Documents — PccDocumentsHeaderCard
Team & Access — PccTeamAccessHeaderCard
Project Readiness — ReadinessHeroSlot / HeroCard
Approvals — HomeCard / Approvals home
External Systems — PccExternalSystemsLaunchPadHeaderCard
Control Center Settings — overview/primary command card
Site Health — PccSiteHealthOverviewCard
```

## Required Fields Per Inventory Item

For each item include:

| Field | Requirement |
|---|---|
| Surface ID | Exact `PccMvpSurfaceId` |
| Component/File | Exact file path |
| Current title/eyebrow | From repo truth |
| Current role | Header card, command card, overview card, compatibility marker carrier, etc. |
| Active-surface marker | Whether it uses `dataActiveSurfacePanel` |
| Header content already moved | What Phase 03 now covers |
| Header content still missing | What remains to extract |
| Operational content to keep | Content that should remain as bento operational content |
| Content to remove/demote | Candidate Phase 04 removals |
| Test/selector risks | Tests/selectors likely impacted by removal |
| Recommended Phase 04 action | Remove, demote, split, replace, or retain |
| Risk if removed too early | Layout, test, selector, evidence, or product risk |

## Required Phase 04 Boundary Statement

The document must explicitly state:

- Phase 03 did not remove duplicate/header cards.
- Phase 04 must remove/demote duplicate cards only after verifying tests/selectors.
- Card-level `dataActiveSurfacePanel` compatibility cleanup belongs to Phase 04 or later.
- Phase 03 does not prove Phase 4 readiness or final scorecard pass.

## Prohibited

- Do not remove runtime cards.
- Do not change `PccDashboardCard`.
- Do not change `PccBentoGrid`.
- Do not change surface runtime composition.
- Do not update Playwright evidence unless the user/auditor asks.

## Validation

For docs-only changes, run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If runtime/test files changed unexpectedly, run full validation:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Required Completion Response

```markdown
## Prompt 06 Complete

## Handoff Document Path

## Duplicate/Header Card Inventory Summary

## Content Already Covered by Phase 03 Header

## Phase 04 Removal/Demotion Risks

## Tests/Selectors to Revisit in Phase 04

## Validation Results

## Package / Lockfile / Manifest Audit

## Phase 03 Closeout Recommendation
```

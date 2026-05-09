# Fresh Local Code Agent Prompt — PCC Phase 04B Corrective Surface Remediation

## Common Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

## Governing Corrective UX Rule

No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero.

The first bento card on the target surface must be operational.

## Baseline Commands

Run and record before editing:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record current package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Expected deployment baseline may be `1.0.0.20` if the tenant publish/version bump has already landed. If current repo truth differs, record it and proceed only if the difference is an intentional package/version-only bump or an already-reviewed forward movement.

## General Files Not to Touch

Do not edit:

```text
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

unless this specific prompt explicitly authorizes it. These prompts are runtime/test remediation prompts, not doc-sync or package-version prompts.

## Required Validation

Run, in order, after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as `--runInBand`.

Do not run hosted Playwright unless explicitly authorized by the user. If the target surface changes visible runtime composition, the closeout must state that live evidence is required after commit.

## Closeout Requirements

Report:

- files changed;
- runtime changes;
- tests changed;
- first bento card before and after;
- whether the surface is `SURFACES_WITH_COMPATIBILITY_CARD` or `SURFACES_WITH_SHELL_ONLY_PANEL` after the change;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- remaining risks;
- follow-up needed, if any.

Commit only after validation passes. Use a concise commit summary matching the actual scope.

---
# Surface Focus: Project Readiness

## Objective

Absorb the top-level `Project readiness` summary/hero card into shell hero metadata and/or a compact operational state model so the Project Readiness bento grid begins with actionable readiness content, not a duplicated surface header.

## Current Problem

The Project Readiness tab still begins with a large card:

```text
Project readiness
Workflow execution and approvals are managed by your PCC administrator.
Active gate
Overall posture
Blockers
Evidence confidence
Source-health badges
```

Some of this is operational status, but its current placement and title make it function as a duplicated top-level summary/header card.

## Required Reads

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

## Required Searches

```bash
rg -n "ReadinessHeroSlot|Project readiness|Active gate|Overall posture|Blockers|Evidence confidence|dataActiveSurfacePanel=\"project-readiness\"" apps/project-control-center/src
rg -n "project-readiness|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL" apps/project-control-center/src/tests
```

## Implementation Requirements

### 1. Separate Header Copy from Operational Signals

Map each element:

| Element | Disposition |
|---|---|
| Page title `Project readiness` | Shell hero only |
| Workflow/admin copy | Shell hero read-only cue or governance cue |
| Active gate | Shell summary or operational readiness card |
| Overall posture | Shell summary or operational readiness card |
| Blocker count | Operational readiness card and optionally shell summary |
| Evidence confidence | Operational readiness card and optionally shell summary |
| Source-health badges | Operational card |

### 2. Convert the Top Card into Operational Content

Preferred:

- Remove or refactor `ReadinessHeroSlot` so it no longer functions as a full-width title/header card.
- Preserve metrics in a compact operational card titled `Readiness controls`, `Gate posture`, or `Blockers and evidence`.
- The first bento card must not restate the tab title.

Allowed fallback:

- Demote the existing card:
  - remove duplicate surface title;
  - use an operational title;
  - compact the layout;
  - retain metrics;
  - remove `dataActiveSurfacePanel="project-readiness"` if shell-only classification is intended.

### 3. Active-Panel Classification

If the top readiness compatibility marker is removed, move `project-readiness` to shell-only expectations in the same commit.

If a retained readiness operational card still emits the marker, justify why and keep it in compatibility-card expectations.

### 4. Tests

Prove:

- Project Readiness no longer begins with a duplicate surface-title card;
- active gate / posture / blockers / evidence confidence still render;
- source-health status remains visible;
- shell hero contains Project Readiness identity and governance cues;
- direct-child bento invariant remains intact.

## Hard Stops

Stop if:

- metrics would be lost;
- loading/degraded state handling is unclear;
- the refactor requires shell read-model-state plumbing;
- unrelated surfaces would need runtime edits.

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
# Surface Focus: Project Home

## Objective

Complete the Project Home corrective remediation by eliminating `Project Intelligence` as the top-level bento summary/header card while preserving all useful project facts, command counts, source posture, and HBI/no-writeback boundary.

The Project Home bento grid should begin with operational content, not a large identity/summary card.

## Current Problem

The shell hero already shows Project Home identity, project facts, posture, and read-only/HBI cues, yet the first bento card still renders:

```text
Project Intelligence
Sample Active Construction Project
High-priority actions
Pending approvals
Blocking setup gaps
Client / Location / Estimated Value / Scheduled Completion
```

This duplicates the shell hero and keeps Project Home from starting with operational work.

## Required Reads

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

## Required Searches

```bash
rg -n "PccProjectIntelligenceCard|Project Intelligence|High-priority actions|Pending approvals|Blocking setup gaps|Source: PCC read-model available|HBI advisory" apps/project-control-center/src
rg -n "project-home|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|expectsCompatibilityCard" apps/project-control-center/src/tests
rg -n "dataActiveSurfacePanel=\"project-home\"|data-pcc-active-surface-panel=\"project-home\"" apps/project-control-center/src
```

## Implementation Requirements

### 1. Content Disposition Matrix

Before editing, produce a matrix mapping each item from `PccProjectIntelligenceCard` to a retained home:

| Content | Required disposition |
|---|---|
| Project status / stage | Shell hero project facts or compact operational status strip |
| Project type / commercial tag | Preserve only if useful; otherwise document safe drop |
| High-priority actions count | Priority Actions card or shell hero summary |
| Pending approvals count | Approvals card or shell hero summary |
| Blocking setup gaps count | Missing Configurations / Settings card or shell hero summary |
| Source / read-model availability | Shell/source posture or documented safe drop if duplicative |
| HBI advisory / no writeback | Shell hero cue or HBI control |
| Client | Shell hero or compact project facts strip |
| Location | Shell hero |
| Estimated value | Shell hero |
| Scheduled completion | Shell hero |

### 2. Remove or Transform the Card

Preferred:

- Remove `PccProjectIntelligenceCard` from the first bento position.
- Delete the component only after import proof.
- Make `Priority Actions` the first Project Home bento card.

Allowed fallback:

- Convert it into a compact operational card titled `Project Signals` or similar.
- It must not use title `Project Intelligence`.
- It must not restate the selected surface.
- It must not carry `dataActiveSurfacePanel="project-home"` unless the card remains the intentional compatibility-card surface for a documented reason.
- It must not remain a full-width top hero/header footprint.

### 3. Tests

Update tests to prove:

- Project Home no longer begins with `Project Intelligence`;
- operational cards still render;
- priority/action/approval/setup-gap data remains visible;
- shell hero remains the source of page identity;
- bento direct-child invariant remains intact.

Update compatibility/shell-only expectations only if runtime active marker behavior changes.

## Hard Stops

Stop if:

- useful facts cannot be preserved or safely documented as dropped;
- removing the card leaves Project Home with zero direct bento cards;
- changes require non-Project-Home runtime edits;
- tests would hide operational content loss.

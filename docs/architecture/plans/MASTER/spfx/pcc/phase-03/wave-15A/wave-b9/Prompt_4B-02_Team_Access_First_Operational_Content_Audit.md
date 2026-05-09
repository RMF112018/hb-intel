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
# Surface Focus: Team & Access

## Objective

Verify and harden the corrected Team & Access surface after Prompt 04 removed `PccTeamAccessHeaderCard`.

Team & Access is expected to be a clean shell-only surface whose first bento card is operational lane content.

## Current Expected State

The first visible bento content should be operational, such as:

```text
Project Team Map
Request access
Access Manager / permission posture content
```

There should be no top-level summary card titled:

```text
Team & Access Center
Team and access overview
```

## Required Reads

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccTeamAccessSurface*.test.tsx
apps/project-control-center/src/tests/PccTeamAccessReadModelContent.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

## Required Searches

```bash
rg -n "PccTeamAccessHeaderCard|Team & Access Center|Team and access overview|dataActiveSurfacePanel=\"team-and-access\"" apps/project-control-center/src
rg -n "team-and-access|SURFACES_WITH_SHELL_ONLY_PANEL|SURFACES_WITH_COMPATIBILITY_CARD|expectsCompatibilityCard" apps/project-control-center/src/tests
```

## Implementation Requirements

### 1. Verify No Duplicate Team Header Remains

Confirm:

- `PccTeamAccessHeaderCard.tsx` is deleted or unused.
- No import of `PccTeamAccessHeaderCard` remains.
- No bento card title duplicates the shell page title.
- The first bento card is operational lane content.

If a duplicate header remains, remove it.

### 2. Verify Uniform Shell-Only Behavior

Confirm no Team surface branch emits:

```text
dataActiveSurfacePanel="team-and-access"
```

This includes ready, loading, error, unauthorized, or degraded branches.

### 3. Strengthen Tests Only If Needed

Add or update tests to assert:

- Team & Access appears in `SURFACES_WITH_SHELL_ONLY_PANEL`;
- no direct child card carries `[data-pcc-active-surface-panel="team-and-access"]`;
- Team surface still has direct-child cards;
- Team operational lane content remains visible;
- shell hero contains Team & Access metadata and read-only/governed access posture.

Do not modify any other surface runtime.

## Hard Stops

Stop if:

- Team is not shell-only across all branches and fixing it would require shell/layout changes;
- the first Team bento card is not operational and no safe operational first card exists;
- test changes would weaken direct-child bento protections.

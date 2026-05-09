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
# Surface Focus: External Platforms

## Objective

Verify and harden the corrected External Platforms surface after Prompt 04 removed `PccExternalSystemsLaunchPadHeaderCard`.

External Platforms should now begin with operational launch/mapping/source-health content, not a page-title/summary card.

## Current Expected State

The first bento card should be operational, such as:

```text
Launch Pad summary
Project launch links
Mapping status
Source health
```

There should be no top-level card titled:

```text
Launch Pad
External Platforms Launch Pad
```

## Required Reads

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccExternalSystems*.test.tsx
apps/project-control-center/src/tests/PccExternalSystemsLaunchPad.routerPassThrough.test.tsx
apps/project-control-center/src/tests/PccExternalSystemsRegistryHealthAudit.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

## Required Searches

```bash
rg -n "PccExternalSystemsLaunchPadHeaderCard|PccExternalSystemsHeaderCard|Launch Pad|External Platforms Launch Pad|dataActiveSurfacePanel=\"external-systems\"" apps/project-control-center/src
rg -n "external-systems|SURFACES_WITH_SHELL_ONLY_PANEL|SURFACES_WITH_COMPATIBILITY_CARD|expectsCompatibilityCard" apps/project-control-center/src/tests
rg -n "IPccLaunchPadHeaderViewModel|SURFACE_SUBTITLE|header\.subtitle" apps/project-control-center/src/surfaces/externalSystems
```

## Implementation Requirements

### 1. Verify No Duplicate External Header Remains

Confirm:

- `PccExternalSystemsLaunchPadHeaderCard.tsx` is deleted or unused.
- `PccExternalSystemsHeaderCard.tsx` is deleted or unused.
- No first card duplicates shell hero title.
- First bento content is operational.

### 2. Verify Uniform Shell-Only Behavior

Confirm no External Systems branch emits:

```text
dataActiveSurfacePanel="external-systems"
```

across ready, loading, error, degraded branches.

### 3. Preserve View-Model Contract

Do not remove `IPccLaunchPadHeaderViewModel.subtitle` or `SURFACE_SUBTITLE` in this prompt unless the user explicitly requested interface cleanup. This audit is about visible first-card behavior.

### 4. Tests

Prove:

- External Platforms appears in shell-only expectations;
- no direct child card carries `[data-pcc-active-surface-panel="external-systems"]`;
- surviving operational cards render;
- static launch cue remains in shell hero;
- bento direct-child invariant remains intact.

## Hard Stops

Stop if:

- External Systems is not shell-only and fixing it would require shell/layout changes;
- the first card is still a title/header card;
- view-model cleanup would become necessary to pass tests;
- tests would weaken bento protections.

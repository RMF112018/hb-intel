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
# Surface Focus: Control Center Settings

## Objective

Verify and harden the corrected Control Center Settings surface after Prompt 04 removed the duplicate first inline overview card.

Settings should begin with operational configuration scope/setup content, not a page-title/overview card.

## Current Expected State

The first bento card should be operational, such as:

```text
Project / Site / Persona / Integration Scope
Items needing setup
```

There should be no top-level card titled:

```text
Control Center Settings
Settings overview
```

## Required Reads

```text
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

## Required Searches

```bash
rg -n "Control Center Settings|Settings overview|Saving, updating, and tenant changes|dataActiveSurfacePanel=\"control-center-settings\"" apps/project-control-center/src
rg -n "control-center-settings|SURFACES_WITH_SHELL_ONLY_PANEL|SURFACES_WITH_COMPATIBILITY_CARD|expectsCompatibilityCard" apps/project-control-center/src/tests
```

## Implementation Requirements

### 1. Verify Duplicate Settings Card Is Gone

Confirm:

- the first inline title/overview card is removed;
- no card restates `Control Center Settings` as a bento header;
- the shell `readOnlyCue` still includes:
  - `saving, updating, and tenant changes`;
  - `governed settings workflows`;
  - `PCC administrator`.

### 2. Verify Shell-Only Behavior

Confirm no Settings surface branch emits:

```text
dataActiveSurfacePanel="control-center-settings"
```

### 3. Verify Operational First Card

The first card should expose actual configuration scope/setup content, such as:

- project scope;
- site scope;
- persona scope;
- integration scope;
- setup-needed state.

### 4. Tests

Prove:

- Settings appears in shell-only expectations;
- no direct child card carries `[data-pcc-active-surface-panel="control-center-settings"]`;
- operational cards remain;
- shell hero carries Settings governance/admin read-only cue;
- bento direct-child invariant remains intact.

## Hard Stops

Stop if:

- admin/governance copy is no longer visible in the shell hero;
- Settings still begins with a duplicate title card;
- fixing the surface requires shell/layout changes;
- tests would weaken bento protections.

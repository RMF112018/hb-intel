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
# Surface Focus: Site Health

## Objective

Absorb or transform the top-level `Site Health` overview card so the Site Health bento grid begins with operational health checks, drift indicators, repair posture, or source diagnostics instead of a duplicated surface header/summary card.

## Current Problem

The Site Health tab still begins with:

```text
Site Health
Site health summary. Scans and repairs are managed in SharePoint admin tooling.
Overall
Failing
Warnings
Last Run
```

This is valuable state, but its title and placement make it behave like a top-level summary/header card.

## Required Reads

```text
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccSiteHealth*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

## Required Searches

```bash
rg -n "PccSiteHealthOverviewCard|Site Health|Site health summary|Overall|Failing|Warnings|Last Run|dataActiveSurfacePanel=\"site-health\"" apps/project-control-center/src
rg -n "site-health|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL" apps/project-control-center/src/tests
```

## Implementation Requirements

### 1. Map Overview Metrics

Preserve:

- overall severity;
- failing checks count;
- warning count;
- last run timestamp;
- scan/repair admin-tooling cue.

### 2. Remove Header Behavior, Preserve Operational Health Signal

Preferred:

- Move high-level severity/failing/warnings/last-run into shell summary items if the shell can support it without read-model-state coupling.
- Or transform `PccSiteHealthOverviewCard` into a compact operational card titled:
  - `Health checks summary`;
  - `Repair posture`;
  - `Drift and scan status`.

The first card must not restate `Site Health` as the tab title.

### 3. Active-Panel Classification

If the overview card no longer emits `dataActiveSurfacePanel="site-health"`, move Site Health to shell-only expectations in the same commit.

If a retained operational card emits the marker, justify it and keep Site Health in compatibility-card expectations.

### 4. Tests

Prove:

- Site Health no longer begins with a duplicate surface-title card;
- severity/failing/warnings/last-run remain visible;
- health checks / drift / repair operational cards remain;
- shell hero carries Site Health identity and no-repair-acknowledgement cue;
- direct-child bento invariant remains intact.

## Hard Stops

Stop if:

- severity/warning/failing/last-run metrics would be lost;
- scan/repair governance cue would be lost;
- refactor requires live repair/writeback behavior;
- unrelated surfaces require runtime edits.

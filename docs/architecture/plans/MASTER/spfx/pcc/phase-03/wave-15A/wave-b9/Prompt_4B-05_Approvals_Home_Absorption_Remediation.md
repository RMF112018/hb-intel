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
# Surface Focus: Approvals

## Objective

Eliminate `Approvals home` as a duplicated top-level summary/header card while preserving approval queue, pending/active counts, state/mode breakdowns, escalation context, and degraded-state posture.

## Current Problem

The Approvals tab still begins with:

```text
Approvals home
Not available for this project
```

or, in ready paths, a top-level home/summary card carrying counts and state/mode context. This reads as a surface header, not as the first operational approval workflow card.

## Required Reads

```text
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccApprovalsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

## Required Searches

```bash
rg -n "Approvals home|Approval queue|My approvals|pending|escalated|mode counts|state counts|dataActiveSurfacePanel=\"approvals\"" apps/project-control-center/src
rg -n "approvals|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL" apps/project-control-center/src/tests
```

## Implementation Requirements

### 1. Map Approval Home Content

Identify where the current top card carries:

- total requests;
- pending/active count;
- terminal count;
- escalated count;
- state counts;
- mode counts;
- unavailable/degraded copy.

### 2. Remove Header Behavior, Preserve Workflow Content

Preferred:

- Remove or refactor `Approvals home` into operational queue/state content.
- The first bento card should be `Approval queue`, `My approvals`, `Pending decisions`, or another true workflow card.
- Summary counts should move into shell summary items if appropriate, or into a compact queue-summary operational card that does not restate the page title.

Allowed fallback:

- Retain a compact operational summary card only if it is clearly workflow-oriented and not titled `Approvals home`.

### 3. State / Unavailable Path

If the surface is unavailable for the sample project, preserve that state in an operational state card, but do not title it as a page home/header.

### 4. Active-Panel Classification

If `approvals` no longer has a card-level active marker, move it to shell-only expectations.

If a retained operational state card still emits the marker, justify it and keep `approvals` in compatibility-card expectations.

### 5. Tests

Prove:

- `Approvals home` no longer functions as the first header card;
- approval queue / my approvals / pending decision content remains visible;
- unavailable/degraded state remains visible if applicable;
- shell hero carries Approvals identity and no-approval-authority cue;
- bento direct-child invariant remains intact.

## Hard Stops

Stop if:

- approval counts/state/mode data would be lost;
- unavailable/degraded posture would be lost;
- no operational card remains after the top card is removed;
- unrelated surfaces require runtime edits.

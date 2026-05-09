# Prompt 04B-02 — Team & Access Hero Summary Remediation and First Operational Content Guardrail

## Objective

Correct the **Team & Access** surface so the shell hero displays Team-specific summary content when the Team tab is selected, while preserving the already-corrected operational-first bento layout.

This prompt is not merely a no-op audit. Team & Access no longer begins with a duplicate bento header card, but the selected-tab hero still shows global Project Home-style project facts:

```text
Location
Estimated Value
Scheduled Completion
Project Stage
```

That is wrong for the intended Phase 04B outcome. The shell hero must reflect the selected tab’s summary context. The Team tab’s hero should summarize team/access posture, permission context, access boundaries, and relevant counts/statuses. The bento grid should continue to start with operational Team content.

---

## Current Visual Defect

With the Team tab selected, the shell hero correctly changes the title/description/cues to:

```text
Team & Access
Team visibility, access posture, and permission request context.
Team access preview
Project team and access posture
Request context only
No access changes from this header
```

But the lower hero fact row still shows Project Home/global project data:

```text
Location
Estimated Value
Scheduled Completion
Project Stage
```

Those facts are not Team & Access summary content. They may be useful on Project Home, but they do not express the selected Team tab’s operational posture.

---

## Governing Corrective UX Rule

No PCC tab surface may begin with either:

1. a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero; or
2. a shell hero summary region that continues to show Project Home/global facts instead of the selected tab’s summary content.

The intended ownership split is:

```text
Native SharePoint chrome = persistent project/site identity
PCC shell hero = selected tab identity, posture, summary, source/authority/read-only cues
PCC bento grid = operational content
```

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Current Baseline

Prompt 04B-01 landed commit:

```text
96d22ce74662f6216e4b95bd75fe978b50bbae25
```

Known current state:

- `PccProjectIntelligenceCard` removed.
- Project Home bento starts with `PccPriorityActionsCard`.
- `project-home` moved to `SURFACES_WITH_SHELL_ONLY_PANEL`.
- Client was added to the hero facts row as a global project fact.
- Team & Access bento starts with operational lane content.
- Team & Access remains in `SURFACES_WITH_SHELL_ONLY_PANEL`.
- The problem now is that the hero facts row is still global instead of selected-surface-specific.

A package/version-only deployment bump to `1.0.0.20` may exist. Treat it as acceptable if it is already reviewed and does not include runtime/source/test drift beyond the package/version bump.

---

## Strict Scope

This prompt may edit:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/tests/**
```

Edit Team runtime files only if current repo truth shows Team-specific counts/statuses are already available there and can be reused without new live plumbing.

Do not edit:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/siteHealth/**
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If fixing Team hero summary requires broad cross-surface hero architecture changes, stop and report a proposed follow-up instead of overbuilding.

---

## Required Baseline Commands

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

Hard stop if the tree is dirty in shell, Team, shared tests, package, manifest, or lockfile files unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current files before editing:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface*.test.tsx
apps/project-control-center/src/tests/PccTeamAccessReadModelContent.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

---

## Required Searches

Run and record:

```bash
rg -n "PccProjectHeroBand|data-pcc-hero-facts|data-pcc-hero-fact-location|data-pcc-hero-fact-client|clientDisplay|projectStageLabel|scheduledCompletionDisplay" apps/project-control-center/src
rg -n "team-and-access|Team access preview|Project team and access posture|Request context only|access-boundary|access changes require governed workflows" apps/project-control-center/src
rg -n "internal|external|guest|permission|access manager|request access|team viewer|Team Viewer|Permission Request|Access Manager" apps/project-control-center/src/surfaces/teamAccess apps/project-control-center/src/tests
rg -n "SURFACES_WITH_SHELL_ONLY_PANEL|SURFACES_WITH_COMPATIBILITY_CARD|expectsCompatibilityCard" apps/project-control-center/src/tests
rg -n "dataActiveSurfacePanel=\"team-and-access\"|data-pcc-active-surface-panel=\"team-and-access\"" apps/project-control-center/src
```

Classify results as:

```text
CURRENT HERO FACT
TEAM SUMMARY SOURCE
SHELL-ONLY TEST CONTRACT
DEFECT
HISTORICAL COMMENT ONLY
```

---

## Required Design Decision

Before editing, decide and report the minimal hero-summary implementation path.

### Preferred Path A — Surface-specific hero facts from metadata

Extend the shell surface metadata model with optional surface-specific summary facts, for example:

```ts
surfaceFacts?: readonly IPccShellSurfaceFact[];
```

Then render facts using this precedence:

```text
active surface metadata facts if present
else default project facts
```

For Team & Access, define facts such as:

```text
Team Visibility: Internal / external / guest posture
Access Requests: Request context only
Permission Changes: Governed workflows
Access Scope: Project team and access posture
```

Use static, deterministic preview-safe facts if no dynamic Team counts are available at the shell boundary.

### Acceptable Path B — Derived hero fact set in `deriveShellHeroViewModel`

Add a typed `heroFacts` array to `IPccShellHeroViewModel` and derive it by `activeSurfaceId`.

For `project-home`, include project facts:

```text
Client
Location
Estimated Value
Scheduled Completion
Project Stage
```

For `team-and-access`, include Team-specific facts, not project facts.

This is acceptable if adding facts to `surfaceHeaderMetadata.ts` would be awkward or overfit.

### Prohibited Path

Do not leave Team & Access showing the Project Home/global project facts row.

Do not add read-model-state plumbing to the shell hero in this prompt.

Do not create live/dynamic Team counts unless the data already exists at the shell boundary. Static preview posture is acceptable for this correction.

---

## Team & Access Hero Content Requirements

When Team & Access is selected, the hero must not show the Project Home/global facts row:

```text
Client
Location
Estimated Value
Scheduled Completion
Project Stage
```

Instead, it must show Team-specific summary facts. Use the best available current repo truth, but the target should include four or five concise facts such as:

```text
Team Visibility
Internal / external / guest posture
Access Requests
Request context only
Permission Changes
Governed workflows
Access Scope
Project team and access posture
```

If the exact labels differ, they must still communicate Team/Access posture.

The existing upper hero metadata must remain:

```text
Team & Access
Team visibility, access posture, and permission request context.
Team access preview
Project team and access posture
Request context only
FOCUS Team visibility and permission posture
BOUNDARY No access changes from this header
Read-only preview — access changes require governed workflows.
```

---

## Team Bento Requirements

Preserve the Team bento state:

- First bento content must remain operational.
- No top-level Team summary/header card may be reintroduced.
- `PccTeamAccessHeaderCard` must remain removed.
- No direct child card may carry `[data-pcc-active-surface-panel="team-and-access"]`.
- Team & Access must remain in `SURFACES_WITH_SHELL_ONLY_PANEL`.
- Direct-child bento invariant must remain enforced.

---

## Required Tests

Update or add tests to prove:

### Hero facts

- Project Home still renders project facts:
  - Client
  - Location
  - Estimated Value
  - Scheduled Completion
  - Project Stage
- Team & Access renders Team-specific facts.
- Team & Access does **not** render the Project Home/global project facts row.
- Switching between Project Home and Team changes the hero fact row.

### Existing Team shell metadata

Assert Team hero still renders:

```text
Team & Access
Team access preview
Project team and access posture
Request context only
access-boundary
access changes require governed workflows
```

### Bento and active-panel contract

Assert:

- Team & Access remains in shell-only expectations.
- No Team card-level active-panel marker exists.
- Team first bento card remains operational lane content.
- Direct-child bento invariant remains intact.

---

## Implementation Rules

### If using metadata facts

- Add a small typed fact interface.
- Populate facts only for `project-home` and `team-and-access` if that minimizes blast radius.
- Preserve existing `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`.
- Do not break other surfaces; either keep their current project facts temporarily or provide no change until their surface-specific prompts run.

### If using derived `heroFacts`

- Add `heroFacts` to `IPccShellHeroViewModel`.
- Project Home facts should include existing project facts plus Client.
- Team facts should be Team-specific.
- `PccProjectHeroBand` should render `viewModel.heroFacts` instead of hardcoded project facts.
- Avoid conditional JSX spread throughout the component; keep rendering generic and data-driven.

### Surface-specific rollout guardrail

This prompt focuses only on Project Home and Team & Access facts behavior.

Do not force all eight surfaces into final surface-specific fact rows in this prompt. The remaining surface prompts should each define their own hero summary facts.

For non-Project Home / non-Team surfaces, either:

- preserve current behavior; or
- use a safe default based on existing metadata.

Do not make speculative content decisions for Documents, Readiness, Approvals, External Platforms, Settings, or Site Health in this prompt.

---

## Required Verification Matrix

Produce this matrix before editing:

| Check | Expected result | Actual result | Action |
|---|---|---|---|
| Team first bento card | operational lane content | | no-op / fix |
| Team duplicate header | absent | | no-op / fix |
| Team card-level active marker | absent | | no-op / fix |
| Team split-set classification | shell-only | | no-op / fix |
| Team hero title/cues | Team-specific | | no-op / fix |
| Team hero facts row | Team-specific, not Project Home facts | | fix |
| Project Home hero facts | client + project facts | | preserve |
| Project Home first bento card | Priority Actions | | preserve |

---

## Validation

If no files are changed, run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If any files are changed, run in order:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as `--runInBand`.

Do not run hosted Playwright unless explicitly authorized by the user. Because this changes visible shell hero behavior, closeout must mark hosted evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- fixing Team hero facts would require read-model-state plumbing;
- fixing Team hero facts would require broad all-surface redesign;
- changing hero facts breaks Project Home client/project facts;
- Team bento would no longer start with operational lane content;
- Team would regain a card-level active-panel marker;
- tests require deleting coverage without replacement;
- package, manifest, or lockfile changes are required;
- runtime changes outside allowed scope appear necessary.

---

## Closeout Report Requirements

Report:

- files changed;
- implementation path selected:
  - metadata facts, or
  - derived `heroFacts`;
- Project Home hero facts after change;
- Team & Access hero facts after change;
- first Team bento card before/after;
- Team active-panel marker status;
- Team split-set classification;
- tests changed;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- hosted runtime evidence status.

Commit summary draft:

```text
refactor(pcc): make Team hero summary surface-specific
```

Commit body should state:

- Team bento content was already operational-first and remains unchanged unless a defect was found.
- The remediation changes the shell hero fact row so Team no longer shows Project Home/global project facts.
- Project Home facts, including Client, remain preserved.
- No package/manifest/lockfile drift.
- Hosted/runtime evidence operator-pending if not run.

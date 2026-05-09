# Prompt 04B-02 — PCC Hero Metadata Band Production-Copy Remediation

## Objective

Refactor the PCC shell hero metadata band so the full production-visible section shown in the user screenshot becomes end-user focused.

Current visible pattern to replace:

```text
MODE        SOURCE                         AUTHORITY
Command preview   Fixture / read-model preview   Advisory only

FOCUS Priority actions and project signals   HBI Grounded preview, no writeback
Read-only preview — no decisions, approvals, or writeback authority.
```

This is implementation/governance scaffolding, not production UX copy. This prompt replaces **all production-visible labels in that hero metadata band** with useful project/tool information, while preserving source/governance/no-writeback protections as subdued microcopy or test-visible metadata.

This prompt supersedes the prior Team-only Prompt 04B-02 and the earlier surface-facts-only plan.

---

## Product Direction

The PCC hero should help the user understand:

1. **What this surface is showing for this project**
2. **What needs attention**
3. **What the user can do next or should remember**
4. **What governance/source limitation applies, without making governance the main content**

The hero metadata band must not expose internal implementation labels as primary production copy.

---

## Production-Copy Problem to Fix

Replace or demote these visible labels/copy patterns:

```text
MODE
SOURCE
AUTHORITY
Command preview
Fixture / read-model preview
Advisory only
FOCUS
BOUNDARY
POSTURE
HBI
Grounded preview, no writeback
No access changes from this header
No checklist completion from this header
No approve / reject action from this header
No sync or external writeback
No repair acknowledgement from this header
Read-only preview — no decisions, approvals, or writeback authority.
```

These may remain available for tests, diagnostics, data attributes, or subdued governance microcopy, but they should not be the main visible hero content.

---

## Ownership Split

Use this production ownership model:

```text
Native SharePoint chrome = persistent project/site identity
PCC shell hero = selected tab identity, project context, production highlights, reminders, governance microcopy
PCC bento grid = operational content and workflow/detail cards
```

Important implications:

- Do not repeat the project name in the PCC hero if SharePoint chrome already provides persistent project identity.
- Project context facts such as Client, Location, Estimated Value, Scheduled Completion, and Project Stage may remain where useful.
- The metadata band below the selected surface title should become tool-specific and end-user focused.
- Governance remains present but visually secondary.

---

## Current Baseline

Expected recent runtime baseline includes Prompt 04B-01 commit:

```text
96d22ce74662f6216e4b95bd75fe978b50bbae25
```

Known state after 04B-01:

- `PccProjectIntelligenceCard` removed.
- Project Home bento starts with `PccPriorityActionsCard`.
- `project-home` moved to `SURFACES_WITH_SHELL_ONLY_PANEL`.
- Client was added to the global hero facts row.
- Team & Access, External Platforms, and Settings are shell-only surfaces from prior work.
- Documents, Project Readiness, Approvals, and Site Health may still have top-level summary/operational-header hybrid cards pending later prompts.
- Current hero metadata still renders implementation-facing `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`.

A package/version-only deployment bump to `1.0.0.20` may exist. Treat that as acceptable only if it is already reviewed and contains no unreviewed runtime/source/test drift beyond package/version files.

---

## Strict Scope

This prompt may edit the shell hero content model and tests needed to support it:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

It may add a small shell/preview helper file if that is the cleanest design, for example:

```text
apps/project-control-center/src/shell/surfaceHeroHighlights.ts
apps/project-control-center/src/preview/surfaceHeroHighlights.ts
```

It may inspect, but should not mutate, surface runtime files to understand deterministic preview data:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/siteHealth/**
```

Do not edit surface runtime composition in this prompt unless the current hero cannot be fixed without a tiny, clearly justified exported constant/import-safe helper. Default is **no surface runtime edits**.

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

If package/manifest/lockfile changes are required, stop and report.

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

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

Hard stop if the working tree is dirty in shell, preview, shared tests, package, manifest, or lockfile files unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current files before editing:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccShell.tsx

apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx

apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/surfaces/siteHealth/
```

Do not edit the surface runtime files unless the implementation report explains exactly why a small helper export is unavoidable.

---

## Required Searches

Run and classify results:

```bash
rg -n "MODE|SOURCE|AUTHORITY|Command preview|Fixture / read-model preview|Advisory only|surfaceSummaryItems|surfaceCues|readOnlyCue|FOCUS|BOUNDARY|POSTURE|HBI|No .* from this header|no .* from this header|no decisions|no writeback" apps/project-control-center/src/shell apps/project-control-center/src/tests
rg -n "data-pcc-hero-summary|data-pcc-hero-surface-summary|data-pcc-hero-surface-cues|data-pcc-hero-read-only-cue|data-pcc-hero-facts|data-pcc-hero-highlight" apps/project-control-center/src
rg -n "Priority Actions|Approvals & Checkpoints|Missing Configurations|Project Team Map|Request access|Document control|Readiness|Approvals home|Launch Pad summary|Items needing setup|Site Health" apps/project-control-center/src/surfaces apps/project-control-center/src/tests
rg -n "SAMPLE_PRIORITY_ACTIONS|SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS|SAMPLE_PROJECT_PROFILE|SAMPLE_TEAM|SAMPLE_APPROVAL|SAMPLE_SITE_HEALTH|SAMPLE_READINESS|SAMPLE_EXTERNAL" apps/project-control-center/src packages apps
rg -n "PccProjectHeroBand|deriveShellHeroViewModel|IPccShellHeroViewModel|PCC_SHELL_SURFACE_HEADER_METADATA" apps/project-control-center/src
```

Classify each relevant result as:

```text
CURRENT PRODUCTION-VISIBLE SCAFFOLD LABEL
CURRENT PROJECT FACT
AVAILABLE TOOL DATA
TEST CONTRACT
CANDIDATE HIGHLIGHT SOURCE
HISTORICAL COMMENT ONLY
```

---

## Required Design Decision

Before editing, decide and report the minimum viable implementation path.

### Preferred Path A — New `heroHighlights` / `governanceMicrocopy` metadata

Extend the shell surface metadata model with production hero content, for example:

```ts
export interface IPccShellHeroHighlight {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone?: 'neutral' | 'attention' | 'success' | 'warning' | 'risk';
  readonly kind?: 'summary' | 'status' | 'reminder' | 'next-step';
}

export interface IPccShellHeroMicrocopy {
  readonly id: string;
  readonly text: string;
}
```

Add optional fields:

```ts
readonly heroHighlights?: readonly IPccShellHeroHighlight[];
readonly governanceMicrocopy?: readonly IPccShellHeroMicrocopy[];
```

Then update the hero band:

- render `heroHighlights` in the metadata band where `MODE/SOURCE/AUTHORITY` and `FOCUS/BOUNDARY/HBI` currently appear;
- render `governanceMicrocopy` or a demoted form of `readOnlyCue` as secondary microcopy;
- stop rendering `MODE`, `SOURCE`, `AUTHORITY`, `FOCUS`, `BOUNDARY`, `POSTURE`, and `HBI` as production-visible labels.

Keep legacy metadata fields only if tests or internal logic still need them temporarily. They should not be the main visible hero content.

### Acceptable Path B — Replace presentation of existing metadata

Only acceptable if the visible result fully replaces the old labels and produces production-quality labels and values.

Example:

```text
Old: MODE Command preview
New: Priority Actions 4 open
```

Do not merely rename `MODE` to `STATUS` while leaving implementation-facing values like `Command preview` / `Fixture preview` / `Advisory only`.

### Prohibited Path

Do not leave the hero showing:

```text
MODE
SOURCE
AUTHORITY
FOCUS
BOUNDARY
POSTURE
HBI
```

as visible labels in the band shown in the screenshot.

Do not add read-model-state fetching or live API calls.

Do not implement deep workflow CTAs. This prompt establishes the production content seam and seeds deterministic preview-safe copy.

---

## Required Hero Band Outcome

The hero should have these production regions.

### 1. Identity region

Keep:

```text
Project Control Center
<Selected Surface Name>
<Selected Surface Description>
Command Search — Preview
```

### 2. Project context row

Keep useful project facts where appropriate:

```text
Client
Location
Estimated Value
Scheduled Completion
Project Stage
```

Do not show project name/project number inside PCC if native SharePoint chrome provides persistent project identity.

### 3. Production metadata / highlight band

Replace the screenshot section with a production band.

Example for Project Home:

```text
Priority Actions       4 open · 2 blocking
Approvals              3 pending
Setup Gaps             1 blocking

Review blocking action items before the next project meeting.
Read-only preview
```

Example for Team & Access:

```text
Team Summary           2 internal · 1 external · 1 guest
Access Requests        No open requests
Permission Reminder    Changes follow governed workflows

Only access managers can change project team permissions.
Read-only preview
```

### 4. Governance microcopy

Governance should be visually subordinate:

```text
Read-only preview
Managed through governed workflows
Actions remain in source systems
```

It may be present, but it should not read like the hero’s main message.

---

## Required Initial Highlight Set by Surface

Seed a first-pass production highlight set for all eight surfaces using current deterministic repo data or static preview-safe copy.

Use exact current fixture values where current repo truth provides them. Do not invent live data.

### Project Home

Suggested highlights:

```text
Priority Actions: 4 open
Approvals: 3 pending
Setup Gaps: 1 blocking
```

Suggested reminder:

```text
Review blocking project signals before the next coordination meeting.
```

### Team & Access

Suggested highlights:

```text
Team Summary: 2 internal · 1 external · 1 guest
Access Requests: No open requests
Permission Reminder: Changes follow governed workflows
```

Suggested reminder:

```text
Only access managers can change project team permissions.
```

### Documents

Suggested highlights:

```text
Document Sources: Project Record · My Project Files · External References
Record Source: Project Record remains the formal file source
Open Items: Source confirmation required where flagged
```

Suggested reminder:

```text
Project Record remains the formal source for project files.
```

Keep `PccDocumentsHeaderCard` untouched in this prompt unless tests force a smaller copy-only update. Its removal remains a separate Documents state-seam prompt.

### Project Readiness

Suggested highlights:

```text
Readiness Status: Preconstruction gate · Blocked
Blockers: 7 open
Evidence: Low confidence
```

Suggested reminder:

```text
Resolve blockers before advancing readiness posture.
```

Do not remove readiness hero/summary cards in this prompt.

### Approvals

Suggested highlights:

```text
Approval Status: Pending decisions require review
Routing: Checkpoint context only
Escalations: Review queue for overdue items
```

Suggested reminder:

```text
Approval actions remain in governed approval workflows.
```

Use actual deterministic counts if available. Do not invent live counts.

### External Platforms

Suggested highlights:

```text
Launch Links: 6 active
Mapping Warnings: 4 mappings with warnings
Reviews: 2 pending reviews
```

Suggested reminder:

```text
Review mapping warnings before expanding external platform usage.
```

### Control Center Settings

Suggested highlights:

```text
Settings Scope: Project · site · persona · integrations
Setup Items: Configuration items remain
Governance: Managed by PCC administrator
```

Suggested reminder:

```text
Tenant and project settings are managed through governed workflows.
```

### Site Health

Suggested highlights:

```text
Site Health: 1 failing check · 1 warning
Last Scan: Apr 26, 2026
Repair Posture: Managed through SharePoint admin tooling
```

Suggested reminder:

```text
Review failing checks before relying on site automation.
```

---

## Copy Rules

### Avoid visible labels

```text
MODE
SOURCE
AUTHORITY
FOCUS
BOUNDARY
POSTURE
HBI
```

### Avoid visible values as primary content

```text
Command preview
Fixture / read-model preview
Advisory only
Grounded preview, no writeback
No <action> from this header
```

### Prefer end-user labels

```text
Priority Actions
Approval Status
Access Requests
Document Sources
Readiness Status
Launch Links
Setup Items
Site Health
Reminder
```

### Use governance as microcopy

```text
Read-only preview
Managed through governed workflows
Actions remain in source systems
Preview data only
```

### Do not imply an enabled action unless one exists

Avoid labels that sound like active buttons:

```text
Change Permissions
Approve
Repair
Sync
Submit
Launch
```

Use status/reminder language instead:

```text
Permission Status
Approval Queue
Repair Posture
Source Links
Submission Status
```

---

## Required Test Updates

Update tests to prove:

1. The hero no longer renders production-visible labels `MODE`, `SOURCE`, `AUTHORITY`, `FOCUS`, `BOUNDARY`, `POSTURE`, or `HBI` in the metadata band.
2. The hero no longer renders primary values such as `Command preview`, `Fixture / read-model preview`, or `Advisory only` as the main visible metadata row.
3. The hero still renders selected-surface title, description, project facts where applicable, production highlights, and governance microcopy.
4. Each of the eight surfaces renders at least one production highlight.
5. Project Home still renders Client and project facts.
6. Team, Documents, and External Platforms may continue to render global project facts, but their production highlight rows must be selected-surface-specific.
7. Existing shell-only vs compatibility-card split remains unchanged:
   - shell-only: project-home, team-and-access, external-systems, control-center-settings;
   - compatibility-card: documents, project-readiness, approvals, site-health.
8. Direct-child bento invariant tests remain green.
9. Existing no-writeback/source-authority protections remain testable through governance microcopy or metadata assertions, not primary hero labels.

Recommended test files:

```text
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

---

## Implementation Requirements

### 1. Preserve typed metadata discipline

If adding new metadata types, export them from `surfaceHeaderMetadata.ts` and re-export or consume them cleanly from `projectShellViewModel.ts`.

Do not use untyped object literals in the hero component.

### 2. Keep hero rendering data-driven

The hero component should render arrays of facts/highlights from the view model.

Avoid hardcoded conditional JSX like:

```ts
if (activeSurfaceId === 'team-and-access') ...
```

Prefer:

```ts
viewModel.heroHighlights.map(...)
```

### 3. Demote governance, do not delete it

The existing `readOnlyCue` may remain internally, but user-facing output should be shortened and demoted.

Do not delete governance/no-writeback protections from tests. Change the presentation, not the policy.

### 4. Avoid broad surface runtime edits

Highlights can be seeded from deterministic metadata or existing imported fixtures. Do not pull data from each surface’s runtime component if that creates coupling.

### 5. Respect phased bento remediation

This prompt fixes the hero metadata band across all eight surfaces. It does not remove remaining bento summary cards.

Later prompts still handle:

```text
Documents state-aware seam and header removal
Project Readiness top-card absorption
Approvals home absorption
Site Health overview absorption
External Platforms / Settings / Team audits if still needed
```

---

## Required Verification Matrix

Before and after editing, produce:

| Surface | Old visible scaffold labels | New production highlights | Project facts shown? | Governance microcopy | Bento first card changed? |
|---|---|---|---|---|---|
| Project Home | | | | | |
| Team & Access | | | | | |
| Documents | | | | | |
| Project Readiness | | | | | |
| Approvals | | | | | |
| External Platforms | | | | | |
| Settings | | | | | |
| Site Health | | | | | |

Expected:

- Bento first card changed? should be `No` for every surface in this prompt.
- This prompt is hero metadata band remediation, not bento composition remediation.

---

## Validation

Run after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized by the user. Because this changes visible hero copy across surfaces, closeout must mark hosted evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- fixing hero copy requires live API/read-model fetching;
- replacing the metadata band would require changing bento surface runtime composition;
- tests require deleting governance/no-writeback coverage without replacement;
- copy cannot be made production-safe without inventing unavailable project facts;
- package, manifest, or lockfile files would change;
- existing shell-only vs compatibility-card classification would need to change;
- direct-child bento invariant tests would need weakening.

---

## Closeout Report Requirements

Report:

- files changed;
- implementation path selected;
- old hero visible scaffold labels removed;
- new metadata/view-model fields added;
- new hero regions rendered;
- highlight set per surface;
- Project Home facts after change;
- Team/Documents/External Platforms fact/highlight behavior after change;
- governance microcopy behavior after change;
- tests changed;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- hosted runtime evidence status;
- follow-up prompts still required.

Commit summary draft:

```text
refactor(pcc): replace hero scaffold labels with production highlights
```

Commit body should state:

- replaced production-visible MODE/SOURCE/AUTHORITY and FOCUS/BOUNDARY/POSTURE cue rows with typed production hero highlights;
- kept governance/read-only posture as demoted microcopy;
- seeded deterministic highlights for all eight PCC surfaces;
- preserved Project Home project facts including Client;
- did not change bento runtime composition;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.

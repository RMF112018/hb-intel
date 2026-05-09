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
# Surface Focus: Documents

## Objective

Create the missing state-aware Documents seam so `PccDocumentsHeaderCard` can be removed without losing dynamic loading/error/source-unavailable/default posture copy.

Documents currently remains the major Phase 04 failure point: the header card still appears because execution-time repo truth showed no dedicated loading/error/source-unavailable state card outside the header.

## Current Problem

The Documents bento grid still begins with:

```text
HB Document Control Center
Document control shows three lanes for this project.
```

That is a top-level header/summary card, not operational content. It duplicates the shell hero, but it also currently carries state-specific copy that must not be lost.

## Required Reads

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

## Required Searches

```bash
rg -n "PccDocumentsHeaderCard|HB Document Control Center|Document control shows three lanes|Loading document control content|temporarily unavailable|No document control sources" apps/project-control-center/src
rg -n "sourceStatus|readModelStatus|source-unavailable|backend-unavailable|PccPreviewState|PccSurfaceContextHeader" apps/project-control-center/src/surfaces/documents apps/project-control-center/src/tests
rg -n "dataActiveSurfacePanel=\"documents\"|data-pcc-active-surface-panel=\"documents\"" apps/project-control-center/src
```

## Implementation Requirements

### 1. Build or Identify a Non-Header State Seam

Preserve each branch:

| Branch | Current header copy | Required retained home |
|---|---|---|
| Loading | `Loading document control content.` | Dedicated loading state card or existing state component |
| Error / backend unavailable | `Document control is temporarily unavailable. Try again later.` | Dedicated error state card |
| Source unavailable | `No document control sources are available for this project.` | Dedicated unavailable/source-state card |
| Ready/default | `Document control shows three lanes for this project.` | Not required if three operational lane cards self-evidence structure |

Preferred:

- Add `PccDocumentsStateCard` or equivalent state-only component for loading/error/source-unavailable posture.
- Use it only for non-ready states.
- Keep ready path focused on operational cards.
- Do not make the shell header read-model-state-aware.

### 2. Remove `PccDocumentsHeaderCard`

After the seam is in place:

- remove imports/usages;
- delete `PccDocumentsHeaderCard.tsx` after import proof;
- ensure Documents starts with the first operational document lane card in ready state.

### 3. Active-Panel Classification

Preferred final state:

- Documents becomes uniformly shell-only across ready/loading/error/source-unavailable branches.

If a retained state card still emits the marker, make tests branch-aware. Do not globally classify Documents as shell-only unless all rendered branches match.

### 4. Tests

Prove:

- `HB Document Control Center` no longer appears as a first bento header card;
- loading/error/source-unavailable posture still renders;
- ready state starts with operational document lane cards;
- shell hero carries Documents identity and read-only/no-move/no-writeback copy;
- bento invariant remains intact;
- active-panel split matches runtime truth.

## Hard Stops

Stop if:

- state-copy preservation requires shell read-model-state plumbing;
- source-unavailable copy would be lost;
- no operational Documents cards remain after removal;
- tests would delete coverage instead of replacing it.

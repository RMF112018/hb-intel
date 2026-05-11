# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

Follow these rules for this prompt:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior unless this prompt explicitly says otherwise.
- Preserve Document Control’s specialized `PccDocumentsSurface` unless this prompt explicitly says otherwise.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Phase 07 Baseline

Current intended baseline:

```text
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
Phase 06 evidence commits:
  4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
  e6886489bb4f85d32840f69914dfb3b615f28aaf
Phase 06 evidence root:
  docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
  docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

Phase 07 objective:

```text
Remove and permanently block the Phase 05 regression where redundant top-level
Dashboard/title-description bento cards returned on the six shared primary
dashboard pages: Core Tools, Estimating & Preconstruction, Project Startup &
Closeout, Project Controls, Cost & Time, and Systems Administration.
```


# Prompt 08 — Optional Focused Live Playwright Evidence

## Objective

If the operator authorizes live evidence, add and/or run a focused Phase 07 live Playwright spec proving the redundant shared-dashboard top cards are removed on the tenant-hosted PCC page.

Do not run live Playwright unless the local environment is already authorized and the operator expects it.

## Preferred New Spec

```text
e2e/pcc-live/pcc-live.phase07-no-redundant-shared-dashboard-cards.spec.ts
```

## Live Spec Scope

Cover only:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Do not duplicate the entire Phase 06 suite.

## Required Live Assertions

For each affected surface:

1. Surface tab activates successfully.
2. Shell panel exists exactly once:

```text
main[role="tabpanel"][data-pcc-active-surface-panel]
```

3. No card-level active-panel marker exists.
4. Exactly one bento grid exists.
5. The first direct bento card heading is `Module status`.
6. No direct bento card heading equals:
   - active surface label;
   - `Dashboard`.
7. No direct card contains the old surface description as generic intro copy.
8. No nested cards exist.
9. Analytics titles still render where applicable.
10. Cost & Time still renders Sage cue.
11. No `Project Intelligence` text exists.
12. No developer/TODO UI copy exists.
13. No horizontal overflow is detected.

## Expected Live Card Counts

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Do not use the old Phase 06 shared-dashboard counts for these six surfaces.

## Commands

Preflight:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
```

Focused run:

```bash
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-07-v1.0.0.218-no-redundant-shared-dashboard-cards" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.phase07-no-redundant-shared-dashboard-cards.spec.ts
```

If a package version bump and tenant redeploy are explicitly authorized, use the new package version in the evidence root name. Otherwise keep `1.0.0.218` in the evidence root.

## Important Evidence Caveat

Do not claim full Phase 08 scorecard readiness. This is focused Phase 07 evidence only.

## Acceptance Criteria

- Focused live spec exists if authorized.
- Focused live spec passes or self-skips only when environment is not ready.
- Evidence root is scoped to Phase 07.
- No auth/storage/HAR/trace/video artifacts are committed if repo policy excludes them.
- Screenshot policy follows current repo rules.

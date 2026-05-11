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


# Prompt 09 — Closeout Report and Commit Guidance

## Objective

Produce a complete closeout report after Phase 07 implementation, tests, and optional evidence.

## Required Commands

Run and capture output:

```bash
git status --short
git diff --stat
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If live Playwright was authorized:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
PCC_EVIDENCE_OUTPUT_DIR="<phase-07-evidence-root>" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.phase07-no-redundant-shared-dashboard-cards.spec.ts
```

## Required Closeout Sections

Return:

```text
Phase 07 Closeout

Repo / Version:
- HEAD:
- Branch:
- solution.version before:
- solution.version after:
- feature.version before:
- feature.version after:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Files Changed:
- ...

Implementation Summary:
- ...

Phase 05 Remediation:
- Removed redundant shared Dashboard card: yes/no
- Affected surfaces:
- Reintroduction blocked by tests: yes/no

Final Shared Dashboard Counts:
- core-tools:
- estimating-preconstruction:
- startup-closeout:
- project-controls:
- cost-time:
- systems-administration:

Preservation Confirmations:
- Project Home preserved:
- Document Control preserved:
- Phase 06 analytics preserved:
- Cost & Time Sage cue preserved:
- Shell-owned active panel preserved:
- No card-level active panel:
- No nested cards:
- No Project Intelligence:
- No echarts-for-react:
- No dependency changes:
- No live writeback / command-model behavior:

Validation:
- check-types:
- vitest:
- prettier:
- diff check:
- Playwright, if run:

Known Limitations / Caveats:
- ...

Recommended Commit Summary:
- ...

Recommended Commit Description:
- ...
```

## Commit Summary Style

Use:

```text
fix(pcc): remove redundant shared dashboard header cards
```

## Commit Description Must Mention

- Phase 05 remediation completed during Phase 07.
- Generic shared `Dashboard` bento card removed from `PccPrimaryDashboardSurface`.
- First direct card on affected surfaces is now `Module status`.
- Cost & Time Sage book-of-record cue preserved and moved out of the generic top card.
- Phase 06 analytics preserved.
- Project Home and Document Control preserved.
- Regression tests added/updated to block reintroduction.
- No dependency changes.
- No `echarts-for-react`.
- No source-system writeback or command-model behavior.

## Acceptance Criteria

- Closeout is complete and specific.
- Validation output is included.
- No unsupported claims are made.
- Known evidence caveats are preserved.

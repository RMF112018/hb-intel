# Prompt 14 — Playwright Evidence and Phase 06 Closeout — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing the final focused Phase 06 closeout for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added the `spanOverrides` foundation.
Prompt 02 locked Project Home operational choreography and gateway actions.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.
Prompt 04 inserted Project Home analytics cards.
Prompts 07–11 inserted analytics cards into every Phase 06 primary dashboard except Core Tools.
Prompt 12 added post-MVP stage/lifecycle TODO documentation only.
Prompt 13 added cross-cutting Vitest regression coverage.

Prompt 14 performs **final Playwright/evidence closeout and validation**.

## Objective

Generate final Phase 06 Playwright/evidence closeout for the PCC app, proving that the deployed/live-hosted PCC package and local repo-truth align on:

- shell-owned active-panel behavior;
- final Phase 06 primary-tab navigation;
- Project Home choreography;
- Phase 06 analytics card rendering;
- expected card counts;
- no duplicate Project Intelligence card;
- no card-level active-panel markers;
- analytics preview/sample-data explanations;
- no false-affordance gateways;
- no horizontal overflow or obvious clipping at required evidence breakpoints;
- safe read-only / preview / no-writeback posture;
- final validation report and evidence manifest.

This prompt may add or update **Playwright/evidence tests and closeout documentation only**, plus extremely narrow fixes if live evidence reveals a real defect. It must not introduce new app features.

## Current Repo-Truth Baseline

Expected minimum ancestry:

```text
Phase 5 closeout: d06d614a02f16123d8c8252f71cebc22f348bc51
Prompt 01: 6e6454aafc4c9a6ca04e58611139eddab9616ae7
Prompt 02: e5f9783e18f0a5860abec589b01bbc8f58ed1551
Prompt 03: 08f133842fc6e8c10f3bfa5dd4fab49178942352
Prompt 04: fdedc65dbe88850fd58d4fdadb394f7043ca6619
Prompt 07: 75845d253951ae19248b4b820e17ffb50db443e3
Prompt 08: 81671c4b46b96217058502c85652aa31e07065d7
Prompt 09: 1eb52e594475efec5163b0f91ae3f144f003dcea
Prompt 10: 122d9c6d156e2f99ccbc33d9e90823c72756159e
Prompt 11: 35417e699fc1a1a4b9c4e9d06e0e1ac3c77ea153
Prompt 12: 33dd4ffc834fb4a2c8fc34c08feeb22ae4af0fc5
Prompt 13: a139ea22640878d821ec77aec27caf7e269b27b8
```

Current expected PCC package state for this prompt:

```text
apps/project-control-center/config/package-solution.json:
  solution.version = 1.0.0.218
  solution.features[0].version = 1.0.0.218

pnpm-lock.yaml md5 = 7c19ccfa8718a42f7f55ce178a626996
```

Do not rely on stale remote `main` if the local branch has the approved `1.0.0.218` bump. Use local repo truth.

Expected current PCC Vitest baseline after Prompt 13:

```text
full PCC vitest suite: 2306/2306 across 106 files
```

## Critical Playwright Lane Facts

The PCC live lane is opt-in and tenant-oriented:

```text
playwright.pcc-live.config.ts
```

- uses `testDir: './e2e/pcc-live'`;
- uses no local `webServer`;
- runs serially with `workers: 1`;
- uses `trace: 'retain-on-failure'`;
- uses storage state only if the resolved storage-state file exists;
- supports optional Brave parity through `PCC_LIVE_BRAVE_EXECUTABLE_PATH`.

The PCC live env resolver in:

```text
e2e/pcc-live/pcc-live.env.ts
```

returns a non-ready `package-version-mismatch` status if `solution.features[].version` does not match `solution.version`.

Therefore, Prompt 14 must hard-gate on both solution and feature versions being `1.0.0.218` before attempting to claim live evidence success.

## Global Instructions

- Do not re-read files still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react`.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, tenant mutation, Procore/Sage/SharePoint mutation, command-model behavior, sync execution, or random render-time data.
- Do not script save/submit/approve/reject/delete/provision/sync actions in the live lane.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add or tolerate card-level `data-pcc-active-surface-panel` in final validation.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not commit raw traces, raw Playwright reports, raw test-results, auth/session files, storageState files, unsanitized console dumps, cookies, tokens, personal data, or tenant-sensitive artifacts.
- Do not fabricate Playwright evidence if live credentials, storage state, tenant package, or deploy state blocks execution.

## Scope

Expected edits, if coverage gaps are found:

```text
e2e/pcc-live/*
docs/architecture/evidence/pcc-live/<phase-06-final-run-id>/*
```

Possible focused new or updated live spec:

```text
e2e/pcc-live/pcc-live.phase06-analytics.spec.ts
```

Possible focused evidence writer/helper updates:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surfaces.ts
```

Only update these if needed to capture final Phase 06 evidence accurately and safely.

Do not edit production source unless evidence reveals a real defect. If a production edit is unavoidable, make the smallest possible fix, run full validation, and call it out clearly in closeout.

Do not edit architecture-blueprint docs unless explicitly instructed. Prompt 14 evidence may live under `docs/architecture/evidence/pcc-live/`.

## Preflight

Run before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -5
git merge-base --is-ancestor a139ea22640878d821ec77aec27caf7e269b27b8 HEAD && echo "prompt-13-present" || echo "prompt-13-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/config/package-solution.json'); const s=p.solution.version; const f=p.solution.features?.[0]?.version; console.log({solution:s, feature:f}); if (s !== '1.0.0.218' || f !== '1.0.0.218') process.exit(1);"
node -e "const p=require('./apps/project-control-center/package.json'); const deps={...p.dependencies,...p.devDependencies}; console.log({echarts:deps.echarts, echartsForReact:deps['echarts-for-react'] ?? null}); if (!deps.echarts) process.exit(1); if (deps['echarts-for-react']) process.exit(1);"
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
```

Stop and report if:

- Prompt 13 is not an ancestor;
- lockfile md5 is not `7c19ccfa8718a42f7f55ce178a626996`;
- `solution.version` is not `1.0.0.218`;
- `solution.features[0].version` is not `1.0.0.218`;
- `echarts` is missing from PCC package.json;
- `echarts-for-react` is present in PCC package.json;
- Playwright list cannot run;
- working tree has unrelated dirty runtime/test/dependency files that cannot be accounted for.

If user-owned prompt/spec docs are dirty, do not stage them unless explicitly instructed.

## Live Environment Handling

Run:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry
```

Then check whether the live lane is ready:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.runtime.spec.ts
```

If the live lane self-skips:

- report the exact self-skip status:
  - `missing-storage-state`
  - `invalid-config`
  - `package-version-mismatch`
  - other surfaced status
- do not fabricate evidence;
- still run all local typecheck/Vitest validation;
- still run registry/writer-only specs that do not require live tenant access;
- create a blocker closeout report that clearly states Phase 06 live evidence is blocked, not complete.

If the live lane is ready:

- run the full PCC live suite;
- generate a fresh evidence directory under a Phase 06-specific run id;
- validate analytics and layout evidence against the current Phase 06 contract.

## Required Run ID and Evidence Root

Use a deterministic, clearly scoped run directory. Example:

```bash
export PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final"
```

If an existing directory already exists, create a timestamped child or clearly named rerun folder:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/<YYYYMMDD-HHMMSS>/
```

Do not mix Prompt 14 evidence into older May 2026 wave-b5/wave-b6 run folders.

## Required Phase 06 Surface Matrix

Final live validation must cover these eight PCC surfaces:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Expected final card-count posture:

```text
project-home -> 12 direct cards minimum on fixture/deployed path, unless live tenant uses read-model path; if read-model path, report exact count and expected reason
core-tools -> 3 direct cards
documents -> not part of PccPrimaryDashboardSurface analytics matrix; validate Document Control surface root/card posture separately
estimating-preconstruction -> 5 direct cards
startup-closeout -> 6 direct cards
project-controls -> 6 direct cards
cost-time -> 6 direct cards
systems-administration -> 6 direct cards
```

Important correction:

- Do **not** require analytics on `documents`.
- Do **not** require analytics on `core-tools`.
- `documents` is its own Document Control surface.
- `core-tools` remains the lone 3-card primary dashboard baseline after Prompt 11.

## Required Phase 06 Analytics Assertions

Add or update a focused live spec if existing Playwright coverage does not already assert these items.

Expected analytics by surface:

```text
project-home:
- Action Exposure Mix
- Project Health Trend
- Readiness / Approval Rollup

estimating-preconstruction:
- Handoff Continuity Preview
- Estimate Exposure Preview

startup-closeout:
- Startup Readiness Completion
- Responsibility Coverage
- Closeout & Warranty Readiness

project-controls:
- Constraints Aging
- Permit / Inspection Readiness
- Risk / Issue Severity Distribution

cost-time:
- Schedule Milestone Posture
- Procurement / Buyout Exposure
- Commitment / Cost Exposure Preview

systems-administration:
- Integration Health Summary
- Configuration Severity
- Procore Mapping / Sync Posture
```

For each analytics-owning surface, live evidence must prove:

- expected analytics titles render;
- `[data-pcc-analytics-card]` exists for expected cards;
- `[data-pcc-analytics-chart]` exists within analytics cards;
- preview/sample-data markers are present;
- `Preview analytics · sample project data` is visible;
- `This preview uses deterministic sample project data until the source read model is connected.` is visible;
- deterministic source label is visible;
- fallback summary text is visible outside the chart canvas;
- chart container has meaningful accessibility posture (`role="img"` / `aria-label` where present in DOM);
- no card-level `data-pcc-active-surface-panel`;
- no `Project Intelligence` card/text;
- no obvious clipping or horizontal overflow.

## Required Project Home Assertions

Live evidence must prove:

- no duplicate `Project Intelligence` bento card;
- Project Home top-level operational order is preserved;
- expected Project Home analytics cards render;
- Project Home gateway buttons are native buttons, not anchors;
- disabled Recent Activity action has visible reason text;
- disabled Recent Activity action is not an enabled false affordance;
- no visible TODO/developer copy appears in the Project Home grid.

Project Home expected operational/analytics order:

```text
Priority Actions
Site Health Summary
Document Control Center
Action Exposure Mix
Project Health Trend
Project Readiness
Approvals & Checkpoints
Readiness / Approval Rollup
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

## Required Shell / Active Panel Assertions

For every surface:

- exactly one shell-owned active panel exists:

```text
main[role="tabpanel"][data-pcc-active-surface-panel="<surface-id>"]
```

- no direct or nested card carries `data-pcc-active-surface-panel`;
- no nested `[data-pcc-card] [data-pcc-card]`;
- bento grid exists;
- cards are direct bento children where applicable;
- selected tab state is visible through `aria-selected="true"` or `data-pcc-tab-active="true"`;
- hero band exists;
- hero secondary title matches the surface label;
- command-search preview slot is non-interactive:
  - zero `input`
  - zero `button`
  - zero `a`
  - zero `select`
  - zero `textarea`
  - zero `[tabindex="0"]`
  - zero `[role="button"]`

Do not accept compatibility-mode shell ownership as a final pass. If shell-main ownership fails, report Prompt 14 as blocked or failed unless the user explicitly chooses to accept tenant-package lag.

## Required Responsive / Screenshot Evidence

Capture fresh evidence for, at minimum:

```text
Project Home — standardLaptop
Project Home — desktop
Project Home — ultrawide
Estimating & Preconstruction — desktop
Startup & Closeout — desktop
Project Controls — desktop
Cost & Time — desktop
Systems Administration — desktop
Core Tools — desktop
Document Control — desktop
```

For each screenshot/breakpoint evidence set, record:

- viewport width/height;
- surface id;
- active tab label;
- card count;
- overflow measurement;
- whether horizontal overflow was detected;
- whether clipping was detected;
- screenshot path or explicit reason screenshots are not committed pending operator review;
- DOM card summary path.

Screenshots must follow the existing artifact policy:

- screenshot PNGs are operator-review required;
- do not commit screenshots without review/scrubbing;
- JSON/markdown metadata may be committed after review/scrubbing;
- never commit raw traces/videos/storageState/auth artifacts.

## Required Accessibility Evidence

Run or update the accessibility live lane so the final report includes:

- axe summary;
- keyboard focus summary;
- ARIA/label summary;
- contrast summary when available;
- reduced-motion / hover-only / touch target findings where available.

For Phase 06 analytics specifically, evidence must show:

- analytics charts have accessible names/labels where the DOM supports them;
- state/source/sample-data labels are visible text, not color-only;
- summaries are visible outside the chart canvas;
- disabled gateway reason text is visible.

## Required Evidence Commands

If live lane is ready, run:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final" pnpm pcc:e2e:live
```

If you add a focused Phase 06 live spec, run it directly first:

```bash
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.phase06-analytics.spec.ts
```

Then run the full live suite.

If live lane is blocked, run only the non-live/writer-safe specs and report the blocker. Do not claim evidence completion.

## Required Local Validation

Always run at closeout:

```bash
git status --short
git rev-parse HEAD
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/config/package-solution.json'); const s=p.solution.version; const f=p.solution.features?.[0]?.version; console.log({solution:s, feature:f}); if (s !== '1.0.0.218' || f !== '1.0.0.218') process.exit(1);"
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If no files changed, omit the prettier command or run it against the touched evidence/summary files only if applicable.

If `pnpm exec prettier` cannot resolve, stop and report. Do not use `npx`.

Expected unchanged dependency/lockfile posture:

```text
dependencies installed by agent: No
echarts: already present
echarts-for-react: absent
pnpm-lock.yaml md5 before/after: 7c19ccfa8718a42f7f55ce178a626996
```

Expected unchanged SPFx posture:

```text
solution.version before/after: 1.0.0.218
solution.features[0].version before/after: 1.0.0.218
version changed in Prompt 14: No
```

## Evidence Closeout Report

Create or update a final closeout report under the Prompt 14 evidence folder, for example:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/PHASE_06_PLAYWRIGHT_CLOSEOUT.md
```

The report must include:

```text
HB: Phase 06 Prompt 14 Closeout — Playwright Evidence and Final Validation

Branch / Version:
- HEAD:
- Base ancestry:
- SPFx solution version before:
- SPFx solution version after:
- SPFx feature version before:
- SPFx feature version after:
- Version changed in this prompt:

Dependency / Lockfile:
- Dependencies installed by agent:
- echarts present:
- echarts-for-react present in PCC package:
- PCC source imports echarts-for-react:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Live Environment:
- PCC_LIVE_PAGE_URL:
- PCC_EVIDENCE_OUTPUT_DIR:
- live status:
- storageState status:
- package-version status:
- conditional env status:
- unauthorized env status:
- blocker, if any:

Playwright Commands:
- pcc:e2e:live:list:
- pcc:e2e:evidence:registry:
- focused Phase 06 live spec:
- pcc:e2e:live:
- skipped/operator-pending specs:

Evidence Artifacts:
- evidence root:
- manifest paths:
- screenshot metadata paths:
- breakpoint metadata paths:
- accessibility metadata paths:
- workflow/content/doctrine/source paths:
- scorecard/report package paths:
- screenshots committed:
- screenshots withheld pending operator review:
- raw artifacts excluded:

Surface Validation Matrix:
| Surface | Active panel shell-owned | Card count | Analytics expected | Analytics observed | Overflow | Screenshot/DOM evidence |
|---|---:|---:|---:|---:|---:|---|
| project-home | | | | | | |
| core-tools | | | | | | |
| documents | | | | | | |
| estimating-preconstruction | | | | | | |
| startup-closeout | | | | | | |
| project-controls | | | | | | |
| cost-time | | | | | | |
| systems-administration | | | | | | |

Analytics Validation:
- Project Home analytics:
- Estimating analytics:
- Startup & Closeout analytics:
- Project Controls analytics:
- Cost & Time analytics:
- Systems Administration analytics:

Accessibility / False Affordance:
- analytics accessible labels:
- visible source/state/sample-data text:
- fallback summaries outside chart:
- disabled gateway reason:
- command-search non-interactive posture:

Validation:
- check-types:
- PCC Vitest:
- Playwright list:
- registry:
- live suite:
- prettier:
- git diff --check:

Known Limitations / Operator-Pending:
- live-captured:
- synthetic-only:
- operator-pending:
- blocked:
- evidence not committed pending review:

Conclusion:
- Phase 06 evidence status:
  - complete / complete except operator-pending artifacts / blocked
- confirmation no live writeback/integration/mutation introduced:
```

Do not claim final score, final hard-stop pass, production deployment approval, or final Phase 4 readiness approval. The Playwright subset supports evidence traceability and operator/expert review; it is not automatic approval authority.

## Commit Guidance

If files are changed, use this commit summary:

```text
test(pcc): HB Intel Project Control Center 1.0.0.218 — close Phase 06 Playwright evidence
```

Suggested description bullets:

```text
- run final PCC Phase 06 Playwright evidence closeout against the 1.0.0.218 package posture;
- add/update focused live evidence assertions for Phase 06 analytics cards, card counts, shell-owned active-panel behavior, Project Home gateway affordances, and no-regression guardrails;
- generate curated evidence metadata and closeout report under docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final;
- preserve read-only/no-writeback posture and avoid tenant mutation;
- no dependency install, no echarts-for-react, no lockfile change, no SPFx version bump, no production feature changes.
```

If live evidence is blocked and no files change, do not create a no-op commit. Report the blocker and required next action.

## Acceptance Criteria

Prompt 14 passes only if one of these is true:

### Full Pass

- local validation passes;
- live lane is ready;
- focused Phase 06 evidence assertions pass;
- full PCC live suite passes or any skipped specs are explicitly classified as expected/operator-pending;
- evidence report is created;
- evidence artifacts are curated and scrubbed per policy;
- no dependency/version/lockfile drift;
- no live mutation introduced.

### Blocked but Honest Closeout

- local validation passes;
- live lane blocker is clearly identified;
- no fabricated evidence;
- report clearly says Phase 06 live evidence is blocked;
- required next action is explicit.

Do not mark Phase 06 fully complete unless live evidence is captured or the user explicitly accepts an operator-pending closeout.

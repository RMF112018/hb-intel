# Phase 08 Prompt 09E — Prompt 09 Follow-On Regression, Visual Evidence, and Closeout Gate

## Role
Act as the final auditor and implementation closeout owner for the **Prompt 09 follow-on package** in the `RMF112018/hb-intel` repo.

This prompt is **not** a new product expansion. It validates, documents, and closes the implementation delivered by Prompts **09A–09D**. Production/runtime edits are not expected unless a narrowly scoped Prompt 09-owned defect is discovered during validation.

---

## Current Repo-Truth Baseline
The reviewed upstream baseline for this prompt is:

```text
3072a01aa8a7d8fe3eebaf00da49a624e308fc8f
pcc: rechoreograph project-home read-model tail layout
```

At the time this prompt was prepared, `main` was identical to that SHA.

If local HEAD has moved forward:
- classify the drift;
- preserve operator-owned work;
- proceed only if the Prompt 09 regression/evidence closeout can be completed without overwriting unrelated work.

### Required Prompt 09 Implementation Chain
Confirm each implementation commit is an ancestor of current HEAD:

```text
09A — 23ef8a26a364f919fd80d0b2a27c1b28dc17498d
      pcc: add document-control home feed contract and project-home seam

09B — 0159f408e3b81f223327afb84ce7d6624707dc52
      pcc: redesign project-home document control card feed tabs

09C — 0ff708201521ad722942057265345f523a62c7a8
      pcc: rechoreograph project-home row 2 spans and order

09D — 3072a01aa8a7d8fe3eebaf00da49a624e308fc8f
      pcc: rechoreograph project-home read-model tail layout
```

These are the commits Prompt 09E must close out.

---

## Baseline / Preflight
Before editing or validating:

1. Confirm branch, HEAD, and recent history:
   ```bash
   git rev-parse --abbrev-ref HEAD
   git rev-parse HEAD
   git log --oneline -12
   ```

2. Confirm each Prompt 09 implementation commit is present:
   ```bash
   git merge-base --is-ancestor 23ef8a26a364f919fd80d0b2a27c1b28dc17498d HEAD && echo "09A-present" || echo "09A-missing"
   git merge-base --is-ancestor 0159f408e3b81f223327afb84ce7d6624707dc52 HEAD && echo "09B-present" || echo "09B-missing"
   git merge-base --is-ancestor 0ff708201521ad722942057265345f523a62c7a8 HEAD && echo "09C-present" || echo "09C-missing"
   git merge-base --is-ancestor 3072a01aa8a7d8fe3eebaf00da49a624e308fc8f HEAD && echo "09D-present" || echo "09D-missing"
   ```

3. Capture working-tree posture and lockfile checksum:
   ```bash
   git status --short
   md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
   ```

4. Confirm current package / manifest posture.
   Reviewed Prompt 09 execution posture is **`1.0.0.222`**. If a newer operator-approved posture exists locally, classify it before proceeding.

   Verify solution + feature package posture:
   ```bash
   node -e "const p=require('./apps/project-control-center/config/package-solution.json'); const s=p.solution.version; const f=p.solution.features?.[0]?.version; console.log({solution:s, feature:f}); if (s !== '1.0.0.222' || f !== '1.0.0.222') process.exit(1);"
   ```

   Verify PCC webpart manifest posture:
   ```bash
   node -e "const fs=require('fs'); const p='apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json'; const m=JSON.parse(fs.readFileSync(p,'utf8')); console.log({manifest:m.version}); if (m.version !== '1.0.0.222') process.exit(1);"
   ```

5. Preserve operator-owned WIP.
   - Do not revert, normalize, restage, or delete unrelated dirty files.
   - If parallel Documents-surface work exists, classify it and isolate Prompt 09E from it.

6. Do **not** re-read files still within current context or memory unless:
   - local drift is suspected;
   - an exact audit claim requires direct source verification;
   - a validation failure requires root-cause inspection.

---

## Parallel Dedicated Document Control Surface Safety — Mandatory
Parallel work on the dedicated Document Control surface may be present by this point.

Rules:
- Do **not** “clean up,” normalize, restage, or reformat Documents-surface WIP.
- Do **not** modify any file under:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
  unless a validation failure proves Prompt 09 work caused a direct compile break and the fix is strictly additive, minimal, and non-disruptive.
- Do **not** alter Prompt 10 Explorer work or Documents-surface target architecture.
- If parallel drift exists, document it and keep Prompt 09E closeout isolated from it.

---

## Objective
Validate and close out the Prompt 09 follow-on initiative by proving all of the following:

1. `PccDocumentControlCard` is now a compact recent-item feed with PCC-native card tabs.
2. The card remains preview-only:
   - no row-level deep links;
   - no live source launches;
   - no hidden executable affordances.
3. Future deep-link implementation remains explicitly documented for a later phase.
4. Project Home first 12 cards use the final Prompt 09C operational/analytics choreography.
5. Project Home read-model tail uses the final Prompt 09D lifecycle/HBI/source-intelligence choreography.
6. Bento direct-child invariants, shell-owned active-panel ownership, and no-dense-grid guardrails remain intact.
7. Dedicated Documents surface work was not disrupted.
8. A durable closeout artifact is created for the Prompt 09 follow-on sequence.

---

## Repo-Truth Audit Targets
Audit the landed Prompt 09 implementation through the current source/tests rather than relying on narrative summaries alone.

### A. Prompt 09A — Feed contract / provider parity / Project Home seam
Verify the additive home-feed contract and Project Home read-model seam remain present and coherent.

Expected audit targets include:

```text
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/documentControlHomeFeed.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
```

Verify:
- home-feed model contract exists;
- additive read-model field remains optional/compatible;
- fixture client and backend mock provider both populate sample/empty feed consistently;
- Project Home adapter/view-model seam remains intact;
- no dedicated Documents-surface read model was broken by the additive field.

### B. Prompt 09B — Recent-item feed UI
Verify:

```text
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.wiring.test.ts
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.feed.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Required posture:
- title/gateway retained;
- `My Recent Files` is default;
- `Latest Changes` switch works;
- tablist/tab/tabpanel roles and manual-activation keyboard behavior remain correct;
- feed item markers remain present;
- top-five feed cardinality remains visible on fixture path;
- empty-feed state exists;
- no feed item is an anchor, button, or row-level launch affordance;
- developer-facing future deep-link documentation remains in the component;
- read-model Project Home path consumes `documentControlHomeFeed`, not the legacy source-array slot.

### C. Prompt 09C — First-12 choreography
Verify:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Final first-12 row posture:

#### 12-column modes
```text
Row 1: Priority Actions (5) + Project Readiness (3) + Document Control Center (4) = 12
Row 2: Action Exposure Mix (5) + Site Health Summary (3) + Project Health Trend (4) = 12
Row 3: Approvals & Checkpoints (4) + Readiness / Approval Rollup (4) + Missing Configurations (4) = 12
Row 4: External Platforms (4) + Team Snapshot (3) + Recent Activity (5) = 12
```

#### standardLaptop / 10-column mode
```text
Row 1: Priority Actions (4) + Project Readiness (3) + Document Control Center (3) = 10
Row 2: Action Exposure Mix (4) + Site Health Summary (3) + Project Health Trend (3) = 10
Row 3: Approvals & Checkpoints (3) + Readiness / Approval Rollup (4) + Missing Configurations (3) = 10
Row 4: External Platforms (3) + Team Snapshot (3) + Recent Activity (4) = 10
```

Verify no first-fold card was reintroduced, removed, or shifted outside the Prompt 09C contract.

### D. Prompt 09D — Tail choreography
Verify:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeTailChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/tests/PccProjectHomeTailChoreography.test.tsx
```

Final tail order:

```text
Lifecycle Timeline
Procore snapshot
Ask HBI — Grounded Project Answers
Project Memory
Related Records
Project Lens
```

Final 12-column matrix:

```text
Lifecycle Timeline (8) + Procore snapshot (4) = 12
Ask HBI (8) + Project Memory (4) = 12
Related Records (8) + Project Lens (4) = 12
```

Final 10-column matrix:

```text
Lifecycle Timeline (7) + Procore snapshot (3) = 10
Ask HBI (7) + Project Memory (3) = 10
Related Records (7) + Project Lens (3) = 10
```

Verify:
- direct-child bento invariant remains intact;
- Ask HBI remains idle on mount;
- Procore snapshot source-boundary / no-writeback posture remains intact.

---

## Cross-Cutting Guardrails to Verify
Confirm:

1. No `grid-auto-flow: dense`.
2. No wrapper was introduced between `PccBentoGrid` and `PccDashboardCard` direct children.
3. Shell remains sole owner of:
   ```text
   main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]
   ```
4. No card-level `data-pcc-active-surface-panel` marker has returned.
5. No `Project Intelligence` card/text has returned.
6. No live source launch, deep-link runtime, Graph/PnP/Procore runtime, or writeback behavior was introduced.
7. No unexpected package/manifest/version bump landed in Prompt 09E.
8. No lockfile or dependency drift lands in Prompt 09E unless explicitly operator-owned before the prompt.
9. No end-user-facing developer/debug copy was introduced.

---

## Validation Commands
Run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test

pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry

pnpm exec prettier --check <all Prompt 09E touched files>
git diff --check

md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Rules:
- If Prompt 09E changes no files until the closeout artifact is authored, run Prettier against the closeout artifact and any other Prompt 09E-touched files only.
- If `git diff --check` is red due pre-existing unrelated operator-owned WIP, classify the exact source and state whether any Prompt 09E-touched file contributes to the failure. Do not claim a clean diff check when the command is red.
- Do not use `npx` as a fallback for repo-local scripts.

---

## Visual Evidence — Repo-Aligned Execution
Prompt 09E should use the existing PCC live evidence lane. Do **not** invent a new evidence harness unless a direct Prompt 09 defect proves the current lane cannot capture required proof.

### Live lane facts
The live lane:
- lives under `e2e/pcc-live/`;
- uses `playwright.pcc-live.config.ts`;
- self-skips safely when auth/storage-state is unavailable;
- writes curated evidence under `PCC_EVIDENCE_OUTPUT_DIR`;
- treats screenshot PNGs as operator-review-required;
- never permits auth/session/storage-state artifacts to be committed.

### If the live lane is available
Use a Prompt 09-specific evidence root:

```bash
export PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-08-prompt-09-follow-on-v1.0.0.222-final"
```

If that root already exists, create a timestamped child under it rather than mixing runs.

Run:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry

PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-08-prompt-09-follow-on-v1.0.0.222-final" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts

PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-08-prompt-09-follow-on-v1.0.0.222-final" \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

These repo-standard specs capture **all eight PCC surfaces**. For Prompt 09E, inspect and summarize the **Project Home** subset specifically:
- screenshot evidence for Project Home;
- breakpoint evidence for Project Home;
- `standardLaptop`;
- `desktop`;
- `ultrawide`;
- above-fold Project Home card layout;
- mid-page analytics cluster;
- read-model tail region, where captured.

Do not claim that the screenshot spec is Project Home-only; it is an all-surface repo-standard lane.

### If the live lane is unavailable
- Do not fabricate evidence.
- Report the exact blocker if surfaced:
  - missing storage state;
  - invalid live config;
  - package-version mismatch;
  - browser/runtime limitation;
  - tenant/deployment mismatch.
- Still complete all local validation and the Prompt 09 closeout artifact.
- State clearly:
  ```text
  Live visual evidence was not produced in Prompt 09E because <reason>.
  ```

---

## Optional Edits Allowed
Prompt 09E may author:

1. the required closeout artifact;
2. curated evidence metadata/reports produced by the approved live lane, subject to existing scrub/operator-review policies;
3. tiny Prompt 09-owned corrective edits **only** if validation reveals a narrow defect, such as:
   - stale comments contradicting final Prompt 09 card order or card count;
   - stale test descriptions contradicting final Prompt 09 behavior;
   - a missing marker assertion test needed to close the Prompt 09 proof set;
   - a minimal type/test correction directly required to reconcile 09A–09D.

Do **not** introduce a new product feature in Prompt 09E.

Do **not** make broad runtime edits under the guise of closeout.

---

## Closeout Artifact — Required
Create a durable Prompt 09 closeout artifact at:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/closeout/PROMPT_09_FOLLOW_ON_REGRESSION_VISUAL_EVIDENCE_CLOSEOUT.md
```

If the `closeout/` directory does not yet exist, create it.

Use:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/templates/Closeout_Template.md
```

as the structural baseline, expanding it as needed for Prompt 09-specific evidence.

The closeout artifact must record:

1. branch / starting HEAD / ending HEAD;
2. package-solution, feature, and webpart-manifest version posture observed;
3. lockfile MD5 before/after;
4. Prompt 09A–09D commit chain summary;
5. final Document Control home-feed contract summary;
6. final first-12 Project Home choreography;
7. final read-model tail choreography;
8. validation commands/results;
9. visual evidence:
   - produced vs not produced;
   - evidence root if produced;
   - Project Home evidence subset inspected;
   - screenshots withheld pending operator review, if applicable;
10. dedicated Documents surface non-disruption statement;
11. any Prompt 09E corrective edits, if any;
12. residual risks / next recommended prompt.

---

## Out of Scope / Hard Stops
- No new UI feature.
- No Documents surface redesign.
- No Prompt 10 Explorer work.
- No deep-link runtime.
- No Graph/PnP/Procore runtime.
- No grid primitive redesign.
- No dependency additions.
- No package/manifest/version bump unless separately operator-authorized.
- No unauthorized commit of raw screenshots, raw traces, raw Playwright reports, storage state, tenant auth/session data, or unsanitized outputs.

---

## Acceptance Criteria

### PASS
Prompt 09E may be reported as `PASS` when:
- the 09A–09D implementation chain is confirmed in current HEAD history;
- local validation succeeds;
- Prompt 09 audit checks reconcile to current repo truth;
- the closeout artifact is created;
- dedicated Documents surface work remains undisturbed;
- any live evidence run is reported honestly as either produced or not produced with an exact blocker.

### BLOCKED
Prompt 09E must be reported as `BLOCKED` if:
- a required Prompt 09 implementation commit is missing;
- local validation fails and the issue is not a narrowly Prompt 09-owned defect that can be fixed within scope;
- the repository no longer matches the final 09A–09D target architecture in a material way;
- closeout would require unauthorized Documents-surface changes, dependency changes, or package/version drift.

Do not fabricate a pass by weakening tests or silently skipping unresolved failures.

---

## Closeout Format
Return:

1. Final verdict: `PASS` / `BLOCKED`
2. Branch, starting HEAD, ending HEAD
3. Package / manifest posture observed
4. Prompt 09A–09D commit chain summary
5. Files changed by Prompt 09E
6. Prompt 09 audit findings:
   - Document Control home-feed contract;
   - first-12 Project Home choreography;
   - read-model tail choreography;
   - guardrails.
7. Validation results
8. Visual evidence summary:
   - produced / not produced;
   - exact blocker if not produced;
   - evidence root and Project Home subset inspected if produced.
9. Dedicated Documents surface safety statement
10. Lockfile MD5 before/after
11. Commit summary and description if Prompt 09E authored a commit
12. Residual risks / next recommended prompt

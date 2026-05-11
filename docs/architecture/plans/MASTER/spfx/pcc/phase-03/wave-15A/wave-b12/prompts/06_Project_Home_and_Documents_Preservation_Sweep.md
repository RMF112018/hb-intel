# PCC Phase 07 — Prompt 06 Updated Execution Prompt
## Project Home and Document Control Preservation Sweep

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

This prompt is a **preservation / verification-first gate** after Phase 07 Prompts 01–05. The expected posture is:

```text
PASS — preservation verified.
```

Only perform narrow test hardening if current repo truth proves a required preservation invariant is not directly asserted yet. Do **not** edit production source.

Follow these rules:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within current context or memory unless needed to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted grep/search.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, Graph, Azure, app catalog, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior.
- Preserve Document Control’s specialized `PccDocumentsSurface`.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- Do not run live Playwright.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

---

## Current Repo-Truth Baseline

Current intended baseline for this prompt:

```text
Expected branch: main
Current package posture: PCC 1.0.0.219
Prompt 02 closeout anchor: c751bdf2bafa654e8d1ecf014579caad38c7fc03
Prompt 05 closeout anchor: 7d8bae430ab999d4fb38abe8de6689b89d8f4d27
Expected prior full PCC Vitest posture after Prompt 05: 107 files / 2316 tests / 0 failures
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

Current package/version posture to verify and report:

```text
apps/project-control-center/config/package-solution.json
  solution.version: 1.0.0.219
  solution.features[0].version: 1.0.0.219

tools/spfx-shell/config/package-solution.json
  solution.version: 1.0.0.219
  solution.features[0].version: 1.0.0.219

apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
  version: 1.0.0.219
```

Important context:

- Phase 07 removed the Phase 05-regressed generic Dashboard/title-description hero card only from the six shared `PccPrimaryDashboardSurface` tabs.
- Project Home is owned by `PccProjectHome` and its Phase 06 composition/read-model/gateway tests.
- Document Control is owned by `PccDocumentsSurface` and must not be routed through `PccPrimaryDashboardSurface`.
- Prompt 06 must verify those two specialized surfaces were preserved while shared-dashboard remediation proceeded.

---

## Objective

Verify and, only if necessary, harden tests proving Phase 07 did **not** regress:

1. Project Home fixture path and read-model path.
2. Project Home gateway/button semantics.
3. Document Control routing to `PccDocumentsSurface`.
4. Document Control absence from the shared-dashboard `PccPrimaryDashboardSurface` matrix.
5. Shell-owned active-panel ownership and direct bento-child invariants.

Expected outcome should be either:

```text
PASS — no edits required
```

or, if a preservation assertion gap exists:

```text
PASS — test hardening added
```

A production-source change during this prompt is a **BLOCKED** condition unless explicitly authorized by the operator after the agent reports the regression.

---

## Preflight / Drift Gate

Run and record:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git log --oneline -12
git merge-base --is-ancestor c751bdf2bafa654e8d1ecf014579caad38c7fc03 HEAD && echo "Prompt 02 closeout reachable"
git merge-base --is-ancestor 7d8bae430ab999d4fb38abe8de6689b89d8f4d27 HEAD && echo "Prompt 05 closeout reachable"
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

Also report version posture using targeted reads/grep:

```bash
grep -nE '"version"' apps/project-control-center/config/package-solution.json tools/spfx-shell/config/package-solution.json apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Stop and report `BLOCKED` if:

- Prompt 02 closeout commit is not reachable from `HEAD`.
- Prompt 05 closeout commit is not reachable from `HEAD`.
- `pnpm-lock.yaml` md5 differs from `7c19ccfa8718a42f7f55ce178a626996`.
- Staged changes overlap Prompt 06 governed files.
- Any required remediation would touch production source, analytics source, layout primitives, models, UI kit, manifests, package files, lockfile, docs/evidence, e2e, or live systems.

If unrelated modified/untracked files exist, report them and leave them unstaged/unedited.

---

## Files to Verify

Use targeted reads/grep only.

Primary verification files:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx
```

Source files may be read for confirmation only, not edited:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeGatewayAction.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Search only if a file has drifted or a target assertion cannot be located.

---

## Project Home Preservation Targets

Verify existing tests already prove these invariants. Add narrow tests only if a listed invariant is missing.

### Fixture path

The Project Home fixture path must render the canonical twelve-card order:

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

Required coverage should exist in `PccProjectHome.phase06Composition.test.tsx` and/or `PccPhase06RegressionCoverage.test.tsx`.

### Read-model path

The read-model path must preserve the first twelve fixture cards, then the read-model tail:

```text
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
Project Memory
Project Lens
Related Records
```

The read-model path should preserve the expected direct-card count currently asserted by repo truth. Do not change Project Home read-model behavior in this prompt.

### Gateway posture

Tests must prove:

- Gateway affordances are native `<button type="button">`.
- Gateway affordances do not render `<a href>`.
- `Recent Activity` gateway remains disabled.
- The visible disabled reason remains:

```text
Activity context is preview-only in this release.
```

Implementation hint for a missing Recent Activity disabled-reason test:

- Render fixture-path `PccProjectHome` with no `onSelectModule` callback.
- Locate the `Recent Activity` card by heading.
- Within that card, locate `[data-pcc-project-home-gateway-action="preview"]`.
- Assert:
  - tag name is `BUTTON`;
  - `disabled` is true;
  - `data-pcc-project-home-gateway-state="disabled"`;
  - text is `View Activity Context`;
  - `aria-describedby` points to visible `[data-pcc-project-home-gateway-reason]`;
  - visible reason text is `Activity context is preview-only in this release.`;
  - the card contains zero `a[href]`.
- Use stable `data-*` markers and heading text only. Do not use CSS module class selectors.

### Project Home no-regression posture

Tests must continue to prove:

- No `Project Intelligence` text.
- Direct-child bento card invariant.
- Zero card-level `[data-pcc-active-surface-panel]`.
- Shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]`.
- Row-sum choreography remains green for `ultrawide`, `desktop`, `largeLaptop`, and `standardLaptop`.
- `echarts-for-react` remains absent through existing dependency/import guards.

---

## Document Control Preservation Targets

Verify existing tests already prove these invariants. Add narrow tests only if a listed invariant is missing.

### Routing / surface ownership

`documents` must route to `PccDocumentsSurface`, not `PccPrimaryDashboardSurface`.

Required behavior:

- Rendering `PccSurfaceRouter` with `activePrimaryTabId="documents"` must produce Document Control lane/card content, not the shared dashboard module-status/selected-module pattern.
- Document Control must not render the removed generic shared Dashboard hero card.
- Document Control must not render a direct child card matching the shared-dashboard duplicate header pattern:
  - heading `Document Control`;
  - `data-pcc-footprint="hero"`;
  - `data-pcc-card-hierarchy="primary"`;
  - `data-pcc-card-tier="tier1"`;
  - `data-pcc-card-region="command"`.

Implementation hint for missing router-level Document Control preservation test:

- Add it to `PccSurfaceRouter.phase05.test.tsx`.
- Render `renderRouter('documents')`.
- Gather direct `[data-pcc-card]` children from `[data-pcc-bento-grid]`.
- Assert headings include Document Control surface/lane headings from current repo truth, such as:
  - `Project Record`;
  - `My Project Files`;
  - `External Platforms`.
- Assert headings do **not** include:
  - `Module status`;
  - `Select a module`;
  - old duplicate hero pattern heading `Document Control` with hero/primary/tier1/command markers.
- Assert `[data-pcc-doc-lane]` exists.
- Assert no `[data-pcc-selected-module-card]` exists.
- Assert no `[data-pcc-dashboard-book-of-record]` exists.

### Document Control card count / specialized surface

Use current repo truth from `PccDocumentsSurface` tests. Do not blindly use the stale placeholder counts in shared-dashboard matrices.

Document Control ready path currently includes specialized Document Control cards/lane content. If adding a router-level count assertion, use direct repo truth from the rendered `documents` route and do not route through the shared `EXPECTED_DIRECT_CARD_COUNT_BY_TAB` matrix.

### Source-unavailable / degraded state posture

If a source-unavailable/degraded-state test already exists elsewhere, do not duplicate it. If absent from the targeted preservation files and easy to assert in `PccDocumentsSurface.tier.test.tsx`, add only a narrow preservation assertion that does not change source or fixture data.

### Active-panel ownership

Tests must continue to prove:

- In-grid Document Control cards do not carry `data-pcc-active-surface-panel`.
- Shell owns `main[role="tabpanel"][data-pcc-active-surface-panel]`.

`PccDocumentsSurface.tier.test.tsx` already asserts zero in-grid active-panel markers on the ready path. Do not weaken that assertion.

---

## Allowed Edit Targets

Only edit tests, and only if verification finds a preservation gap:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx
```

Preferred remediation pattern:

- Add the minimum number of scoped assertions.
- Do not duplicate broad coverage already present in Phase 06 regression tests.
- Do not rewrite test structure unnecessarily.
- Do not introduce brittle CSS selectors.
- Use stable `data-*` markers and `h2,h3,h4` heading text.

---

## Prohibited Edits

Do not edit:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/phase05Dashboard/**
apps/project-control-center/src/analytics/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/shell/**
packages/models/**
packages/ui-kit/**
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
apps/project-control-center/package.json
pnpm-lock.yaml
docs/architecture/**
e2e/**
```

If any required fix appears to require one of these paths, stop and report `BLOCKED`.

---

## Validation

If no edits were made, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

If test edits were made, run targeted tests first:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHome.phase06Composition PccDocumentsSurface.tier PccSurfaceRouter.phase05 PccPhase06RegressionCoverage
```

Then run Prettier before final validation:

```bash
pnpm exec prettier --check <changed-test-file-1> <changed-test-file-2>
```

If Prettier fails, run `--write` only on the changed test files, then rerun the targeted tests.

Final validation after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

Do not run live Playwright.

Do not install dependencies.

Do not touch tenant / Procore / Sage / SharePoint / Graph / Azure / app catalog.

---

## Decision Tree

### PASS — no edits required

Use this when:

- Existing tests already prove the Project Home and Document Control preservation targets.
- `check-types` passes.
- Full PCC Vitest passes.
- Diff is empty except unrelated operator-owned WIP that is reported and unstaged.
- Lockfile md5 is unchanged.

No commit. No docs update. Report no-op closeout.

### PASS — test hardening added

Use this only if one or more missing preservation assertions were added inside the allowed test files.

Required:

- Only allowed test files changed.
- Targeted tests pass.
- Prettier passes on changed files.
- `check-types` passes.
- Full PCC Vitest passes.
- `git diff --check` passes.
- Lockfile md5 unchanged.

Stage only the changed test files by explicit path.

Suggested commit subject:

```text
test(pcc): HB Intel Project Control Center 1.0.0.219 — harden Project Home and Document Control preservation guards (Phase 07 Prompt 06)
```

Commit body must list exactly what was added, validation results, and explicitly state no production source, manifests, package files, lockfile, docs/evidence, e2e, or live systems were changed.

### BLOCKED

Use this if:

- Prompt 02 or Prompt 05 closeout commit is unreachable.
- Lockfile md5 changed.
- A real Project Home or Document Control regression is found and the fix would require production source.
- Manifest/package drift appears during this prompt.
- Required remediation would touch prohibited paths.
- Existing operator-owned WIP prevents clean validation or staging.

Stop and report. Do not edit. Do not commit.

---

## Required Closeout Response

Use this structure:

```text
HB: Phase 07 Prompt 06 Closeout

Verdict:
- PASS — no edits required
  - or PASS — test hardening added
  - or BLOCKED

Branch / HEAD:
- Branch:
- HEAD:
- Prompt 02 closeout reachable:
- Prompt 05 closeout reachable:
- Working tree before:
- Working tree after:

Repo version posture:
- package-solution solution.version:
- package-solution feature version:
- webpart manifest version:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Project Home preservation:
- fixture twelve-card order:
- read-model first twelve + tail:
- gateway buttons / no anchors:
- Recent Activity disabled reason:
- no Project Intelligence:
- row-sum choreography:
- active-panel ownership:

Document Control preservation:
- documents routes to PccDocumentsSurface:
- not routed through PccPrimaryDashboardSurface:
- no generic Dashboard hero card:
- direct-card / lane posture:
- source-unavailable or degraded-state posture:
- active-panel ownership:

Files changed:
- None
  - or list changed files

Validation:
- targeted tests:
- check-types:
- full PCC vitest:
- prettier:
- git diff --check:
- git diff / cached diff:
- lockfile md5:

Guardrails:
- Production source modified:
- Project Home source modified:
- Document Control source modified:
- shared-dashboard source modified:
- analytics/layout/models/ui-kit modified:
- manifests/package/lockfile modified:
- docs/evidence/e2e modified:
- dependencies installed:
- live systems touched:
- Playwright run:

Proceed / Stop:
- Proceed only if PASS.
```

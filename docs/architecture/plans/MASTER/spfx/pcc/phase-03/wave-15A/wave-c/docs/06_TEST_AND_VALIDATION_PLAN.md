# 06 — Test and Validation Plan

## Required test philosophy

Tests must prove semantics, not only marker presence.

The existing `PccSurfaceContextHeader.contract.test.tsx` is a good baseline but insufficient because it only verifies structural markers across surfaces.

## Required focused tests

### 1. Surface header contract test

Update or add:

```text
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Required assertions:

- every `PCC_MVP_SURFACE_ID` renders one active panel;
- every active surface renders one primary surface context header for that id;
- context contains project number or project name;
- context contains current surface label;
- context contains posture;
- context contains source status;
- context contains source confidence;
- context contains last-updated/freshness label or explicit `Not listed`;
- context contains next action or limitation where applicable;
- changing surfaces preserves project identity.

### 2. Project context propagation test

Add or update a test to prove:

- shell selected project context and surface header context do not diverge;
- if `selectedProjectId` is deferred, all hard-coded project labels originate from one helper and test verifies the helper value.

Possible file:

```text
apps/project-control-center/src/tests/PccProjectContext.propagation.test.tsx
```

### 3. Surface-specific state/source tests

Add targeted assertions for surfaces with read-model status:

- Documents: loading/error/source-unavailable/available.
- Project Readiness: loading/error/reference.
- Approvals: loading/error/unavailable/reference.
- External Systems: available/unavailable.
- Site Health: scan last run label.

### 4. Accessibility/header hierarchy tests

Add or update tests to verify:

- one shell `h1` exists in normal render;
- surface context region has accessible name;
- state error renders `role="alert"`;
- loading renders `aria-busy`;
- disabled actions use `aria-describedby`.

### 5. Responsive/container tests

Extend current responsive tests to validate context header behavior under:

- `wideDesktop`;
- `standardDesktop`;
- `tabletLandscape`;
- `tabletPortrait`;
- `phone`.

If JSDOM cannot fully prove visual wrapping, pair tests with screenshot evidence.

## Required command gates

Run all applicable commands:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check "<changed files>"
```

If the package has a `check-types` script and local convention prefers it, either command is acceptable:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
```

## Optional command gates

If changed docs are broad:

```bash
pnpm exec prettier --check "docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/**/*.md" "docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/**/*.md"
```

If accessibility tooling exists in repo truth, run the repo-standard accessibility test. Do not install new dependencies without explicit approval.

## Evidence to capture in test closeout

- command;
- result;
- test count;
- failed tests, if any;
- whether failure is in-scope or pre-existing;
- exact files changed to fix failures;
- residual untested items.

## Failure handling

Stop and report if:

- full suite fails for an in-scope reason;
- typecheck fails;
- active-surface panel uniqueness breaks;
- route navigation breaks;
- project context differs by surface;
- state/source labels imply live data without evidence;
- accessibility heading/landmark defects cannot be safely fixed within Wave C.

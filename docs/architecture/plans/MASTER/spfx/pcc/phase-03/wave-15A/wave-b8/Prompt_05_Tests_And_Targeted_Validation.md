# Prompt 05 — Tests and Targeted Validation

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are completing Phase 03 test coverage and validation.

## Objective

Close all Phase 03 unit/component coverage gaps and run the required validation suite.

This prompt should primarily affect tests. Runtime edits are allowed only for small fixes discovered by tests.

## Required Test Files to Inspect

```text
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

## Required Coverage Matrix

### Header Metadata

- all eight surfaces have metadata;
- each metadata item has non-empty ID/label/value;
- each cue has non-empty ID/label/value;
- read-only cue exists for every surface;
- tones are valid;
- authority copy is truthful.

### Conditional Rendering

- every active tab updates the header secondary title;
- every active tab updates summary/cue markers;
- Project Home includes command-summary/source/HBI posture;
- Approvals includes no approval authority;
- Documents includes no file operation authority;
- External Systems includes no sync/writeback authority;
- Control Center Settings includes no settings mutation authority;
- Site Health includes no repair acknowledgement/execution authority.

### Shell / Tabpanel

- shell `main[role="tabpanel"]` owns active surface marker;
- `aria-labelledby` updates with the active tab;
- tab `aria-controls` points to `pcc-active-surface-panel`;
- keyboard navigation remains valid.

### Bento Direct-Child

- no new wrapper breaks direct-child relationship;
- cards remain direct children of `[data-pcc-bento-grid]`;
- card-level active-surface markers remain compatibility only.

### Negative Scope Tests / Checks

- no full Modules launcher introduced;
- no active module state introduced;
- no command-routing controls introduced;
- no duplicate/header card removal performed in Phase 03.

## Playwright Scope

Do not run full live evidence unless files/selectors were touched or the auditor/user asks. If touched, run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Package / Lockfile / Manifest Audit

Confirm:

- `pnpm-lock.yaml` unchanged unless explicitly justified;
- package dependency sections unchanged;
- `apps/project-control-center/config/package-solution.json` unchanged unless explicitly justified;
- stale `config/package-solution.json` references are not introduced.

## Required Completion Response

```markdown
## Prompt 05 Complete

## Files Changed

## Test Coverage Matrix

## Runtime Fixes, If Any

## Validation Results

## Package / Lockfile / Manifest Audit

## Remaining Phase 03 Issues

## Ready for Prompt 06?
```

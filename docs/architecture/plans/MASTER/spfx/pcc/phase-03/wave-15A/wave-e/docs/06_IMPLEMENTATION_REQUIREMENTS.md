# 06 — Implementation Requirements

## Purpose

Provide local-agent implementation and hardening requirements for Wave E.

## Execution Mode Decision

At the start of Prompt 01, the local agent must choose mode:

| Mode | Criteria | Expected work |
|---|---|---|
| Verification/hardening | Prompt 05 state/product-language implementation exists locally. | Verify, close gaps, add missing tests/evidence, avoid duplicate rewrites. |
| Implementation | Prompt 05 changes are absent locally. | Implement shared taxonomy, migrate language, update surfaces, add tests/evidence. |

## Required Source Ownership

Use or extend existing PCC-owned source areas:

- `apps/project-control-center/src/ui/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/surfaces/**`
- `apps/project-control-center/src/layout/`
- `apps/project-control-center/src/tests/`

Do not move state copy into `@hbc/models` unless a separate contract change is explicitly approved. UI copy should remain in the SPFx app or surface-local modules.

## Required Implementation Steps

### Step 1 — File Map and Baseline

- Confirm current branch SHA.
- Confirm package version in:
  - `apps/project-control-center/config/package-solution.json`
  - `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
- Confirm whether Prompt 05 closeout exists locally.
- Build a file map for all state, disabled-action, source-status, surface-header, and diagnostics copy sources.
- Capture lockfile MD5 before edits.

### Step 2 — Shared State Taxonomy

- Preserve existing `PccPreviewState` if already broadly used and tested.
- Add aliases/wrapper/types only if necessary to cover target taxonomy.
- Avoid breaking existing tests or selectors without migration notes.
- If `unavailable-fixture` remains as an internal key, verify it does not leak as visible text. If it leaks only as `data-pcc-state`, decide whether to:
  - leave as non-user-visible instrumentation with documented risk; or
  - introduce `unavailable` alias while preserving backwards-compatible test selectors.

### Step 3 — Product Language Migration

- Centralize posture copy in shared modules where possible.
- Keep surface-specific source language surface-local.
- Replace primary developer-facing copy.
- Reposition diagnostics to admin/debug/closeout contexts.
- Do not scrub legitimate source comments or closeout docs unless explicitly in scope.

### Step 4 — Disabled Action Standard

- Convert unexplained inert buttons/chips to `PccDisabledAffordance`.
- Remove useless disabled CTAs if no user value exists.
- Add reference actions where review context is valuable.
- Test disabled action reasons and `aria-describedby`.

### Step 5 — Surface Adoption

Apply/verify the model surface-by-surface:

1. Project Home
2. Team & Access
3. Documents
4. Project Readiness
5. Approvals
6. External Systems
7. Control Center Settings
8. Site Health
9. Router fallback

### Step 6 — Tests and Evidence

- Add/update exact-string tests where copy is intentionally stable.
- Use semantic tests for dynamic/surface copy where exact strings would be brittle.
- Add forbidden-token grep results to closeout.
- Add screenshot evidence plan and capture where environment allows.
- Add accessibility/keyboard notes.

## Required Commands

Use repo-appropriate commands. At minimum, for touched PCC app files:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
```

If only docs are touched, run Prettier on those docs and report that runtime tests were not applicable.

## Versioning

Only bump SPFx package/manifest versions if runtime source changes require a new tenant package. Do not bump versions for docs-only packages.

## Closeout Restrictions

Do not claim:

- final 56/56 readiness;
- tenant-hosted validation;
- accessibility closure;
- screenshot proof;
- production readiness;

unless the evidence actually exists in the current branch closeout.

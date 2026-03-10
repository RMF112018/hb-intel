# How to Work with Stub Detection Enforcement

**Applicable to:** All developers contributing to HB Intel
**Relevant ADR:** ADR-0095
**Phase:** PH7.13

## Overview

HB Intel enforces a zero-unapproved-stubs policy on all source code in `packages/`,
`apps/`, and `backend/`. This is implemented via two complementary layers:

- **Layer 1 — ESLint:** The `@hb-intel/hbc/no-stub-implementations` rule detects
  `throw new Error('not implemented')` patterns at lint time (developer machine + CI).
- **Layer 2 — CI grep scan:** A grep step in the `lint-and-typecheck` CI job scans
  for the same patterns as a fail-fast gate.

## When You See This Error

If you receive an `@hb-intel/hbc/no-stub-implementations` lint error, you have two options:

**Option A — Implement the function.** Replace the stub throw with a real implementation.
This is the preferred resolution.

**Option B — Mark it as intentionally deferred.** If the stub is a tracked,
deliberate deferral (e.g., pending a future phase), add the `stub-approved` comment:

```typescript
// stub-approved: <non-empty reason explaining intent and tracking reference>
throw new Error('not implemented');
```

The reason must be meaningful — it will be visible in `pnpm scan-stubs:all` output and
will be reviewed at each phase gate.

## Developer Commands

```bash
pnpm scan-stubs         # Check for unapproved stubs — should exit 0 before pushing
pnpm scan-stubs:all     # View all stubs including stub-approved entries
pnpm turbo run lint     # Full lint gate including stub detection
```

## What Is Exempt

- Files in `tools/mocks/` — SPFx SDK mocks (globally exempt)
- Test files (`*.test.ts`, `*.spec.ts`)
- Storybook files (`*.stories.tsx`)
- Files in `**/testing/**`

## Further Reading

- `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`
- `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`

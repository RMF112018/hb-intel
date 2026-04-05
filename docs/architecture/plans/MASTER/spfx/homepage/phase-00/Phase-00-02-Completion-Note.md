# Phase 00-02 Completion Note — UI-Kit Export and Import Contract Lock

## Status

**Complete.** Package contract verified, consumer import policy documented and enforced, ESLint guardrail active.

---

## Findings

### Package export map — already truthful

The `@hbc/ui-kit` package.json exports field correctly declares all 5 entry points:
- `.` → `dist/index.js` (full library)
- `./app-shell` → `dist/app-shell.js` (shell chrome)
- `./homepage` → `dist/homepage.js` (governed homepage primitives)
- `./theme` → `dist/theme/index.js` (token-only)
- `./icons` → `dist/icons/index.js` (icon-only)

All 5 entries resolve to real source files with correct TypeScript declarations. No changes needed to the export map.

### Consumer import posture — already compliant

All 16 source files in `apps/hb-webparts/src/` that import from `@hbc/ui-kit` use the `@hbc/ui-kit/homepage` entry point. Zero violations of the intended policy were found (no `@hbc/ui-kit` root imports, no `@hbc/ui-kit/app-shell` imports).

### What was missing — enforcement and explicit policy

The import policy was correct in practice but not enforced by tooling or explicitly documented as a contract. A developer could have added a broad `@hbc/ui-kit` import without any CI feedback.

---

## Changes Made

### Guardrail: ESLint no-restricted-imports

**File:** `apps/hb-webparts/.eslintrc.cjs`

Added `no-restricted-imports` rule that errors on:
- `@hbc/ui-kit` — "Homepage webparts must import from @hbc/ui-kit/homepage, not the full @hbc/ui-kit entry point."
- `@hbc/ui-kit/app-shell` — "Homepage webparts must import from @hbc/ui-kit/homepage, not @hbc/ui-kit/app-shell."

This rule runs in CI and local lint, providing immediate feedback on policy violations.

### Documentation: Authoritative import policy

**File:** `docs/reference/ui-kit/entry-points.md`

Replaced the informal "Homepage Guardrails" section with an explicit "Homepage Import Policy" section that includes:
- Allowed entry points table (homepage, theme, icons)
- Prohibited entry points table with reasons (full ui-kit, app-shell)
- Enforcement mechanisms (ESLint, source constant, Vite aliases)
- Escalation path for when a homepage webpart needs a component not in the homepage entry

### Verification

- `pnpm run lint` in `apps/hb-webparts` passes clean with the new guardrail active
- All 16 existing imports are compliant

---

## Final Authoritative Statement: Homepage Import Policy

| Entry Point | Status | Enforced By |
|-------------|--------|-------------|
| `@hbc/ui-kit/homepage` | **Allowed — Primary** | Source convention, documentation |
| `@hbc/ui-kit/theme` | **Allowed — Supplementary** | Documentation |
| `@hbc/ui-kit/icons` | **Allowed — Supplementary** | Documentation |
| `@hbc/ui-kit` | **Prohibited** | ESLint `no-restricted-imports` |
| `@hbc/ui-kit/app-shell` | **Prohibited** | ESLint `no-restricted-imports` |

The authoritative reference for this policy is `docs/reference/ui-kit/entry-points.md` §Homepage Import Policy.

---

## Intentionally Deferred

- **Prompt 3:** SPFx-hosted homepage doctrine overlay formalization (binding vs directional classification)
- **Future:** Adding `@hbc/ui-kit/theme` and `@hbc/ui-kit/icons` to the Vite alias map if homepage webparts need them at build time
- **Future:** Promotion of the policy to a workspace-wide ESLint plugin rule (currently local to hb-webparts; could be generalized if other SPFx apps adopt constrained entry points)

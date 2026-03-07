# DevToolbar Reference

## Purpose

`DevToolbar` is a development-only shell surface used to switch personas, adjust mock auth delay, and inspect current mock session state during local validation of Phase 5C authentication behavior.

This reference documents the runtime contract and constraints for the toolbar introduced by locked Phase 5C decisions D-PH5C-01, D-PH5C-02, D-PH5C-03, and D-PH5C-06.

## Runtime Constraints

- `DevToolbar` is DEV-only and must never be relied on by production workflows.
- Rendering is gated by `import.meta.env.DEV` in shell composition.
- Persona and session actions flow through `useDevAuthBypass` and `@hbc/auth/dev`.
- Production bundle checks must confirm no `DevToolbar` markers in shipped artifacts.

## Tabs and Responsibilities

1. `Personas`
- Lists base and supplemental personas from `PERSONA_REGISTRY`.
- Applies selected persona to simulated auth lifecycle.

2. `Settings`
- Adjusts simulated auth delay used by `DevAuthBypassAdapter`.
- Supports session clear/reset helpers for rapid scenario iteration.

3. `Session`
- Displays current normalized session data used by shell/auth state.
- Supports refresh/expire actions for guarded-path validation.

## Integration Contract

- Import path: `packages/shell/src/devToolbar/index.ts`
- Mounted in: `packages/shell/src/ShellCore.tsx`
- Hook dependency: `packages/shell/src/devToolbar/useDevAuthBypass.ts`
- Dev auth surface: `packages/auth/src/dev.ts`

## Verification Expectations (Phase 5C.10)

- Dev toolbar renders and functions in DEV runtime.
- Persona switching, delay changes, and session actions are test-covered.
- Production build artifacts contain no runtime toolbar strings.
- Console remains free of warnings/errors during gate validation interactions.

## Traceability

- Plan: `docs/architecture/plans/PH5C-Auth-Shell-Plan.md`
- Task: `docs/architecture/plans/PH5C.10-FinalVerification.md`
- ADR: `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md`

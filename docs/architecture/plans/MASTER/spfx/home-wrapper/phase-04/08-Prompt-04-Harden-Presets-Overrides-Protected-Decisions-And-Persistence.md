# Prompt 04 — Harden Presets, Overrides, Protected Decisions, and Persistence

## Objective

Take the shell contract work that already exists and close the remaining governance gap so the shell is genuinely ready for future controlled configuration without becoming a freeform editor runtime.

## Why this issue exists in the current code

The repo already includes strong groundwork:
- typed shell contracts
- Zod schemas
- preset definitions
- protected/configurable decision models
- validation and normalization
- preview helpers

That is a strong start, but it is not the same thing as closure.

Wave 01 still needs stronger answers to:
- what persisted shape is truly supported
- what may be overridden safely
- what can never be overridden
- how invalid persisted state is normalized
- how preset selection and band overrides remain bounded

## Current repo-truth evidence

Use at minimum:
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellValidation.test.ts`
- supporting shell-entry doctrine where protected entry behavior is defined

## Required future state

You are done only when all of the following are true:

1. Approved presets are explicit and well-described.
2. Override boundaries are explicit and bounded.
3. Protected decisions are unambiguously protected.
4. Configurable decisions are explicit and realistic.
5. Persisted shell input has a stable typed shape.
6. Invalid persisted input normalizes predictably and diagnostically.
7. Entry-state protections remain code-governed even when persisted layout data is present.
8. The public shell still behaves as an authored governed experience, not a freeform dashboard.

## Files / seams / symbols to inspect

Inspect at minimum:
- `ShellLayoutInput`
- `ShellPreset`
- `ShellProtectedDecisions`
- `ShellLayoutInputSchema`
- `ShellPresetSchema`
- `parseShellLayout`
- `validatePresetStructure`
- `previewShellLayout`
- `previewBandOverride`
- preset library exports
- protected/configurable decision exports

## Implementation requirements

1. Audit the current preset and override model against the real closure need.
2. Tighten schema, normalization, and diagnostics where required.
3. Make protected-vs-configurable boundaries explicit and testable.
4. Ensure future persisted payloads cannot quietly bypass protected shell rules.
5. Preserve authored hierarchy. Do not introduce freeform editing semantics.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. final approved preset list
3. final protected decision list
4. final configurable decision list
5. the final persisted input shape
6. at least one invalid persisted-state example and its normalized outcome
7. explanation of why the result is control-panel-ready without being a freeform editor contract

## Out-of-scope guardrails

Do not:
- add drag-resize behavior
- make every band reorderable
- treat persisted layout input as authority over protected shell policy
- redesign hosted child modules

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.


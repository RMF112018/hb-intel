# Prompt-04 — Phase 11 Runtime Config Injection Parity and Packaged-Shell Hardening

## Objective

Ensure the Accounting SPFx deployment path has the same build-time/runtime injection discipline and packaged-shell evidence quality expected of the Project Setup comparison package.

The goal is to remove any ambiguity about whether the Accounting packaged shell actually carries the correct injected values for hosted production-mode operation, including at minimum:

- `FUNCTION_APP_URL`
- `API_AUDIENCE`
- `BACKEND_MODE`
- `ALLOW_BACKEND_MODE_SWITCH` (if applicable to Accounting)

This prompt should result in code, verification, and documentation that prove the packaged Accounting shell is correct rather than assumed correct.

## Critical Working Rules

- Start from the outcomes of Prompts 01–03.
- Do not re-read files already in current context or memory unless needed to verify contradiction, inspect build/payload evidence, or capture exact wording.
- Favor build-time inspection and packaged-artifact proof over assumptions derived from source alone.
- Keep changes bounded to runtime injection, packaging inspection, and closely related supporting docs/tests.

## Required Scope

Inspect at minimum:
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- any shell webpack / gulp define-constant path
- Accounting config/runtime files that consume injected values
- any existing packaged-shell inspection docs for Project Setup
- the fresh Accounting `.sppkg` output after rebuild

## Required Work

1. Verify whether the current source already supports Accounting runtime injection parity.
2. If source support exists, harden the Accounting build/evidence path so the next produced artifact proves it.
3. If support is incomplete, implement the missing Accounting injection/plumbing.
4. Add or tighten packaged-shell inspection steps so a bad artifact cannot be mistaken for a valid release candidate.
5. Ensure the Accounting evidence path mirrors the comparison package’s level of rigor.

## Required Outputs

### 1. Create a hardening/evidence memo at:
`docs/architecture/reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md`

The memo must include:
- Injection Inputs
- Shell Injection Path
- Accounting Runtime Consumption Path
- Packaged-Shell Inspection Results
- Differences vs Project Setup Comparison Pattern
- Changes Made
- Remaining Risks
- Exact Files Inspected

### 2. Create a phase-local evidence doc at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/04-Packaged-Shell-Injection-Evidence.md`

### 3. Add or extend any code/tests/scripts needed to ensure Accounting packaged-shell inspection is repeatable and reliable.

## Hard Requirements

- Do not stop at source inspection. Inspect the actual generated Accounting `.sppkg`.
- State whether the fresh packaged shell contains the injected values explicitly.
- If `ALLOW_BACKEND_MODE_SWITCH` is intentionally not used for Accounting, document that decision clearly rather than leaving the omission implicit.
- Preserve distinction between:
  - source capability
  - packaged-shell proof
  - hosted runtime proof

## Completion Standard

This prompt is complete only when the Accounting packaged shell can be inspected and shown to contain the intended runtime config values required by the approved Accounting release posture.

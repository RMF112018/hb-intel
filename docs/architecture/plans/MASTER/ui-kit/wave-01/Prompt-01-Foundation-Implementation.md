# Prompt 01 — Foundation Implementation

You are working in the live HB Intel repository.

## Objective

Implement the shared foundation layer so both the productive lane and presentation lane inherit from one consistent source of truth while still allowing materially different outcomes.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`

Then inspect the live foundation implementation in `packages/ui-kit`.

Do not reread files that are already in your active context unless needed.

## Implementation goals

Refactor the foundation layer toward:

- token-first foundations,
- semantic token layering,
- shared typography, spacing, radii, elevation, motion, and iconography rules,
- support for distinct presentation and productive outcomes without local hardcoded drift,
- compatibility-preserving access for existing consumers.

## Required work

- identify hardcoded visual values that should become tokens or semantic aliases,
- strengthen the foundation exports used by both lanes,
- preserve or introduce compatibility shims where needed,
- reduce opportunities for feature packages to freestyle core visual values,
- explicitly identify any consumer surfaces or packages materially affected by the foundation changes.

## Consumer naming requirement

Name the specific consumer surfaces, packages, stories, or webparts materially affected by this wave.

At minimum, identify:

- direct foundation consumers touched by the changes,
- any presentation-lane consumers expected to adopt the foundation updates,
- any productive-lane consumers expected to adopt the foundation updates.

Do not report this wave as “broadly applicable” without naming concrete affected consumers.

## Validation

Report:

- which foundation files changed,
- what old hardcoded or duplicated values were normalized,
- what compatibility measures were preserved,
- which named consumers were verified or spot-checked,
- what verification was actually run.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

For this foundation wave, the visual section must state whether the changes materially improved the base quality ceiling for presentation-lane consumers, even if no major consumer redesign occurred yet.

## Guardrails

- Do not redesign consumer surfaces here unless necessary for foundation adoption.
- Do not let presentation-lane needs fork an entirely separate foundation.
- Structural cleanliness is not enough; foundation work must improve the quality ceiling for later presentation-lane work.

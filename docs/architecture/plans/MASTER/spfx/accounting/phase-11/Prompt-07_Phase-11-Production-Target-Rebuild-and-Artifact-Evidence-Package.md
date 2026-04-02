# Prompt-07 — Phase 11 Production-Target Rebuild and Artifact Evidence Package

## Objective

Produce a fresh, production-target Accounting `.sppkg` from the canonical Phase 11 build path and generate an evidence package proving that the rebuilt artifact is the correct release candidate.

This prompt is where source truth becomes artifact truth.

The goal is not merely to “get a build.” The goal is to establish an evidence-backed release candidate that can be traced from:
- approved packaging path
- approved permission posture
- approved runtime injection posture
- approved hosted dependency posture
- to the actual packaged Accounting artifact

## Critical Working Rules

- Execute this prompt only after Prompts 01–06 are complete.
- Do not re-read files already in current context or memory unless needed to verify contradiction, inspect final artifact contents, or capture exact evidence.
- Use explicit target-environment values for production-target packaging.
- The resulting evidence must be package-based, not just source-based.
- If the artifact still fails evidence checks, do not classify it as release-ready.

## Required Scope

Inspect and use at minimum:
- `tools/build-spfx-package.ts`
- current Accounting package config
- current auth/runtime docs updated by earlier prompts
- the final generated Accounting `.sppkg`
- any comparison package evidence pattern worth reusing

## Required Work

1. Rebuild the Accounting `.sppkg` from the canonical packaging path using explicit production-target values.
2. Inspect the packaged shell asset and manifest contents.
3. Verify at minimum:
   - version
   - package manifest identity
   - API permission request posture
   - bundle reference
   - global/module reference
   - `FUNCTION_APP_URL`
   - `API_AUDIENCE`
   - `BACKEND_MODE`
   - `ALLOW_BACKEND_MODE_SWITCH` handling (present or intentionally absent)
4. Record exact evidence of what the artifact proves.
5. If the rebuilt artifact still does not match intended repo truth, stop and document the mismatch instead of hand-waving it away.

## Required Outputs

### 1. Create an artifact evidence report at:
`docs/architecture/reviews/accounting-production-target-sppkg-build-evidence.md`

The report must include:
- Packaging Command / Entry Path
- Explicit Target Values Used
- Produced Artifact Details
- AppManifest.xml Findings
- Packaged Shell Asset Findings
- Runtime Injection Findings
- Permission Findings
- Comparison Against Intended Repo Truth
- Go / No-Go Artifact Conclusion
- Exact Files Inspected

### 2. Create a phase-local artifact reference at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/07-Accounting-Production-Target-Artifact-Evidence.md`

### 3. Save the rebuilt artifact to the repo’s standard artifact/output location if that is the established pattern, and document exactly where it lives.

## Hard Requirements

- Do not rely solely on source inspection.
- Do not call the artifact valid unless the artifact itself proves the required contract.
- Be explicit if the artifact is:
  - repo-aligned
  - staging-targeted
  - production-targeted
  - still ambiguous

## Completion Standard

This prompt is complete only when the repo contains a fresh Accounting release-candidate evidence package grounded in the actual rebuilt `.sppkg`.

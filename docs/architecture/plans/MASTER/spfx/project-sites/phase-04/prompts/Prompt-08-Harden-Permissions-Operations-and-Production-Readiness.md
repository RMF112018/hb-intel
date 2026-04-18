# Prompt 08 — Harden Permissions, Operations, and Production Readiness

## Objective
Take the bridge from working pilot to governed operational solution by tightening permission posture, finalizing sync operations, documenting secret/credential handling, and producing a production readiness closeout.

## Current gap to close
A working pilot is not enough. The bridge must become supportable, observable, and governable before it should be treated as production-ready.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01 through 07
- live repo deployment/config/ops patterns
- the current interim auth posture using `HB SharePoint Creator`
- the Azure service-hosting implementation from Prompt 03

## Required repo inspection areas

Inspect the live repo for:

- environment/config patterns
- backend deployment patterns
- logging / monitoring seams
- admin/ops documentation patterns
- any security-hardening precedents already used in the codebase
- any list schema documentation patterns that must be finalized for the HBCentral bridge lists
- any Azure deployment/config scripts or templates introduced during Prompt 03

## Required implementation outcome

Harden the bridge for production or near-production use.

Required outcomes:

1. finalize secure secret/config handling for the discovery job
2. define sync cadence and rerun posture
3. implement monitoring/logging improvements if missing
4. document stale-record behavior and failure handling
5. explicitly document the interim-vs-target permission model
6. produce a production readiness checklist or closeout note
7. confirm the final live HBCentral list schema and documentation posture
8. confirm the Azure hosting footprint, operational ownership, and rerun/disable posture

## Required implementation details

- Do not leave the pilot auth posture undocumented.
- Explicitly distinguish:
  - interim use of `HB SharePoint Creator`
  - target least-privilege production posture
- Ensure no secrets are committed to source control.
- Ensure sync failures are visible and actionable.
- Ensure emergency disable and rerun procedures are clear.
- If the repo already has a standard runbook or closure pattern, use it.
- If any final HBCentral list-field cleanup or hardening is required, perform it through the repo's provisioning path rather than leaving schema drift.
- If any final Azure service configuration cleanup or hardening is required, implement it through the repo's deployment/config path rather than leaving undocumented portal drift.

## Proof of closure

Provide:

- exact files added or modified
- final config / secret handling approach
- final logging and monitoring approach
- sync cadence recommendation
- documented production hardening path for permissions
- final readiness checklist or closure note
- confirmation that the HBCentral bridge lists are provisioned, aligned, and documented
- confirmation that Azure hosting, monitoring, and operational handling are documented and supportable

## Constraints

- Do not silently treat broad pilot permissions as the final design.
- Do not skip operational documentation.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

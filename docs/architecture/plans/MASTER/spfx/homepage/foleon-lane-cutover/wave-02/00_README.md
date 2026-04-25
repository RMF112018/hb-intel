# Wave 02 — Homepage Shell Foleon Lane Cutover

Generated: 2026-04-25

## Objective

Replace the existing HB Homepage shell zone internals so the current shell locations render the two Foleon reader lanes:

- `project-portfolio-spotlight` renders the Foleon Project Spotlight lane.
- `company-pulse` renders the Foleon Company Pulse lane.

This is a controlled module replacement inside the existing homepage shell occupant architecture. It is not a shell redesign.

## Current Baseline

Wave 01 is complete:

- Commit: `07e0cff6e43cbf5db54b8d04089cfb0ed6762780`
- Package: `@hbc/foleon-reader`
- Foleon deployable version: `1.0.21.0`

The shared package exposes:

- `FoleonEmbeddedReaderLane`
- `ProjectSpotlightReader`
- `CompanyPulseReader`
- `createEmbeddedFoleonRuntimeContract`
- `FoleonReaderModuleConfig`
- `FoleonReaderResolution`

## Plan Package Contents

- `01_REPO_TRUTH_AUDIT.md` — inspected repo facts and constraints.
- `02_IMPLEMENTATION_PLAN.md` — implementation sequence and file-level work.
- `03_CONFIG_AND_PROPERTY_PANE_PLAN.md` — homepage-specific Foleon config seam.
- `04_ZONE_AND_CONTENT_STATE_PLAN.md` — zone replacement and content-state mapping.
- `05_TESTING_AND_VALIDATION_PLAN.md` — test matrix and validation commands.
- `06_VERSIONING_AND_PACKAGE_PROOF_PLAN.md` — homepage version/package authority.
- `07_TENANT_ROLLOUT_RUNBOOK.md` — deployment and tenant validation follow-up.
- `08_RISK_REGISTER.md` — risks, hard stops, and required decisions.
- `09_LOCAL_AGENT_IMPLEMENTATION_PROMPT.md` — execution prompt for the implementation wave.

## Locked Rules

- Use Strategy A: render `@hbc/foleon-reader` directly in the homepage React tree.
- Do not call or load `window.__hbIntel_foleon`.
- Do not mount the Foleon IIFE twice.
- Preserve occupant IDs: `project-portfolio-spotlight`, `company-pulse`.
- Do not alter shell protected row pairings or layout governance.
- Do not alter hero, Priority Actions launcher, Safety, Kudos, PnP Ops, or unrelated shell code.
- Do not hardcode tenant list GUIDs.
- Do not mutate tenant lists.
- Do not reintroduce public person-field `$select` or `$expand`.
- Do not duplicate Foleon reader gate or query logic.

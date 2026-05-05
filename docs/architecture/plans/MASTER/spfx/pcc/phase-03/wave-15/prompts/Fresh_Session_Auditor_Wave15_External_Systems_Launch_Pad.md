# Fresh Session Auditor Prompt — Wave 15 External Systems Launch Pad

## Purpose

Run an independent auditor pass for Wave 15 documentation closeout quality and provenance integrity.

## Expected Prompt Sequence

1. Prompt 01 — Repo Truth and Scope Lock
2. Prompt 02 — HB Central Schema Audit and Storage Model
3. Prompt 03 — Target Architecture and System of Record
4. Prompt 04 — SharePoint List Schemas and JSON Artifacts
5. Prompt 05 — SPFx UX Wireframes and Project Link Workflows
6. Prompt 05R — Wireframe Completeness Remediation
7. Prompt 06 — Security HBI Dependencies and Test Gates
8. Prompt 07 — Final Closeout and Auditor Handoff

## Latest Known Prompt-06 SHA

- `c1e1054c6`

## Canonical Paths to Audit

- Blueprint root: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/`
- Wireframes: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/`
- SharePoint schemas: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/`
- Plan root: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/`
- Artifacts: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/`
- Prompts: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/prompts/`
- Reference notes: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/reference/`
- Package inventory source: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_doc-updates/FILE_INVENTORY.md`
- Package manifest source: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_doc-updates/PACKAGE_MANIFEST.md`

## Approved TODOs Only

The closeout is valid only if exactly these TODOs remain open:

1. Example fixture scenarios.
2. Future progress-camera iframe/current-image viewer review.

## Prohibited Change Classes

Audit must fail if Prompt-07 delivery introduces any of the following:

- runtime/source code edits,
- `package.json` mutation,
- `pnpm-lock.yaml` mutation,
- manifest/version bump,
- tenant/security/group mutation,
- live integration or external-system write behavior,
- runtime feature-completion claims.

## Validation Commands

Run and capture evidence:

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log --oneline -n 5`
- `md5 -q pnpm-lock.yaml`
- `pnpm format:check` (record unrelated drift evidence path if failing)
- `jq empty <json-file>` for any JSON touched in Prompt 07

## Artifact Disposition Categories

Every package artifact must be classified exactly once in Prompt-07 closeout using:

- `promoted`: copied into canonical Wave-15 blueprint/plan locations.
- `merged`: content incorporated into existing canonical document(s) without 1:1 file copy.
- `deferred`: explicitly out of executed prompt scope and intentionally left for later prompt/workstream.
- `retained package-only`: intentionally kept in package context with a stated reason.

## Auditor Deliverable Requirements

Auditor output must include:

- pass/fail on prompt-sequence reconciliation (01-06 + 05R + 07),
- pass/fail on provenance preservation for Prompt-02/04/06 artifacts,
- pass/fail on no-orphaned-docs proof,
- pass/fail on approved TODO-only constraint,
- pass/fail on prohibited-change-class constraint,
- explicit list of findings with file references if any failures are detected.

# README — Admin SPFx IT Control Center Phase 8 Prompt Package

## What this package is

This package is the **Phase 8 implementation prompt set** for the Admin SPFx IT Control Center:

**Phase 8 — HB Intel SharePoint control and standards enforcement**

It is intended for a **repo-writing local code agent** and is sequenced so the work can be executed in the correct order without flattening multiple major tasks into vague all-in-one prompts.

## Execution status

| Prompt | Status | Date | Artifact |
|--------|--------|------|----------|
| P8-01 Repo-Truth Audit | **Complete** | 2026-04-03 | `admin-spfx-phase-8-repo-truth-audit.md` |
| P8-02 SharePoint Control Baseline | **Complete** | 2026-04-03 | `admin-spfx-phase-8-sharepoint-control-baseline.md` |
| P8-03 Standards Comparison Model | **Complete** | 2026-04-03 | `admin-spfx-phase-8-standards-comparison-model.md` + `ISharePointControl.ts` |
| P8-04 Drift Detection Workflow | **Complete** | 2026-04-03 | `admin-spfx-phase-8-drift-detection-workflow.md` + `sharepoint-drift-service.ts` |
| P8-05 Preview / Dry-Run | **Complete** | 2026-04-03 | `admin-spfx-phase-8-preview-and-dry-run.md` + `sharepoint-preview-service.ts` |
| P8-06 Controlled Repair | **Complete** | 2026-04-03 | `admin-spfx-phase-8-repair-and-standards-application.md` + `sharepoint-repair-service.ts` |
| P8-07 App Catalog / API Posture | **Complete** | 2026-04-03 | `admin-spfx-phase-8-package-and-api-posture.md` + `sharepoint-posture-service.ts` |
| P8-08 SharePoint Control Lane UX | **Complete** | 2026-04-03 | `admin-spfx-phase-8-sharepoint-control-ux.md` + `SharePointControlPage.tsx` |
| P8-09 Evidence, Docs, Runbooks | **Complete** | 2026-04-03 | `admin-spfx-phase-8-sharepoint-control-operator-runbook.md` |
| P8-10 Validation and Exit | **Complete** | 2026-04-03 | `admin-spfx-phase-8-exit-reconciliation.md` |

## Included files

1. `Admin-SPFx-IT-Control-Center-Phase-8-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-8-Repo-Truth-Audit-and-Dependency-Map.md`
4. `Prompt-02-SharePoint-Control-Baseline-and-Managed-Asset-Boundary.md`
5. `Prompt-03-Standards-Snapshot-and-Comparison-Model.md`
6. `Prompt-04-Drift-Detection-and-Normalization-Workflows.md`
7. `Prompt-05-Preview-Dry-Run-and-Impact-Summary-Execution.md`
8. `Prompt-06-Controlled-Repair-Apply-and-Reapply-Flows.md`
9. `Prompt-07-App-Catalog-and-API-Posture-Validation-Lane.md`
10. `Prompt-08-SPFx-SharePoint-Control-Lane-UX.md`
11. `Prompt-09-Evidence-Audit-Docs-and-Runbooks.md`
12. `Prompt-10-Validation-and-Phase-8-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do not skip ahead unless a prompt explicitly tells the agent to stop because repo truth materially differs from the assumptions captured in this package.

## Governing behavior for the local code agent

- Treat verified live repo code as the first implementation truth.
- Use the end-state plan and prior phase artifacts as governing design intent.
- Read only the smallest authoritative set required for the current prompt.
- **Do not re-read files that are still within active context or memory** unless:
  - the file changed,
  - the context became stale,
  - the scope widened,
  - or the prompt explicitly requires a fresh check.
- Keep Phase 8 inside the approved first-wave SharePoint boundary:
  - active control only for **HB Intel-managed SharePoint assets**
  - broader tenant SharePoint administration remains outside first-wave active scope

## Important cautions

- Do not move privileged SharePoint repair logic into SPFx.
- Do not treat `@hbc/features-admin` as the privileged executor.
- Do not create a broad tenant-governance engine under the Phase 8 banner.
- Do not hard-code live-governance assumptions that belong to the later standards/config phase.
- Do not bypass preview / dry-run semantics for repair-oriented flows unless repo truth forces a narrowly documented exception.

## Expected output shape in the repo

This phase is expected to touch, as appropriate:

- `backend/functions/**`
- `apps/admin/**`
- `docs/architecture/plans/MASTER/spfx/admin/**`
- supporting shared contract or adapter surfaces if the repo already has the correct extension points

## Validation posture

Use the smallest credible validation set for each prompt.

Typical expectation:
- targeted type-checking or test runs for touched packages / apps
- targeted linting where needed
- focused documentation reconciliation
- no broad workspace-wide verification unless repo truth or touched areas justify it

## Completion standard

This package is complete when the repo has:
- a working SharePoint control lane,
- bounded active-control workflows,
- standards comparison and preview behavior,
- constrained repair / apply / reapply execution,
- operator-facing visibility into package / API posture where relevant,
- and updated docs proving the phase stayed architecture-safe.

# Prompt 07 — SharePoint Artifact Validation and Hardening

## Objective

Validate and harden the provisioning of libraries, template files, department folders, and financial/startup workflow lists so the Estimating & Accounting site output is exactly what the workflow intends.

## Required repo-truth reading

- `backend/functions/src/config/core-libraries.ts`
- `backend/functions/src/config/template-file-manifest.ts`
- `backend/functions/src/config/financial-list-definitions.ts`
- `backend/functions/src/config/workflow-list-definitions.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts`
- `backend/functions/src/services/sharepoint-service.ts`

## Execution instructions

You are acting as a senior implementation agent working directly in the live HB Intel repo.

Perform the work directly in code.

Before changing code:
1. inspect the required repo-truth files,
2. inspect the current implementation files named below,
3. identify the exact contract or wiring mismatch,
4. implement the smallest correct set of changes,
5. validate against the affected surfaces and runtime seams.

Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.

## Implementation scope

- Inspect the current artifact definitions and validate they are all actually reachable from saga Steps 2–4.
- Harden any missing reporting or validation around missing template assets, list creation, folder tree creation, and project-number placeholder substitution.
- Prefer precise validation and clearer failure metadata over broad rewrites.

## Required deliverables

- Any targeted hardening changes for steps 2–4
- Improved error/reporting behavior where needed
- Evidence that estimating/accounting artifacts are being provisioned as intended

## Acceptance criteria

- Core libraries are created reliably.
- Department-specific libraries/folders are created reliably.
- Financial-family lists are created reliably with correct ordering and schema.
- Missing template assets surface clearly in metadata / diagnostics rather than failing silently.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

# Prompt 04 — Admin SPFx API Permission and Token Path Remediation

## Objective

Make the Admin SPFx solution production-safe for authenticated backend access by validating and correcting the Admin API permission posture and the Admin SPFx bearer-token acquisition path.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Focus Areas

Inspect and reconcile at minimum:

- `apps/admin/config/package-solution.json`
- `apps/admin/src/webparts/admin/AdminWebPart.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/utils/resolveSessionToken.ts`
- `packages/auth/src/spfx/index.ts`
- `packages/auth/src/spfx/apiTokenProvider.ts`
- `packages/auth/src/spfx/SpfxContextAdapter.ts`
- `packages/provisioning/src/api-client.ts`
- backend Admin host auth/audience expectations
- comparable working SPFx surfaces, especially Accounting

## Required Tasks

1. Determine the intended Admin backend call path from the SPFx runtime.
2. Prove whether current Admin backend-bound calls use:
   - a valid SPFx API-scoped token provider
   - a session abstraction that still yields a valid bearer token
   - an invalid fallback path
3. Correct the Admin solution so that:
   - `package-solution.json` declares the required web API permission requests
   - runtime token acquisition is explicitly API-scoped where required
   - backend API clients receive a valid bearer token
   - invalid fallback behavior is removed or blocked
4. Verify parity against the proven SPFx permission model already used elsewhere in the repo where appropriate.
5. Update docs to describe the Admin SPFx auth and permission path clearly.

## Deliverables

Create or update:

- Admin SPFx auth/token wiring
- Admin `package-solution.json`
- `phase-14/auth/admin-api-permission-remediation.md`
- `phase-14/auth/admin-token-path-validation.md`
- `phase-14/auth/admin-spfx-auth-contract.md`

## Hard Gates

This prompt is not complete unless:
- Admin declares the required SPFx API permission posture
- backend-bound Admin calls are proven to use a valid bearer token path
- no fallback path can silently send an invalid identity reference as a bearer token

## Required Final Report

Return:
- the exact Admin permission declarations now in place
- the exact token acquisition path now in place
- all invalid fallback paths removed or blocked
- what still needs environment validation in Prompt 05

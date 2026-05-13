# Prompt 05 — My Projects Role Schema Readiness and Provisioning Evidence

## Objective
Close the confirmed schema/readiness gap between the project-links provider’s canonical 14-role assignment model and the tenant snapshots that still classify those fields as provisioning-required target additions.

## Why This Issue Exists Now
The provider searches canonical role-array fields across Projects and Legacy Registry, but the repo’s own tenant snapshots state those columns are not yet live-verified. Projects has a limited four-field legacy fallback; Registry does not.

## Why It Matters
A fully authenticated user may still get no project matches because the source data contract is not closed in the tenant.

## Current Repo-Truth Condition
Inspect and verify:
- `packages/models/src/myWork/MyProjectAssignmentRoles.ts`
- `packages/models/src/myWork/MyProjectUpnNormalization.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- any existing provisioning/backfill scripts and docs.

Known condition:
- provider reads 14 canonical fields,
- schema docs call them provisioning-required/not live-verified.

## Required Future State
1. Produce an operator-gated schema readiness path that proves whether the canonical role fields exist in both tenant lists.
2. Where repo tooling already supports provisioning/backfill, align it to this contract; where it does not, add the missing governed script or evidence doc.
3. Ensure the Legacy Registry path is not silently expected to match on absent fields.
4. Update schema/reference docs so live-verified vs target-only state is unambiguous after remediation.

## Exact Files / Seams / Symbols to Inspect
- My Project role taxonomy model
- UPN normalization/parser model
- project-links provider
- Projects schema reference
- Legacy Registry schema reference
- any existing scripts under `scripts/`, `backend/functions/src/services/`, or docs that relate to provisioning/backfill.

## Required Implementation Scope
- Add readiness/provisioning evidence tooling or scripts.
- Add tests for readiness contract helpers where appropriate.
- Update docs and operator procedure.
- Do not execute tenant mutation automatically; preserve operator gating.

## Explicit Non-Scope
- Do not populate tenant data automatically without operator approval.
- Do not change unrelated HB Central list contracts.
- Do not redesign project-link card UI.

## Required Tests
- Schema readiness helper tests.
- Script/input validation tests where applicable.
- Provider regression tests if schema-readiness reporting touches provider behavior.

## Validation Commands
Run the closest available equivalent commands in the repo. At minimum, execute the relevant package checks for changed areas, such as:

```bash
pnpm --filter @hbc/my-dashboard check-types
pnpm --filter @hbc/my-dashboard test
pnpm --filter @hbc/functions test
```

Also run any narrower Vitest files or package-specific test commands that directly cover the changed files. If the repo exposes an existing SPFx package verification command for My Dashboard, use it when the prompt changes packaging/runtime proof seams.

## Proof-of-Closure Artifacts
Provide:
- changed-file inventory,
- test command results,
- concise before/after behavior summary,
- any new fixtures/snapshots/evidence docs,
- any remaining operator-only proof items.

## Completion Standard
The prompt is complete only when:
- the required future state is implemented,
- tests are added/updated,
- validation commands are executed or clearly documented if unavailable,
- the closure evidence is produced,
- no out-of-scope surface was disturbed.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**


# Prompt 04 — Verification, Backfill, and Operator Runbook Integration

## Objective

Integrate the new My Projects source-list provisioner into the existing readiness and backfill workflow, and document the operator-safe run sequence.

## Why this issue exists now

The repo has separate verifier and backfill scripts, but no single documented operator path from schema readiness to provisioning to post-provision backfill.

## Why it matters

Operators need a deterministic sequence that avoids running backfills before columns exist and avoids confusing app registration permissions with Function App runtime identity.

## Current repo-truth condition

- Readiness docs exist at `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`.
- B05A plan docs exist under `docs/architecture/plans/MASTER/spfx/my-dashboard/B05A/`.
- Existing admin guide exists for legacy fallback lists only.

## Required future state

Update docs to include:

1. Identity lane selection.
2. Read-only verification.
3. New provisioner dry-run.
4. New provisioner apply.
5. Post-apply verification.
6. Projects backfill dry-run/apply.
7. Registry backfill dry-run/apply.
8. Final readiness and functional smoke evidence.

## Exact files / seams / symbols to inspect

- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `docs/how-to/administrator/create-legacy-fallback-lists.md`
- B05A docs under `docs/architecture/plans/MASTER/spfx/my-dashboard/B05A/`
- `apps/my-dashboard/config/package-solution.json`
- `backend/functions/src/services/managed-identity-token-service.ts`

## Research-informed technical considerations

- App manifest `requiredResourceAccess` does not by itself prove admin consent/effective service-principal grants.
- `Sites.Selected` requires selected scope consent, resource grant, and token containing the selected scope.
- Graph list column create/update docs name `Sites.Manage.All` and `Sites.FullControl.All` for application mode.

## Required implementation scope

- Update readiness doc to reference the new provisioner.
- Add or update an administrator runbook for My Projects source-list schema provisioning.
- Add an evidence checklist template.
- Include explicit guidance for `HB SharePoint Creator` app registration vs Function App UAMI.
- Include no-secrets warning.
- Include exact command sequence.

## Explicit non-scope

- Do not change code behavior in this prompt unless documentation updates reveal broken command names.
- Do not alter SPFx package permissions.
- Do not create new app registrations.

## Required tests

- Documentation link/path check if repo has markdown lint/link tooling.
- Existing unit tests should still pass.

## Validation commands

```bash
pnpm test -- scripts/verify-my-project-role-fields
pnpm test -- scripts/provision-my-projects-source-list-schema
pnpm typecheck
```

## Proof-of-closure artifacts

- Updated docs/runbook.
- Evidence checklist.
- Command ledger.

## Completion standard

This prompt is complete when an operator can follow repo docs from read-only verification through schema provisioning and backfill without needing unstated decisions.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

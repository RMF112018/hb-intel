# My Projects Source-List Provisioning Command Ledger

Prepared: 2026-05-14

This ledger defines the deterministic operator command order from read-only verification through provisioning and backfill.

## Ordered Commands

1. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`
2. `pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json`
3. `pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json`
4. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`
5. `pnpm tsx scripts/backfill-my-project-role-arrays.ts`
6. `pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply`
7. `pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts`
8. `pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply`
9. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`

## Sequencing Guards

- Do not run any backfill apply before command 4 confirms schema closure readiness.
- Do not run command 3 when command 2 reports wrong-type blockers or missing target lists.
- Use HBCentral site lock only.
- Keep runtime identity lane and operator/deployment app-registration lane distinct in evidence.

## Evidence Expectations

Record exit code and artifact path for each command using:
- `docs/how-to/administrator/templates/my-projects-source-list-evidence-checklist.md`

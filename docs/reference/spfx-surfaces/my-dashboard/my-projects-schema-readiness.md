# My Dashboard — My Projects Role Schema Readiness

## What this is

This is the read-only schema readiness gate for My Projects source lists. It verifies required columns only; it does not provision or backfill.

Required lists:
- `Projects`
- `Legacy Project Fallback Registry`

## Canonical fields

Source of truth: `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS` in `packages/models/src/myWork/MyProjectAssignmentRoles.ts`.

- 14 canonical role-array fields: expected SharePoint `Note` (`MultiLineText`)
- Registry-only `procoreProject`: expected SharePoint `Text`

## Identity lane distinction (critical)

Keep these lanes separate in operator decisions and evidence:

1. **Runtime lane**: Function App UAMI app-only token lane used by provisioning/verification scripts.
2. **Operator/deployment lane**: `HB SharePoint Creator` app registration and consent posture.

SPFx package permission declarations do not, by themselves, prove effective runtime app-only schema mutation grants.

## Read-only verification command

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

Exit code:
- `0`: ready
- `1`: missing/wrong-type drift exists

`--apply` is intentionally unsupported.

## Integrated operator sequence

Use the documented end-to-end runbook for deterministic ordering:

- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`

That runbook defines the full sequence:
1. identity lane selection
2. read-only verification
3. provisioner dry-run
4. provisioner apply
5. post-apply verification
6. Projects backfill dry-run/apply
7. Registry backfill dry-run/apply
8. final readiness + functional smoke evidence

## Evidence and no-secrets posture

- Use checklist template:
  - `docs/how-to/administrator/templates/my-projects-source-list-evidence-checklist.md`
- Never capture or store raw bearer tokens, client secrets, or full app-setting dumps in evidence.

## Related references

- My Projects source-list provisioner: `scripts/provision-my-projects-source-list-schema.ts`
- Legacy fallback list runbook: `docs/how-to/administrator/create-legacy-fallback-lists.md`
- B05A command ledger: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05A/supporting/06_My_Projects_Source_List_Provisioning_Command_Ledger.md`

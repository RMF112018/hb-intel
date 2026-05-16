# My Dashboard — My Projects Role Schema Readiness

## What this is

This is the read-only schema readiness gate for My Projects source lists. It verifies required columns only; it does not provision or backfill.

Required lists:

- `Projects`
- `Legacy Project Fallback Registry`

## Canonical fields

Source of truth: `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS` in `packages/models/src/myWork/MyProjectAssignmentRoles.ts` (role arrays), plus the descriptor and readiness helper at:

- `backend/functions/src/services/my-projects/my-projects-source-list-schema.ts`
- `backend/functions/src/services/projects-role-schema-readiness.ts`

| Field                  | Lists                 | Expected Type          | Notes                                                                                      |
| ---------------------- | --------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| 14 role-array fields   | Projects + Registry   | `Note` (MultiLineText) | Source of truth: `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS`. Required on both lists.          |
| `procoreProject`       | Registry only         | `Text`                 | Registry-only Procore identifier/token column.                                             |
| `buildingConnectedUrl` | Projects + Registry   | `Text`                 | B05.10 multi-platform launch — Autodesk BuildingConnected destination URL on each row.     |
| `documentCrunchUrl`    | Projects + Registry   | `Text`                 | B05.10 multi-platform launch — Document Crunch destination URL on each row.                |
| `projectStage`         | Registry only (added) | `Text`                 | Registry-side stage column. Projects-side stage is the existing `field_6` (no new column). |

Required-field counts:

- Projects: **16** (14 role arrays + `buildingConnectedUrl` + `documentCrunchUrl`)
- Legacy Project Fallback Registry: **18** (14 role arrays + `procoreProject` + `buildingConnectedUrl` + `documentCrunchUrl` + `projectStage`)

Project stage — Projects vs Registry distinction:

- **Projects-side stage**: reuse the existing `field_6` column (`Text`, `MaxLength=255`) via `resolveSpField('projectStage')` in `backend/functions/src/services/projects-list-contract.ts`. No new column is added to the Projects list.
- **Registry-side stage**: a new `projectStage` `Text` column is added to the Legacy Project Fallback Registry because the Registry does not carry `field_6`. The provider applies a Projects-preferred precedence rule on merged rows.

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

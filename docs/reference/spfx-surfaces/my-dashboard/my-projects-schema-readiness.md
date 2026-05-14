# My Dashboard — My Projects Role Schema Readiness

## What this is

The my-project-links backend provider matches a user to their projects by reading **14 canonical role-array fields** on every row of two SharePoint lists: `Projects` and `Legacy Project Fallback Registry`. If those columns are absent or have the wrong type in the tenant, a fully authenticated user gets **zero project matches** — and the Prompt 04 diagnostics blob reports `classification: 'zero-match-available-sources'` whether the columns exist or not. This page documents the **read-only verification path** that proves whether the canonical columns are live in both lists before any backfill is run.

This is the operator-gated readiness gate. It never mutates the tenant.

## The 14 canonical role-array fields

Source of truth: `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS` in `packages/models/src/myWork/MyProjectAssignmentRoles.ts`. Stored as SharePoint `Note` (MultiLineText), JSON-serialized `string[]`.

```
leadEstimatorUpns        estimatorUpns            idsManagerUpns
projectAccountantUpns    projectAdministratorUpns projectCoordinatorUpns
superintendentUpns       leadSuperintendentUpns   projectManagerUpns
leadProjectManagerUpns   projectExecutiveUpns     safetyCoordinatorUpns
qcManagerUpns            warrantyManagerUpns
```

| List                               | Required fields                                                                | Provider fallback                                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Projects`                         | the 14 canonical role-array fields (`Note`)                                    | 4-field legacy fallback (`leadEstimatorUpn`, `supportingEstimatorUpns`, `projectManagerUpn`, `projectExecutiveUpn`) — emits `schema-transition-legacy-role-fallback-used` warning |
| `Legacy Project Fallback Registry` | the 14 canonical role-array fields (`Note`) **plus** `procoreProject` (`Text`) | **none** — a missing field here silently produces zero-match for users whose only assignments live in legacy rows                                                                 |

## How to verify (operator-gated)

Run the read-only verify script against the tenant. It requires managed-identity auth (`SHAREPOINT_PROJECTS_SITE_URL` or `SHAREPOINT_TENANT_URL` env var) and never writes:

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts          # human-readable text
pnpm tsx scripts/verify-my-project-role-fields.ts --json   # structured JSON
```

`--apply` is intentionally **not supported** — the script throws if it is passed. Remediation is a separate, operator-decided step (see "If not ready" below).

Exit code:

| Exit code | Meaning                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `0`       | Both lists ready — every required field is present with the expected type. Downstream backfill is unnecessary.            |
| `1`       | At least one required field is `missing` or `wrong-type` on at least one list. Do not consider My Projects schema-closed. |

## Interpreting the report

The structured report (`--json`) has this shape:

```jsonc
{
  "ready": false,
  "generatedAtUtc": "2026-05-14T12:00:00.000Z",
  "projects": {
    "listName": "Projects",
    "ready": false,
    "entries": [
      {
        "internalName": "projectManagerUpns",
        "expectedTypeAsString": "Note",
        "observedTypeAsString": null,
        "state": "missing",
      },
      // …13 more
    ],
  },
  "legacyRegistry": {
    "listName": "Legacy Project Fallback Registry",
    "ready": true,
    "entries": [
      /* 15 entries: 14 canonical + procoreProject */
    ],
  },
}
```

Per-field `state` is a closed set:

| `state`         | Meaning                                                                                            | Operator action                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `live-verified` | Column exists with the expected `TypeAsString`.                                                    | None — this field is closed.                                                                                                                  |
| `missing`       | Column is absent from the list.                                                                    | Provision the column (see below). On `Projects` the 4-field legacy fallback may still cover some users; on the Registry there is no fallback. |
| `wrong-type`    | Column exists but `TypeAsString` ≠ expected (`Note` for role arrays, `Text` for `procoreProject`). | Recreate the column with the correct type — a wrong-typed column will not deserialize correctly.                                              |

## If not ready — chaining into remediation

The verify script is the gate; it does not provision. When it reports `ready: false`, the operator decides whether to run the existing **mutation** scripts (each defaults to dry-run and gates behind `--apply`):

- `scripts/backfill-my-project-role-arrays.ts` — migrates the Projects 4-field legacy data into the canonical 14 array fields. Run with `--apply` only after the columns exist.
- `scripts/backfill-my-project-legacy-registry-fields.ts` — mirrors Projects role data into the Legacy Registry and backfills the canonical fields there.
- `scripts/provision-legacy-fallback-lists.ts` — provisions the Legacy Project Fallback Registry list/columns.

After any remediation, **re-run the verify script** and confirm `ready: true` before considering the My Projects schema contract closed in the tenant.

## Test-coverage map

| File                                                                              | Layer       | What it proves                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/functions/src/services/projects-role-schema-readiness.ts`                | Pure helper | `buildProjectsRoleSchemaReadinessReport(...)` classifies each field `live-verified` / `missing` / `wrong-type`; the field list is a typed re-export of `@hbc/models` — no drift  |
| `backend/functions/src/services/__tests__/projects-role-schema-readiness.test.ts` | Unit        | Fully-live tenant → `ready: true`; single missing field; wrong-type field; empty snapshot; the Registry-only `procoreProject` field; field-list constants match the canonical 14 |
| `scripts/verify-my-project-role-fields.ts`                                        | CLI         | Read-only Graph probe + structured stdout + non-zero exit on `!ready`; `--apply` rejected                                                                                        |
| `scripts/verify-my-project-role-fields.test.ts`                                   | Unit        | argv parsing, exit-code selection, JSON/text formatting, `main(...)` orchestration with a stubbed list-field query (no live Graph calls)                                         |

## Operator acceptance checklist

1. Set `SHAREPOINT_PROJECTS_SITE_URL` (or `SHAREPOINT_TENANT_URL`) for the HBCentral site.
2. Run `pnpm tsx scripts/verify-my-project-role-fields.ts --json`.
3. If exit code `0` — the My Projects role schema is live-verified in the tenant; no further action.
4. If exit code `1` — inspect `entries[].state` per list, provision/recreate the flagged columns, then run the relevant backfill script with `--apply`.
5. Re-run the verify script and confirm `ready: true`.
6. Record the final `ready: true` JSON output as the closure evidence for the My Projects schema readiness gate.

## Out of scope (deliberate)

- This script never provisions or backfills. Tenant mutation stays operator-gated behind the separate `--apply` backfill scripts.
- The `validateSchemaReadiness(...)` helper in `backend/functions/src/services/projects-list-contract.ts` still classifies the 14 canonical fields as `OPTIONAL_EXTENSION_FIELDS` (warning-only). Promoting them to a `my-projects-required` category there is deferred future work — the dedicated verify script is the authoritative readiness gate for now.

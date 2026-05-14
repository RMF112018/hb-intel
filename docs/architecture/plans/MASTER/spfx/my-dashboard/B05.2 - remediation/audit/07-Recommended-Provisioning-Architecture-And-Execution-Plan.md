# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 5 — Recommended Provisioning Architecture and Execution Plan

## Recommended implementation structure

### New script

```text
scripts/provision-my-projects-source-list-schema.ts
```

### Shared utilities

Create or refactor shared utilities from the legacy fallback script:

```text
backend/functions/src/services/sharepoint-schema-provisioning/
  field-definition.ts
  field-compatibility.ts
  list-field-provisioner.ts
  provisioning-report.ts
```

### Descriptor source

Define a My Projects descriptor that contains only the schema delta:

```text
backend/functions/src/services/my-projects/my-projects-source-list-schema.ts
```

Recommended constants:

```ts
export const MY_PROJECTS_SOURCE_LIST_SCHEMA_TARGETS = [
  {
    listTitle: 'Projects',
    allowCreateList: false,
    fields: MY_PROJECT_ROLE_ARRAY_FIELD_DEFINITIONS,
  },
  {
    listTitle: 'Legacy Project Fallback Registry',
    allowCreateList: false,
    fields: [
      ...MY_PROJECT_ROLE_ARRAY_FIELD_DEFINITIONS,
      { internalName: 'procoreProject', displayName: 'Procore Project', type: 'Text' },
    ],
  },
] as const;
```

## Required script behavior

- Defaults to dry-run.
- Requires `--apply` for mutation.
- Supports `--json` output.
- Supports `--site-url` or `SHAREPOINT_PROJECTS_SITE_URL` / `SHAREPOINT_TENANT_URL`.
- Locks to HBCentral unless a deliberately named override is supplied for test tenants.
- Refuses to create either source list.
- Creates missing fields only.
- Treats wrong-type existing fields as blocking drift.
- Does not delete/recreate wrong-type fields.
- Does not backfill item values.
- Emits report with started/completed UTC, execution identity hint, target lists, field states, planned mutations, applied mutations, unresolved blockers, and next commands.
- Runs or instructs the operator to run `scripts/verify-my-project-role-fields.ts --json` after apply.

## Recommended operator sequence

```bash
# 1. Confirm branch and current source
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD

# 2. Confirm selected identity lane
export SHAREPOINT_PROJECTS_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="08c399eb-a394-4087-b859-659d493f8dc7" # if using HB SharePoint Creator app registration
# export AZURE_CLIENT_SECRET="..." # only via secure local environment / secret manager, never committed

# 3. Read-only readiness proof
pnpm tsx scripts/verify-my-project-role-fields.ts --json

# 4. Provisioning dry-run
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json

# 5. Apply only after review
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json

# 6. Post-apply closure proof
pnpm tsx scripts/verify-my-project-role-fields.ts --json

# 7. Backfill dry-runs and applies
pnpm tsx scripts/backfill-my-project-role-arrays.ts --json
pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply --json
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --json
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply --json
```

## Tests required

- Unit tests for descriptor field list equals `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS`.
- Unit tests for dry-run classification: missing, live-verified, wrong-type.
- Unit tests for apply mode: creates missing Note/Text fields, does not update wrong-type fields.
- Unit tests for report shape and exit codes.
- Regression test that the legacy fallback provisioner still produces equivalent behavior after shared utility extraction.
- Unit test that `FolderWebUrl` drift is isolated from My Projects source-list provisioning.

## Proof-of-closure artifacts

- Dry-run JSON report.
- Apply JSON report.
- Post-apply `verify-my-project-role-fields.ts --json` report with `ready: true`.
- Test command outputs.
- README/runbook update documenting identity selection and backfill sequence.

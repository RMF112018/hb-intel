# My Projects Source-List Provisioning Evidence Checklist

## Run Metadata

- Date (UTC):
- Operator:
- Tenant/Site:
- Branch/Commit:
- Script versions observed:

## Identity Lane Evidence

- Runtime lane confirmed (Function App UAMI): yes/no
- Operator/deployment lane confirmed (`HB SharePoint Creator` posture): yes/no
- Consent/resource grant evidence captured (redacted): yes/no

## Command Ledger

1. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`
   - Exit code:
   - Evidence file:
2. `pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json`
   - Exit code:
   - Evidence file:
3. `pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json`
   - Exit code:
   - Evidence file:
4. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`
   - Exit code:
   - Evidence file:
5. `pnpm tsx scripts/backfill-my-project-role-arrays.ts`
   - Exit code:
   - Evidence file:
6. `pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply`
   - Exit code:
   - Evidence file:
7. `pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts`
   - Exit code:
   - Evidence file:
8. `pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply`
   - Exit code:
   - Evidence file:
9. `pnpm tsx scripts/verify-my-project-role-fields.ts --json`
   - Exit code:
   - Evidence file:

## Schema Closure

- Projects 14 canonical role-array fields `live-verified`: yes/no
- Registry 14 canonical role-array fields `live-verified`: yes/no
- Registry `procoreProject` `Text` `live-verified`: yes/no
- Wrong-type blockers remain: yes/no
- Missing fields remain: yes/no

## Functional Smoke

- My Projects response no longer blocked by schema readiness drift: yes/no
- User/project match smoke captured: yes/no
- Screenshot/log evidence location:

## Security and Redaction Check

- No secrets copied into evidence: yes/no
- No bearer/app-setting dumps retained: yes/no
- Sensitive identifiers redacted as required: yes/no

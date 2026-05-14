# Provision My Projects Source-List Schema

## Purpose

Operator-safe runbook to move from read-only schema verification to controlled provisioning and post-provision backfill for My Projects source lists on HBCentral.

This runbook is scoped to:
- `Projects`
- `Legacy Project Fallback Registry`

It does not create lists, does not mutate item data unless backfill `--apply` is explicitly used, and does not remediate unrelated drift such as `FolderWebUrl`.

## Identity Lane Prerequisite

Use the correct lane before running provisioning:

1. **Runtime lane (script execution)**: Function App UAMI app-only token lane used by backend provisioning scripts.
2. **Operator/deployment lane**: `HB SharePoint Creator` app registration and permission/admin-consent posture.

Do not treat these as the same thing. SPFx `requiredResourceAccess` and package permission declarations do not, by themselves, prove effective app-only grants for runtime schema mutation.

## No-Secrets Warning

- Never commit tokens, bearer strings, client secrets, or tenant app-setting dumps.
- Do not paste raw auth payloads into docs, PRs, or logs.
- Use redacted evidence only.

## Deterministic Command Sequence

Run from repo root.

### 1. Read-only readiness verification

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

### 2. Provisioner dry-run (required)

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json
```

Optional explicit site:

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral --json
```

### 3. Provisioner apply (only if dry-run has no blocking drift)

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json
```

### 4. Post-apply verification

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

### 5. Projects backfill dry-run

```bash
pnpm tsx scripts/backfill-my-project-role-arrays.ts
```

### 6. Projects backfill apply

```bash
pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply
```

### 7. Registry backfill dry-run

```bash
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts
```

### 8. Registry backfill apply

```bash
pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply
```

### 9. Final readiness and functional smoke evidence

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

Then collect functional smoke evidence from My Dashboard/My Projects surfaces according to current hosted validation guidance.

## Blocking Rules

- If readiness verification reports missing/wrong-type fields, do not run backfill apply.
- If provisioner dry-run reports blocking wrong-type drift, do not run provisioner apply.
- If target list is missing, stop and resolve list availability first.

## Related Docs

- Readiness reference: `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- Legacy fallback list runbook: `docs/how-to/administrator/create-legacy-fallback-lists.md`
- Evidence checklist template: `docs/how-to/administrator/templates/my-projects-source-list-evidence-checklist.md`

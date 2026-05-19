# Provision My Projects Projection Storage (MyDashboard)

## Purpose

Provision and verify the seven MyDashboard SharePoint lists used by the My Projects projection storage/control plane.

This runbook is for schema and control-list readiness only. It does not perform production permission changes automatically.

## Canonical script names and aliases

Package-required entrypoints:

- `scripts/provision-my-dashboard-my-projects-projection-storage.ts`
- `scripts/verify-my-dashboard-my-projects-projection-storage.ts`

Repo-convention aliases (same logic path):

- `scripts/provision-my-projects-projection-storage.ts`
- `scripts/verify-my-projects-projection-storage.ts`

## Deterministic command sequence

1. Read-only verification (JSON):

```bash
pnpm tsx scripts/verify-my-projects-projection-storage.ts --json
```

2. Provision dry-run (required first pass):

```bash
pnpm tsx scripts/provision-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

3. Apply provisioning (only if dry-run has no unsafe drift blockers):

```bash
pnpm tsx scripts/provision-my-projects-projection-storage.ts --apply --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

4. Post-apply read-only verification:

```bash
pnpm tsx scripts/verify-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

## Guardrails

- Wrong-site refusal is strict: only `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` is accepted.
- Provisioner is dry-run by default.
- Verifier is read-only and rejects `--apply`.
- Unsafe drift (wrong-type / unresolved uniqueness) refuses apply unless explicitly overridden by the script's drift flag.
- No destructive delete/recreate behavior is automated.

## Required operator-only permission step

After schema provisioning, operators must:

1. Break permission inheritance for all seven projection lists.
2. Remove broad member/visitor access.
3. Apply restricted role assignments for backend/runtime identity and authorized operators.

This step is mandatory before production seed/cutover.

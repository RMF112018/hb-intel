# Scope Lock and Guardrails

## Allowed

- `packages/models/src/pcc/**`
- `packages/models/src/pcc/fixtures/**`
- `backend/functions/src/hosts/pcc-read-model/**`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/surfaces/**`
- `apps/project-control-center/src/tests/**`
- `docs/architecture/blueprint/sp-project-control-center/**`
- `docs/architecture/plans/MASTER/spfx/pcc/**`
- `packages/project-site-template/**` only for documentation/schema-description alignment, not tenant mutation.

## Forbidden

- Procore SDK dependency adoption.
- Live Procore HTTP calls.
- Direct SPFx-to-Procore.
- Procore write-back.
- Sage write-back.
- External-system mutation.
- Binary/file mirror.
- Tenant/deployment/app-catalog changes.
- Secrets or credential-like placeholders.
- Package/lockfile mutation unless specifically authorized by the prompt.

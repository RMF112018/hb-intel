---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 05 — Wave 05 Prompt: Controlled Provisioning Path

You are working after urgent Foleon list schema remediation and package proof have been addressed.

## Objective

Evaluate and, if approved, implement a controlled provisioning path for Foleon SharePoint lists so complex business-list schema creation is not dependent on SPFx Feature Framework app-install side effects.

The target model should be consistent with the Safety Records posture: explicit provisioning, observable validation, dry-run capability, idempotent operations, and clear tenant readiness output.

## Why This Wave Exists

Feature Framework is weak for complex governed business-list provisioning because it provides poor observability, weak rollback, and poor repair behavior after partial failures. Foleon lists include many fields, indexes, views, a lookup relationship, future backend writers, and a manager surface. That profile is better suited to controlled provisioning.

## Required Repo Scope

Inspect:

```text
apps/hb-intel-foleon/
backend/functions/
packages/provisioning/
packages/sharepoint-platform/
packages/features/safety/
docs/architecture/plans/MASTER/backend/safety*
docs/reference/sharepoint/list-schemas/hbcentral/lists/
tools/pnp-runner-local/
```

Do not re-read files that remain in your active context unless verifying a specific line, contradiction, or diff.

## Research Required

Use current documentation to evaluate:

- Microsoft Graph list/column/view provisioning capability.
- SharePoint REST list/field/view provisioning capability.
- PnP PowerShell / PnP Core SDK provisioning reliability.
- Azure Functions app-only vs delegated permissions for SharePoint provisioning.
- SPFx calling backend provisioning routes securely.
- Idempotent schema drift detection and repair.

## Design Requirements

The controlled provisioning path must support:

1. Dry run.
2. Apply run.
3. Idempotent re-run.
4. Per-list readiness checks.
5. Per-field readiness checks.
6. Per-view readiness checks.
7. Index creation with explicit success/failure logs.
8. Lookup creation only after target list is valid.
9. Unique field enforcement only through documented supported mechanism.
10. Rollback guidance.
11. Evidence artifact output.
12. Manager route readiness display.

## Candidate Implementation Options

### Option A — PnP PowerShell / CLI Runbook

Best for immediate admin-controlled tenant provisioning.

Deliverables:

- scripts under `tools/pnp-runner-local/` or `apps/hb-intel-foleon/scripts/`
- dry-run mode,
- apply mode,
- evidence JSON output,
- docs runbook.

### Option B — Azure Functions Backend Route

Best for long-term app-managed provisioning consistent with Safety Records.

Potential endpoints:

```text
POST /api/foleon/provision-sharepoint
GET  /api/foleon/readiness
POST /api/foleon/repair-sharepoint
```

Required controls:

- admin-only auth,
- function-key or role-gated access,
- strict CORS,
- dry-run default,
- rollout gate,
- detailed readiness output,
- no secrets in logs.

### Option C — Hybrid

- PnP runbook for initial rollout.
- Backend readiness endpoint for ongoing monitoring.
- Backend apply/repair later.

## Required Analysis Questions

Answer:

1. Should SPFx Feature Framework continue provisioning any Foleon lists?
2. Which fields/indexes/views should be created at initial provisioning?
3. Which fields/indexes/views should be post-provisioned?
4. Should `ContentLookup` exist at all if `ContentIdCache` is runtime-critical?
5. What should the manager route do when lists are missing or invalid?
6. What exact permissions are required?
7. Can the existing Azure registered app be reused?
8. Can the existing function app be reused?
9. What are the tenant rollback steps?
10. What is the critical path schedule for implementing this safely?

## Required Implementation if Approved

If implementing in this wave:

1. Add schema contract source.
2. Add dry-run planner.
3. Add apply runner.
4. Add readiness validator.
5. Add evidence JSON output.
6. Add docs.
7. Add tests.
8. Add package/runtime wiring only if necessary.
9. Do not make unrelated UI changes.

## Required Validation

Local:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
```

Backend/package validation if backend is changed:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
```

Provisioning dry run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:dry-run
```

Apply command only against a test site first:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:apply -- --siteUrl <TEST_SITE>
```

## Required Output

Produce:

- recommendation: Feature Framework vs controlled provisioning,
- implementation plan,
- permission model,
- data model,
- rollback model,
- validation results,
- remaining risks,
- commit summary and description.

## Do Not Claim

Do not claim production readiness unless a controlled test-site apply run has created/validated all lists, fields, views, indexes, lookup behavior, and app read/write paths.

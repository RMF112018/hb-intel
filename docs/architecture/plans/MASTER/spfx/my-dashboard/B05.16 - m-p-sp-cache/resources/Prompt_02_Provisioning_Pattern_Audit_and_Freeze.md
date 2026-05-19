# Prompt 02 — MyDashboard Provisioning Pattern Audit and Schema Freeze

## Repo-Truth Snapshot

- Branch: `main`
- HEAD: `665521e41d3b9d619eb7ce4b835605f64a56d2e1`
- Observed status at audit time: existing untracked B05.15/B05.16 package docs; no Prompt 02 implementation code changes.

## Selected Provisioning Architecture (Locked)

Prompt 03 must reuse the existing repository provisioning stack and must not introduce a new stack:

1. Descriptor module(s) that declare SharePoint list schema contracts in service space.
2. `sharepoint-schema-provisioning` planner/types compatibility surface for drift classification and action planning.
3. Adapter-backed scripts (`provision-*`, `verify-*`) with dry-run default and explicit `--apply` mutation lane.
4. Script-local tests that assert parser, guardrails, blocker handling, report shape, and exit-code behavior.
5. Operator runbook under `docs/how-to/administrator/`.

Proven pattern sources audited:

- `scripts/provision-my-projects-registry-schema.ts`
- `scripts/verify-my-projects-registry-schema.ts`
- `scripts/provision-my-projects-source-list-schema.ts`
- `scripts/verify-my-projects-custom-links.ts`
- `backend/functions/src/services/sharepoint-schema-provisioning/*`

## Contract Reconciliation (Locked)

Canonical schema/contract inputs for Prompt 03 are:

- `resources/My_Projects_SharePoint_Storage_Schema.json`
- `resources/My_Projects_Provisioning_Contract.json`

Implementation must project those contracts into repo-native descriptor/readiness modules while preserving existing script orchestration posture:

- strict target-site validation (`https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`);
- dry-run default;
- fail-closed on wrong-type/unsafe drift for apply;
- structured JSON/text report with deterministic exit code;
- read-only verifier that rejects `--apply`.

## Naming Contradiction and Resolution (Locked)

### Contradiction

Package resource contract currently references:

- `scripts/provision-my-dashboard-my-projects-projection-storage.ts`
- `scripts/verify-my-dashboard-my-projects-projection-storage.ts`

Repo naming convention in active provisioning scripts uses:

- `scripts/provision-my-projects-*.ts`
- `scripts/verify-my-projects-*.ts`

### Resolution

Prompt 03 must use repo convention names:

- `scripts/provision-my-projects-projection-storage.ts`
- `scripts/verify-my-projects-projection-storage.ts`

Package docs/resources must explicitly document the mapping so no silent rename ambiguity remains.

## Prompt 03 Target Paths (Locked)

### Scripts and tests

- `scripts/provision-my-projects-projection-storage.ts`
- `scripts/verify-my-projects-projection-storage.ts`
- `scripts/provision-my-projects-projection-storage.test.ts`
- `scripts/verify-my-projects-projection-storage.test.ts`

### Service modules

- `backend/functions/src/services/my-projects-projection/storage-list-descriptor.ts`
- `backend/functions/src/services/my-projects-projection/storage-schema-readiness.ts`
- optional mirror adapter: `backend/functions/src/services/my-projects-projection/storage-pnp-list-adapter.ts`

### Operator doc

- `docs/how-to/administrator/provision-my-projects-projection-storage.md`

## Prompt 03 Acceptance Preconditions (No Open Decisions)

Prompt 03 is ready to execute when implementation follows all locked items above and validates:

- parser/flag handling (`--apply`, `--json`, `--site-url`, invalid flags);
- wrong-site refusal;
- dry-run/apply split behavior;
- idempotent re-run behavior on compliant schema;
- blocker refusal on wrong-type/unsafe drift;
- read-only verifier posture;
- targeted validation commands:
  - `pnpm --filter @hbc/functions test -- my-projects-projection`
  - `pnpm --filter @hbc/functions check-types`

## Validation Commands Used for Prompt 02 Audit

- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `sed -n` inspections across required scripts/services/docs/resources
- `rg --files` inspections across required seams

## Prompt 02 Readiness Decision

- Provisioning pattern selected: **descriptor + planner + adapter + script orchestration (existing repo standard)**.
- Target paths locked: **yes**.
- Contradictions reported/resolved: **yes (script naming)**.
- Prompt 03 readiness: **READY**.

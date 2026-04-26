# HB Intel Foleon — Two-Lane Reader Development Package

Generated: 2026-04-25T19:25:58Z

## Objective

Adapt `apps/hb-intel-foleon` from the current generic Foleon Highlights / Hub / Reader / Manager model into a governed two-lane HB Central communications model:

1. **Project Spotlight** — monthly, curated, project-profile reader.
2. **Company Pulse** — frequently updated company news / events / recognition reader.

The target is not two separate duplicated integrations. The target is:

```text
Two dedicated homepage reader modules
+ one shared Foleon registry
+ one shared iframe host
+ one shared reader gate
+ one shared telemetry model
+ one shared Manager/backend workflow
```

## Controlling Product Intent

The product requirement provided for this package defines:

- `Project Spotlight` as a single active monthly project profile.
- `Company Pulse` as a single active living publication updated frequently.
- two homepage reader modules using a shared `FoleonReaderModule`;
- separate `ReaderKey` / `PlacementKey` lanes;
- a left/primary Project Spotlight lane and a right/secondary Company Pulse lane on desktop;
- stacked tablet behavior;
- collapsed card-first behavior on mobile to avoid loading two full iframes immediately.

## Package Contents

| File | Purpose |
|---|---|
| `01_REPO_TRUTH_AUDIT.md` | Current implementation findings and gaps. |
| `02_TARGET_ARCHITECTURE.md` | Target two-lane architecture and reader model. |
| `03_DATA_MODEL_SCHEMA_BACKEND_PLAN.md` | SharePoint schema, backend DTO, service, provisioning, and migration plan. |
| `04_PUBLIC_READER_RUNTIME_PLAN.md` | Public route, service, module, gate, iframe, telemetry, and preview behavior. |
| `05_MANAGER_AND_PUBLISHING_WORKFLOW_PLAN.md` | Manager/admin workflow and validation changes. |
| `06_UI_UX_BREAKPOINT_AND_PREVIEW_SPEC.md` | Homepage composition, responsive behavior, and preview requirements. |
| `07_TESTING_VALIDATION_AND_PACKAGE_PROOF.md` | Test, build, package, tenant validation, and versioning plan. |
| `08_RISK_REGISTER_AND_DECISIONS.md` | Risks, hard stops, and open decisions. |
| `09_EXECUTION_WAVES.md` | Sequenced implementation waves. |
| `10_PROMPT_01_SCHEMA_AND_CONTRACTS.md` | Code-agent prompt for schema/contracts. |
| `11_PROMPT_02_PUBLIC_READER_SERVICES.md` | Code-agent prompt for public read services. |
| `12_PROMPT_03_READER_MODULE_UI.md` | Code-agent prompt for reader module UI. |
| `13_PROMPT_04_MANAGER_WORKFLOWS.md` | Code-agent prompt for Manager/admin changes. |
| `14_PROMPT_05_TESTS_DOCS_PACKAGE_PROOF.md` | Code-agent prompt for final validation/package proof. |
| `15_TENANT_ROLLOUT_RUNBOOK.md` | Tenant rollout, validation, and rollback runbook. |
| `manifest.json` | Package metadata. |

## Recommended Execution Posture

Execute this package in waves. Do not attempt to implement schema, backend, UI, Manager, previews, package versioning, and tenant deployment in one local-agent pass.

Recommended sequence:

1. **Wave 01 — Schema and contracts**
2. **Wave 02 — Public reader services**
3. **Wave 03 — Reader module UI**
4. **Wave 04 — Manager workflows**
5. **Wave 05 — docs, tests, package proof, tenant rollout**

## Hard Rules

- Preserve the scalar-safe public SharePoint `$select` remediation.
- Do not reintroduce direct public `$select` of person fields such as `MarketingOwner` or `AudienceGroups`.
- Do not weaken reader gates.
- Do not show preview fallback for configuration/query failures.
- Do not load two full iframes on mobile.
- Do not duplicate the Foleon integration logic.
- Do not mutate tenant lists outside an explicit tenant rollout/migration step.

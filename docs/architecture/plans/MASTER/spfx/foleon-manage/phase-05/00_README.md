# HB Intel Foleon Manager Registry-First Audit and Development Package

## Objective

This updated package restructures the prior Foleon Manager audit package so the **HB Platform Configuration Registry** is provisioned first, before Foleon-specific remediation begins.

The purpose is to avoid reinforcing the current fragmented configuration model where list GUIDs, package values, API URLs, accepted origins, and backend token settings are scattered across webpart properties, backend environment variables, and page-local configuration.

## Governing Direction

The first implementation step is now:

```text
Wave 00 — Provision HB Platform Configuration Registry
```

Foleon Manager work follows only after the registry exists and has a validated read/proof path.

## Why This Package Was Reordered

The current Foleon Manager write-readiness blocker is caused by missing runtime API/token configuration. A narrow fix would add more page-specific property-pane values. That would work temporarily, but it would leave the platform with another isolated configuration surface.

The correct platform sequence is:

1. provision the central non-secret registry in HBCentral;
2. seed known safe Foleon baseline values;
3. validate registry access, duplicate active keys, and secret-reference hygiene;
4. build a registry reader/runtime bridge;
5. resolve Foleon Manager load/write readiness from registry-backed configuration;
6. implement the two-tab Manager UX and Foleon content workflows.

## Target Registry

```text
List title: HB Platform Configuration Registry
Recommended internal/reference key: HB_PlatformConfigurationRegistry
Target site: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
Registered app ID: 08c399eb-a394-4087-b859-659d493f8dc7
```

## Updated Execution Order

| Wave | File | Purpose |
| --- | --- | --- |
| Wave 00 | `17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md` | Provision and validate the HBCentral platform configuration registry. |
| Wave 01 | `18_PROMPT_01_REGISTRY_READER_RUNTIME_CONFIG_BRIDGE.md` | Add the registry reader and runtime precedence model. |
| Wave 02 | `19_PROMPT_02_LOAD_ERROR_AND_CONFIG_READINESS.md` | Resolve Foleon Manager load/write readiness using registry-backed config. |
| Wave 03 | `20_PROMPT_03_MANAGER_TWO_TAB_UI.md` | Implement the two-tab Manager shell with registry-aware Config tab. |
| Wave 04 | `21_PROMPT_04_CONTENT_WORKFLOW_AND_VALIDATION.md` | Implement lane-specific Foleon content workflows. |
| Wave 05 | `22_PROMPT_05_FINAL_PACKAGE_PROOF_AND_TENANT_VALIDATION.md` | Run package proof, tenant proof, hosted validation, and rollback documentation. |

## Package Contents

```text
00_README.md
01_REPO_TRUTH_AUDIT.md
02_FOLEON_DEVELOPER_DOCS_RESEARCH.md
03_CURRENT_MANAGER_GAP_ANALYSIS.md
04_LOAD_ERROR_ROOT_CAUSE.md
05_TARGET_MANAGER_UX_AND_WORKFLOW.md
06_HOMEPAGE_CONTENT_TAB_SPEC.md
07_CONFIG_TAB_SPEC.md
08_CENTRAL_CONFIG_REGISTRY_ANALYSIS.md
09_RECOMMENDED_DATA_MODEL.md
10_BACKEND_AND_AUTH_REMEDIATION_PLAN.md
11_SHAREPOINT_PROVISIONING_PLAN.md
12_SECURITY_GOVERNANCE_AND_PERMISSIONS.md
13_TESTING_VALIDATION_AND_PACKAGE_PROOF.md
14_TENANT_ROLLOUT_RUNBOOK.md
15_RISK_REGISTER_AND_DECISIONS.md
16_EXECUTION_WAVES.md
17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md
18_PROMPT_01_REGISTRY_READER_RUNTIME_CONFIG_BRIDGE.md
19_PROMPT_02_LOAD_ERROR_AND_CONFIG_READINESS.md
20_PROMPT_03_MANAGER_TWO_TAB_UI.md
21_PROMPT_04_CONTENT_WORKFLOW_AND_VALIDATION.md
22_PROMPT_05_FINAL_PACKAGE_PROOF_AND_TENANT_VALIDATION.md
23_PACKAGE_UPDATE_CHANGELOG.md
```

## First Prompt to Run

Run this first:

```text
17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md
```

Do not begin Foleon-specific Manager remediation until the registry provisioning script, validation script, and proof artifact are complete or an explicit blocker is documented.

## Key Design Position

- The registry is the authoritative non-secret configuration index.
- Azure Key Vault, Azure App Configuration, or backend-managed app settings remain the authority for secrets.
- SPFx property-pane fields remain only for bootstrap, route, page-local override, and emergency fallback values.
- The Manager Config tab becomes a registry-aware admin surface, not a separate configuration silo.

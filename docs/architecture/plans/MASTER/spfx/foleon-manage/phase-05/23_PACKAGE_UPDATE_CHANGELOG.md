# 23 — Package Update Changelog

## 2026-04-26 — Registry-First Reorder

This package was updated so the platform configuration registry is provisioned before Foleon-specific work begins.

## Major Changes

- Added `17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md` as the first execution prompt.
- Added `18_PROMPT_01_REGISTRY_READER_RUNTIME_CONFIG_BRIDGE.md` as the second execution prompt.
- Renumbered Foleon-specific prompts so load-error remediation begins only after registry provisioning and registry reader work.
- Updated `00_README.md` to identify registry provisioning as the first step.
- Updated `04_LOAD_ERROR_ROOT_CAUSE.md` to frame property-pane-only remediation as a temporary bridge.
- Updated `07_CONFIG_TAB_SPEC.md` so the Config tab is registry-aware.
- Updated `08_CENTRAL_CONFIG_REGISTRY_ANALYSIS.md` so the registry is a prerequisite implementation step.
- Updated `09_RECOMMENDED_DATA_MODEL.md` with the registry field model and seed records.
- Updated `10_BACKEND_AND_AUTH_REMEDIATION_PLAN.md` for registry-backed runtime config.
- Updated `11_SHAREPOINT_PROVISIONING_PLAN.md` so registry provisioning occurs first.
- Updated `13_TESTING_VALIDATION_AND_PACKAGE_PROOF.md`, `14_TENANT_ROLLOUT_RUNBOOK.md`, `15_RISK_REGISTER_AND_DECISIONS.md`, and `16_EXECUTION_WAVES.md` to match the new order.

## First Prompt to Execute

```text
17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md
```

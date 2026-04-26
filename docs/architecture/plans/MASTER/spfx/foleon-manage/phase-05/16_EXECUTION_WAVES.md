# 16 — Execution Waves

## Wave 00 — Provision HB Platform Configuration Registry

Goal:

- Provision `HB Platform Configuration Registry` in HBCentral.
- Use registered app ID `08c399eb-a394-4087-b859-659d493f8dc7`.
- Add schema, indexes, seed records, validation script, and proof artifact.

Prompt:

```text
17_PROMPT_00_PROVISION_PLATFORM_CONFIG_REGISTRY.md
```

## Wave 01 — Registry Reader / Runtime Config Bridge

Goal:

- Add a shared registry reader pattern.
- Resolve safe config values by application/environment/scope/key.
- Define runtime precedence.
- Preserve page override compatibility.

Prompt:

```text
18_PROMPT_01_REGISTRY_READER_RUNTIME_CONFIG_BRIDGE.md
```

## Wave 02 — Resolve Manager Load / Write-Readiness Error

Goal:

- Resolve the current Manager blocked state using registry-backed config.
- Add diagnostics for `apiBaseUrl`, `apiResource`, token provider, list GUIDs, and safe backend config.

Prompt:

```text
19_PROMPT_02_LOAD_ERROR_AND_CONFIG_READINESS.md
```

## Wave 03 — Manager Two-Tab UX Shell

Goal:

- Implement `Homepage Foleon Content` and `Config` tabs.
- Preserve existing Manager functionality.
- Make Config tab registry-aware.

Prompt:

```text
20_PROMPT_03_MANAGER_TWO_TAB_UI.md
```

## Wave 04 — Homepage Foleon Content Workflows

Goal:

- Add lane-specific content and placement workflow for Project Spotlight, Company Pulse, and Leadership Message.
- Add active edition validation, production URL validation, and preview/live/blocked readiness.

Prompt:

```text
21_PROMPT_04_CONTENT_WORKFLOW_AND_VALIDATION.md
```

## Wave 05 — Final Package Proof and Tenant Validation

Goal:

- Version bump if package source changed.
- Package proof.
- Tenant deployment runbook.
- Hosted validation.

Prompt:

```text
22_PROMPT_05_FINAL_PACKAGE_PROOF_AND_TENANT_VALIDATION.md
```

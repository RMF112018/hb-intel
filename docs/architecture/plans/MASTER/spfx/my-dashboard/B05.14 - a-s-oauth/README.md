# HB Intel / My Dashboard — Adobe Sign Embedded Modal Implementation Package

## Purpose

This package instructs a local code agent to implement an embedded Adobe Sign action experience inside the HB Intel / My Dashboard application.

The target user experience is:

```text
User clicks Act Now
→ HB Intel resolves the Adobe Sign action URL
→ HB Intel opens a borderless floating modal over the My Dashboard page
→ My Dashboard remains visible behind a translucent gray / blurred backdrop
→ User completes the Adobe Sign action inside the modal
→ HB Intel detects completion or fallback state
→ HB Intel refreshes the pending queue and recent completions
```

## Non-Negotiable Decisions

1. Implement a **hybrid embedded-first architecture**.
2. Do **not** replace Adobe signing with a custom signer UI.
3. Do **not** proxy Adobe signing-page content through HB Intel.
4. Do **not** remove the external Adobe launch fallback.
5. Place the embedded modal behind a feature flag until live Adobe tenant validation passes.
6. Treat Adobe `postMessage` events as immediate UX signals, not the sole source of truth.
7. Use webhook/polling refresh as the authoritative lifecycle hardening path.
8. Keep all changes repo-truth-driven. Do not re-read files still in the agent’s current context or memory.

## Package Contents

- `architecture/01_target_architecture.md`
- `architecture/02_contracts_and_state_machine.md`
- `architecture/03_ui_modal_spec.md`
- `architecture/04_security_csp_telemetry.md`
- `architecture/05_file_level_change_map.md`
- `implementation/01_implementation_plan.md`
- `implementation/02_validation_plan.md`
- `prompts/01_repo_truth_reverification.md`
- `prompts/02_backend_contract_and_resolver.md`
- `prompts/03_frontend_modal_foundation.md`
- `prompts/04_embedded_event_handling_and_refresh.md`
- `prompts/05_security_csp_telemetry_and_tests.md`
- `prompts/06_live_tenant_validation_and_closeout.md`
- `supporting/feature_flags_and_config.md`
- `supporting/acceptance_criteria.md`

## Recommended Execution Order

1. Run Prompt 01.
2. Run Prompt 02.
3. Run Prompt 03.
4. Run Prompt 04.
5. Run Prompt 05.
6. Run Prompt 06.

Do not skip Prompt 01. It forces current repo-truth verification before implementation.

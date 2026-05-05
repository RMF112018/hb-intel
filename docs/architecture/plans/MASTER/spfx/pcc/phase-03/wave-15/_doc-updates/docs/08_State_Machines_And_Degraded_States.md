# 08 — State Machines and Degraded States

State machines are locked in `artifacts/external_system_state_machines.json`.

Degraded/empty/unauthorized states are locked in `artifacts/external_system_degraded_state_matrix.json`.

Required UI behavior: do not render unsafe launch hrefs; redact unauthorized details; route mapping conflicts to review; block policy-prohibited links; avoid retry loops in SPFx.

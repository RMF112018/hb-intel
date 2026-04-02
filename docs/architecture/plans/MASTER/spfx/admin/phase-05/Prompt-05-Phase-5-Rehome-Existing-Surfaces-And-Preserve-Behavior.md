# Prompt-05 — Phase 5 Rehome Existing Surfaces and Preserve Behavior

## Objective

Rehome the current Admin surfaces into the new operator-console IA so existing working functionality sits in the right lanes and continues to operate.

This prompt is about **preservation-through-recomposition**.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Preserve healthy current behavior.
- Prefer wrapping, re-routing, or re-contextualizing over rewriting stable page logic.
- Do not regress provisioning oversight, dashboards, or access-control administration.

## Inputs

Use:
- the implemented route/lane model
- current pages:
  - `SystemSettingsPage`
  - `OperationalDashboardPage`
  - `ProvisioningOversightPage`
  - `ErrorLogPage`

## Required work

### A. Rehome current pages into the correct lanes
Make explicit decisions and implement them.

At minimum:
- `ProvisioningOversightPage` should live coherently under Runs / History.
- `OperationalDashboardPage` should live coherently under Health / Alerts.
- `ErrorLogPage` should live coherently under Error / Audit.
- `SystemSettingsPage` should be preserved under a coherent operator-console ownership slot.

### B. Preserve compatibility where needed
If old route paths should temporarily redirect or remain aliased, implement that intentionally.
Do not break working navigation casually.

### C. Preserve current permission-gated behavior
Make sure rehoming does not accidentally broaden or narrow access.

## Required decision quality

Document any important placement decision in the Phase 5 docs, especially if:
- access-control administration remains somewhat orthogonal to the main operator lanes,
- old routes remain as compatibility aliases,
- or a page is intentionally dual-linked during transition.

## Validation

Before finishing:
- verify each rehomed page still renders,
- verify provisioning oversight behavior is preserved,
- verify dashboard behavior is preserved,
- verify the Error Log deferred state remains clear and non-broken,
- verify permission checks still behave correctly after route changes.

## Completion condition

Stop when the existing surfaces are cleanly rehomed and behavior-preserving.
Do not yet address cross-app handoff or inbound selection logic here unless rehoming makes a minimal fix unavoidable.

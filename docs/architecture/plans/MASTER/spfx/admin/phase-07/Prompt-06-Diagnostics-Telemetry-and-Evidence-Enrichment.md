# Prompt-06 — Diagnostics, Telemetry, and Evidence Enrichment

## Objective

Improve provisioning diagnostics and evidence so operators can understand what happened without waiting for full later-phase observability completion.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Keep this provisioning-focused.
- Use existing logging/telemetry patterns where possible.
- Do not pretend Phase 12 is complete.

## Inputs

Use:
- touched provisioning saga/backend files
- `backend/functions/README.md`
- any current logger/telemetry helpers
- `packages/features/admin/README.md`
- any current SignalR/progress or admin alert integration directly related to provisioning

## Scope of work

Enhance provisioning diagnostics in a way that materially helps:
- function/runtime troubleshooting,
- run evidence reconstruction,
- operator status/history visibility,
- and failure investigation.

Potential work may include:
- structured event naming cleanup,
- correlation consistency,
- richer step metadata,
- clearer failure payloads,
- targeted telemetry hooks,
- and durable evidence fields useful to the UI.

## Required implementation outcomes

1. Provisioning run evidence is richer and more consistent.
2. Correlation IDs remain visible and trustworthy end-to-end.
3. Failure context is easier to inspect without scraping raw logs.
4. The implementation is compatible with Azure Functions/Application Insights monitoring posture.
5. The work remains scoped to provisioning diagnostics, not total platform observability completion.

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/provisioning-diagnostics-and-evidence-guide.md`

Document:
- available evidence,
- correlation rules,
- event/log expectations,
- and how operators/developers should use the enriched telemetry.

## Validation

Add/update targeted tests if telemetry helpers are testable.
Otherwise validate through the smallest credible code-path and payload checks.
Also update any local backend README guidance if Phase 7 materially changes provisioning evidence expectations.

## Completion condition

Stop after diagnostics/evidence hardening and related docs are complete.
Do not yet touch the install/bootstrap integration layer in this prompt.

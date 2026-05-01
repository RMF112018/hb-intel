# Standards and Best Practices

## Construction Operations

- Use lifecycle gate thinking rather than static checklist thinking.
- Distinguish startup, mobilization, active construction safety controls, pre-CO readiness, turnover readiness, financial closeout, and warranty/lessons learned.
- Track owners, due dates, blockers, dependencies, exceptions, evidence, and reviewer posture.
- Surface critical blockers above raw completion percentage.
- Keep closeout visible from day one.

## Safety Readiness

- Support hazard category, severity, likelihood, corrective-action posture, recurrence, and failed-state signals.
- Do not assert OSHA compliance.
- Do not implement incident management or Safety app runtime.

## Closeout Readiness

- Surface substantial completion, completion/correction lists, CO/TCO, inspections, warranties, O&M manuals, as-builts, lien releases, final payment, attic stock, owner turnover, and lessons learned as readiness posture.
- Show closeout exposures during active construction before they become late-stage blockers.

## Information Governance

- Preserve source traceability and authoritative records.
- Use metadata-like normalized fields for search/filter/reporting.
- Keep evidence references linked to governed document sources.
- Do not force raw SharePoint edit mode into the user experience.

## SPFx / UI

- Use existing `apps/project-control-center` shell/router/bento/card patterns.
- Keep fixture mode as default.
- Use role/persona labels as display/read-model posture, not authoritative auth.
- Provide empty/loading/error/missing-config/source-unavailable/unauthorized/degraded states as relevant.

## Backend

- Routes must be GET-only.
- Provider must be deterministic and mock/local only.
- No live Graph/PnP/SharePoint REST/Procore/Sage/Outlook calls.
- No writes, persistence, workflow execution, approval execution, or tenant mutation.

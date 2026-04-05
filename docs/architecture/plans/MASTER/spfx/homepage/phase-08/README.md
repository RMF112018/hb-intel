# Phase 08 Prompt Package — Accessibility, QA, and Production Readiness

## Objective

Execute the next phase of the SharePoint homepage ecosystem program after Phase 07 closure by hardening the completed Lane A and Lane B products through a formal accessibility, QA, and production-readiness phase.

This package is informed by the executed Phase 07 completion artifacts, especially:
- packaging truth and entrypoint inventory
- bundle governance and budget baselines
- release checklist and runtime-integrity guidance
- the explicit Phase 08 deferral list from the Phase 07 closeout

## Why Phase 08 is next

Phase 07 closed packaging and performance hardening. The remaining next-step work explicitly deferred at Phase 07 close is:
- full accessibility audit
- broader QA suite
- cross-browser and device verification
- screen-reader testing
- contrast validation
- focus-order audit

That makes Phase 08 the correct next package.

## Package contents

- `Phase-08-Implementation-Summary.md`
- `Phase-08-01-Accessibility-and-Interaction-QA.md`
- `Phase-08-02-Production-Readiness-and-Rollout-Playbook.md`
- `Phase-08-Risk-Exposure.md`
- `Phase-08-Standards-and-Best-Practices.md`

## Execution order

1. Run Prompt 01 first to establish the accessibility and interaction QA baseline for both lanes.
2. Run Prompt 02 second to convert those findings into a production-readiness and rollout package.

## Scope

### In scope
- Lane A (`apps/hb-webparts`) accessibility audit and QA
- Lane B (`apps/hb-shell-extension`) accessibility audit and QA
- keyboard and focus behavior
- contrast and readability validation
- screen-reader behavior expectations
- responsive and cross-browser verification planning
- release-readiness evidence and rollout playbook updates

### Out of scope
- new homepage features
- new shell-extension features
- homepage property-pane implementation
- homepage async data integration
- workflow automation
- navigation-governance changes unless required by audit findings
- changes that weaken the established Lane A, Lane B, or Lane C boundaries

## Hard gates

- Do not reopen product-boundary decisions already locked in Phases 01–07 unless a verified accessibility or QA defect requires it.
- Do not add new visual features under the guise of QA.
- Do not introduce unsupported SharePoint DOM manipulation or shell takeover behavior.
- Keep import discipline, bundle budgets, and runtime contracts intact.

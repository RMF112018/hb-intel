# Fresh Reviewer Prompt — Wave 10 Permit & Inspection Control Center Documentation

You are acting as a fresh reviewer for the `hb-intel` repository.

Your task is to validate whether the Wave 10 documentation update correctly defines the Permit & Inspection Control Center target architecture.

## Review Scope

Review the latest repo truth for:

- Wave 10 naming
- governing roadmap/blueprint docs
- Wave 10 target architecture file
- Wave 10 scope lock / decision register
- workbook mapping appendix
- documentation closeout
- actual workbook source files

## Required Validation Questions

1. Does Wave 10 consistently define the user-facing surface as `Permit & Inspection Control Center`?
2. Is prior `Permit Log` naming preserved only as legacy/subcomponent context?
3. Are permits and required inspections both first-class?
4. Are required fields included?
   - `revision`
   - `applicationValue`
   - `permitFee`
   - `reInspectionFee`
5. Does the architecture remain AHJ launcher-only?
6. Does it avoid Procore runtime/source-of-truth assumptions?
7. Does it define source-of-record posture?
8. Does it define permit and inspection status models?
9. Does it define status transition rules?
10. Does it define failed inspection / correction / reinspection workflow?
11. Does it define evidence-backed closeout?
12. Does it define role/action authority?
13. Does it define Priority Actions integration?
14. Does it define Project Readiness integration?
15. Does it define Approvals / Checkpoints integration?
16. Does it define HB Document Control Center evidence posture?
17. Does it preserve workbook source traceability?
18. Does it avoid runtime implementation claims?
19. Does it avoid edits to `docs/architecture/plans/**` unless explicitly authorized?
20. Did validation preserve `pnpm-lock.yaml`?

## Pass / Fail Criteria

Pass only if:

- target architecture is complete and non-contradictory
- workbook mapping is source-traceable
- external-service guardrails are explicit
- no runtime implementation is implied
- validation evidence is included
- docs are aligned across governing files

Fail if:

- Wave 10 still reads as only a simple Permit Log
- inspections are secondary or missing
- fields required by the user are missing
- AHJ integration is implied beyond launcher links
- Procore is treated as source of truth
- evidence-free closeout is allowed without override
- failed inspection/reinspection workflow is missing
- workbook traceability is missing
- repo governance is violated

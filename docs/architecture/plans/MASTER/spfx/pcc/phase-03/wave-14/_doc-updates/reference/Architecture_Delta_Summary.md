# Architecture Delta Summary — What This Package Adds

## Purpose

This file summarizes the architectural improvements that should be added to the existing Phase 14 documentation.

## Critical Additions

1. Read-model / command-model separation.
2. SharePoint queue index strategy.
3. Permission/redaction strategy rejecting item-level unique permissions by default.
4. Step-level routing model.
5. Reviewer vs approver distinction.
6. Current action owner / ball-in-court model.
7. Source module callback/event contract.
8. Stale/supersession rules.
9. Evidence requirements by checkpoint family.
10. Decision reason code catalog.
11. Priority Actions deduplication rules.
12. Detailed UX behavior and accessibility gates.
13. Progressive-friction decision panel.
14. HBI citation-only/no-authority guardrails.
15. Dependency posture and validation strategy.
16. Wireframes for all major screen groups.

## Benefit to Developers

These additions remove implementation ambiguity around:

- who can decide;
- what state transitions are legal;
- what evidence is required;
- how source modules are notified;
- how queue rows are filtered and indexed;
- how redaction works;
- how HBI is constrained;
- how to test the module;
- how Wave 13G estimating checkpoints integrate.

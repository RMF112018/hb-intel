# 06 — Prompt 03: Add Target Architecture File

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. You have Prompt 01 audit and Prompt 02 governing-doc updates in context.

## Objective

Add a complete target architecture file for Wave 9.

## Target File

Recommended path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

If the repo uses a different Wave 9 folder naming convention, follow repo truth and document the selected path.

## Source Content

Use the package file:

```text
01_Target_Architecture_Project_Lifecycle_Readiness_Center.md
```

Adapt only as necessary to align with current repo truth. Do not weaken the core architecture or anti-pattern guardrails.

## Required Sections

The target architecture file must include, at minimum:

1. Document Purpose.
2. Module Name and Rationale.
3. Governing Context and Wave 8 dependency.
4. Source Checklist Inputs.
5. Product Thesis.
6. Scope Model.
7. Module Boundary Decisions.
8. Lifecycle Phase Model.
9. Readiness Domain Model.
10. Item Type Model.
11. Criticality Model.
12. Template vs Project Instance Model.
13. Status Model.
14. Exception Model.
15. Evidence and Document Link Model.
16. Role / Action Authority Model.
17. Readiness Scoring Model.
18. Priority Actions Integration.
19. Approvals / Checkpoints Integration.
20. Safety Readiness Model.
21. Closeout-From-Day-One Model.
22. External-System Posture.
23. UX Architecture.
24. Read-Model Target Architecture.
25. Fixture and Mock Provider Requirements.
26. Source Traceability Contract.
27. Audit Model.
28. Export / Reporting Target.
29. Documentation Updates Required.
30. Acceptance Criteria.
31. Open Decisions.

## Required Guardrails

The file must explicitly prohibit:

- giant checklist as primary UX;
- simple three-tab checklist IA;
- PDF replacement;
- Procore clone;
- external runtime integration in this documentation update;
- tenant mutation;
- write routes;
- lockfile/package changes.

## Validation

Run:

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

If the target path differs, adjust the Prettier command accordingly.

Do not commit yet unless the user/local workflow explicitly says to commit after each prompt.

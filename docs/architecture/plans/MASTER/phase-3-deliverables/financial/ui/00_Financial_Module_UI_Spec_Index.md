# Financial Module UI Spec Index

## Purpose

This package defines the proposed UI specification for each unique page in the HB Intel Financial module.

These specs are grounded in:
- current repo truth and present-state implementation status,
- the Financial Module UI Design Brief,
- the Financial Source-of-Truth Lock,
- the Financial Replacement Crosswalk,
- the Project Hub wireframe family,
- the `@hbc/ui-kit` governing doctrine and page-layout contracts,
- the attached construction-tech and Procore UI / UX studies,
- and the `ux-mold-breaker.md` strategy document.

## Governing References

### Repo-truth / architecture
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial plan family
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRC-00-Financial-Replacement-Crosswalk.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRC-03-Implementation-Implications.md`

### Project Hub wireframe guidance
- `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/02_Project_Hub_Canvas_First_Operating_Layer_Wireframe_Spec.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/03_Project_Hub_Control_Center_Command_Rail_Wireframe_Spec.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/05_Project_Hub_Health_Risk_Executive_Cockpit_Wireframe_Spec.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/07_Project_Hub_Field_Tablet_Split_Pane_Hub_Wireframe_Spec.md`

### UI-kit governance
- `docs/reference/ui-kit/WorkspacePageShell.md`
- `docs/reference/ui-kit/DashboardLayout.md`
- `docs/reference/ui-kit/ListLayout.md`
- `docs/reference/ui-kit/HbcCommandBar.md`
- `docs/reference/ui-kit/HbcDataTable.md`
- `docs/reference/ui-kit/HbcApprovalStepper.md`
- `docs/reference/ui-kit/complexity-sensitivity.md`
- `docs/reference/ui-kit/accessibility-patterns.md`

## Page Set

1. Financial Control Center
2. Forecast Summary
3. Budget
4. GC/GR
5. Cash Flow
6. Buyout
7. Checklist & Review
8. Period History / Versions

## Operating Design Principles

- The Financial module is a **financial control center**, not a passive dashboard.
- The root surface must make **custody, period state, freshness, and next actions** obvious.
- Deep pages must behave like **real working surfaces**, not read-only summary tabs.
- Imported authoritative values and internal working-state layers must remain visually distinguishable.
- Approved / confirmed periods must feel materially different from working periods.
- Review and approval must be explicit, auditable, and role-shaped.
- Layouts must use `WorkspacePageShell` and governed `@hbc/ui-kit` patterns unless a Financial-specific reason requires a custom composition.
- The UX should be **mold-breaking** in clarity and actionability, but must remain implementation-honest and consistent with repo truth.

## Recommended Build Order

1. Financial Control Center
2. Forecast Summary
3. Checklist & Review
4. Period History / Versions
5. Budget
6. GC/GR
7. Cash Flow
8. Buyout

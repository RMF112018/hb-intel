# Prompt-02 — SharePoint Control Baseline and Managed-Asset Boundary

## Objective

Create the canonical Phase 8 architecture baseline for the SharePoint control lane and freeze the **HB Intel-managed asset boundary** so later implementation does not drift into broad tenant-wide SharePoint governance.

## Important execution rules

- Use the Phase 8 repo-truth audit as the immediate evidence base.
- Do not invent broad tenant control beyond the end-state plan.
- Keep privileged execution in backend/control-plane logic.
- Keep this baseline explicit enough to govern later prompts.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-repo-truth-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- the end-state plan concepts already reflected in the repo docs

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-sharepoint-control-baseline.md`

## Required sections

1. Purpose
2. Why Phase 8 exists
3. HB Intel-managed SharePoint asset boundary
4. Active vs advisory SharePoint control boundary
5. SPFx responsibilities in Phase 8
6. Backend/control-plane responsibilities in Phase 8
7. Adapter responsibilities in Phase 8
8. Standards comparison / preview / repair boundary
9. Explicit no-go patterns
10. Cross-links to follow-on Phase 8 artifacts

## Required substance

The baseline must define, in concrete repo-facing language, which assets count as in-scope first-wave active control, such as:
- HB Intel-managed sites
- platform-related site standards
- app catalog / package posture related to HB Intel rollout
- API access posture related to HB Intel rollout
- platform dependency validation related to SharePoint rollout health

It must also explicitly state what is **not** in first-wave active scope.

## Required no-go statements

Include clear no-go statements such as:
- no broad tenant-wide SharePoint active governance in Phase 8,
- no privileged SharePoint repair logic in SPFx,
- no silent repair without preview / dry-run where practical,
- no standards mutation model that conflicts with later config-governance phases,
- no treating all SharePoint assets in the tenant as implicitly in-scope.

## Validation

Before finishing:
- verify the baseline matches the audit doc,
- verify the boundary is explicit enough to govern implementation,
- verify it does not overclaim current repo maturity.

## Completion condition

Stop after the baseline is complete.
Do not create contracts or code in this prompt.

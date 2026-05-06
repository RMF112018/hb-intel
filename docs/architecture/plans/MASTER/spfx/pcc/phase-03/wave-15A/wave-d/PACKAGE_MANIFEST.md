# PACKAGE_MANIFEST — PCC Phase 3 Wave 15A / Wave D Grid, Bento, Card Hierarchy, and Layout Primitives

## Package Identity

- Package name: `wave-D-grid-card-layout-remediation`
- Recommended repo path: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Package type: local-code-agent remediation prompt package
- Runtime scope: `apps/project-control-center/`
- Documentation scope: Wave 15A planning/closeout paths and governing UI doctrine paths
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`

## Objective

Guide a local code agent through Wave D remediation: verify current repo truth, harden shared layout/card primitives where required, formalize Tier 1 / Tier 2 / Tier 3 card hierarchy, apply allowed layout patterns to all current PCC routed surfaces, and produce test/screenshot/closeout evidence.

## Required Execution Order

1. `prompts/Prompt_01_Grid_Card_Layout_Scope_Lock_And_File_Map.md`
2. `prompts/Prompt_02_Card_Tier_Component_And_Visual_Hierarchy_Primitives.md`
3. `prompts/Prompt_03_Bento_Grid_Span_Responsive_And_Host_Fit_Primitives.md`
4. `prompts/Prompt_04_Apply_Layout_Patterns_To_All_Current_PCC_Surfaces.md`
5. `prompts/Prompt_05_Layout_Tests_Responsive_Smoke_And_Screenshot_Evidence.md`
6. `prompts/Prompt_06_Wave_D_Closeout_Evidence_And_Handoff.md`

## Files Included

### Root

- `PACKAGE_MANIFEST.md`
- `README.md`

### Docs

- `docs/00_WAVE_D_REPO_TRUTH_AUDIT_FINDINGS.md`
- `docs/01_GRID_CARD_DOCTRINE_MATRIX.md`
- `docs/02_CURRENT_LAYOUT_PRIMITIVES_INVENTORY.md`
- `docs/03_SURFACE_LAYOUT_USAGE_INVENTORY.md`
- `docs/04_TARGET_CARD_TIER_AND_LAYOUT_PATTERN_CONTRACT.md`
- `docs/05_IMPLEMENTATION_REQUIREMENTS.md`
- `docs/06_RESPONSIVE_AND_HOST_FIT_VALIDATION_PLAN.md`
- `docs/07_TEST_AND_SCREENSHOT_EVIDENCE_PLAN.md`
- `docs/08_RISK_DECISION_AND_DEFERMENT_LOG.md`

### Prompts

- `prompts/Prompt_01_Grid_Card_Layout_Scope_Lock_And_File_Map.md`
- `prompts/Prompt_02_Card_Tier_Component_And_Visual_Hierarchy_Primitives.md`
- `prompts/Prompt_03_Bento_Grid_Span_Responsive_And_Host_Fit_Primitives.md`
- `prompts/Prompt_04_Apply_Layout_Patterns_To_All_Current_PCC_Surfaces.md`
- `prompts/Prompt_05_Layout_Tests_Responsive_Smoke_And_Screenshot_Evidence.md`
- `prompts/Prompt_06_Wave_D_Closeout_Evidence_And_Handoff.md`

### Artifact Templates

- `artifacts/scorecard-impact-template.md`
- `artifacts/screenshot-evidence-index-template.md`
- `artifacts/wave-agent-closeout-template.md`
- `artifacts/source-file-map-template.md`

## Source Authority

## Repo-Truth Baseline

- Repository: `RMF112018/hb-intel`
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app root: `apps/project-control-center/`
- Recommended package placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Runtime implementation is **not** included in this package. This package is for a local code agent to execute in the repo.

## Non-Negotiables for the Local Agent

- Inspect repo truth before editing.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Preserve active routed-surface semantics: exactly one `[data-pcc-active-surface-panel]` per active route.
- Preserve the bento direct-child invariant unless a shared layout primitive explicitly replaces it.
- Prefer shared primitives and named contracts over one-off surface CSS.
- Do not introduce backend/API, Graph, PnP, Procore SDK, Document Crunch, Adobe Sign, CI, package-manager, or app-catalog scope.
- Do not claim final `56/56` readiness. Wave D can move layout/card/responsive/visual hierarchy categories, but final readiness requires Wave H-style tenant-hosted, screenshot, accessibility, keyboard, and regression evidence.

## Completion Standard

Wave D is complete only when:

- shared primitives have an explicit tier/region contract or a recorded no-change proof;
- all current routed surfaces have adopted command/operational/reference layout patterns;
- Team & Access has no verified narrow-column/dead-canvas failure in desktop, constrained SharePoint, tablet, and narrow-container evidence;
- focused tests and full app tests pass;
- screenshot evidence index exists and ties captures to routes, breakpoints, and acceptance criteria;
- closeout records exact files changed, validation commands, lockfile posture, residual issues, and scorecard impact.

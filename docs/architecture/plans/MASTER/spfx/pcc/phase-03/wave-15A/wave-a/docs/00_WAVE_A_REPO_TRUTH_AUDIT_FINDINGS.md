# 00 — Wave A Repo-Truth Audit Findings

## Objective

Establish the current repo-truth baseline for PCC Phase 3 Wave 15A / Wave A. This file is the starting point for the local code agent and must be updated by Prompt 01 with exact local repo command evidence.

## Uploaded Prompt Authority

The controlling uploaded prompt is:

```text
Fresh_Session_Prompt_Wave15A_WaveA_Baseline_Doctrine_Audit(3).md
```

Its stated purpose is to perform an exhaustive repo-truth audit and generate a comprehensive remediation prompt package for Wave 15A, beginning with Wave A and carrying forward remediation through shared systems, surfaces, validation, and closeout.

## Confirmed Repo-Truth Findings

### Wave 15A Placement

Initial repository search did not locate committed files under a Wave 15A path by name.

Required canonical blueprint path to create or validate:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

Recommended execution package path:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/remediation-prompt-package/
```

### PCC Source Existence

The PCC source exists under:

```text
apps/project-control-center/
```

Key shared primitives and surfaces were found in repo search results, including:

- shell/router files,
- bento/grid/card primitives,
- preview/state mapping,
- Project Home,
- Team & Access,
- Documents,
- Project Readiness,
- Approvals,
- External Systems,
- Control Center Settings,
- Site Health-related components,
- surface and footprint tests.

### Doctrine Authority

The doctrine and supporting standards exist under:

```text
docs/reference/ui-kit/
docs/reference/spfx-surfaces/
```

This package treats those files as governing acceptance criteria, not design inspiration.

## Files / Areas Inspected During Package Preparation

- `Fresh_Session_Prompt_Wave15A_WaveA_Baseline_Doctrine_Audit(3).md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
- `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.module.css`
- `apps/project-control-center/src/layout/useBentoRowSpan.ts`
- `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css`
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/teamAccessAdapter.ts`
- `apps/project-control-center/src/surfaces/teamAccess/teamAccessViewModel.ts`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessRequestForm.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessRequestQueue.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessExecutionQueue.tsx`
- `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx`
- `apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts`
- `apps/project-control-center/src/surfaces/documents/useDocumentControlReadModel.ts`
- `apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx`
- `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx`
- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthProcoreSyncRepairCard.tsx`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`
- `apps/project-control-center/src/tests/PccProjectHome.states.test.tsx`
- `apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx`
- `apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`
- `apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx`
- `apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx`
- `apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_implementation/docs/01_REPO_TRUTH_AUDIT_SUMMARY.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_implementation/docs/05_SPFX_UX_IMPLEMENTATION_BLUEPRINT.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/_implementation/reference/01_REQUIRED_REPO_TRUTH_FILES.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/docs/01_REPO_TRUTH_AUDIT_FINDINGS_BASELINE.md`

## Confirmed Evidence Gaps

- No Wave 15A committed path was found by name during the audit pass.
- No Wave 15A screenshot evidence path was found by search.
- No PCC-specific `axe`/keyboard evidence was confirmed by search.
- Tenant-hosted evidence exists as a required planning concept in PCC roadmap/phase docs, but no Wave 15A final validation evidence package was confirmed.
- Existing tests prove meaningful coverage exists, but they do not by themselves prove visual doctrine compliance or a 56/56 score.

## Known Issues to Address

1. **PCC shell visually dominates operational content.** Must be verified with screenshots; high-priority shell/host-fit issue for Wave B.
2. **Project context is inconsistent across surfaces.** Requires shared project context/header standard in Wave C.
3. **Navigation is module-based rather than workflow/status-aware.** Requires navigation IA contract in Wave B.
4. **Card hierarchy is too flat.** Requires card primitive and surface hierarchy remediation in Wave D.
5. **Grid/layout behavior allows unusable or narrow-column composition.** Requires footprint contract and bento/card constraints in Wave D.
6. **Team & Access appears to have severe layout collapse in browser evidence.** Requires before screenshot capture and Wave F remediation.
7. **Preview/read-only/no-live-data language is too developer-facing.** Requires state model/product language standard in Wave E.
8. **Generic unavailable states dominate some surfaces.** Requires preview-safe meaningful content states in Wave E and surface waves.
9. **Disabled controls are not consistently explained.** Requires disabled-control reason/next-step pattern in Wave E.
10. **Documents needs clearer formal Project Record versus working-file distinction.** Requires Wave F Documents remediation.
11. **Project Readiness needs stronger blocker/readiness hierarchy.** Requires Wave F Project Readiness remediation.
12. **Site Health needs stronger security/repair hierarchy.** Requires Wave G Site Health remediation.
13. **Approvals needs preview-safe queue content rather than unavailable placeholders.** Requires Wave G Approvals remediation.
14. **External Systems needs system-specific workflow value and mapping status.** Requires Wave G External Systems remediation.
15. **Control Center Settings needs clearer governance ownership and locked/editable/preview distinctions.** Requires Wave G Settings remediation.
16. **Tenant-hosted SharePoint validation is required before 56/56 closeout.** Requires Wave H tenant evidence gate.
17. **Accessibility and keyboard validation cannot be deferred if claiming 56/56.** Requires Wave H and must be regression-guarded in each implementation wave.

## Prompt 01 Duties

Prompt 01 must convert this package from planning artifact to repo-truth-backed local package by:

1. Running local file-system inspection.
2. Capturing exact file existence and command evidence.
3. Placing or validating Wave 15A guide docs.
4. Creating the baseline evidence folders.
5. Filling in the current score only where evidence supports it.
6. Preparing for Prompt 02 without runtime UI changes.

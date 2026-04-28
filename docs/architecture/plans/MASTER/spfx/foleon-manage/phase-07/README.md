# HB Intel Foleon Manager — World-Class Manager Rebuild Package

## Objective

Redesign the `HB Intel Foleon Manager` from a technically functional SPFx admin surface into a flagship-grade content operations console for HB Central.

The Manager must remain a placement and readiness control plane. It must not become a Foleon authoring replacement.

## Product Model

- **Foleon:** source authoring platform used by Marketing.
- **HB Intel Foleon Manager:** HB Central placement, readiness, sync, and validation control plane.
- **HB Central Foleon Readers:** employee-facing presentation surfaces for Project Spotlight, Company Pulse, and Leadership Message.

## Target Acceptance

- Target score: **53 / 56**.
- Minimum category score: **3**.
- No hard-stop failures.
- No generic enterprise-card outcome.
- No developer-first primary journey.
- Hosted proof and package proof required before closure.

## Required Work Product

This package contains:

1. Repo-truth audit.
2. Subject-matter research summary.
3. Current-state scorecard.
4. Gap register.
5. Product definition and user journeys.
6. Information architecture.
7. Wireframes and screen states.
8. State model.
9. Breakpoint contract.
10. Technical architecture plan.
11. Implementation plan.
12. Test and validation plan.
13. Package and hosted proof plan.
14. Final acceptance target.
15. Five implementation-ready prompts for the local code agent.

## Files Inspected / Required for Implementation

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/pages/manage/useManageBreakpoint.ts`
- `apps/hb-intel-foleon/src/services/FoleonManagementApi.ts`
- `apps/hb-intel-foleon/src/types/foleon-management.types.ts`
- `apps/hb-intel-foleon/config/package-solution.json`
- `backend/functions/src/functions/adminApi/foleon-routes.ts`
- `backend/functions/src/services/foleon-service.ts`
- `backend/functions/src/config/foleon-list-definitions.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `tools/spfx-shell/src/webparts/shell/**`
- `tools/spfx-shell/config/package-solution.json`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/ui-kit/doctrine/**`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/**`

## Implementation Sequencing

Use the prompt package in order:

1. `prompts/01_build_content_operations_shell.md`
2. `prompts/02_build_content_inbox_and_lane_board.md`
3. `prompts/03_build_placement_workflow_and_preview.md`
4. `prompts/04_rebuild_admin_config_and_diagnostics.md`
5. `prompts/05_breakpoints_accessibility_tests_and_package_proof.md`

Do not skip hosted validation. The current problem is not only source design; it is the packaged, SharePoint-hosted result.

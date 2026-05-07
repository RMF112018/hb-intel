# Project Readiness Command Surface Remediation Package

## Objective

Remediate the Project Readiness surface so it behaves like a command-first, decision-grade PCC surface instead of a default-expanded 62-card module anthology.

The first screen must communicate what matters now: readiness posture, blockers, lifecycle/domain status, ownership exposure, evidence/source health, Priority Actions eligibility, and intentional drill-down paths into related modules.

## Closed decisions

All open implementation decisions are closed in this package:

1. **Default state:** Project Readiness opens to a command overview.
2. **Detail navigation pattern:** Use local segmented/module-index view-selection controls, not route changes and not accordions containing cards.
3. **Detail rendering behavior:** Selecting a module replaces the default command card set with a compact context header/module index plus only the selected module’s detail cards.
4. **DOM behavior:** Non-selected embedded module cards must be absent from the DOM, not merely visually hidden.
5. **Direct-child invariant:** Every rendered `PccDashboardCard` must remain a direct child of `[data-pcc-bento-grid]`.
6. **No card nesting:** Never render a `PccDashboardCard` inside another `PccDashboardCard`.
7. **Controls:** Enabled controls are permitted only for local view selection and must be marked clearly as drill-down controls. Workflow-like action labels remain prohibited.
8. **Read-model hooks:** Existing read-model hooks must remain unconditional in the read-model path. Do not call hooks conditionally based on selected detail section.
9. **Unified Lifecycle:** Refactor it only as needed so the hook/state can be resolved without rendering its cards by default.
10. **Shared primitives:** Do not change `PccBentoGrid`, `PccDashboardCard`, or `footprints.ts` unless a failing validation proves it is absolutely required. This remediation is composition-first.
11. **Package/manifest/lockfile:** Do not change SPFx package metadata, manifests, `package.json`, or `pnpm-lock.yaml`.
12. **Internal module compression:** Do not redesign the internals of Permit/Inspection, Responsibility Matrix, Constraints, or Buyout in this first remediation. Their detail views may still be dense; the current scope is to remove them from default view.
13. **Evidence closeout:** Playwright evidence supports expert scoring but does not itself mark the scorecard complete or Phase 4 ready.

## Package contents

```text
README.md
00_REPO_TRUTH_SUMMARY.md
01_OPEN_DECISIONS_CLOSED.md
02_IMPLEMENTATION_PLAN.md
03_ACCEPTANCE_CRITERIA.md
04_VALIDATION_AND_EVIDENCE_CLOSEOUT.md
wireframes/PROJECT_READINESS_COMMAND_SURFACE_WIREFRAME.md
wireframes/PROJECT_READINESS_DETAIL_SECTION_WIREFRAME.md
checklists/LOCAL_AGENT_EXECUTION_CHECKLIST.md
checklists/POST_IMPLEMENTATION_REVIEW_CHECKLIST.md
prompts/Prompt_01_Command_Surface_Skeleton_And_Density_Contract.md
prompts/Prompt_02_Detail_Section_Renderer_And_Selected_Module_Tests.md
prompts/Prompt_03_Read_Model_Parity_And_Unified_Lifecycle_Refactor.md
prompts/Prompt_04_State_Density_And_False_Affordance_Hardening.md
prompts/Prompt_05_Card_Tier_Contract_And_Evidence_Closeout.md
```

## Recommended execution order

Run prompts in order. Do not skip ahead unless the prior prompt has been committed and its validation has passed.

1. Prompt 01 creates the command/detail skeleton, module index, and default density contract.
2. Prompt 02 wires selected module rendering and updates selected-section test coverage.
3. Prompt 03 preserves read-model parity and refactors Unified Lifecycle rendering safely.
4. Prompt 04 hardens loading/error/degraded states and false-affordance rules.
5. Prompt 05 updates card-tier assertions and reruns evidence/closeout.

## Expected outcome

After completion:

- Default Project Readiness DOM card count should drop from 62 to no more than 12.
- Embedded detail modules remain accessible through local view selection.
- Non-selected module cards are absent from the DOM.
- Every rendered card remains a direct bento child.
- Project Readiness no longer creates the 56k px phone-height / 26k px standard-laptop-height card wall seen in the current live evidence.
- No workflow execution, writeback, sync, upload, approval, or external launch behavior is introduced.

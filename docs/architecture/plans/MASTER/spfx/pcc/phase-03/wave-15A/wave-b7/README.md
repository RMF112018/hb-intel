# PCC Phase 2 Prompt Package — Consolidate Surface Headers into the Shell Header

**Package objective:** Implement Phase 2 of the PCC Basis of Design remediation by moving active surface panel ownership into the shell tabpanel and establishing the shell/header metadata seam required for later duplicate header-card removal.

**Repo:** `RMF112018/hb-intel`  
**Primary app:** `apps/project-control-center`  
**Phase:** Phase 2 — Consolidate Surface Headers into the Shell Header  
**Execution model:** Local code agent executes prompts sequentially. ChatGPT fresh-session auditor reviews each plan and following-execution report.

---

## 1. Non-Negotiable Scope

Phase 2 is a shell/header foundation phase. It must not become the duplicate-card removal phase, module launcher phase, visual redesign phase, or Project Home composition phase.

### In scope

- Confirm current repo truth before editing.
- Move active surface panel ownership to shell `main[role="tabpanel"]`.
- Keep existing tablist / tab / tabpanel ARIA contract intact.
- Update tests so active panel ownership no longer depends on a bento card.
- Preserve bento direct-child invariants.
- Add or extend a typed shell/header metadata seam for all eight MVP surfaces.
- Preserve card-level `dataActiveSurfacePanel` only as a deprecated compatibility bridge unless safely removed by a later prompt.
- Confirm Playwright selector posture and optionally add shell-owner checks without breaking existing evidence harness.
- Produce a handoff inventory for the later duplicate header-card removal phase.

### Out of scope

- Removing `Project Intelligence` or top-level surface header cards.
- Implementing the Modules launcher.
- Implementing active module state.
- Reworking Project Home card order/spans.
- Introducing URL routing.
- Introducing live writeback, Graph, SharePoint mutation, Procore mutation, Sage mutation, Autodesk mutation, or tenant reads/writes.
- Changing package dependencies or lockfile.
- Changing SPFx manifests or packaging files unless repo truth proves an unavoidable reason.

---

## 2. Governing References

The local agent must use repo truth, not memory. Relevant governing files:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

Key source files:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

---

## 3. Closed Phase 2 Decisions

| ID | Decision | Direction |
|---|---|---|
| D-01 | Shell structure | Keep `PccShell → PccProjectHeroBand → PccHorizontalTabs → main[role="tabpanel"] → PccBentoGrid`. |
| D-02 | Active panel marker owner | Move ownership to shell `main[role="tabpanel"]`. |
| D-03 | Card marker bridge | Treat `dataActiveSurfacePanel` on cards as deprecated compatibility only. |
| D-04 | Duplicate header cards | Do not remove in Phase 2. Inventory only. |
| D-05 | Module launcher | Do not implement in Phase 2. |
| D-06 | Header metadata | Add typed metadata seam for surface header summaries/cues. |
| D-07 | Direct-child invariant | Do not introduce wrappers between `PccBentoGrid` and `PccDashboardCard`. |
| D-08 | Tests | Update tests to prove shell ownership, tab ARIA linkage, no direct-child regression, and no reliance on card ownership. |
| D-09 | Package/manifest/lockfile | No dependency, lockfile, or manifest/package changes unless repo truth proves unavoidable. |
| D-10 | Evidence | Playwright may be updated to improve evidence, but component tests carry primary Phase 2 proof. |

---

## 4. Prompt Execution Order

Execute prompts in order.

1. `prompts/Prompt_00_Mandatory_Pre_Edit_Repo_Truth_Gate.md`
2. `prompts/Prompt_01_Active_Surface_Panel_Ownership_Move.md`
3. `prompts/Prompt_02_Shell_Hero_View_Model_Extension.md`
4. `prompts/Prompt_03_Surface_Header_Metadata_And_Compatibility_Bridge.md`
5. `prompts/Prompt_04_Test_Update_And_Direct_Child_Guardrails.md`
6. `prompts/Prompt_05_Playwright_Selector_And_Evidence_Posture.md`
7. `prompts/Prompt_06_Targeted_Validation_And_Closeout.md`
8. `prompts/Prompt_07_Phase_3_Handoff_Inventory.md`

The auditor prompt is located at:

```text
auditor/Fresh_Session_Auditor_PCC_Phase_2_Shell_Header_Consolidation.md
```

---

## 5. Required Local-Agent Report Format

Every local-agent plan and following-execution report must include:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed / Changed

## Scope Compliance

## Test Plan / Validation

## Package / Lockfile / Manifest Posture

## Risks / Open Items

## Next Step
```

For every prompt, include:

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

---

## 6. Minimum Validation Commands

Use targeted validation first; expand only if needed.

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check   apps/project-control-center/src/shell   apps/project-control-center/src/preview/projectShellViewModel.ts   apps/project-control-center/src/tests/PccShell.responsive.test.tsx   apps/project-control-center/src/tests/PccCardTierContract.test.tsx   apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx   apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx   e2e/pcc-live/pcc-live.page-object.ts   e2e/pcc-live/pcc-live.surface-smoke.spec.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright changes are made:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

If tenant env/auth is missing, live tests must self-skip or report missing env/auth. They must not claim evidence was captured without artifacts.

---

## 7. Completion Definition

Phase 2 is complete when:

- shell `main[role="tabpanel"]` owns `data-pcc-active-surface-panel={activeSurfaceId}`;
- tests prove exactly one shell-owned active-panel marker for tab navigation states;
- tests no longer require active-panel ownership on bento cards;
- bento cards remain direct children;
- shell/header metadata seam exists for all eight surfaces;
- card-level marker compatibility is documented as deprecated or cleaned up safely;
- Playwright selector posture is understood and optionally improved;
- no package/lockfile/manifest drift exists;
- handoff inventory identifies duplicate header cards for Phase 3.

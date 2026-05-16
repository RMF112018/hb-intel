# My Dashboard — My Projects Flagship UI/UX Implementation Package

**Generated:** 2026-05-16  
**Target repo:** `RMF112018/hb-intel`  
**Target application:** `apps/my-dashboard`  
**Target module:** `My Dashboard → My Projects`  
**Work type:** UI/UX flagship implementation package — implementation, validation, and hosted evidence closure.

---

## 1. Purpose

This package converts the current working **My Projects** module from a functional but vertically heavy project launcher into a **flagship-grade personal project portfolio surface**.

The plan is fully decision-locked. It does **not** reopen backend/auth/data remediation. It assumes the current read model is functionally working and focuses on:

- visual hierarchy;
- item composition;
- interaction model;
- premium action affordances;
- overflow/full-list behavior;
- responsive mode behavior;
- accessibility;
- validation and hosted evidence closure.

---

## 2. Locked target state

The final module must become:

> A benchmark-grade **My Portfolio → My Projects** launcher that renders a compact, recognition-first tile grid, uses a per-project **Open** menu for SharePoint / Procore destinations, exposes a responsive full-portfolio browser for larger project sets, supports project search by name or number, and remains stable in real SharePoint-hosted conditions.

No major design decision is left open in this package.

---

## 3. Package contents

### Core plan and specifications

1. `00_FULL_IMPLEMENTATION_PLAN.md`
2. `01_TARGET_STATE_DECISION_LOCK.md`
3. `02_REPO_TRUTH_BASELINE.md`
4. `03_PROJECT_ITEM_COMPOSITION_SPEC.md`
5. `04_BREAKPOINT_SHELL_FIT_CONTRACT.md`
6. `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`
7. `06_TEST_VALIDATION_AND_EVIDENCE_MATRIX.md`
8. `07_DEPENDENCY_AND_FILE_OWNERSHIP_MAP.md`

### Execution prompts

1. `prompts/Prompt_01_Repo_Truth_Revalidation_and_Worktree_Scope_Lock.md`
2. `prompts/Prompt_02_Card_Shell_Copy_Metrics_and_Composition_Reset.md`
3. `prompts/Prompt_03_Project_Tile_Primitives_and_Identity_Block_Rebuild.md`
4. `prompts/Prompt_04_Project_Launch_Menu_and_Action_Affordance_Implementation.md`
5. `prompts/Prompt_05_Full_Portfolio_Browser_Search_and_Overflow_Surface.md`
6. `prompts/Prompt_06_Premium_Visual_System_Motion_and_Responsive_Mode_Closure.md`
7. `prompts/Prompt_07_Test_Suite_DOM_Contracts_and_A11y_Hardening.md`
8. `prompts/Prompt_08_Final_Build_Package_Hosted_Validation_and_Closeout.md`

### Supporting execution resources

1. `supporting/Agent_Closeout_Report_Template.md`
2. `supporting/Acceptance_Scorecard_Worksheet.md`
3. `supporting/Hosted_Evidence_Capture_Checklist.md`
4. `supporting/Commit_Message_Template.md`
5. `supporting/Package_Execution_Checklist.md`

### Machine-readable manifest

- `manifest.json`
- `PACKAGE_MANIFEST.md`

---

## 4. Required execution order

Execute prompts in this order:

1. Prompt 01 — repo-truth preflight and scope lock  
2. Prompt 02 — card shell, copy, KPI removal, composition reset  
3. Prompt 03 — compact tile primitives and identity hierarchy  
4. Prompt 04 — per-project launch menu and action affordance  
5. Prompt 05 — full portfolio browser, search, overflow strategy  
6. Prompt 06 — premium visual layer, motion, responsive behavior  
7. Prompt 07 — tests, DOM contracts, accessibility hardening  
8. Prompt 08 — build/package validation, hosted evidence, closeout  

Do not skip Prompt 01.  
Do not execute later prompts until the current prompt is complete and validated.

---

## 5. Universal agent operating rule

Every prompt in this package includes the following binding instruction:

> **Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

The agent should use active context first, re-open only the files necessary for the prompt, and avoid broad repo audits unless the current prompt explicitly requires one.

---

## 6. Global scope boundaries

### In scope

- `apps/my-dashboard/src/modules/myProjects/**`
- targeted supporting test updates under `apps/my-dashboard/src/modules/myProjects/**`
- limited home-surface test updates only where copy/contracts require it
- `apps/my-dashboard/package.json` and workspace lockfile updates if the required premium dependencies are not already available to this package
- documentation/report outputs requested by the prompts

### Out of scope

- backend/auth/data remediation;
- provider/data-contract redesign;
- Adobe Sign feature changes;
- home-page card span changes;
- unrelated My Dashboard cards;
- SharePoint host shell changes;
- package version changes unless explicitly required by existing repo workflow;
- deployment workflow edits;
- broad redesign of `MyWorkCard`, `MyWorkBentoGrid`, or unrelated layout primitives.

---

## 7. Current decisions that must not be reopened

- Keep the home surface two-card composition: **My Projects first, Adobe Sign second**.
- Keep the current My Projects / Adobe Sign surface span posture: **7 + 5** desktop-class, **6 + 4** standard laptop.
- Remove the My Projects KPI strip entirely.
- Replace `My Work` with `My Portfolio`.
- Remove `Launch List`.
- Remove visible source/provenance pills from project tiles.
- Preserve SharePoint Site vs SharePoint Folder distinction only in action labels/menu items.
- Make project name and project number the primary scan block.
- Use responsive compact project tiles.
- Use a single per-project **Open** action trigger, not persistent dual launch buttons.
- Replace inline full-list expansion with a responsive portfolio browser overlay.
- Add search by project name and project number inside the full portfolio browser.
- Apply a UI display sort of project name → project number → record key; do **not** modify the backend provider ordering as part of this UI effort.
- Preserve current loading, empty, partial, source-unavailable, backend-unavailable, and principal-unresolved state semantics while visually upgrading them.

---

## 8. Expected final validation baseline

The final implementation is not closed until all of the following are true:

- My Projects renders as a compact portfolio launcher, not a vertically bloated list.
- Five projects fit materially better in the hosted first viewport than the current screenshots.
- Adobe Sign is no longer visually stretched into a large blank companion merely because My Projects is too tall.
- SharePoint and Procore launch paths remain fully available where the read model provides them.
- Unavailable launch paths remain truthful and do not render fake links.
- Keyboard and touch behavior are credible.
- Narrow, tablet, desktop, and short-height states are explicitly handled.
- Targeted unit tests, type checks, lint, and build commands pass.
- Hosted SharePoint evidence is captured before closure.
- The final package can credibly target **flagship / benchmark-grade** closure.

---

## 9. Recommended agent response format after each prompt

Use:

```text
Following execution of prompt-N:
- Status: Closed | Partially Closed | Not Closed
- Files changed:
- Implementation summary:
- Validation commands run:
- Validation results:
- Exact outstanding blockers, if any:
- Commit-ready summary:
- Proposed commit message:
```

Do not push or create a commit unless the operator separately instructs it outside the prompt.

---

## 10. Primary repo paths anchored by this package

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.module.css`
- `apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `packages/models/src/myWork/MyProjectLinksReadModel.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `apps/my-dashboard/package.json`

---

## 11. Read this package before executing prompts

Start with:

1. `00_FULL_IMPLEMENTATION_PLAN.md`
2. `01_TARGET_STATE_DECISION_LOCK.md`
3. `03_PROJECT_ITEM_COMPOSITION_SPEC.md`
4. `04_BREAKPOINT_SHELL_FIT_CONTRACT.md`
5. `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`
6. `07_DEPENDENCY_AND_FILE_OWNERSHIP_MAP.md`

Then execute Prompt 01.

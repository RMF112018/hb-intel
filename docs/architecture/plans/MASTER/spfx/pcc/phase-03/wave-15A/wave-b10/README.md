# PCC Phase 05 Package — Grouped Tab Module Navigation

## Package Purpose

This package governs implementation of **Phase 05 — Grouped Tab Module Navigation** for the Project Control Center (`apps/project-control-center`) in the `RMF112018/hb-intel` repo.

This package replaces the prior standalone "Module Launcher" concept with the corrected target architecture:

```text
Primary Tab = Dashboard Surface
Dropdown / Child Links = Modules under that dashboard surface
```

The phase objective is to extend the existing accessible tab bar pattern so each primary PCC tab opens its dashboard surface and exposes related module links through an accessible dropdown. The work must remain read-only / preview-safe, in-memory, host-fit, and production-grade from the user's perspective.

## Non-Negotiable Decisions

No decisions remain open in this package.

1. **No standalone hero/header Module Launcher.**
   - Do not add a separate "Modules" button in the command header.
   - Do not build a second navigation system outside the primary tab bar.

2. **Primary tabs are dashboard surfaces.**
   - Each primary tab opens a dashboard surface.
   - The selected tab's dashboard is the surface rendered inside the shell tabpanel.

3. **Child dropdown links are module entry points.**
   - Dropdown links are not separate SharePoint pages.
   - Dropdown links are not URL routes.
   - Dropdown links set safe in-memory module context only.

4. **Document Control is its own primary tab.**
   - The visible tab label must be `Document Control`.
   - Internally, Phase 05 may preserve the current `documents` surface ID for compatibility.
   - Do not remove the existing Documents surface implementation. Re-label and evolve it.

5. **All UI copy must be production-grade and end-user-facing.**
   - Do not render developer copy in the product UI.
   - Do not render raw strings such as `TODO`, `TBD`, `placeholder`, `stub`, `fixture`, `mock`, `debug`, `dev-only`, `not implemented`, or internal package names in the UI.
   - Future/deferred modules must use professional product copy, such as: `Planned for a future release. This module is not active for the selected project.`
   - Preview modules must use professional copy, such as: `Preview only. Review source records before taking action.`
   - No user-facing copy may say "developer", "code agent", "prompt", "repo", "test selector", or "implementation pending".

6. **No routing expansion.**
   - No URL routing.
   - No query-string routing.
   - No SharePoint page routing.
   - No new browser history behavior.

7. **No writeback or source mutation.**
   - No Procore writes.
   - No Sage writes.
   - No SharePoint list/library/group/security mutations.
   - No tenant mutation.
   - No HBI autonomous decisions.
   - No approval decisions.

8. **Preserve SharePoint host-fit.**
   - No PCC sidebar.
   - No full-page takeover assumptions.
   - No native SharePoint chrome manipulation.
   - No horizontal overflow.

9. **Preserve accessibility.**
   - Primary navigation remains keyboard-accessible.
   - Primary tabs preserve `role="tab"` semantics.
   - The active dashboard remains the shell `main[role="tabpanel"]`.
   - Dropdown toggles expose `aria-haspopup`, `aria-expanded`, and `aria-controls`.
   - Disabled/non-openable modules expose reason copy and do not navigate.

10. **Preserve current bento direct-child invariants.**
    - Do not wrap bento cards in untested containers that break `PccBentoGrid` direct-child behavior.

## Package Contents

```text
README.md
00_Target_Architecture.md
01_Navigation_Registry_Contract.md
02_Implementation_Plan.md
03_Wireframes.md
04_Acceptance_Criteria_And_Validation.md
prompts/
  Prompt_00_Pre_Edit_Repo_Truth_Gate.md
  Prompt_01_Primary_Tab_And_Module_Registry.md
  Prompt_02_Shell_State_Active_Module_Model.md
  Prompt_03_Generalize_PccHorizontalTabs_Dropdowns.md
  Prompt_04_Surface_Router_And_Dashboard_Shells.md
  Prompt_05_Module_Selection_Disabled_State_And_Copy.md
  Prompt_06_Document_Control_Tab_Refinement.md
  Prompt_07_A11y_Regression_And_False_Affordance_Tests.md
  Prompt_08_Live_Evidence_Closeout.md
Auditor_Prompt_Phase_05_Completion_Review.md
```

## Target Primary Navigation

| Primary Tab | Dashboard Surface | Child Module Links |
|---|---|---|
| Project Home | Daily project command dashboard | Action Center; My Responsibilities; Today / This Week |
| Core Tools | Cross-cutting project operating tools | HBI Assistant; External Platforms; Team & Access; Project Directory; Approvals & Checkpoints |
| Document Control | Documents, drawings, models, and source-file control | Primary Documents Tool; Document Control Center; Drawing & Model Center; SharePoint Project Record; My Project Files / OneDrive; Procore Documents; Document Crunch; Adobe Sign |
| Estimating & Preconstruction | Preconstruction continuity dashboard | Future estimating modules; Preconstruction Handoff; Estimate Assumptions / Alternates / Exclusions |
| Project Startup & Closeout | Startup, closeout, turnover, warranty, lessons learned, and subcontractor performance | Startup Center; Responsibility Matrix; Closeout; Closeout & Turnover Tracker; Warranty; Lessons Learned; Subcontractor Performance |
| Project Controls | Controls, compliance, risk, constraints, field operations, and communication | Project Controls; Permits & Inspections; Contract & Compliance; Risk / Issues / Decisions; Constraints Log; Field Operations; Meeting & Communication |
| Cost & Time | Financial, schedule, procurement, and commitment dashboard | Financial Reporting; Schedule Monitor; Procurement & Buyout; Commitment / Cost Exposure |
| Systems Administration | Governance, health, configuration, integration, and template administration | Site Health; Control Center Settings; Integration Settings; Procore Mapping / Sync Health; Module Configuration |

## Required Baseline Validation Commands

Every implementation prompt must close with these commands:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Live evidence commands are required only in Prompt 08 or if implementation materially changes hosted visual/navigation behavior:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Required Agent Instruction

Every local-code-agent prompt in this package includes this instruction:

> Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Implementation Safety Notes

- This package is an implementation instruction package, not runtime code.
- The local agent must inspect current `main` before editing because the repo is moving quickly.
- Where current repo truth differs from this package, the local agent must stop and report the conflict before making broad edits.
- The local agent must not invent tenant facts, live integration facts, IDs, URLs, or permission claims.

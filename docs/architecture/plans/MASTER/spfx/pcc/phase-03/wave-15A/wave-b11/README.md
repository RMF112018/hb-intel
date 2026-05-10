# PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System

## Purpose

This package instructs a local code agent to implement **Phase 06** for the `RMF112018/hb-intel` repo, focused on the SharePoint/SPFx Project Control Center (`apps/project-control-center`).

Phase 06 has four implementation objectives:

1. Add typed, dashboard-specific **span overrides** to eliminate stranded horizontal grid gaps without changing global footprint defaults.
2. Add **intentional dashboard card choreography** so cards are ordered, sized, and paired by operational priority, visual weight, and expected height.
3. Add a direct `echarts`-based **PCC analytics preview system** with project-specific, deterministic, previewable visualizations.
4. Add comprehensive TODO-style, non-UI documentation for post-MVP **stage/lifecycle-aware navigation and Project Home context** implementation, aligned to the existing Product Architecture / User Journey Blueprint.

The package does **not** instruct the local agent to install dependencies. Because of local-agent hard gates/rules, the user will install `echarts` manually.

---

## Required Human Dependency Step

The local agent must **not** install `echarts`.

The user should run this command locally at the correct point in the sequence:

```bash
pnpm --filter @hbc/spfx-project-control-center add echarts
```

### Recommended timing

**Preferred:** Run the dependency install before Prompt 00 so the agent's initial baseline includes the intended dependency and `pnpm-lock.yaml` state.

**Acceptable alternate:** If Prompt 00 is already complete, run the dependency install immediately before Prompt 03. Prompt 03 includes explicit instructions to treat the resulting `apps/project-control-center/package.json` and `pnpm-lock.yaml` changes as a human-owned, expected dependency delta.

### Required lockfile explanation

The dependency install is expected to change:

```text
apps/project-control-center/package.json
pnpm-lock.yaml
```

The local agent must:

- record `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml` before and after its own work;
- clearly distinguish the user-owned `echarts` install delta from agent-authored source changes;
- not revert the lockfile or package dependency change;
- not attempt to install `echarts`, `echarts-for-react`, or any other dependency;
- not add `echarts-for-react` for MVP.

---

## Package Contents

```text
README.md
00_Complete_Implementation_Plan.md
01_Closed_Decisions_And_Repo_Truth_Baseline.md
02_Span_Override_And_Choreography_Contract.md
03_Analytics_Architecture_Contract.md
04_Analytics_Card_Inventory_And_Placement_Matrix.md
05_Test_And_Evidence_Contract.md
06_Human_ECharts_Dependency_Prerequisite.md

prompts/
  Prompt_00_Pre_Edit_Repo_Truth_Gate.md
  Prompt_01_Span_Override_Foundation.md
  Prompt_02_Project_Home_Choreography_And_Gateways.md
  Prompt_03_ECharts_Wrapper_And_Analytics_Foundation.md
  Prompt_04_Project_Home_Analytics_Cards.md
  Prompt_05_Documents_Analytics_Cards.md
  Prompt_06_Core_Tools_Analytics_Cards.md
  Prompt_07_Estimating_Preconstruction_Analytics_Cards.md
  Prompt_08_Startup_Closeout_Analytics_Cards.md
  Prompt_09_Project_Controls_Analytics_Cards.md
  Prompt_10_Cost_Time_Analytics_Cards.md
  Prompt_11_Systems_Administration_Analytics_Cards.md
  Prompt_12_Post_MVP_Stage_Lifecycle_TODO_Documentation.md
  Prompt_13_Test_Suite_Accessibility_And_Regression_Coverage.md
  Prompt_14_Playwright_Evidence_And_Closeout.md

auditor/
  Fresh_Session_Auditor_Prompt_Phase_06.md
```

---

## Recommended Execution Sequence

### Step 1 — Baseline and dependency

1. Run `prompts/Prompt_00_Pre_Edit_Repo_Truth_Gate.md`.
2. Install `echarts` manually if not already installed.
3. Confirm the lockfile/package dependency delta is intentional.

### Step 2 — Layout foundation

4. Run `prompts/Prompt_01_Span_Override_Foundation.md`.
5. Run `prompts/Prompt_02_Project_Home_Choreography_And_Gateways.md`.

### Step 3 — Analytics foundation

6. Run `prompts/Prompt_03_ECharts_Wrapper_And_Analytics_Foundation.md`.

### Step 4 — Page-by-page analytics

7. Run `prompts/Prompt_04_Project_Home_Analytics_Cards.md`.
8. Run `prompts/Prompt_05_Documents_Analytics_Cards.md`.
9. Run `prompts/Prompt_06_Core_Tools_Analytics_Cards.md`.
10. Run `prompts/Prompt_07_Estimating_Preconstruction_Analytics_Cards.md`.
11. Run `prompts/Prompt_08_Startup_Closeout_Analytics_Cards.md`.
12. Run `prompts/Prompt_09_Project_Controls_Analytics_Cards.md`.
13. Run `prompts/Prompt_10_Cost_Time_Analytics_Cards.md`.
14. Run `prompts/Prompt_11_Systems_Administration_Analytics_Cards.md`.

### Step 5 — TODO documentation, tests, evidence

15. Run `prompts/Prompt_12_Post_MVP_Stage_Lifecycle_TODO_Documentation.md`.
16. Run `prompts/Prompt_13_Test_Suite_Accessibility_And_Regression_Coverage.md`.
17. Run `prompts/Prompt_14_Playwright_Evidence_And_Closeout.md`.

---

## Core Guardrails

The local agent must preserve the following:

- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Do not reintroduce card-level `data-pcc-active-surface-panel`; the shell `main[role="tabpanel"]` remains owner.
- Do not use `grid-auto-flow: dense` as the primary layout solution.
- Do not globally mutate footprint defaults to solve dashboard-specific layout.
- Do not install dependencies.
- Do not add `echarts-for-react` for MVP.
- Do not create live integrations, live analytics, writeback, approval execution, or source-system mutation.
- Do not render developer/internal copy in the UI.
- Do not use random data generation in render paths.
- Do not hide critical chart information in canvas, tooltip-only content, or color-only states.
- Do not re-read files already in the agent's current context unless the file has changed, the context is stale, or validation requires it.

---

## Phase 06 Completion Standard

Phase 06 is complete only when:

- Project Home uses the target first-fold order and span choreography.
- Dashboard-specific span overrides are typed, clamped, tested, and instrumented.
- Analytics cards are present across all current primary dashboards.
- Analytics cards are intelligently placed near related operational cards where practical.
- Preview/degraded analytics states render deterministic sample-data visualizations with clear product-grade explanation.
- `echarts` is used directly through PCC-owned wrapper components.
- TODO documentation exists for post-MVP stage/lifecycle-aware Project Home context and navigation.
- `echarts-for-react` is not installed, but a post-MVP TODO documents when it should be re-evaluated.
- Component tests pass.
- Playwright evidence proves layout, analytics, accessibility, and no-overflow posture.
- SPFx solution and feature versions are bumped from `1.0.0.215` to `1.0.0.216` unless the user provides a different version.

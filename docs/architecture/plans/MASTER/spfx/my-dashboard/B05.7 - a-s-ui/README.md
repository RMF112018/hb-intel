# README — Adobe Sign Flagship UI/UX Remediation Package

## Objective

Use this package to guide a local code agent through a controlled, repo-truth-aware remediation of the **My Dashboard Adobe Sign module**. The module already has a strong backend/read-model foundation and a functioning `Action Queue` / `Completed` toggle. The remaining work is a **flagship UI/UX rebuild** of the card's composition, hierarchy, responsive posture, and closure evidence.

## Current Baseline

The live `main` branch was verified against:

```text
7ae348ed5ee912e72a7ec1d703ad53bdc18bd090
```

That baseline introduced:

- header-level `Action Queue` / `Completed` toggling;
- lazy recent-completions loading;
- completed-state rendering;
- `MyWorkCard.titleContent`;
- state and toggle tests.

This package assumes that baseline unless Prompt 01 proves repo truth has moved.

## Why This Package Exists

The audit found that the current module is:

- **functionally strong**;
- **architecturally credible** in its read-model seams;
- **visually under-authored** relative to the UI doctrine;
- **not yet homepage-grade or benchmark-grade**.

The audit score was:

```text
28 / 56
```

The implementation target is:

```text
48+ / 56
```

with a stretch recovery target of:

```text
50 / 56
```

## Core Remediation Themes

1. **Remove low-value stretched whitespace**
   - The Adobe card must not grow to match a taller My Projects sibling merely because they share a grid row.

2. **Rebuild the card header**
   - Stable title.
   - Visible status chip.
   - Dedicated semantic view switch.
   - Freshness/confidence rail.

3. **Replace raw key/value row reuse**
   - Build Adobe-specific activity rows for queue and completed items.
   - Keep primary content readable.
   - Keep row action visible.
   - Prevent metadata from dominating or truncating poorly.

4. **Make state rendering authored**
   - Loading, empty, degraded, and error states must read as designed product states, not simple paragraph fallbacks.

5. **Make responsive behavior explicit**
   - Wide, medium, compact, phone, and short-height postures must be intentionally defined.

6. **Close validation gaps**
   - Keyboard semantics.
   - Retry behavior.
   - State coverage.
   - Hosted evidence.
   - Re-scored acceptance.

## Package Reading Order

Read in this order:

1. `PACKAGE_MANIFEST.md`
2. `docs/00_Executive_Implementation_Summary.md`
3. `docs/02_Closed_Decisions_And_Target_Posture.md`
4. `docs/03_Target_Flagship_Card_Anatomy_And_UX_Spec.md`
5. `docs/05_State_Render_Matrix.md`
6. `docs/06_Responsive_And_Shell_Fit_Spec.md`
7. `docs/09_Accessibility_And_Interaction_Contract.md`
8. `prompts/PROMPT_EXECUTION_SEQUENCE.md`

The remaining docs are supporting detail and should be used as implementation reference.

## How to Use the Prompt Files

### Step 1 — Run Prompt 01

Prompt 01 is a **read-only repo-truth readiness audit**. It verifies:

- clean or explainable worktree posture;
- active branch and HEAD;
- current baseline commit ancestry;
- exact file existence;
- whether the package remains aligned to current repo truth.

Do not authorize implementation until the Prompt 01 report is reviewed.

### Step 2 — Use the user's preferred review exchange

After the local agent returns a plan or readiness report, use these labels in ChatGPT review:

```text
Agent's prompt-01 plan:
[paste plan]
```

After execution of a prompt:

```text
Following execution of prompt-02:
[paste execution report]
```

This package is written to support that review cadence.

### Step 3 — Execute Prompts 02 through 07 sequentially

Each prompt contains:

- Objective
- Required ground rules
- Files to inspect
- Allowed files to modify
- Forbidden files/scope
- Exact implementation tasks
- Validation commands
- Staging rules
- Commit summary/body guidance
- Required final report

### Step 4 — Execute Prompt 08

Prompt 08 closes the effort through:

- validation pass;
- hosted evidence plan;
- scorecard re-audit;
- final closeout docs.

### Step 5 — Use Prompt 09 for an independent re-audit

Prompt 09 is a fresh-session reviewer prompt for a new ChatGPT session after implementation is complete.

## Non-Negotiable Scope Rules

Unless a prompt explicitly authorizes it:

- Do not edit backend/functions code.
- Do not mutate package versions.
- Do not modify `pnpm-lock.yaml`.
- Do not edit SPFx manifests or packaging files.
- Do not run deployment or publish steps.
- Do not introduce new third-party dependencies.
- Do not synthesize Adobe Sign URLs.
- Do not create hidden write paths or tenant mutations.
- Do not broaden the module into a new workflow system.

## Decision-Closed Product Rules

The implementation must follow these locked decisions:

- Card title becomes **Agreement Activity**.
- Eyebrow remains **Adobe Sign**.
- The title is stable and noninteractive.
- `Action Queue` / `Completed` becomes a dedicated view-switch control beneath the title.
- The card shows a visible state chip and freshness rail.
- The card remains a compact operational companion, not a mini Adobe Sign app.
- My Projects remains the dominant primary module.
- Adobe Sign must not stretch to sibling height.
- Row actions remain explicit; the full row is not an ambiguous click target.
- No generic `View all` footer link is added unless an existing truthful target already exists.
- Completed rows do not repeat `Updated date unavailable`.
- Missing date/sender metadata degrades gracefully per the copy rules.
- Completed lazy-fetch errors gain a local retry capability.
- No backend contract changes are made in this package.

## Expected Implementation Folder in the Repo

Final closeout docs created by Prompt 08 should be placed under:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/
```

The package itself does not assume that folder already exists.

## Success Definition

At completion:

- the Adobe card should visually read as a premium, authored operational module;
- the empty queue state should feel intentional and compact;
- the completed state should feel like useful recent-history intelligence;
- long agreement names and partial metadata should scan cleanly;
- keyboard behavior should be explicit and proven;
- hosted evidence should support a scorecard recovery claim.

## Package Outputs

This ZIP contains the complete implementation plan, execution prompts, supporting reference materials, copies of the governing checklist/scorecard attachments, and the two current-state screenshots supplied for visual reference.

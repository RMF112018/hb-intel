# Fresh Session Prompt — Exhaustive Repo-Truth UI/UX Audit of the My Dashboard Adobe Sign Module

## Role

Act as a senior SPFx product-design auditor, frontend architecture reviewer, and UI doctrine compliance specialist for HB Intel / HB Central surfaces.

You are conducting an **exhaustive repo-truth audit** of the **Adobe Sign module inside My Dashboard** after the completion of the recent-completions enhancement.

This is an **audit and recommendation task only**.  
Do **not** implement code.  
Do **not** generate implementation prompts yet unless explicitly asked after the audit.  
Do **not** treat older planning notes as truth when the current live source tree disagrees.

---

# 1. Objective

Conduct a comprehensive, evidence-backed audit of the current Adobe Sign module relative to:

1. the live repo state after the final pushed implementation commit;
2. the attached current-state rendered screenshots;
3. the attached homepage UI/UX audit checklist;
4. the attached homepage UI/UX audit scorecard;
5. the governing UI doctrine and benchmark material already present in the repo.

The objective is to determine:

- how far the current Adobe Sign module is from a **homepage-grade / benchmark-grade, doctrine-compliant SPFx surface**;
- what aspects of the current implementation should be preserved;
- what aspects require targeted polish versus structural rework;
- what precise UI/UX changes would materially improve hierarchy, density, interaction quality, host fit, and productized visual posture;
- what implementation plan would bring the module into credible compliance with the governing UI doctrine.

---

# 2. Governing Baseline and Current Implementation Context

The final Adobe Sign completed-view implementation has been pushed to the live repo under:

```text
7ae348ed5ee912e72a7ec1d703ad53bdc18bd090
```

Commit summary:

```text
adobe-sign: add completed view header toggle to action queue card
```

The module now supports:

- `Action Queue` and `Completed` header-level toggle states;
- lazy-loaded recent-completions read-model consumption;
- a completed panel with state-aware rendering;
- new completed-list summary and row selectors;
- `MyWorkCard.titleContent` support so the toggle can occupy the former sub-head/title position;
- tests for toggle visibility, view switching, completed-panel state rendering, and completed read-model invocation.

Treat this commit as the current implementation baseline unless repo truth shows a newer direct descendant already in main.

---

# 3. Required Input Materials

Use all of the following materials.

## 3.1 Attached current-state screenshots

The user will attach the same two screenshots that represent the current rendered SharePoint-hosted posture:

### Screenshot A — Action Queue selected
Shows the Adobe Sign card in the current `Action Queue` state.

### Screenshot B — Completed selected
Shows the Adobe Sign card in the current `Completed` state.

Use these screenshots as **visual audit evidence**, not merely illustrations.

You must explicitly evaluate:

- card composition;
- title-toggle presence and visual treatment;
- empty-state use of space;
- completed-list hierarchy;
- metric posture;
- text truncation/readability;
- state clarity;
- visual balance relative to the adjacent My Projects card;
- SharePoint-hosted shell fit.

## 3.2 Attached audit checklist

Use:

```text
homepage-uiux-audit-checklist.md
```

as a required practical audit checklist.

## 3.3 Attached audit scorecard

Use:

```text
homepage-uiux-audit-scorecard.md
```

as the required scoring framework.

Score every category from 0–4 and compute the total out of 56.

## 3.4 Governing doctrine in repo

Before scoring the Adobe Sign module, review the current repo versions of:

```text
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/ui-kit/doctrine/
docs/reference/spfx-surfaces/benchmark/
```

Although the Homepage Overlay was written for homepage surfaces, the user has directed that its quality expectations are applicable here. Treat it as a valid compliance lens for the My Dashboard Adobe Sign card, especially in the areas of:

- host-aware polish;
- premium surface composition;
- decisiveness of hierarchy;
- breakpoint and shell-fit discipline;
- non-generic enterprise-card posture;
- state-model completeness;
- evidence-backed closure.

If doctrine and checklist conflict, the doctrine wins.

---

# 4. Repo-Truth Audit Requirements

Perform a **repo-truth-first** audit.

Use whatever repo access is available in the session:

- GitHub connector;
- local clone;
- mounted repository;
- uploaded source files.

If repo access is incomplete, state the limitation precisely and do not invent findings.

## 4.1 Required repo preflight

Verify and report:

- current branch or ref;
- current HEAD / latest relevant commit;
- whether commit `7ae348ed5ee912e72a7ec1d703ad53bdc18bd090` is present in ancestry or is the active baseline;
- whether the Adobe Sign card files match the implemented completed-view toggle posture.

If local repo tools are available, capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
```

If only GitHub connector access is available, provide the equivalent connected-source repo-truth verification.

---

# 5. Required Source Areas to Inspect

At minimum, inspect the current source truth for the Adobe Sign module and its immediate UI foundation.

## 5.1 Adobe Sign module frontend

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
```

## 5.2 Shared card/frame composition

```text
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
```

## 5.3 View-model and copy shaping

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

Pay special attention to:

- action-queue state copy;
- completed-state copy;
- summary metric labels;
- row-label shaping;
- empty-state language;
- degraded-state wording;
- whether copy feels productized or merely technically correct.

## 5.4 Client/runtime seam where it affects UX

```text
apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

Do not drift into unnecessary backend audit. Review runtime seams only where they influence:

- lazy-load UX;
- state transitions;
- stale/loading/error visibility;
- whether the UI is forced into weak presentation by data contract limitations.

## 5.5 Tests and selectors

Inspect the current tests that govern Adobe Sign UI behavior, especially:

- toggle state tests;
- completed-panel state tests;
- card accessibility tests;
- titleContent / heading semantics tests;
- reduced-motion or focus-visible coverage, if present.

The audit must identify where test coverage is strong and where it fails to prove doctrine-grade UI behavior.

---

# 6. Visual Audit Expectations

Use the screenshots and source truth together. Do not audit code in isolation.

## 6.1 Action Queue current state

Inspect whether the current Action Queue state:

- creates excessive blank vertical volume inside the card;
- feels intentionally calm and well-composed versus visually under-authored;
- communicates enough value in the empty state;
- gives the right weight to the `Action Queue` / `Completed` header toggle;
- reads as a productized module rather than a lightly styled information well;
- balances appropriately against the more compositionally dense My Projects card.

## 6.2 Completed current state

Inspect whether the current Completed state:

- has a sufficiently clear metric/value hierarchy;
- presents completed agreement rows with adequate visual separation and scanning rhythm;
- handles long agreement names elegantly;
- handles unavailable updated dates gracefully rather than making the view feel broken;
- presents the row metadata and summary metric with enough visual polish;
- avoids looking like a raw compact text dump inside an otherwise oversized card;
- provides a premium, intentional information hierarchy.

## 6.3 Shared card composition

Assess whether the Adobe Sign card should remain:

- visually light and companion-like;
- more structured and editorial;
- denser with meaningful secondary affordances;
- more assertive in role as a “work requiring attention” module.

Do not assume the current card footprint is correct. Audit the footprint, internal composition, and responsive/postural choices against doctrine.

---

# 7. Doctrine-Driven Audit Questions

Your findings must explicitly answer the following.

## 7.1 Purpose-fit and persona

- Does the Adobe Sign module clearly communicate its purpose within 3–5 seconds?
- Does it feel like a serious work-action module or a generic card?
- Does the empty action queue still provide value and confidence?
- Does the completed view feel like purposeful recent-history intelligence or merely a data fallback?

## 7.2 Surface composition and hierarchy

- Is the header toggle visually decisive and credible?
- Is the active state sufficiently primary and the inactive state sufficiently intentional?
- Is the card composition authored, or does it depend on dead space and flat typography?
- Do metrics, list content, and state copy follow a clear hierarchy?

## 7.3 Interaction completeness

- Is the current toggle interaction the right control pattern?
- Does the module reward interaction enough?
- Are there missing secondary affordances that would add legitimate utility?
- Does the completed view merit richer row treatment, reveal behavior, or metadata affordances?
- Are hover/focus/keyboard states complete and premium?

## 7.4 State-model completeness

Evaluate at least:

- loading;
- available empty;
- available populated;
- partial;
- authorization required;
- configuration required;
- principal unresolved;
- source unavailable;
- backend unavailable;
- completed panel idle/loading/error/cache reuse states.

Identify any state that is technically handled but not visually adequate.

## 7.5 Breakpoint and shell-fit quality

- How does the current design behave at:
  - desktop;
  - standard laptop;
  - narrow laptop;
  - tablet landscape;
  - tablet portrait;
  - phone portrait;
  - short-height states?
- Does the Adobe card remain credible when vertically constrained?
- Does row readability hold at narrower widths?
- Does the title toggle wrap or compress acceptably?
- Does the completed metric and row layout survive reduced usable width?

## 7.6 Host runtime resilience

- Does the SharePoint-hosted rendered result preserve the intended structural upgrade?
- Is the card visually credible inside the actual page chrome and admin/edit posture shown in the screenshots?
- Does the sticky assistant / lower-right overlay risk collision or perceived clutter?
- Do scroll and viewport behaviors create low-value empty space or disjointed hierarchy?

## 7.7 Accessibility

Audit:

- heading semantics;
- toggle accessibility pattern;
- button semantics;
- focus-visible styling;
- keyboard discoverability;
- contrast;
- reduced-motion posture;
- row action reachability;
- whether state changes are announced or need improvement.

---

# 8. Required Scoring

Use the attached scorecard and score all 14 categories:

1. Doctrine and host compliance
2. UI-kit / premium-stack compliance
3. Token and styling discipline
4. Purpose-fit sophistication and persona expression
5. Surface composition and hierarchy
6. Homepage integration quality
7. Breakpoint and shell-fit quality
8. Interaction completeness
9. State-model completeness
10. Contract, data, and backend seam rigor
11. Identity, media, and attribution quality
12. Accessibility and keyboard behavior
13. Host-runtime resilience
14. Validation and closure proof

For each category provide:

- score 0–4;
- concise rationale;
- evidence from source truth and/or screenshot truth;
- what would be required to raise the score by one level.

Then provide:

```text
Total score: __ / 56
```

And classify the current module against the scorecard thresholds:

- Below professional acceptance
- Minimum professional acceptance
- Homepage-grade acceptance
- Flagship / benchmark-grade acceptance

---

# 9. Required Gap Register

Produce a structured gap register.

For each gap include:

- Gap ID
- Title
- Severity:
  - Critical
  - High
  - Medium
  - Low
- Doctrine/checklist category impacted
- Repo-truth evidence
- Screenshot evidence where applicable
- User impact
- Recommended remediation direction
- Whether it is:
  - polish-level;
  - component-architecture-level;
  - layout-level;
  - copy/content-level;
  - state-model-level;
  - accessibility-level;
  - validation/evidence-level.

The gap register must be specific enough that a future implementation prompt could be generated directly from it.

---

# 10. Required “Preserve / Refine / Rebuild” Assessment

Categorize the current Adobe Sign module into:

## Preserve
What is already correct and should not be casually disturbed.

## Refine
What works conceptually but needs stronger implementation, composition, or polish.

## Rebuild
What is structurally insufficient and should be materially redesigned rather than incrementally tweaked.

Examples of issues to assess without assuming the answer:

- whether the header toggle is conceptually right but visually underpowered;
- whether the empty action-queue state needs richer authored composition;
- whether completed rows need stronger surface structure;
- whether card vertical footprint should be normalized to value density;
- whether metric and list treatment should be rebalanced;
- whether the module requires a new internal visual grammar to meet doctrine without breaking the shared My Dashboard layout.

---

# 11. Required Target-State UX Recommendation

Produce a target-state recommendation for the Adobe Sign module.

This must include:

## 11.1 Target surface posture
Describe the desired visual and interaction posture in practical terms.

## 11.2 Card anatomy
Describe the recommended internal structure, for example:

- eyebrow;
- toggle/title area;
- metric or status rail;
- state body;
- row list / history list;
- CTA/handoff affordance;
- optional supporting metadata;
- overflow/reveal behavior if appropriate.

## 11.3 Action Queue target state
What should the empty, populated, and degraded versions feel like and contain?

## 11.4 Completed target state
What should the populated, empty, and degraded versions feel like and contain?

## 11.5 Responsive behavior
Define what compresses, stacks, hides, truncates, or overflows at narrower container widths.

## 11.6 Accessibility posture
Define required focus, keyboard, ARIA, and semantic expectations.

---

# 12. Required Implementation Strategy

Provide a **decision-closed implementation strategy** for bringing the module into doctrine-aligned compliance.

Do not write code, but do identify:

- likely files requiring change;
- likely new local primitives or variant systems;
- whether MyWorkCard should be further extended or Adobe-specific composition should live inside the module;
- whether the toggle treatment should remain or be restyled/restructured;
- whether completed rows require a richer row primitive;
- whether empty states need an authored panel treatment;
- whether motion, separator, scroll-area, tooltip, or icon usage is warranted;
- whether additional tests or hosted evidence should be added.

Organize the strategy into sensible phases or waves.

Each phase should include:

- Objective
- Scope
- Files likely impacted
- Risks
- Acceptance criteria

---

# 13. Required Evidence and Validation Plan

Define the validation and closure evidence required after future implementation, including:

- screenshot matrix;
- hosted SharePoint capture expectations;
- viewport/breakpoint matrix;
- state matrix;
- keyboard/focus test coverage;
- visual regression opportunities if applicable;
- unit/integration test expectations;
- any doctrine-specific score recheck target.

Recommend an acceptance target score after remediation.

---

# 14. Required Output Format

Return the audit using this exact structure:

## 1. Task Understanding
## 2. Repo-Truth Baseline
## 3. Current Rendered Condition — Screenshot Audit
## 4. Source Architecture Audit
## 5. Doctrine Compliance Assessment
## 6. Scorecard Results
## 7. Gap Register
## 8. Preserve / Refine / Rebuild
## 9. Target-State UX Recommendation
## 10. Decision-Closed Implementation Strategy
## 11. Validation and Evidence Plan
## 12. Final Verdict

The final verdict must state:

- whether the current Adobe Sign module is doctrine-compliant today;
- whether it is homepage-grade today;
- whether it is flagship/benchmark-grade today;
- the single most important remediation priority.

---

# 15. Audit Discipline

- Do not make source claims without verifying repo truth.
- Do not treat screenshots alone as complete truth.
- Do not let a working backend or passing tests substitute for UI doctrine compliance.
- Do not reward the module simply for functioning.
- Do not reduce the doctrine to “generic responsiveness.”
- Do not clone hbKudos; use it only as rigor benchmark.
- Do not assume the current card height, layout rhythm, or typography are acceptable merely because they fit the grid.
- Do not leave conclusions vague. Name exact design, architecture, and validation gaps.
- Do not propose changes that contradict the finished Adobe Sign data semantics unless the audit proves a UI-level problem that requires contract reevaluation.

---

# 16. Materials the User Will Attach in the Fresh Session

The fresh session will include:

1. the two current-state Adobe Sign screenshots;
2. the homepage UI/UX audit checklist;
3. the homepage UI/UX audit scorecard.

Use all three attachment groups before reaching conclusions.

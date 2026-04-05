# Phase 08-01 — Accessibility and Interaction QA

## Objective

Conduct a full accessibility and interaction-quality audit of the SharePoint homepage ecosystem, covering both Lane A (`apps/hb-webparts`) and Lane B (`apps/hb-shell-extension`), and produce a repo-truth evidence package plus any narrowly scoped fixes required to bring the products to an enterprise-ready accessibility and interaction baseline.

## Required context

Before making changes, review the live repo truth and the Phase 07 completion artifacts, including:
- Phase 07 Packaging Truth Audit
- Phase 07 Entrypoint and Emitted Asset Inventory
- Phase 07 Bundle Budget Baseline
- Phase 07 Bundle Governance Policy
- Phase 07 Release Checklist
- Phase 07 Runtime Integrity Guide
- Phase 07 completion notes

Also review the core Lane A and Lane B product docs that define expected behavior, including the homepage zone architecture, governance overlays, and shell-extension boundaries.

Do not re-read files that are already in your active context window unless a file changed or you need exact wording for a governed claim.

## Scope

### Lane A
Audit:
- the 5-zone homepage composition reference
- all 10 homepage webpart surfaces
- empty, loading, stale, and no-results states
- keyboard focus and tab flow across zones
- CTA/link semantics and visibility
- reduced-motion handling
- contrast/readability across tinted zones and cards
- responsive and touch-target behavior

### Lane B
Audit:
- top ribbon
- alert band
- footer rail
- support band
- placeholder availability behavior
- dismissible alert interactions
- keyboard focus and landmark behavior
- reduced-motion handling
- contrast/readability across alert severities
- responsive and touch-target behavior

## Required audit dimensions

### 1. Semantic structure
Validate:
- headings and hierarchy
- landmarks (`banner`, `nav`, `contentinfo`, status/live regions)
- button vs link correctness
- descriptive link text
- aria labeling adequacy

### 2. Keyboard behavior
Validate:
- tab order is logical and stable
- no keyboard traps
- focus-visible treatment is present and consistent
- dismiss actions are reachable and understandable
- search input interaction is keyboard-safe

### 3. Visual accessibility
Validate:
- text/background contrast
- badge readability
- CTA readability and affordance
- alert severity color legibility
- tinted-zone readability
- empty/loading-state readability

### 4. Motion and reduced motion
Validate:
- all interactive transitions behave acceptably
- reduced-motion behavior is consistent with policy
- no unnecessary motion remains

### 5. Responsive and device behavior
Validate:
- desktop and laptop widths
- tablet portrait/landscape assumptions
- narrow content widths inside SharePoint page regions
- touch target sizing and spacing
- no clipping, overlap, or unreadable density at realistic widths

### 6. Assistive technology posture
Produce a screen-reader expectation matrix for:
- VoiceOver
- NVDA
- JAWS

You are not required to emulate every real screen reader if the environment cannot do so, but you must still produce a grounded audit of expected spoken order, live-region behavior, landmark exposure, and likely risk points based on code and DOM structure. Be explicit about what was directly verified vs inferred.

## Execution requirements

1. Run the relevant verification commands for both lanes.
2. Add targeted audit-focused tests where they materially improve regression protection.
3. Make only narrowly scoped fixes that are clearly justified by verified findings.
4. Do not redesign products or expand feature scope.
5. Preserve bundle discipline and existing entrypoint rules.

## Required deliverables

Create the following at minimum under the Phase 08 plan directory:
- `Phase-08-Accessibility-Audit-Report.md`
- `Phase-08-Interaction-QA-Matrix.md`
- `Phase-08-Screen-Reader-and-Keyboard-Guide.md`
- `Phase-08-01-Completion-Note.md`

If fixes are made, also include:
- a concise remediation register within the audit report or as a separate appendix
- verification evidence summarizing what changed and what passed

## Acceptance criteria

- accessibility and interaction findings are documented for both lanes
- all critical and high-severity issues are either fixed or clearly isolated with release impact stated
- focus order, semantics, contrast, and reduced-motion posture are explicitly assessed
- the report distinguishes verified behavior from inference
- verification commands complete successfully after any changes

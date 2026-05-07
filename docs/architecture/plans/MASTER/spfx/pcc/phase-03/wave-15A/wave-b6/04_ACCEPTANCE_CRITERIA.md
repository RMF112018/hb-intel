# Acceptance Criteria — Project Home Flagship Remediation

## Product-level acceptance

Project Home passes the product-level remediation when:

- The first scan clearly communicates project identity, operating posture, critical actions, and source/HBI boundaries.
- The page no longer reads as a generic dashboard/card inventory.
- Core operational modules appear before deferred/reference modules.
- Priority Actions is compact enough for home-page use.
- Lifecycle continuity and HBI differentiation are visible earlier.
- HBI remains clearly advisory and grounded.
- Source-of-record boundaries remain visible and non-conflicting.
- Project Home is more useful on phone/tablet/laptop without adding horizontal scroll.

## Card hierarchy acceptance

### Command card

- Exactly one `data-pcc-active-surface-panel="project-home"` exists.
- It is carried by the Project Home command summary card.
- The command card emits:
  - `data-pcc-card-tier="tier1"`;
  - `data-pcc-card-region="command"`;
  - `data-pcc-card-hierarchy="primary"`;
  - `data-pcc-footprint="hero"` or accepted flagship equivalent.

### Operational cluster

Approvals, Project Readiness, and Document Control must appear before deferred/reference cards in the read-model-driven path.

### Deferred/reference cards

Procore snapshot, External Platforms, Team Snapshot, Recent Activity, and detailed memory/related-record cards must not compete with the first operational scan unless they are actively blocking.

## Priority Actions acceptance

- Default home-page rail displays no more than 7 visible action rows unless a test-authorized expanded mode is active.
- Remaining hidden/secondary actions are summarized by count and/or category.
- Each visible row communicates:
  - priority;
  - owner/persona or responsible party when available;
  - due date when available;
  - related work center/source module when available;
  - read-only/reference-only posture.
- No row introduces live workflow execution.
- No anchors or executable workflow buttons appear in the rail.
- Phone measured height of Priority Actions is materially lower than the baseline 2573px.

## Lifecycle / HBI acceptance

- Lifecycle continuity is visible before the lower reference zone.
- Ask HBI or a compact HBI entry point is visible earlier than the last card.
- Ask HBI remains idle-on-mount unless the existing test contract is deliberately and safely revised.
- HBI copy includes a no-decision/no-writeback/no-source-of-record boundary.
- Any sample-query controls are touch-safe and keyboard-accessible.

## Content acceptance

Project Home copy must satisfy:

- disabled/inert controls explain condition, impact, and next step;
- HBI language is advisory, not authoritative;
- source ownership and freshness/confidence wording is non-conflicting;
- construction terms are specific to project operations;
- state copy communicates condition, impact, owner, and next step;
- mock/demo/fixture posture is explicit where relevant.

Content evidence should show materially reduced Project Home needs-review findings.

## Accessibility acceptance

- Project Home axe `color-contrast` findings are resolved.
- Project Intelligence/Command Summary metric labels pass contrast.
- PCC-owned touch target issues are fixed or explicitly classified.
- No color-only state.
- Keyboard focus is visible.
- No hover-only critical meaning.

## Responsive / host-fit acceptance

- No horizontal overflow at any supported breakpoint.
- Direct-child bento invariant holds at all relevant breakpoints.
- Project Home remains useful at phone, tablet portrait, tablet landscape, small laptop, standard laptop, large laptop, desktop, and ultrawide modes.
- Screenshot evidence includes at least:
  - above-fold;
  - full-page or equivalent;
  - real scroll segment(s) below the first fold.

## Technical acceptance

- `pnpm-lock.yaml` unchanged.
- No package/manifest edits.
- No shell primitive edits unless explicitly justified.
- No shared primitive edits unless explicitly justified.
- Tests cover fixture-only and read-model-driven paths.
- All modified files pass typecheck, tests, prettier check, and `git diff --check`.

## Scorecard acceptance

The local agent may say the implementation is designed to improve the scorecard posture. It must not claim:

- final 100/100;
- final 95+/100;
- Phase 4 readiness;
- hard-stop closure;
- Playwright-driven final score.

Final scoring is expert-reviewed.

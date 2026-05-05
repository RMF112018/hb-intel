# 04 — Shared System Remediation Blueprint

## 1. Purpose

This file defines the shared-system corrections required before surface-specific remediation. These are the highest-leverage Wave 15A changes.

## 2. Shared Shell

### Current Failure Mode

The current PCC shell is visually dominant. It presents preview/build metadata and module navigation with more force than the operational project state.

### Target Behavior

The shell should quietly frame the work. The project state and current surface should dominate.

### Required Remediation

- Reduce top header height.
- Reduce left nav width or visual mass.
- Move build/wave/fixture diagnostics into a compact status region or diagnostics drawer.
- Add persistent project context band.
- Add surface state indicator.
- Preserve search only if it has clear scope and utility.
- Ensure scroll ownership is predictable under SharePoint chrome.

### Acceptance Criteria

- Project identity appears before or at the same priority as the product title.
- Operational status is more prominent than preview metadata.
- Tenant screenshots show no wasted vertical header stack.

## 3. Navigation

### Current Failure Mode

Navigation presents modules as a flat list.

### Target Behavior

Navigation should support workflow orientation and risk awareness.

### Required Remediation

- Group nav into:
  - Command
  - Controls
  - Governance
  - Connected Systems
- Add lightweight status indicators.
- Improve active state.
- Add keyboard/focus support.
- Avoid large high-saturation active blocks that dominate the page.

### Acceptance Criteria

- Users can see what area is active and what requires attention.
- Nav communicates operational relationship between modules.

## 4. Project Context Band

### Required Fields

- Project number.
- Project name.
- Phase/status.
- Risk/readiness posture.
- Source/data state.
- Last refreshed timestamp.
- Optional current user role/persona when relevant.

### Required Behaviors

- Present on every surface.
- Collapse gracefully on constrained widths.
- Provide enough context without repeating full Project Home metadata.

### Acceptance Criteria

- User never loses project context while navigating.

## 5. Surface Header Component

### Required Fields

- Surface label.
- Purpose statement.
- Current state.
- Primary next action.
- Key limitation if preview/read-only.
- Source confidence where applicable.

### Acceptance Criteria

- Every surface starts with purpose + status + next action.
- Headings are consistent across the app.

## 6. Grid and Layout System

### Current Failure Mode

The Team & Access page demonstrates severe layout failure. Other surfaces show equal-weight cards and empty canvas.

### Target Behavior

The grid should support surface comprehension and SharePoint constraints.

### Required Layout Patterns

- Full-width command panel.
- Two-column operational split.
- Three/four-metric summary row.
- Side-by-side queue + detail.
- Responsive single-column collapse.
- Compact reference card grid.
- No unintended narrow-column-only rendering.

### Required Tests

- Surface render tests.
- Span assignment tests.
- Constrained-width tests where feasible.
- Snapshot or visual regression tests if the repo supports them.

## 7. Card Hierarchy

### Tier 1 — Command Card

Use for:

- project health
- readiness posture
- access posture
- site health top risk
- document control state
- approval queue posture

### Tier 2 — Operational Card

Use for:

- work queues
- health checks
- document lanes
- team roster
- lifecycle gates
- integration cards

### Tier 3 — Reference Card

Use for:

- notes
- metadata
- policy references
- diagnostics
- last run detail

### Acceptance Criteria

- Only true primary content gets Tier 1 visual weight.
- Reference content does not compete with action content.
- Every surface has a deliberate card hierarchy.

## 8. State Model Component System

Required components or patterns:

- State banner.
- Inline state chip.
- Empty state panel.
- Blocked state panel.
- Degraded data notice.
- Preview action explanation.
- Disabled-control explanation.

Each must support:

- state kind
- severity
- operational consequence
- next step
- owner/resolution where applicable

## 9. Accessibility

Shared system requirements:

- Visible focus states.
- Keyboard-accessible nav and actions.
- Proper button/link semantics.
- Disabled controls with explanatory text.
- No reliance on color alone.
- Adequate contrast.
- Meaningful headings and landmarks.

## 10. Host Fit

Required validation:

- SharePoint published mode.
- SharePoint edit mode.
- Top Microsoft chrome present.
- Site header present.
- Page command bar present.
- Left app rail present.
- Vertical scrollbar present.
- Common laptop widths.

## 11. Shared System Exit Criteria

Before surface remediation begins:

- Shell no longer dominates content.
- Project context band exists.
- Surface header standard exists.
- Navigation is grouped and state-aware.
- Card tiers exist.
- Grid span failure is fixed.
- State model standard exists.
- Tests cover key shared behaviors.

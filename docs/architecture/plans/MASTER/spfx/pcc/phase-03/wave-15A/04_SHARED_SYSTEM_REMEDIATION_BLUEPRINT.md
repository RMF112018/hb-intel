# 04 — Shared System Remediation Blueprint

## 1. Purpose

This document defines Wave 15A remediation requirements for shared PCC systems: shell, navigation, project context, layout, cards, state components, accessibility, and host fit.

Shared-system work must precede surface-local polish.

## 2. Shared Shell

### Current Failure Mode

A technically valid shell can still underperform if it frames modules without establishing a decisive command-center posture.

### Target Behavior

The shell should:

- Respect SharePoint host boundaries.
- Establish PCC as a productized project control center.
- Keep project identity visible.
- Identify active surface.
- Provide command/search/HBI entry.
- Avoid crowding the working canvas.
- Support tenant-hosted and responsive contexts.

### Required Remediation

- Verify host chrome boundary.
- Verify app canvas fit.
- Verify active surface labelling.
- Verify project context clarity.
- Verify shell density across breakpoints.
- Verify keyboard navigation.
- Verify edit-mode and constrained-container resilience.

### Acceptance Criteria

- Supports P1, P3, P7, P8, and P9.
- No host-fit hard stop.
- No navigation hard stop.
- No accessibility hard stop.

## 3. Navigation

### Current Failure Mode

Module tabs can become a learned-navigation burden if they only expose surface names.

### Target Behavior

Navigation should:

- Make the active location unmistakable.
- Support work-center movement.
- Reduce module hunting.
- Reinforce lifecycle continuity.
- Support keyboard and responsive behavior.

### Required Remediation

- Validate active tab state.
- Validate tab/panel relationships.
- Consider status/priority cues where appropriate.
- Ensure overflow behavior works in constrained widths.
- Ensure keyboard Arrow/Home/End/Enter/Space behavior remains intact.

### Acceptance Criteria

- Users know where they are.
- Users can move from project status to relevant surface without confusion.
- Navigation does not reproduce incumbent dense module navigation as the dominant mental model.

## 4. Project Context Band

### Required Fields

The context band should include only what improves orientation:

- PCC identity.
- Project name.
- Active surface.
- Surface-specific purpose.
- Project stage/phase.
- Key project facts where useful.
- Command/search/HBI affordance.
- Source confidence where relevant.

### Required Behaviors

- Compact at constrained widths.
- Does not become a data dump.
- Does not crowd primary work.
- Does not rely only on color/status badges.
- Supports screen-reader and keyboard use.

### Acceptance Criteria

- Project context is visible and useful.
- First-screen hierarchy improves.
- Field/tablet density remains usable.

## 5. Surface Header Component

### Required Fields

A surface header should clarify:

- Surface title.
- Surface purpose.
- Current operating state.
- Primary next action or limitation.
- Source/degraded/read-only posture where relevant.

### Acceptance Criteria

- Users understand what the surface is for before reading the cards.
- Preview/read-only/deferred surfaces are not misleading.
- HBI authority boundaries are clear where HBI appears.

## 6. Grid and Layout System

### Current Failure Mode

Bento grids can solve placement mechanics while still creating a dense card wall.

### Target Behavior

Layout should:

- Prioritize command cards.
- Group related operational content.
- Subordinate reference content.
- Prevent equal-weight overload.
- Preserve scanability across breakpoints.

### Required Layout Patterns

- Primary command row.
- Operational work zone.
- Supporting/reference zone.
- State/diagnostic zone.
- Responsive row/column behavior.
- Full-scroll scanability.

### Required Tests / Evidence

- Direct-child bento invariants.
- Row-span stability.
- Breakpoint screenshots.
- Full-scroll screenshots.
- Overflow/clipping checks.
- Short-height checks.

## 7. Card Hierarchy

### Tier 1 — Command Card

Used for:

- Project intelligence.
- Priority actions.
- Critical risk/status.
- Highest-value decisions.

Required qualities:

- Visually dominant but not decorative.
- Clear owner/action.
- Not overused.

### Tier 2 — Operational Card

Used for:

- Queues.
- Work in progress.
- Blockers.
- Reviews.
- Health checks.

Required qualities:

- Actionable.
- Clear state and owner.
- Compact.
- Not visually equal to command cards.

### Tier 3 — Reference Card

Used for:

- Logs.
- Registry information.
- Passive context.
- Historical summaries.

Required qualities:

- Subordinate hierarchy.
- Progressive disclosure where possible.
- Clear purpose.

### State Card

Used for:

- Empty.
- Error.
- Read-only.
- Preview.
- Degraded.
- Deferred.
- Unauthorized.
- Missing configuration.

Required qualities:

- Meaning, impact, owner, next step.
- Does not imply broken UI when the state is intentional.

## 8. State Model Component System

Shared state components must support:

- Title.
- Status/severity.
- Explanation.
- Impact.
- Owner/system.
- Next step.
- Optional action.
- Optional source confidence.
- Optional timestamp/freshness.
- ARIA alert/status behavior where applicable.

## 9. Accessibility

Shared systems must support:

- Keyboard reachability.
- Logical focus order.
- Focus-visible states.
- ARIA labels and relationships.
- Color-independent status.
- Contrast.
- Reduced motion.
- Touch target adequacy.
- No hover-only critical meaning.

## 10. Host Fit

Shared systems must prove:

- SharePoint-hosted canvas fit.
- No fake shell.
- No host chrome collision.
- Edit-mode resilience.
- Console/runtime stability.
- Package/version alignment.
- High-zoom behavior.
- Constrained width behavior.

## 11. Shared System Exit Criteria

Shared-system remediation is complete only when:

- Shell, navigation, grid, card, and state primitives are stable.
- The major hard stops tied to shared systems are closed.
- Project Home and other surfaces can consume the primitives without surface-local hacks.
- Evidence exists for source, screenshot, tenant, breakpoint, and accessibility categories.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`


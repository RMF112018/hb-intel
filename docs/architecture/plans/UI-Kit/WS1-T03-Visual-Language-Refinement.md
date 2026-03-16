# WS1-T03 — Visual Language Refinement

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for visual language audit and refinement. Sets the token system, color, shape, typography, and surface treatment baseline that T04–T07 must implement against.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase B (begins after T01 and T02 complete)
**Depends On:** T01 maturity matrix (identifies current visual inconsistencies); T02 mold-breaker principles (governs refinement direction)
**Unlocks:** T04 hierarchy overhaul; T05 density refinement; T06 data surface implementation; T07 component polish
**Estimated Effort:** 2–3 working sessions

---

## Objective

Perform a full audit and refinement of `@hbc/ui-kit`'s visual language: the color system, semantic status palette, shape language, surface roles, typography, spacing, borders, radii, shadows, and motion patterns. Exit with a normalized, intentional, and aesthetically excellent visual foundation that every subsequent task in this workstream can build against.

The hard requirement is that tokenization compliance is not sufficient. The output must be aesthetically excellent.

---

## Why This Task Exists

A design token system that is technically complete but visually unbalanced produces pages that feel inconsistent even when they are technically compliant. Tokens define ranges; visual language refinement decides where within those ranges the kit lands — and ensures those decisions are coherent, purposeful, and premium.

T03 exists because the kit may have correct token architecture but unresolved decisions about how those tokens are used: colors that are technically named correctly but feel unbalanced, spacing values that are consistent within a component but jarring across compositions, or shape language that varies between newer and older components without intent.

---

## Scope

T03 covers:

1. Color system audit and refinement (brand palette, neutral scale, semantic colors, interactive states)
2. Semantic status palette normalization for strong scanning and field legibility
3. Shape language normalization (cards, inputs, buttons, menus, tabs, pills, dialogs, panels, tables)
4. Border, radius, divider, shadow, and surface-transition normalization
5. Surface role definition and enforcement (base canvas, secondary canvas, cards, inset panels, toolbars, overlays, focused work zones)
6. Typography refinement (scale, weight contrast, line height, letter spacing, icon alignment)
7. Motion pattern review (what animates, at what speed, and whether motion aids or distracts)
8. Elimination of visually awkward or inconsistent component-level styling decisions

T03 does not cover:

- Defining density modes (that is T05)
- Defining hierarchy rules (that is T04, though T03 establishes the tools T04 uses)
- Component-level polish sweeps (that is T07, though T03 output sets the standard T07 implements against)
- Accessibility contrast validation (partially overlaps with T09; T03 should flag issues but T09 owns the audit)

---

## Required Actions

### Color system

- Audit the full color palette for visual balance, premium feel, and controlled usage
- Confirm that the brand palette is sufficiently differentiated from the construction-tech category average (no "generic blue enterprise" appearance)
- Normalize interactive state colors (hover, active, focus, disabled) so they follow a consistent model across all component families
- Eliminate ad-hoc color decisions made at component level that bypass the token system

### Semantic status palette

- Audit all status/state color usages: success, warning, error, info, pending, neutral
- Ensure the status palette provides strong contrast differences for rapid scanning
- Ensure status colors remain legible in both standard and high-brightness conditions (field use)
- Normalize status color usage across badges, inline messages, row states, and notification surfaces

### Shape language

- Audit border-radius usage across all component families
- Define a normalized radius scale with clear intent: sharp for data-dense surfaces, moderate for interactive elements, softer for cards and modals
- Ensure shape language does not vary arbitrarily between older and newer components
- Eliminate radius inconsistencies that create visual seams between component families

### Surface roles

Define and document clear surface roles:

| Surface | Role | Visual treatment |
|---------|------|-----------------|
| Base canvas | Primary page background | Lowest elevation |
| Secondary canvas | Sidebar, drawer background, secondary panels | Subtle differentiation from base |
| Cards | Grouped content units | Elevation and/or border to separate from canvas |
| Inset panels | Contained sub-sections within a surface | Recessed treatment |
| Toolbars | Command and filter areas | Distinct from content area; does not compete |
| Overlays | Dialogs, popovers, dropdowns | Highest elevation; clear shadow/backdrop |
| Focused work zones | Detail areas that require user attention | Focus affordance without shouting |

Each surface role must have a defined token combination so any component can correctly place itself in the visual stack.

### Typography

- Audit the type scale for visual rhythm: are adjacent text levels perceptibly distinct?
- Confirm weight contrast is strong enough to drive hierarchy (body vs. label vs. heading vs. display)
- Audit line height and letter spacing for readability in both dense and standard density modes
- Ensure icon sizing and alignment with adjacent text is consistent
- Eliminate per-component typography decisions that bypass the scale

### Motion

- Audit all animation and transition usage in the kit
- Confirm that motion is purposeful (communicates state change, spatial relationship, or focus) rather than decorative
- Ensure motion respects `prefers-reduced-motion` throughout
- Remove or simplify animations that add latency without user benefit

---

## Governing Constraints

- **T02 mold-breaker principles govern direction.** Every refinement decision must be compatible with the mold-breaker principles, particularly the principles on cognitive load, depth, and field readability.
- **No tokenization without aesthetic intent.** Defining a new token is not sufficient — the token value itself must be correct.
- **Backward-compatible changes preferred.** Where a token refinement changes an existing visual output, assess the consumer impact before shipping. Breaking visual changes to stable Tier A components require explicit justification.
- **T04 owns hierarchy, T03 establishes the tools.** T03 should produce a color, type, and spacing system rich enough for T04 to define strong hierarchy rules. T03 does not define the hierarchy rules themselves.

---

## Acceptance Criteria

- [x] Color system is balanced, premium, and consistently applied — no ad-hoc component-level color overrides remain
- [x] Semantic status palette provides strong scanning distinction and is field-legible
- [x] Shape language is normalized across all component families with a clear radius intent model
- [x] All seven surface roles are defined with token combinations documented
- [x] Typography scale has perceptible weight contrast across levels and consistent icon alignment
- [x] Motion patterns are purposeful, reduced-motion compliant, and documented
- [x] All visual inconsistencies identified in T01 maturity matrix that fall within T03 scope are resolved
- [x] No visually awkward or unexplained per-component styling decisions remain in `@hbc/ui-kit`
- [ ] T04 and T07 authors confirm the refined visual language is a sufficient implementation baseline

---

## Known Risks and Pitfalls

**Risk T03-R1: Token proliferation.** Refining the visual language may tempt the addition of many new tokens for edge cases. Prefer normalizing values over multiplying tokens. A smaller, well-chosen token set is more maintainable than an exhaustive one.

**Risk T03-R2: Breaking stable components.** Color or shape refinements can silently break visual regression tests on Tier A components. Document any intentional visual changes and update baselines deliberately.

**Risk T03-R3: Typography changes affect layout.** Type scale changes affect line height, which affects component height, which can affect layout. Changes to the scale must be assessed for downstream composition impact before landing.

---

## Follow-On Consumers

- **T04:** Uses the refined type scale, color system, and surface roles to define hierarchy rules
- **T05:** Uses the color and spacing refinements to define density mode tokens
- **T06:** Uses the refined surface roles and shape language for data surface design
- **T07:** Implements all T03 refinements component by component during the polish sweep
- **T10:** Documents the refined visual language in `UI-Kit-Visual-Language-Guide.md`
- **T13:** Evaluates "color," "typography," and "spacing rhythm" dimensions of the production-readiness scorecard against T03 outputs

---

*End of WS1-T03 — Visual Language Refinement v1.0 (2026-03-15)*

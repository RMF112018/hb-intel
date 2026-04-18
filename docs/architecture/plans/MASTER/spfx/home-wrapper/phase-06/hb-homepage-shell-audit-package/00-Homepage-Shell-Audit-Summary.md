# 00 — Homepage Shell Audit Summary

## Objective

Audit the HB Central homepage shell against:

- repo-truth in `main`
- the governing SPFx doctrine
- the HB shell entry breakpoint spec
- the current rendered state shown in the screenshots
- benchmark-grade homepage and intranet principles

## Executive conclusion

The homepage is **not yet close to a flagship end state**.

The strongest code already exists in the right places:

- a canonical signature hero
- a governed shell with preset, slot, occupant, and breakpoint policy layers
- protected-vs-configurable governance for future layout control
- a dedicated priority-actions surface
- modular homepage applications that are already routed through shared premium surface families

However, the current rendered experience still breaks the intended flagship model in three visible ways:

1. **Brand + action + value is not landing on first view at the laptop baseline.**
2. **The action layer is still behaving like a flat directory instead of a governed priority system.**
3. **The shell allows empty or low-value states to consume early-page real estate before the best available content takes over.**

## Preserve-this strengths

- Separate SPFx entry surfaces for hero, actions, and shell are structurally defensible.
- `HbHomepageShell` already has a strong control-plane foundation: preset parsing, occupant registry, protected decisions, container-aware band resolution, and diagnostics.
- The module ecosystem is already moving toward shared premium surface families rather than one-off card styling.
- The future control-panel boundary is substantially better defined than in most enterprise intranet builds.

## Highest-risk weaknesses

### 1. Entry stack failure at the real laptop baseline
The current 14-inch MacBook Pro screenshot at 100% shows the hero and utilities consuming too much decision space before the user reaches meaningful shell value.

### 2. OOB Quick Links are still acting as a directory
The current quick-links band is visually equal-weight, overexposed, and not governed by breakpoint-aware action budgets or overflow behavior.

### 3. Empty-state-first sequencing
The shell currently lets no-data modules consume top-of-shell positions. That makes the homepage feel stale and low-value even when stronger content exists lower in the composition.

### 4. Governance is split between authored page layout and governed shell logic
The shell has a thoughtful architecture, but the flagship page still relies on mixed page authoring choices outside the shell, especially the separate OOB quick-links row.

## Most important implementation decision

Do **not** solve this with cosmetic restyling only.

The right solution is:

- keep the shell architecture,
- tighten the entry stack,
- replace the OOB utility row,
- promote non-empty high-value modules earlier,
- and formalize control-panel-safe layout contracts now.

## Recommended wave split

### Wave 01 — Flagship correction
Immediate production-facing remediation:
- entry-stack correction
- PriorityActionsRail adoption
- first-lane recomposition
- empty-state demotion
- breakpoint and harness validation

### Wave 02 — Structural hardening
Future-safe architecture:
- preset library expansion
- bounded configurability contracts
- control-panel groundwork
- shell-fit contracts for all hosted occupants
- optional discovery / workhub integration strategy

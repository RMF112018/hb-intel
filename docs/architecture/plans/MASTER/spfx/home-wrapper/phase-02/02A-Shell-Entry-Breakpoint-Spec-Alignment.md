# 02A — Shell Entry Breakpoint Spec Alignment

## Governing source

This package is now aligned to:

- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

That file is treated here as the governing local shell entry-state target.

## Why this file exists

The breakpoint spec introduces a more exact shell-entry doctrine than the earlier package captured.

The package previously treated breakpoint work as a general container-awareness and responsive-orchestration problem.

That remains true, but it is no longer sufficient.

The shell now needs to encode the specific entry-state expectations in the spec.

## Boundary clarification

The entry stack in the spec is:

1. independent flagship hero
2. top actions / utility band
3. first shell lane

This package remains **shell-only** and **post-hero**.

That means:

- the shell still does **not** absorb `hbSignatureHero`
- the shell still does **not** broadly redesign the current quick-links layer in this package
- but the shell **does** need to implement and validate its own first-lane behavior in a way that preserves the spec’s first-screen value-density goals

## What becomes a shell requirement now

### 1. Practical shell design targets
Use the spec’s practical usable-width ranges as the real shell entry targets.

Do not design shell behavior against raw hardware resolutions alone.

### 2. Named entry states
The shell should define named entry states aligned to the spec’s practical target ranges.

A workable example mapping is:

| Shell entry state | Practical target |
|---|---|
| `ultrawide` | 1600–2200 px usable shell width |
| `desktopBaseline` | 1180–1400 px usable shell width |
| `tabletLandscape` | 980–1250 px usable shell width |
| `tabletPortrait` | 720–950 px usable shell width |
| `phonePortrait` | 375–430 px usable shell width |
| `shortHeightConstrained` | height-constrained state regardless of generous width |

The exact state names may vary, but the implementation should encode an equivalent model.

### 3. First-lane visibility
At every major entry state, the beginning of the first shell lane must be visible on initial load.

That requirement must show up in:
- shell orchestration logic
- first-lane policy
- validation artifacts
- closure criteria

### 4. Conditional first-lane pairing
A two-column first lane is conditional, not automatic.

The first lane may only pair occupants when both remain:
- readable
- balanced
- premium-looking
- interaction-safe
- free of awkward internal compression

Otherwise the shell must stack.

### 5. Forced single-column entry states
Tablet portrait, phone portrait, and phone landscape / short-height states should default to disciplined single-column first-lane behavior.

This should be treated as a protected shell decision unless a later spec update says otherwise.

### 6. Occupant narrowest stable mode
Each early-entry occupant should declare a narrowest stable mode or comfort threshold for:
- dominant first-lane placement
- paired first-lane placement
- compact / demoted rendering
- stacked fallback

### 7. Entry-state adjacency budgets
Even though this package does not fully redesign the utility/actions layer, the shell package should now define compatible adjacent assumptions for future alignment, including:
- visible primary-action budgets by entry state
- the expectation that the first shell lane begins sooner below the utility band
- no shell top padding / spacing assumptions that bury the first lane

## What does **not** become shell scope now

The following remain out of scope for this package unless they are needed only as ultra-light proof harnesses:

- moving the hero into `hbHomepage`
- rebuilding the hero implementation itself
- broadly replacing SharePoint quick links with a full Top Actions product
- standalone redesign briefs for child webparts

## Prompt mapping

| Prompt | Breakpoint-spec alignment work |
|---|---|
| Prompt 01 | encode named entry-state breakpoint policy and first-lane-related schema metadata |
| Prompt 02 | make the first shell lane an explicit shell concept rather than a generic first band |
| Prompt 03 | implement spec-aligned container-aware resolution and first-lane behavior |
| Prompt 05 | encode occupant first-lane eligibility and narrowest stable modes |
| Prompt 06 | protect entry-state decisions in presets and persistence rules |
| Prompt 07 | validate shell closure against the spec’s first-lane and narrow-state acceptance criteria |

## Closure implication

A shell implementation is not complete merely because it is responsive.

It must now also prove that:
- the first shell lane begins on first load
- portrait and handheld states are stable and single-column where required
- first-lane pairing is conditional and shell-fit-driven
- the shell does not read as “branding first, homepage later”

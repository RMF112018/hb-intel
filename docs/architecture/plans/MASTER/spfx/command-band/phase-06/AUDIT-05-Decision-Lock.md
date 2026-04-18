# 05 — Decision Lock

## Locked decisions

### DL1 — Preserve wrapper ownership
The rail stays in the wrapper-owned pre-shell region.

### DL2 — Do not shell-ize the rail
Do not move the rail into shell occupant, band, slot, preset, or module-config semantics.

### DL3 — Introduce an explicit flagship contract
The homepage-facing rail must have an explicit flagship context / variant / contract so the public result is intentional, not incidental.

### DL4 — Solve the visual problem where it actually lives
The primary remediation surfaces are:
- `HbHomepageEntryStack.module.css`
- `PriorityActionsRail.tsx`
- `priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcPriorityRail/**`

### DL5 — Prefer already-installed stack members
Before adding any new dependency, use what is already in repo where justified:
- Floating UI
- Radix Scroll Area
- Radix Tooltip
- motion
- lucide-react
- CVA
- clsx

### DL6 — Breakpoint governance is non-negotiable
Any redesign must preserve or strengthen:
- visible-action budgets by breakpoint
- first shell-lane begins on first view
- short-height compact posture
- single-column fallback where required

### DL7 — Hosted proof governs closure
No code-path-only claim counts as final closure.

## Locked non-goals

- turning the rail into a shell slot occupant
- decorative shell mimicry inside page content
- desktop-only layout decisions
- a purely cosmetic repaint that keeps the same timid hierarchy
- deferring docs/validation discipline to a later wave

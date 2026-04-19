# Audit 05 — Enhanced Remediation Strategy

## Strategy objective

Preserve the good architecture.
Replace the weak product surface.
Harden the closure rules so the launcher cannot regress back into “changed but still weak.”

## Recommended strategy

## 1. Treat this as a primitive-family rebuild, not a polish pass
Do not try to salvage the chip band through padding, radius, or minor color changes.

That path has already failed conceptually.
The problem is the primitive family, not only the paint.

## 2. Introduce a launcher tile family with explicit variants
Recommended tile variants:

- `primary`
- `secondaryOverflowEntry`
- `mobileEntry`

Optional future-safe variants if helpful:
- `grouped`
- `quiet`
- `disabled`

This should be implemented as an explicit variant system, not conditional class sprawl.

## 3. Keep the current wrapper/data path intact
Avoid unnecessary churn in:
- `HbHomepageEntryStack`
- `HbHomepageLauncherBand`
- `usePriorityActionsData`
- audience/schedule/device filtering

The rebuild should happen primarily beneath those seams unless a prompt explicitly widens scope.

## 4. Reframe overflow as family membership, not escape hatch
`More Tools` should become a tile in the row, not a utility button floating beside the row.

The hierarchy should be:
- same family
- clearly secondary
- still visibly related
- orange brand posture
- accessible and touch-safe

## 5. Add a true handheld launcher mode
For small handheld:
- do not preserve visible primary tiles
- do not preserve the current 3-item primary budget
- do not preserve overflow-only content strategy

Instead:
- show one mobile entry tile
- open a drawer / sheet
- show all tools inside
- present them as the same launcher family, adapted for handheld

## 6. Use the approved premium stack deliberately
The current stack already permits a strong solution.

Recommended usage posture:
- `class-variance-authority` for launcher tile variants
- `clsx` for readable class assembly
- `motion/react` for restrained hover/press and drawer entrance/exit
- `@floating-ui/react` for anchored desktop/tablet overflow where relevant
- the existing Radix-aligned primitives only where they materially help
- no new dependency unless it materially simplifies accessibility or interaction correctness

## 7. Strengthen the closure model
Closure should require:
- hosted screenshots
- DOM marker proof
- explicit breakpoint matrix validation
- desktop/tablet/phone screenshots
- test pass proof
- packaged parity proof
- written statement that the final launcher no longer reads as a button strip

## Recommended implementation decomposition

### Prompt 01
Primitive/tile-family rebuild

### Prompt 02
Inline orange `More Tools` tile

### Prompt 03
Small-handheld single-entry tile and full tools drawer

### Prompt 04
Contract/adapter/breakpoint expansion

### Prompt 05
Tests + hosted proof + closure

## Out-of-scope guardrail

Do not drift into unrelated homepage shell or hero work unless a launcher change exposes a direct dependency that must be touched for the launcher to function correctly.

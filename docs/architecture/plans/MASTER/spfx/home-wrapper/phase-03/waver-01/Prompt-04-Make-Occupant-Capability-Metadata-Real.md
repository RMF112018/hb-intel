# Prompt 04 — Make occupant capability metadata materially affect layout resolution

## Objective
Upgrade the shell from “capability metadata exists” to “capability metadata governs real layout decisions.”

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The shell stores useful metadata such as:
- `preferredWidth`
- `supportsCompact`
- `supportsSummaryCollapse`
- `prominenceCeiling`

but the resolver mainly acts on minimum width and pairability.

## Required implementation outcome
- use the existing metadata to drive real slot/band decisions
- introduce explicit compact or summary-collapse behavior only where the occupant supports it
- enforce prominence ceilings through shell logic rather than prose alone
- keep tablet portrait and phone single-column behavior protected and non-configurable

## Closure proof required
Provide:
- description of which capability fields are now active in runtime behavior
- example of how the resolver changes output based on those capabilities
- any added tests or validation diagnostics

## Prohibited
- no freeform drag-and-drop system
- no unrelated module-level redesign

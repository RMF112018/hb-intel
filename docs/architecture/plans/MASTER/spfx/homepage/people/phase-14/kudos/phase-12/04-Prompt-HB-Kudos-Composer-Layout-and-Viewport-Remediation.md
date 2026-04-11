# 04 — Prompt: HB Kudos Composer Layout and Viewport Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

After the shared hosted overlay and footer-clearance fixes are in place, rebalance the HB Kudos composer layout so it is stable, readable, and comfortably usable at standard 100% browser zoom in SharePoint.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`

## Required outcomes

- the composer must be usable at 100% browser zoom
- density must feel deliberate, not cramped
- the recipients area must not visually fight the rest of the form
- preview, form sections, and footer must fit together coherently
- the sheet width and internal section spacing must feel correct for desktop SharePoint use
- the layout must not depend on the user shrinking the browser zoom

## Required implementation direction

Review and adjust as needed:

- sheet width on desktop
- header/body/footer spacing relationship
- recipients area spacing
- progressive-disclosure section spacing
- message/details spacing
- preview separation and rhythm
- action row spacing relative to the body
- standard desktop viewport behavior

## Explicit prohibition

Do not use reduced browser zoom as a compensating mechanism.
Do not claim closure because the UI “fits better at 90%.”

## Deliverables

Provide:
- files changed
- concise rationale for each significant spacing or layout change
- proof that the layout now works at 100% zoom

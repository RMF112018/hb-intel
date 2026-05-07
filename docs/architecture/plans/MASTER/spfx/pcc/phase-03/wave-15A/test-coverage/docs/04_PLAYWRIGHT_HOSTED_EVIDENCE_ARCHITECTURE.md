# Playwright Hosted Evidence Architecture

## Config

`playwright.pcc-live.config.ts`

- No `webServer`.
- Uses `PCC_LIVE_STORAGE_STATE`.
- Serial workers.
- Chromium default.
- Optional Brave executable project only if `PCC_LIVE_BRAVE_EXECUTABLE_PATH` exists.
- Trace retain-on-failure.
- HTML report disabled or non-opening by default.

## Page Object

`PccLivePage` responsibilities:

- Navigate to PCC live page.
- Wait for PCC root/grid.
- Navigate to a surface.
- Return active grid.
- Return active command card.
- Capture console/page errors.
- Capture screenshot artifacts.
- Extract DOM summaries.

## Surface Registry

Eight surfaces:

- project-home
- project-readiness
- documents
- external-systems
- approvals
- team-and-access
- site-health
- control-center-settings

## Breakpoint Registry

Must include desktop, large laptop, standard laptop, small laptop, tablet landscape, tablet portrait, phone width, short-height, ultrawide, constrained-canvas, and high-zoom best-effort.

## Selector Rule

Use `data-pcc-*` selectors first. Never depend on SharePoint-generated classes.

# Prompt 03 — Consolidate Launcher Verification and Produce Final Hosted Closure Evidence

## Objective
Make launcher closure proof easy to run, easy to review, and hard to fake.

## Governing repo authorities
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- relevant launcher proof docs under `docs/architecture/plans/MASTER/spfx/launcher/`

## Files / seams to inspect
- `package.json`
- `playwright.webparts.config.ts`
- launcher proof specs under:
  - `e2e/webparts/`
  - `e2e/live-sharepoint/`
- launcher proof artifact folders under `docs/architecture/plans/MASTER/spfx/launcher/`

## Current gap to close
The repo contains strong proof files, but there is not yet one crisp launcher-closure path that clearly runs the right tests, captures the right artifacts, and produces a final evidence package without guesswork.

## Required implementation outcome
Create a consolidated launcher verification posture that:
- exposes a dedicated launcher proof command or command cluster
- runs the correct proof files together
- stores artifacts in a stable, obvious location
- produces a final closure report or README summarizing the evidence
- makes it easy to verify:
  - row parity
  - `More Tools` parity
  - handheld `HB Toolbox` behavior
  - drawer dimensions and rail behavior
  - runtime version markers
  - live SharePoint handheld proof where environment variables permit

## Proof of closure required
Provide:
- the exact commands to run
- the exact artifacts produced
- the final closure report location
- the fresh screenshot/evidence set
- a concise statement of whether the launcher now clears flagship review

## Prohibitions
- no unrelated CI changes
- no deletion of useful existing proof without replacement
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes

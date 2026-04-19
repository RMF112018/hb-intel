# HB Homepage Launcher — Fresh-Eyes Audit + Implementation Prompt Package

## Purpose

This package supersedes the prior launcher remediation framing.

It is built from a fresh-eyes repo-truth audit of the live `main` branch launcher path, reconciled against the binding homepage doctrine and benchmark package, the current source-defined surface behavior, and external design/accessibility research.

This package is intentionally more candid and more decisive than the earlier launcher packages.

## Core decision

The current homepage launcher does **not** primarily fail at the data-wrapper seam.

The current homepage launcher fails at the **primitive and surface layer**:

- the active homepage path is correctly routed through a new launcher surface instead of the old rail
- but that launcher surface is explicitly implemented as a **chip band / button strip**
- the current `More Tools` trigger is intentionally styled as a **separate white utility control**
- the current phone mode is **not** a handheld launcher mode; it is a reduced desktop row plus overflow
- the current tests and runtime expectations lock in those weak outcomes instead of preventing them

## What should be preserved

Preserve these seams unless a specific prompt says otherwise:

- `HbHomepageEntryStack` as the wrapper-owned entry stack owner
- `HbHomepageLauncherBand` as the hosted launcher integration seam
- `usePriorityActionsData` and the existing list-driven data pipeline
- audience / schedule / device filtering seams
- shell-entry-state and container-aware measurement posture
- the general idea of authoritative visible-count governance by breakpoint
- the package/runtime marker posture used to prove hosted cutover

## What must be rebuilt

Rebuild these seams materially:

- `HbcHomepageLauncher` primitive family
- `HbcHomepageLauncherChip` semantics and shape
- `HbcHomepageLauncherOverflow` interaction model and trigger family
- launcher contract shape where needed to support tile variants and handheld-entry mode
- phone-mode presentation logic so small handheld no longer renders a reduced row
- tests that currently codify the chip-band outcome as acceptable

## Package map

### Core
- `README.md`
- `Plan-Summary.md`

### Audit
- `Audit-00-Executive-Summary.md`
- `Audit-01-Live-Launcher-Architecture-and-Render-Path.md`
- `Audit-02-Rendered-Outcome-and-Root-Cause-Assessment.md`
- `Audit-03-Standards-Compliance-Assessment.md`
- `Audit-04-Enhanced-Issues-Register.md`
- `Audit-05-Enhanced-Remediation-Strategy.md`
- `Audit-06-Required-Implementation-Waves.md`

### Prompts
- `Prompt-01-Launcher-Primitive-Tile-Family-Rebuild.md`
- `Prompt-02-Inline-More-Tools-Orange-Secondary-Tile.md`
- `Prompt-03-Small-Handheld-Single-Entry-Tile-and-Drawer.md`
- `Prompt-04-Contract-Adapter-and-Breakpoint-Governance-Expansion.md`
- `Prompt-05-Tests-Hosted-Proof-and-Closure.md`

## Execution order

1. Read `Audit-00` through `Audit-06`.
2. Execute prompts in numeric order unless a prompt explicitly states a dependency adjustment.
3. Do not declare closure until `Prompt-05` proof requirements are fully satisfied.

## Non-negotiable closure rules

- Do **not** preserve pill-shaped chip/button anatomy as the premium launcher answer.
- Do **not** keep `More Tools` as a detached white outlined utility control.
- Do **not** keep the current phone mode that shows a reduced set of primary items plus overflow-only sheet.
- Do **not** close on source diffs alone.
- Do **not** close without hosted screenshots, runtime marker proof, and explicit validation of small-handheld behavior.

## Suggested external references used in this package

The audit posture in this package was strengthened using guidance from:

- Microsoft Learn — SharePoint full-width SPFx behavior
- Fluent 2 — button and menu usage
- W3C WCAG 2.2 — target size minimum
- Apple Human Interface Guidelines — sheets and action sheets
- Material responsive UI and bottom-sheet guidance
- design-system guidance distinguishing chips from primary CTA/tile surfaces

Use those references to support execution quality, not as excuses to dilute the repo’s governing doctrine.

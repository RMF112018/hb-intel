# Prompt 04 — Host Fit, Content Wrapper, and Scroll Behavior

## Role

You are the PCC Wave B host-fit and scroll-ownership remediation agent.

## Objective

Make the PCC shell and content wrapper resilient inside SharePoint-hosted published and edit modes, avoiding double scroll, horizontal overflow, and fixed viewport traps.

## Scope

Shell CSS, content canvas, bento wrapper interaction, responsive/container behavior tests, visual evidence.

## Non-Scope

No package deployment, no backend/API changes, no surface redesign except minimal wrapper/marker fixes required for host fit.

## Required Repo-Truth Inspection

Inspect Prompt 01–03 closeouts, `PccShell.module.css`, `PccBentoGrid.*`, `PccDashboardCard.*`, `useContainerBreakpoint`, footprint tests, SPFx host/manifest/package files if present, and host-runtime validation standard.

## Exact or Best-Known Source Areas

Likely files: `PccShell.module.css`, `PccShell.tsx`, `PccBentoGrid.module.css`, `PccBentoGrid.tsx`, tests and evidence docs.

## Implementation Requirements

Replace fragile viewport assumptions where needed; define app-owned shell/container sizing; maintain usable canvas; prevent horizontal overflow; preserve bento direct-child contract; ensure all routes render under constraints.

## Required Tests

Run footprint/grid tests, shell tests, all-surface smoke tests, typecheck, and build.

## Required Screenshot / Evidence Output

Capture local wide, constrained desktop, tablet landscape, tablet portrait, and phone screenshots. Capture tenant published/edit screenshots if available or log gap.

## Scorecard Impact

Targets doctrine/host compliance, breakpoint/shell fit, host-runtime resilience, validation evidence, and surface composition.

## Closeout Requirements

Create Prompt 04 closeout with screenshots and explicit host-fit pass/fail statements.

## Stop Conditions

Stop if a true host-fit claim requires tenant access that is unavailable; log local-only evidence and block final closure until tenant proof.


## Standing Instructions

- Inspect repo truth first.
- Do not rely on chat memory, assumptions, or prior summaries.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Avoid unrelated changes.
- Preserve architecture unless it conflicts with doctrine.
- Prefer shared primitives over one-off styling.
- Avoid backend/API scope creep.
- Update or create closeout documentation.
- Run repo-appropriate checks.
- Report exact files changed, command results, residual issues, and stop conditions.
- Never claim final 56/56 from Wave B alone.

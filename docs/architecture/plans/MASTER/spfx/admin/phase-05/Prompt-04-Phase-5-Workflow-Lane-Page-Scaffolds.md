# Prompt-04 — Phase 5 Workflow Lane Page Scaffolds

## Objective

Create the **workflow lane page scaffolds** that establish stable UI anchors for the Admin operator console.

This prompt should add the page and route shells needed for the Phase 5 lane model without pretending that later-phase backend functionality already exists.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Reuse existing page-shell and empty-state patterns already used in the Admin app.
- Keep scaffolds honest: clear purpose, clear current status, clear future hook points.
- Do not fake later-phase functionality.

## Inputs

Use:
- route taxonomy / page ownership map
- current Admin page patterns
- `WorkspacePageShell`
- existing `HbcSmartEmptyState`, banners, coaching callouts, and related patterns

## Required work

Add or update route/page shells for these lanes:

- Setup / Install
- Validation
- Runs / History
- SharePoint Control
- Entra Control
- Standards / Config
- Health / Alerts
- Error / Audit

## Required implementation posture

### Real-content lanes
Where current real functionality already exists, scaffold around that real content rather than creating empty placeholders.

Expected examples:
- Runs / History should become a real lane that can host provisioning oversight and current run-oriented surfaces.
- Health / Alerts should reuse the current dashboard/alert/probe posture.
- Error / Audit should preserve the current deferred state honestly if no durable surface exists yet.

### Scaffold-only lanes
Where functionality is not ready yet, add honest shells with:
- purpose statement
- what this lane will own later
- what is currently available
- clear links to current nearby functionality if useful

## Required file organization

Choose a clean page organization structure under `apps/admin/src/pages/` that fits the repo.
If it materially improves maintainability, group Phase 5 lane pages in a subfolder.
Do not perform a gratuitous reorganization.

## Validation

Before finishing:
- verify the route set and page shells align,
- verify empty-state / scaffold messaging is accurate,
- verify the app does not claim unimplemented later-phase behavior,
- verify existing real pages are not accidentally replaced with worse placeholders.

## Completion condition

Stop after the operator-console lane shells exist and are wired into the route model.
Do not fully rehome the existing pages in this prompt unless a minimal wrapper is required.

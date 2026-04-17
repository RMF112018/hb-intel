# Prompt 06 — PriorityActionsRailAdmin Webpart

## Objective
Create `PriorityActionsRailAdmin` as a full maintainer-facing SPFx webpart that delivers guided authoring, reorder, validation, and preview workflows using the same shared rail surface family as production.

## Current-state repo-truth
- The current `main` branch webpart inventory does not show `priorityActionsRailAdmin`, so this is a net-new webpart in the package.
- `HbHeroBannerAdmin` exists and should be treated as the closest structural authoring precedent.
- The shared public rail and admin backend/state layers should already exist by the time this prompt runs.

## Relevant SharePoint list-schema truth
The admin must let maintainers operate against the canonical two-list model, not a fake local model:
- config row editing maps to `Priority Actions Band Config`
- item authoring maps to `Priority Actions Band Items`
- `BandKey`, `ActionKey`, `SortOrder`, `ItemStatus`, visibility fields, audience fields, and schedule fields must remain explicit
- preview must be driven by the normalized shared contract, not by a separate admin-only interpretation

## Why the current implementation is insufficient
Without this webpart, maintainers must still rely on raw SharePoint list editing or incomplete tooling, which directly violates the carried-forward spec. The missing admin is one of the largest repo-truth gaps in the package.

## Relevant governing doctrine / benchmark authorities
- authoring safety is binding
- benchmark-grade authoring requires structured draft state, validation, preview, success/error/discard flows, and reliable write seams
- the surface may use some Fluent primitives where ergonomically justified, but Fluent cannot become the dominant premium language
- the admin must remain a SharePoint-hosted page-canvas surface, not a fake app shell

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- `apps/hb-webparts/src/webparts/hbHeroBannerAdmin/`
- outputs from Prompt 03 and Prompt 05
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/models/`
- carried-forward spec and doctrine docs

Create expected files:
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdminWebPart.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.manifest.json`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.module.scss` or equivalent

Required regions:
- band settings
- action library/editor
- reorder/prioritization
- validation summary
- preview

## Required implementation outcome
Deliver a maintainer authoring webpart that supports:
- load current live config/items
- add action
- edit action
- reorder actions
- archive/disable actions
- edit visibility and breakpoint rules
- edit layout modes and overflow label
- preview desktop/laptop/tablet/phone results through shared surface primitives
- save, discard, publish, and retry flows
- permission-aware read-only/disabled mode for unauthorized users

## What done really looks like
- Maintainers can manage the rail without editing SharePoint rows directly.
- The admin has a clear IA and visible hierarchy.
- Preview fidelity is high because it uses the same shared surface family as production.
- Validation summary clearly distinguishes blocking vs warning issues.
- Dirty-state protection and discard confirmation are credible.
- Reorder is deterministic and not drag-only.
- Success and failure states are explicit.

## Proof of closure required
- new admin webpart exists and renders
- manifest is adjacent and valid
- mount integration can dispatch the admin webpart
- screenshots or proof captures demonstrate:
  - add/edit
  - reorder
  - archive/disable
  - validation block
  - dirty/discard
  - preview across device modes
  - permission-restricted state

## Constraints / prohibited shortcuts
- Do not reduce the admin to a raw editable grid.
- Do not bypass the shared rail surface family for preview.
- Do not make the admin read like a pseudo-shell application inside SharePoint page content.
- Do not silently save or silently fail.
- Do not make reorder dependent solely on pointer drag.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

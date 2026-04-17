# Prompt 05 — Admin Contracts, Writers, and Draft State

## Objective
Build the admin-side contract, writer, validation, and draft-state stack required for a benchmark-grade `PriorityActionsRailAdmin` experience.

## Current-state repo-truth
- The repo currently shows a public `PriorityActionsRail`, but not a `PriorityActionsRailAdmin` webpart.
- `HbHeroBannerAdmin` proves that the homepage package already accepts an admin/configuration webpart model.
- The list docs explicitly position `PriorityActionsRailAdmin` as the preferred long-term maintenance path, meaning the write-path architecture belongs in this implementation now.

## Relevant SharePoint list-schema truth
Writers must preserve:
- config identity and active-row rules on `Priority Actions Band Config`
- stable `ActionKey` identity and `BandKey` join integrity on `Priority Actions Band Items`
- `ItemStatus` semantics
- deterministic `SortOrder`
- newline storage semantics for `AudienceKeys`
- item-level device visibility and schedule field integrity

Validation must detect at minimum:
- duplicate active rows for one `BandKey`
- missing title or href
- invalid icon key
- invalid date window
- inconsistent ordering/priority state
- publish attempts with blocking validation issues

## Why the current implementation is insufficient
The admin product cannot be benchmark-grade if it only has form fields and raw list writes. It needs:
- persisted vs draft separation
- validation issues as a first-class model
- dirty state
- save/discard/publish rules
- deterministic reorder/archive commands
- read-after-write refresh
- permission-aware write disablement

## Relevant governing doctrine / benchmark authorities
- benchmark categories: backend seam quality, state orchestration quality, UX completeness, validation/closure proof
- doctrine: authoring safety, credible empty/loading/error/success states, no browser-native prompt/confirm flows as the premium answer
- anti-homogenization: admin must feel authoring-first, not like a clone of the public surface

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- outputs from Prompt 01 and 02
- `apps/hb-webparts/src/webparts/hbHeroBannerAdmin/`
- any existing save/reorder/archive/validation patterns used in homepage admin/config work
- schema docs for both Priority Actions lists
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/models/`

Implement equivalent named seams:
- `savePriorityRailBandConfig(...)`
- `savePriorityRailItems(...)`
- `reorderPriorityRailItems(...)`
- `archivePriorityRailItem(...)`
- `validatePriorityRailDraft(...)`

Also create explicit:
- admin draft model
- persisted snapshot model
- dirty state comparator
- permission model
- success/error status model

## Required implementation outcome
Create the authoring backend/state layer that the admin UI can sit on:
- explicit writers for config and items
- deterministic reorder and archive flows
- draft-state orchestration
- validation engine with blocking vs warning levels
- read-after-write refresh policy
- permission-aware enable/disable logic for mutating actions

## What done really looks like
- Admin UI can edit without mutating live persisted values on every keystroke.
- Validation issues are explicit and preview-affecting where relevant.
- Save/discard/publish paths are deterministic and testable.
- Reorder/archive flows have clear command semantics.
- The eventual admin webpart can remain UI-focused because state and write complexity are already organized into named seams.

## Proof of closure required
- writer and validator modules exist
- tests or equivalent seam proof exist for:
  - duplicate active-row detection
  - invalid schedule windows
  - reorder determinism
  - dirty-state detection
  - archive action effects
- read-after-write refresh behavior is explicit in code

## Constraints / prohibited shortcuts
- Do not write directly from component event handlers into SharePoint without a command seam.
- Do not make reorder drag-only with no keyboard-safe alternative path.
- Do not rely on browser-native `prompt` or `confirm`.
- Do not let validation live only as scattered UI conditions.
- Do not expose raw backend errors directly to unauthorized/public contexts.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

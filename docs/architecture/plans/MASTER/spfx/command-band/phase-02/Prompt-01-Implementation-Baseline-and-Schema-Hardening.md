# Prompt 01 — Implementation Baseline and Schema Hardening

## Objective
Lock the implementation baseline for Priority Actions, harden canonical list/schema truth into explicit code-facing contracts, and remove ambiguity about what the rest of the implementation must build against.

## Current-state repo-truth
- The live `main` branch already ships `PriorityActionsRail` as a homepage webpart under `apps/hb-webparts/src/webparts/priorityActionsRail/`.
- `apps/hb-webparts/src/mount.tsx` already dispatches the public rail by manifest id and includes `HbHeroBannerAdmin`, proving the repo already has both a public rail runtime seam and an admin-webpart precedent.
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx` already exists, so the repo expects proof-case isolation for this surface family.
- The current webpart inventory on `main` does **not** show `priorityActionsRailAdmin`, so the admin product is not yet present as a first-class homepage webpart.
- The list-schema docs explicitly state that the direct public list-read adapter for the Priority Actions lists is still pending. That means schema truth exists, but runtime code truth is not yet closed.

## Relevant SharePoint list-schema truth
Treat these documents as canonical:
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`

Non-negotiable schema facts:
- config list title is `Priority Actions Band Config`
- item list title is `Priority Actions Band Items`
- `BandKey` is the join key
- `ActionKey` is the stable item identity key
- active config resolution is: `BandKey` match → `Enabled=true` → `IsActive=true` → newest `Modified` → highest `ID`
- item render eligibility must respect `ItemStatus`, schedule, audience, device visibility, and `OverflowOnly`

## Why the current implementation is insufficient
The existing repo proves the public webpart exists, but it does not yet prove:
- canonical descriptors for both lists
- explicit raw-row interfaces keyed to internal names
- one shared typed contract layer spanning public/admin/runtime/write use cases
- validator coverage for duplicate-active rows, inconsistent schedule windows, unstable keys, or invalid icon usage

Without this groundwork, the implementation will drift into scattered field strings, duplicated mapping logic, and admin/public mismatch.

## Relevant governing doctrine / benchmark authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`

Specific binding implications:
- typed, explicit, testable contracts
- no false simplicity through component-level field coupling
- no closure on visual work without backend/data rigor
- no drift from documented internal names

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect and use:
- `apps/hb-webparts/README.md`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/webparts/hbHeroBannerAdmin/`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/webparts/`
- `apps/hb-webparts/src/homepage/models/`
- `packages/ui-kit/src/homepage/`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`

Create or harden:
- list descriptor modules for config/items
- raw row interfaces
- normalized public render contracts
- admin draft contracts
- validation result contracts
- write command contracts

## Required implementation outcome
Deliver the Priority Actions baseline layer that the rest of the prompts can trust:
- canonical descriptor for `Priority Actions Band Config`
- canonical descriptor for `Priority Actions Band Items`
- raw row interfaces keyed to internal names
- normalized contract definitions for public render and admin draft use
- validation result types and enumerated issue kinds
- explicit note in code comments and module docs that the schema docs are authoritative

## What done really looks like
- No downstream Priority Actions code needs to guess list titles or internal field names.
- The config and item schemas are represented once, centrally, with readable exported symbols.
- Public/admin/runtime/write layers share one coherent contract vocabulary.
- The codebase has a single clearly-owned place to update if the SharePoint schema evolves.
- The next prompts can build readers, writers, surfaces, and admin flows without re-deciding schema truth.

## Proof of closure required
- Diff shows descriptor modules with full internal-name coverage.
- Diff shows raw row + normalized contract + draft + validation types.
- Inline docs or module comments tie each descriptor to the corresponding schema docs.
- A short schema alignment note is added near the module or in local README comments if that pattern exists in the repo.

## Constraints / prohibited shortcuts
- Do not scatter internal names through UI code.
- Do not treat display names as canonical when internal names are documented.
- Do not conflate persisted SharePoint rows with normalized runtime/admin contracts.
- Do not “keep it simple” by skipping validation issue types or explicit command contracts.
- Do not mutate unrelated homepage surfaces.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

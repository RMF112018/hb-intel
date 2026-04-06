# Phase 01 Package — Live SharePoint List Wiring and Data Adapter Foundation

## Objective

Replace the current grouped local-config seam for Tool Launcher / Work Hub with a live SharePoint-backed adapter and normalized launcher record model targeting the existing list **`Tool Launcher Contents`**.

## Why this phase exists

The current Tool Launcher implementation is still shaped around a local grouped configuration contract. That is not compatible with the now-established source-of-truth model where platform metadata is already stored in a live seeded SharePoint list.

This phase is therefore the structural replacement phase for launcher data intake.

## Scope

This package should result in:

1. validation of the actual live SharePoint list field names
2. a typed launcher domain model / normalized presentation model
3. a SharePoint data-access layer or adapter
4. webpart binding from live list data into the launcher UI contract
5. fallback behavior for missing / partial list values
6. documentation of the live-field mapping and runtime assumptions

## Explicit exclusions

This phase must **not**:

- fully redesign every visual surface in final form
- overbuild search, favorites, or recents
- create a speculative persistence layer beyond what the current architecture needs
- rebuild unrelated homepage webparts
- recreate the list or reseed it from scratch

## Package contents

- `phase-01-package-summary.md`
- `prompt-01-live-list-field-audit-and-mapping.md`
- `prompt-02-launcher-domain-model-and-normalization-layer.md`
- `prompt-03-sharepoint-data-access-service-and-webpart-binding.md`
- `prompt-04-fallback-states-and-partial-data-hardening.md`
- `phase-01-validation-checklist.md`
- `phase-01-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- treat the SharePoint list as the content source and the architecture brief as the UI hierarchy source
- do not broaden scope into final visual polish unless required for wiring proof
- keep homepage import discipline intact
- preserve authoring safety and host-aware behavior
- document the mapping as part of the work

# Prompt-03 — Harden project lookup onto a GUID-bound authoritative contract

## Objective

Upgrade project binding from a polished author-facing picker over a brittle lookup seam into a materially more authoritative contract that matches the repo's stronger SharePoint binding posture.

## Why this matters

The current ProjectPicker UX is already strong. The problem is not the picker.
The problem is that the lookup beneath it still depends on a title-bound `Projects` list call and generic imported field names (`field_1` through `field_4`).

That mismatch matters because project identity is foundational to:

- trust in the picker itself
- safe project-derived defaults
- future promotion and workflow logic
- maintainability when list titles or field assumptions drift

## Live repo authorities to inspect first

- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `packages/sharepoint-platform/src/listDescriptor.ts`
- `packages/sharepoint-platform/src/listRead.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- any existing governed list-descriptor registration or environment/config seam that already binds the HBCentral Projects list more authoritatively elsewhere in the repo

## Current deficiency

The repo's shared SharePoint binding doctrine explicitly prefers GUID-bound list descriptors over title-bound access. The Publisher's project lookup is currently below that standard.

This is not just a code-style issue.
It is an authority issue.

## Required implementation outcome

1. Inspect whether the repo already has, or clearly implies, a governed binding source for the HBCentral Projects list.
2. Move the Publisher lookup onto the strongest current authoritative contract the repo can support **now**.
3. If a GUID-bound descriptor is already available or can be derived from existing repo truth, use it.
4. If the repo is missing the required descriptor/config seam, add that seam now rather than preserving `getbytitle('Projects')` as the long-term contract.
5. Centralize the raw field mapping into one authoritative adapter/mapper instead of leaving brittle assumptions inline.
6. Preserve the current author-facing picker interaction model and search quality.

## Author-facing behavior that must remain intact or better

- searchable combobox interaction
- search by project number, project name, and location
- selected chip presentation with system identifiers demoted behind details
- no regression to manual Project ID / Project Name free-text entry
- no weakening of current keyboard and listbox behavior

## Implementation posture

- treat the lookup as control-plane-grade identity, not just a convenience search
- use the shared list-descriptor / list-read posture where applicable
- improve failure truth if list binding or field contract drifts
- keep transport details below the picker UI
- keep field-name normalization explicit and testable

## Closure proof requirements

The final implementation must prove all of the following:

- the old title-bound list binding has been removed or materially reduced behind a stronger contract
- the field contract is centralized and explicit
- the picker still searches name / number / location correctly
- failure messaging is more truthful when the contract is unavailable or drifts
- targeted tests cover mapping, query construction, and drift-sensitive assumptions
- no regression to manual identity entry occurred

## Prohibited outcomes

- no preservation of `getbytitle('Projects')` as the unstated long-term source of truth if a stronger repo-truth seam is available
- no inline re-scattering of `field_1` / `field_2` / `field_3` / `field_4` assumptions
- no UI redesign that changes the current picker ergonomics without a real need
- no over-engineering beyond what current repo truth justifies

## Final instruction to the code agent

Keep the current picker UX, but harden the identity seam under it until it matches the repo's real authoritative-binding posture.
The goal is not prettier code. The goal is a stronger contract.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

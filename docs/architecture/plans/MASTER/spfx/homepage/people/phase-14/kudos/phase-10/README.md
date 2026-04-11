# HB Kudos Shared People Picker Extraction — Prompt Package README

## Objective

This package instructs the local code agent to perform a repo-truth architecture audit and then execute a controlled extraction of the HB Kudos people picker into the correct shared UI boundary.

The end state is **not** another Kudos-local picker.

The end state is:

- a shared, reusable people picker in the correct shared ownership lane,
- consumed by HB Kudos through the governed homepage entrypoint,
- backed by live directory search,
- showing avatar/photo, first name, and last name,
- handling missing-photo fallback correctly,
- and preserving HB Kudos submission behavior without regression.

## Scope

In scope:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- any homepage/shared code used by the HB Kudos composer flow
- `packages/ui-kit/src/HbcKudosComposer/`
- `packages/ui-kit/src/HbcPeoplePicker/`
- `packages/ui-kit/src/homepage.ts`
- governing ownership and UI-boundary docs that materially affect package placement and export boundaries
- the previously generated directory response-shape and photo response-shape artifacts, which are canonical evidence inputs for parsing and avatar behavior

Out of scope:

- unrelated People & Culture surfaces
- broad visual redesign of the entire Kudos webpart
- replacing the Kudos submission schema unless required for correctness
- speculative architecture outside the touched surface chain

## Execution Order

Execute these files in order:

1. `00-Plan-Summary.md`
2. `01-Audit-Summary.md`
3. `02-Prompt-Architecture-and-Ownership-Audit.md`
4. `03-Prompt-Shared-Component-Extraction.md`
5. `04-Prompt-Directory-Result-Contract.md`
6. `05-Prompt-Photo-Avatar-Contract.md`
7. `06-Prompt-HB-Kudos-Reintegration.md`
8. `07-Prompt-Validation-and-Closure.md`

## Expected Deliverables

The agent must deliver all of the following:

- corrected shared ownership decision, implemented in code
- no duplicated people-picker UI logic remaining inside the Kudos composer
- a reusable shared people picker under the correct shared package boundary
- governed exports for homepage/SPFx consumption
- typed directory result contract that supports first name, last name, identity keying, and photo handling
- separate avatar/photo retrieval path that does **not** assume photo data is inline on the user object
- graceful initials/avatar fallback when the photo endpoint returns `404 ImageNotFound`
- HB Kudos reintegrated against the shared picker with no regression to submit flow
- targeted docs/Storybook/tests/verification updates required by repo doctrine

## Non-Goals

Do **not** do any of the following:

- do not create a third people picker
- do not leave the real picker logic duplicated inside `HbcKudosComposer`
- do not move reusable visual UI into `apps/hb-webparts`
- do not import homepage webparts from a non-governed entrypoint when the constrained homepage entrypoint is the correct lane
- do not treat SharePoint principal payload shape as the canonical long-term directory contract for the shared picker
- do not assume avatar/photo is inline on the Graph user object
- do not regress to email-entry-first UX
- do not implement a static list, CSV-backed picker, or SharePoint-list substitute for directory search

## Working Rules

- Do not reread files already in current context unless they changed, the context is stale, or scope expanded.
- Read the smallest authoritative set needed.
- Use repo truth over stale documentation when they conflict.
- Preserve compatibility through adapters, wrappers, or export shims where that reduces blast radius.
- Keep package boundaries clean.
- Promote durable reusable visual UI into `@hbc/ui-kit`, not a feature/webpart folder.
- Keep homepage/SPFx consumption aligned with the governed `@hbc/ui-kit/homepage` entrypoint when that entrypoint is the correct boundary.

## Closure Standard

This package is complete only when the agent proves all of the following:

- the shared people picker exists in the correct shared destination
- HB Kudos consumes that shared picker rather than a local duplicated picker
- live search is human-name-first, while email/UPN remains secondary support
- result rows show avatar/photo when available and correctly show first/last name
- missing photo cleanly falls back to initials/placeholder
- the picker is export-safe and reusable by other consumers
- targeted verification passes
- no material regression is introduced into Kudos composer behavior

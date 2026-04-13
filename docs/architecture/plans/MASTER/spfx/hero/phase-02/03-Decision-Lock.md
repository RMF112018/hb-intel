# 03 — Decision Lock

## Governing authority lock

The following documents are binding for `teamViewer`:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

The following govern benchmark quality, delivery workflow, scoring, and closure:

- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/02-Kudos-Public-Benchmark-Reference.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/05-Code-Agent-Governance-Prompt-Template.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`

---

## Product lock

`teamViewer` is a **people viewer**, not a recognition product.

Its core job is to present team members in a premium, interactive, scan-friendly, SharePoint-safe way.

Minimum visible payload:

- photo
- name
- job title

---

## Architecture lock

### Locked decision 1
`teamViewer` will be implemented as a **new standalone webpart** under:

- `apps/hb-webparts/src/webparts/teamViewer/`

### Locked decision 2
`teamViewer` will define its own:
- manifest
- runtime contract
- props/config model
- data contracts
- view-model selectors
- interaction model

### Locked decision 3
`teamViewer` may learn from Kudos, but it must not depend directly on:
- `kudosContracts.ts`
- Kudos workflow predicates
- composer logic
- celebrate logic
- archive/feed logic
- governance surfaces

### Locked decision 4
Small reusable mechanics may be generalized where justified, especially:
- person photo hydration
- host-safe layout
- shell semantics
- avatar / fallback behavior

Generalization must happen cleanly.
No hidden domain coupling is allowed.

---

## Surface and persona lock

`teamViewer` should feel:

- premium
- refined
- human
- professional
- clearly more intentional than a default SharePoint people list

It should **not** feel:
- celebratory in the same way Kudos does
- like a renamed Kudos module
- like a generic enterprise card grid
- like a plain table or stock people directory

Recommended persona:
- confident
- polished
- people-centric
- slightly editorial
- operationally useful

---

## Interaction lock

Purpose-fit interactions are allowed and encouraged.

Appropriate interactions include:
- hover / focus / press refinement
- compact / standard / expanded density variants
- grouped or strip-based presentation
- optional detail drawer or expanded profile card
- overflow handling for large teams
- optional search/filter only if materially useful

Not locked in:
- archive browse
- feed flyout
- submission
- reactions
- governance actions

Those are Kudos-specific until proven otherwise.

---

## Data contract lock

`teamViewer` should define a clean person contract, for example:

- `id`
- `displayName`
- `email` or `upn`
- `jobTitle`
- `photo`
- `department` / `team` / `projectRole` when available
- `sortOrder` / `groupKey` when needed
- optional `profileUrl` / `bio` only if product scope justifies it

It should also define:
- display-mode contracts
- group/view contracts
- fallback behavior contracts

---

## Photo lock

Photo behavior must be explicit.

Preferred strategy:
1. explicit photo URL when provided
2. SharePoint profile photo resolver when suitable
3. Graph photo lookup when token-backed runtime is available
4. initials fallback as the final default

Failures must degrade cleanly and consistently.

---

## Layout lock

The app must support more than one team size scenario.

At minimum, the design and rendering model must account for:
- small teams
- medium teams
- large teams

That means no single rigid layout that only looks good with 3–5 people.

---

## Validation lock

`teamViewer` does not close without:

- loading / empty / error proof
- keyboard and focus proof
- photo-missing fallback proof
- missing-title proof
- no-people proof
- hosted runtime proof where relevant
- conformance scoring
- closure evidence

---

## Anti-clone lock

The code agent must explicitly avoid:
- copying Kudos’ archive/feed/composer grammar
- reusing recognition vocabulary
- reusing recognition domain contracts
- inheriting warm celebratory interaction semantics that are not people-viewer-fit

The benchmark to match is **quality**, not **shape**.

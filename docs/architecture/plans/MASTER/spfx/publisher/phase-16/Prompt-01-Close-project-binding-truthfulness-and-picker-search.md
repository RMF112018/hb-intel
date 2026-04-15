# Prompt 01 — Close project binding truthfulness and picker search

## Objective

Eliminate the trust defect in the authoritative project-binding step and leave the project picker fully aligned with what it tells authors it can do.

## Why this issue matters

The project-binding step is the highest-value metadata step in the product.
It determines whether the article is tied to a real project, drives downstream defaults, and is one of the first interactions every author experiences.

Right now, the surface tells authors they can search by **project number, name, or location**, but the backing query only filters **project number** and **project name**.
That is a direct truth gap in a foundational workflow step.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — only where homepage-derived primitives materially affect the Publisher
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`
- any directly coupled lookup tests, metadata tests, or picker tests
- any helper text or no-results copy that narrates search behavior

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

Repo truth currently shows:
- the picker placeholder and helper text promise search by number, name, and location
- the result tiles visibly present location as part of project identity
- the backing SharePoint lookup currently filters only `field_3` (project name) and `field_2` (project number)
- manual project identity entry is intentionally removed, which is correct and must stay that way

That leaves the product in an avoidable state where the authoritative selector is not truthful about its live capability.

## Required implementation outcome

Implement a **truthful, authoritative, low-friction** project search experience.

At minimum:

1. close the search-contract gap fully
   - if the UI continues to promise location search, the backing adapter must truly support location-based matches
   - if repo-truth proves location search cannot be implemented safely against the current list contract, then every affected piece of author-facing copy must be rewritten so it no longer promises location search
   - do **not** leave a partial mismatch

2. preserve authoritative project identity
   - no manual `ProjectId` / `ProjectName` fallback entry path
   - selection must still come from the authoritative lookup surface

3. improve recognizability of results without exposing raw internals
   - result ranking and visual presentation should privilege author-recognizable identity
   - selected-state presentation should continue to lead with project name and supporting context, with raw IDs demoted

4. preserve downstream metadata behavior
   - project selection must still feed the draft fields the rest of the workflow expects
   - team-heading defaulting and any other project-derived draft hydration must continue to work

5. leave the search copy exactly aligned with reality
   - placeholder text
   - empty-state/helper text
   - no-results text
   - selected-state narration

## Dependencies / cross-surface considerations

- `MetadataPanel.tsx` depends on the picker remaining authoritative and on the project selection still hydrating `ProjectId`, `ProjectName`, and `ProjectLocation`
- the team-heading intelligent default path depends on project selection still emitting the expected identity values
- any search-ranking or field-expansion change must remain safe for the current SharePoint list contract
- do not widen scope into generalized project-data refactors

## Validation / proof-of-closure requirements

Prove all of the following:

- location-based search works **if** location search remains promised
- project-number and project-name search still work
- the selected chip still presents project identity in an author-first way
- no manual project-ID or project-name entry path is reintroduced
- project selection still hydrates the downstream fields expected by draft save/default logic
- helper, placeholder, and no-results copy match live search behavior exactly

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for the lookup / picker path
- a concise closure note summarizing:
  - what changed
  - which search modes were proven
  - whether any author-facing copy changed and why
  - any remaining assumptions tied to the current SharePoint Projects list contract

## Explicit non-goals

- do not introduce manual project identity editing
- do not broaden this into a general metadata redesign
- do not make unrelated styling or lifecycle changes

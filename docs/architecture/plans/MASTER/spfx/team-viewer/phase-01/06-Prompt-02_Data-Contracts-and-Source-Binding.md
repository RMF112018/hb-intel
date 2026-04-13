# 06 — Prompt 02: Data Contracts and Source Binding

You are working in the live local HB Intel repo.

## Objective

Define the canonical `teamViewer` data contracts, normalization rules, and source-binding strategy so the app has explicit, testable, repo-truth-based person data handling.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Governing authority

Treat the doctrine and benchmark files from Prompt 01 as still binding.

## Repo-truth audit requirements

Inspect the actual relevant source seams before implementing:
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
- `apps/hb-webparts/src/homepage/helpers/identity.ts`
- any existing people- or profile-related seams needed to choose a clean source model

Also use the uploaded article-architecture planning input:
- `HB Articles`
- `HB Article Team Members`
- `HB Article Destination Pages`

## Required decisions

You must explicitly decide and document:

1. the canonical `TeamViewerPerson` contract
2. the canonical article-binding contract
3. optional grouping contract
4. display-model contract
5. how incomplete data is normalized
6. what source/binding strategy `teamViewer` uses initially
7. how refresh / cache invalidation should work
8. what data is required vs optional
9. what fields are needed for bio/resume slide-out support
10. whether schema gaps in `HB Article Team Members` must be documented

## Mandatory fallback rules

Define and implement rules for:
- missing photo
- missing name
- missing title
- empty person set
- partial / malformed person records

## Required implementation work

Implement the contract and data layer files needed for `teamViewer`.

At minimum, create files such as:
- `contracts/teamViewerContracts.ts` or equivalent
- `display/teamViewerSelectors.ts`
- `hooks/useTeamViewerData.ts`

If a generic helper extraction is justified, do it cleanly and document why.

## Prohibited behavior

- do not import Kudos contracts
- do not model people using recognition recipient buckets
- do not leave source binding implicit or guessed in code comments
- do not allow malformed source data to leak directly into rendering

## Closure requirements

Before closing this prompt:

- prove the source-binding approach is explicit
- prove contract definitions are stable and readable
- prove fallback behavior is encoded, not implied
- identify the exact render inputs the surface layer will consume in Prompt 03


## Mandatory bio/resume contract rule

Do not hand-wave the person-detail content.

You must explicitly define and document how `teamViewer` receives:
- short bio text
- optional rich resume content
- optional linked resume document / profile page

If the uploaded article architecture does not yet provide enough fields for this, you must:
- state the gap clearly,
- propose the minimum required schema additions or linked-source model,
- and implement the code to the locked contract rather than leaving it vague.

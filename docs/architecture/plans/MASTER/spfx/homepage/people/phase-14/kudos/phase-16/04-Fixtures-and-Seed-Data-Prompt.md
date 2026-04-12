# 04 — Fixtures and Seed Data Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to implement deterministic fixtures and seed generation for the complete HB Kudos stress suite.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Create a deterministic data system that can drive broad scenario coverage across:

- workflow states
- visibility modes
- prominence modes
- admin-review overlays
- ownership overlays
- reaction states
- people-picker/media cases
- audit timeline cases

## Required data families

### A. Core Kudos entries

Create deterministic seed builders for entries covering at least:

- each of the 7 workflow states
- was-ever-published true/false combinations
- homepage enabled true/false combinations
- approved date present/absent combinations
- celebrate count zero/non-zero
- scheduled publish timestamp present/absent
- pinned / featured / standard
- removed / restored history shapes
- flagged-for-admin-review combinations
- claim / reassignment combinations

### B. Recipient shapes

Cover at least:

- one individual recipient with photo
- one individual recipient without photo
- multiple individuals mixed photo presence
- one team label only
- one department label only
- one project-group label only
- mixed bucket case combining multiple recipient bucket families

### C. Submitter / recipient identity cases

Cover:

- current user is submitter
- current user is recipient
- current user is unrelated viewer
- current user is governance reviewer
- current user is governance admin

### D. Audit timeline cases

Generate deterministic audit-event sequences for:

- submit → approve
- submit → revisionRequested → resubmit → approve
- submit → reject
- submit → withdraw
- approve → schedule → unschedule
- approve → pin / unpin
- approve → feature / unfeature
- approve → remove → restore
- claim → reassign
- flagAdminReview → clearAdminReview
- celebrate increments
- reopen path
- updateContent path

## Required implementation behavior

- centralize fixtures in one coherent area
- keep factories small and composable
- make timestamps deterministic
- make IDs deterministic
- make the seed API readable and scenario-oriented

## Required artifact

Create a scenario catalog document that maps each named fixture to:

- workflow core state
- overlay states
- intended tests
- expected visible behavior
- expected hidden behavior

## Special handling requirements

### People-picker search

Add deterministic people-search fixture responses for:

- exact match
- multiple matches
- zero matches
- malformed/partial data shape if current adapter can encounter it
- photo available / photo unavailable
- directory error / digest failure path

### Hosted runtime

Add fixture support or harness support for:

- stale-after-action refresh verification
- collision scenarios for feature/pin slots
- role/capability denial paths
- list item not found / audit write failure / patch rejection paths

## Prohibited shortcuts

- no hand-built copy-paste JSON chaos
- no random timestamps
- no scenario ambiguity
- no fake unsupported taxonomy completion if the current repo does not implement it
- no omission of audit-event fixture coverage

## Closure

Commit the fixture system and a short markdown catalog documenting exactly how the next prompts should consume it.

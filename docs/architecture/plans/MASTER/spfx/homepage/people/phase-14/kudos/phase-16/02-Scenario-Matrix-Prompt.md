# 02 — Scenario Matrix Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to derive, lock, and commit the **authoritative HB Kudos stress-test scenario matrix** from current repo truth.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Build a scenario/state matrix that is exhaustive enough to drive the full end-to-end stress harness for:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/data/`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/webparts/`
- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/mount.tsx`

## Critical interpretation lock

Do **not** invent a fake larger workflow enum.

The current workflow core is the 7-state union already present in repo truth. Many other “states” are not workflow enum members. They are:

- action results
- overlay metadata
- visibility predicates
- prominence modes
- ownership modes
- audit-event outcomes
- composer lifecycle states

Model those separately.

## Required matrix axes

Build the matrix with at least these axes:

### A. Workflow core

- pending
- revisionRequested
- approved
- approvedScheduled
- rejected
- withdrawn
- removedUnpublished

### B. Governance overlays

- flagged for admin review
- admin review cleared
- claimed
- reassigned
- reviewed by current user
- assigned to current user
- assigned to other user
- unassigned

### C. Visibility overlays

- public homepage visible
- not public
- archive eligible
- aged off homepage
- associated visible to submitter
- associated visible to recipient
- not visible to unrelated user

### D. Prominence overlays

- standard
- pinned
- featured
- unpinned
- unfeatured
- prominence collision / slot denial path
- scheduled prominence collision demotion path if supported by current writer

### E. Interaction overlays

- celebrate count zero
- celebrate count non-zero
- celebrate from main surface
- celebrate from detail panel
- repeated celebrate attempts where meaningful

### F. Composer lifecycle

- pristine open
- dirty draft
- discard close dialog
- validation error
- submit success
- submit error
- send another
- typed people search success
- typed people search empty
- typed people search error

### G. Identity / media

- individual recipient with photo
- individual recipient without photo
- multiple recipients with mixed photo presence
- bucket mix with individual + team + department + project-group labels
- submitter attribution correctness
- recipient display correctness

### H. Host/runtime conditions

- standard viewport
- reduced-width but supported viewport
- SharePoint-hosted chrome overlap risk zones
- keyboard-only navigation
- focus-visible state
- panel scroll behavior
- no dead CTA
- 100% zoom baseline
- 90% comparison capture where useful for layout regressions

## Deliverable

Create a new markdown file in the repo for the stress-test workstream that includes:

1. **scenario matrix table**
2. **state interpretation rules**
3. **coverage priority**
   - P0: must always run
   - P1: broad workflow/regression
   - P2: hosted/adversarial/drift
4. **fixture dependencies for each matrix family**
5. **expected assertions / proof points for each matrix family**

## Required quality bar

- The matrix must be implementation-ready.
- The matrix must map directly into test file groups.
- The matrix must explicitly separate workflow core from overlays.
- The matrix must explicitly mark cases that are repo-truth-supported vs not yet supported.
- Unsupported future-state fantasies must be excluded or clearly labeled as non-current.

## Prohibited output

- no vague prose-only summary
- no generic test ideas list
- no collapsing claimed/reassigned/flagged into fake workflow states
- no omission of public/admin boundary cases
- no omission of photo, people-picker, or cache refresh cases

## Closure

Do not stop after writing the matrix.

Also add a short section that names the exact test-group breakdown you want the next prompts to implement.

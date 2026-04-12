# 05 — Public Webpart Stress-Test Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to implement the **public/employee-side stress suite** for HB Kudos.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Implement browser-level stress coverage for the employee-facing Kudos experience across:

- main surface
- Give Kudos composer flyout
- live preview
- success/error states
- detail panel
- `View All` feed flyout
- archive section
- celebrate path
- submitter withdraw/resubmit paths
- person photo correctness
- no leakage of governance-only data

## Surfaces and seams to cover

At minimum, cover current repo-truth behavior in:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.js|tsx`
- shared homepage exports for `HbcPeopleCultureSurface`, `HbcKudosComposer*`, `HbcPeoplePicker`, `HbcAvatarStack`

## Required test families

### A. Main surface rendering

Prove:

- surface loads with featured/recent recognition when data exists
- sparse/empty behavior is acceptable when no featured-worthy item exists
- spotlight selection behaves as current code intends
- avatars render correctly
- no dead primary CTA
- no dead `View All`

### B. Composer lifecycle

Prove:

- Give Kudos opens correctly
- pristine state renders correctly
- dirty draft is detected
- discard dialog appears on close when appropriate
- validation errors render for missing recipients/headline/excerpt
- typed recipient entry path works
- submit success path works
- submit error path works
- Send Another resets correctly
- Done closes correctly

### C. People search / people picker

Prove:

- search dispatch occurs only when query threshold is met
- multiple matches render correctly
- empty results render correctly
- error path surfaces appropriately
- selected person displays correct identity fields
- preview and composer surfaces stay consistent

### D. Photo behavior

Prove:

- Graph-hydrated individual recipient photo displays when available
- fallback avatar/initials display when photo is absent
- mixed-recipient sets render correctly
- submitter/recipient attribution text is correct

### E. Feed / View All

Prove:

- `View All` opens the feed flyout
- feed is searchable
- full excerpt rendering is preserved
- clicking an item closes feed and opens detail
- scroll behavior in the flyout is usable

### F. Archive

Prove:

- archive section renders eligible items only
- archive search works
- clicking archive row opens detail
- aged-off / associated-visible cases behave per current predicates

### G. Detail panel

Prove:

- detail opens from main surface, feed, and archive
- public detail shows recognition content correctly
- public detail does **not** show audit timeline or governance internals
- celebrate works from detail when allowed
- withdraw available only to correct submitter/state combinations
- resubmit available only to correct submitter/state combinations

### H. Reaction / celebrate

Prove:

- celebrate from main surface updates count
- celebrate from detail panel updates count
- refresh behavior is correct after celebrate
- repeated usage behavior is at least documented if not restricted

## Hosted / UX checks

Also prove:

- keyboard navigation reaches primary interactive elements
- focus-visible states exist for actionable controls
- panel content remains usable with SharePoint-style host chrome constraints
- no critical control is hidden or inaccessible under ordinary usage
- no dead buttons, dead links, or dead CTAs remain on this surface

## Evidence requirements

Produce and save:

- screenshots for major public states
- traces for failure triage
- at least one curated proof set for:
  - composer success
  - composer validation failure
  - people search result rendering
  - `View All` feed open
  - detail panel open
  - archive open

## Prohibited shortcuts

- do not stop at submit-only testing
- do not ignore the feed and archive lanes
- do not ignore public/admin privacy boundaries
- do not rely only on logic tests for people search or photos

## Closure

Commit the public suite, any needed test-id hardening, and a short summary of what remains for the companion/shared/hosted prompts.

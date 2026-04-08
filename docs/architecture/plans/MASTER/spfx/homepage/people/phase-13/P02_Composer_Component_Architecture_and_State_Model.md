# P02 — Composer Component Architecture and State Model

## Objective

Implement the Kudos Composer using repo-appropriate separation of concerns.

The final architecture must keep `PeopleCultureMerged.tsx` mostly presentation-focused while moving form state, validation, and submission logic into dedicated seams.

---

## Target Architecture

Create or align the implementation with a structure like the following:

- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerPreview.tsx`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`

You may refine file names if repo conventions strongly suggest a better placement, but do **not** collapse everything into a single component file.

---

## Responsibilities

### `PeopleCultureMerged.tsx`
Responsible for:
- rendering the People & Culture surface
- owning local open/close state for the composer or delegating that state to a narrow hook
- passing current user/site context into the composer as needed
- replacing current `href="#give-kudos"` behavior with a real open action

Not responsible for:
- raw SharePoint create-item requests
- heavy validation logic
- recipient mapping rules
- submission lifecycle orchestration

### `KudosComposerFlyout.tsx`
Responsible for:
- flyout shell
- responsive layout
- header / body / footer composition
- loading / success / error presentation states
- focus management if not handled by an existing primitive
- close/cancel affordances

### `KudosComposerForm.tsx`
Responsible for:
- recipient UI
- headline input
- message input
- optional category input if implemented
- validation messaging
- form field composition and microcopy

### `KudosComposerPreview.tsx`
Responsible for:
- lightweight, polished inline preview
- warm recognition-card presentation using the same overall visual language as the People & Culture module
- showing recipient names/avatars and basic message shape

### `useKudosComposer.ts`
Responsible for:
- draft state
- validation
- submit orchestration
- state machine flags:
  - idle
  - editing
  - submitting
  - success
  - error
- unsaved draft detection

### `peopleCultureSubmissionSource.ts`
Responsible for:
- SharePoint write logic only
- mapping draft form input to SharePoint list field payload
- current user submitter mapping
- field normalization and null safety
- returning a deterministic result object

---

## Recommended State Model

Implement a small explicit state model.

Suggested shape:
- `isOpen`
- `status: "idle" | "editing" | "submitting" | "success" | "error"`
- `draft`
- `validationErrors`
- `submitError`

Suggested draft shape:
- `recipientIndividuals`
- `recipientTeams`
- `recipientDepartments`
- `recipientProjectGroups`
- `headline`
- `excerpt`
- `details` (optional)
- `image` / `imageAltText` (optional if in scope)

Do not overcomplicate this into a heavyweight form framework unless clearly justified.

---

## Recipient UI Direction

The fastest premium experience is:
- people picker / controlled recipient selector
- avatar chips rendered immediately when recipients are chosen
- support at least individual recipients in this pass
- team / department / project group support should be implemented only if the repo already has clean selector patterns or if the field mapping is trivial and safe

If multi-recipient types are not equally ready, prioritize:
1. individual recipients
2. team
3. department
4. project group

But do not break the underlying list model.

---

## Preview Behavior

Preview should be inline and elegant.

Requirements:
- live-updating based on the draft
- must not require a stepper or second screen
- should visually resemble the curated People & Culture kudos presentation
- should degrade gracefully when some fields are empty

---

## Responsive Behavior

### Desktop
- right-side sheet
- sticky header and footer if appropriate
- ample room for form + preview

### Mobile
- full-screen or near-full-screen sheet
- stacked layout
- no cramped side-by-side composition
- stable footer actions

---

## Deliverable for This Phase

At completion of this phase:
1. add the flyout and form components
2. add the composer hook/state model
3. make the architecture consistent with existing homepage data/UI patterns
4. keep the rendering layer clean

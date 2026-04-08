# P04 — Webpart Wiring, Interaction, and UI Implementation

## Objective

Wire the new Kudos Composer into the People & Culture surface so every **Give Kudos** action opens the premium flyout and the user can complete a polished in-surface submission flow.

This phase is about interaction wiring, flyout behavior, UI polish, and keeping the People & Culture surface premium.

---

## Required Source Targets

Primary target:
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`

Likely adjacent files:
- `apps/hb-webparts/src/webparts/peopleCulture/index.ts`
- new composer files created in prior phases
- any minimal styles/tokens/helpers required for the flyout

---

## Repo Truth You Must Preserve

The current `PeopleCultureMerged.tsx` already provides:
- warm hero banner
- branded gradients
- kudos spotlight zone
- supporting rail
- multiple Give Kudos CTAs
- strong visual hierarchy

Do not regress any of that.

The flyout must read as a continuation of this component family.

---

## Replace Presentational Kudos Actions With Real Triggers

Current Give Kudos actions inside `PeopleCultureMerged.tsx` should stop behaving like inert anchor links.

Convert them so they open the unified composer.

That includes:
- header CTA
- spotlight CTA
- sparse-state CTA
- any other Give Kudos action present in the surface

### Important
Do this in a way that remains accessible and visually consistent with the current CTA styling.

If `HbcPremiumCta` can support click/button semantics cleanly, use it.
If not, create a narrow wrapper or adjacent control pattern that preserves the same visual standard.

Do not hack around it with broken pseudo-links.

---

## Flyout Composition Requirements

### Header
- title: `Give Kudos`
- short supporting copy
- premium brand treatment
- close affordance

### Body
- recipient selection
- headline field
- message field
- optional preview block
- refined empty/invalid states

### Footer
- sticky or stable action bar
- primary submit action
- secondary cancel action
- polished submitting state

---

## Required UX Behaviors

### Open
- opens instantly from Give Kudos actions
- initial focus is meaningful
- no awkward page jump behavior from prior `href="#give-kudos"` links

### Close
- closes cleanly when draft is empty
- warns when there are unsaved changes
- Escape closes when appropriate

### Submit
- validates required inputs
- shows submitting state
- prevents double submit
- transitions to success state on completion

### Success
- success state appears inside flyout
- give user a clean exit path
- optionally support “send another”

### Error
- preserve draft
- show actionable message
- allow retry

---

## UI Quality Bar

The composer must look:
- elegant
- premium
- warm
- social
- intentional
- not overly corporate
- not cheesy

### Good signals
- recipient avatars/chips
- live preview card
- layered surface treatment
- controlled spacing
- tasteful animation
- refined microcopy

### Bad signals
- raw SharePoint form feel
- clumsy modal chrome
- cramped fields
- neutral gray enterprise blandness
- abrupt state changes

---

## Preview Rule

The preview is strongly recommended and should be implemented unless a concrete repo limitation blocks it.

The preview should:
- update live as the draft changes
- feel like a miniature version of the homepage recognition card
- use fallback content gracefully when fields are partially complete

---

## Mobile Rule

Do not simply shrink the desktop flyout.

On mobile:
- use a full-screen or nearly full-screen sheet
- stack content vertically
- keep the action bar reliable
- keep tap targets generous

---

## Accessibility / Safety

Maintain:
- focus containment
- tab order
- meaningful labels
- reduced-motion-safe transitions
- no broken background scrolling
- safe dismissal logic

---

## Deliverable for This Phase

At completion of this phase:
1. all Give Kudos actions in `PeopleCultureMerged.tsx` open the composer
2. the composer feels fully integrated with the People & Culture premium surface
3. the component remains presentation-focused
4. the submission flow works end to end against the submission source from prior phases

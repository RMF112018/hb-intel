# P01 — Repo Truth, Product Direction, and UX Directive

## Objective

Implement a **premium Kudos Composer flyout** for the People & Culture webpart in the live `hb-intel` repo.

This composer must be designed as a **natural continuation of the current `PeopleCultureMerged` premium surface**, not as a separate generic form experience.

The final result must feel like a polished, warm, celebratory extension of the existing brand-forward homepage module.

---

## Repo Truth You Must Honor

Work from the current implementation state in:

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`

### Current state observations to validate in code
1. `PeopleCultureMerged.tsx` already has multiple **Give Kudos** entry points.
2. Those entry points currently behave like presentational links rather than a real composer trigger.
3. `mount.tsx` already stores the SharePoint site URL through `storeSiteUrl(...)`.
4. `spContext.ts` already provides the narrow site URL seam.
5. `ProjectPortfolioSpotlight` already demonstrates the architecture pattern to follow:
   - render component stays presentation-first
   - data logic lives outside the component
   - hook manages runtime state
   - SharePoint list access is isolated in a list-source file

Do not ignore these repo seams and invent an unrelated pattern.

---

## Product Decision

Use a **single shared composer flyout**.

### Required interaction model
- **desktop / wide tablet:** right-side command-sheet flyout
- **mobile / narrow layouts:** full-screen or near-full-screen slide-up sheet
- every **Give Kudos** action in `PeopleCultureMerged` must open the same composer
- the composer must preserve the premium People & Culture look and feel

### Do not do the following
- do not use a tiny tooltip/popover form
- do not redirect users to a raw SharePoint new-item form
- do not create a separate full page for quick kudos unless strictly required by a repo constraint
- do not make the UX feel like generic enterprise CRUD

---

## Visual Direction

The composer must feel like a sibling of the current People & Culture surface.

### Required visual qualities
- warm
- polished
- layered
- celebratory
- brand-native
- emotionally human
- restrained but expressive

### Suggested treatments
- warm brand gradient or accent band in the flyout header
- soft cream or white body canvas
- refined card layering
- avatar-rich recipient presentation
- subtle celebratory iconography
- premium action bar with sticky footer

### Important
Do **not** visually flatten the People & Culture experience into neutral stock form UI.

---

## UX Structure

The composer should support the following states:

### A. Compose
- recipient selection
- headline field
- message field
- optional category/tag selection
- optional image affordance only if practical in this repo pass

### B. Preview
- inline visual preview of how the kudos may appear in the module
- preview should be lightweight, not a second page

### C. Submit
- controlled loading state
- duplicate-submit prevention
- disabled submit until required inputs are valid

### D. Success
- warm success confirmation inside the same flyout
- allow close
- optionally allow “Send another”

### E. Error
- clear, calm, polished failure message
- do not lose draft input on recoverable error

---

## Form Simplicity Rule

This must be **fast to complete**.

Recommended minimum required fields:
- recipient(s)
- headline
- message

Everything else should be optional or system-owned unless a live list requirement forces it.

---

## Accessibility and Motion

Maintain production-safe UX:
- keyboard accessible open/close behavior
- focus trap inside the flyout
- Escape closes when safe
- reduced-motion-safe transitions
- mobile safe area handling if needed
- unsaved-changes warning when closing a non-empty draft

---

## Deliverable for This Phase

Complete the repo-truth audit for the composer work and produce the concrete implementation direction before writing code.

At the end of this phase, explicitly state:
1. which existing CTA elements will become composer triggers
2. which component API changes are needed in `PeopleCultureMerged.tsx`
3. whether existing UI kit CTA primitives can support button/onClick semantics cleanly or need a wrapper
4. whether the preview should be its own component

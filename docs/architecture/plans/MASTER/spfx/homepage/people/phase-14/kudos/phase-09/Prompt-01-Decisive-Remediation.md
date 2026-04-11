# Prompt 01 — Decisive HB Kudos Remediation

You have direct access to the local live repo.

## Mission
Resolve the HB Kudos product failures now. Do not preserve the current architecture unless it directly helps closure. If the current boundary blocks closure, change it.

## Repo-truth facts you must accept as binding for this task
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` currently hard-defends the existing shared/ui-kit/local boundary and explicitly argues against splitting/replacing it.
- `HbKudos.tsx` is already running the composer in typed mode.
- `packages/ui-kit/src/HbcKudosComposer/index.tsx` already contains a chip/token people-picker shell with keyboard navigation, selection, and remove behavior.
- The current failure is not “we forgot to add typed mode.”
- The current failure is that the live identity-resolution pipeline is not working reliably in-host.
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` currently uses a custom raw `fetch()` wrapper to `ClientPeoplePickerSearchUser`, swallows failures, and returns empty arrays on every failure path.
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css` currently styles the homepage featured card with near-white text on a very light frosted-glass card, which is a major reason the featured card reads as hollow / washed out.

## Non-negotiable outcome locks
1. **Real working people picker**
   - The Give Kudos recipients field must return real tenant-backed people results for known users.
   - It must support suggestion selection, selected-person chips/tokens, removal, keyboard nav, and successful submission.
   - “No people found” for known valid users is a hard failure.
   - Silent fallback to `[]` is not acceptable.

2. **Real featured recognition surface**
   - The homepage featured card must visibly carry headline, recipient identity, and body content at normal zoom in the real SharePoint host.
   - A washed-out / hollow / visually empty card is a hard failure.

3. **No structural deference**
   - You are explicitly authorized to modify, fork, localize, or replace the current shared surface path and/or people-picker implementation if that is what closure requires.
   - Do not defend the current boundary in comments or commit summaries.
   - Do not preserve a failing abstraction because it is neat.

## Required implementation steps

### A. Kill the structural lock
- Remove or rewrite the “boundary decision” narrative in `HbKudos.tsx` so the code no longer pre-judges the current structure as correct.
- Replace that commentary with short factual notes only.

### B. Rebuild the people-resolution pipeline
- Replace the current `useSharePointPeopleSearch.ts` implementation with a proven SPFx-aware approach.
- Do not keep the current silent `fetch()` wrapper as the production resolver.
- Preferred direction:
  - use SPFx-aware request plumbing,
  - preserve typed chip UX,
  - add instrumentation during validation,
  - support broader resolution where the narrow site-scoped lookup is insufficient.
- You may adopt a proven SPFx people-picker control or rebuild the resolver behind the existing UI shell, but the result must behave like a true working picker.
- Add a temporary validation/debug mode that can log:
  - query text,
  - request target,
  - count of returned results,
  - first few returned principals,
  - surfaced error reason when resolution fails.
- That debug behavior must be safe to disable for production.

### C. Correct the featured card treatment
- Rework the homepage featured card so text contrast is correct in the real host.
- Do not keep white/near-white content on a light translucent card if it remains washed out.
- You may:
  - darken the card,
  - switch text back to dark content styling,
  - or localize the homepage variant away from the current shared visual treatment.
- The card must read as a premium, content-carrying recognition surface at 100% and 90% zoom without appearing blank.

### D. Host-fit layout correction
- Validate the component against actual SharePoint rendered width, not just browser viewport breakpoints.
- Eliminate the need to shrink to abnormal zoom just to see the whole webpart comfortably.
- Adjust widths, spacing, footer safe zones, and flyout layout as needed.

### E. Proof package required
Before claiming closure, produce all of the following in the repo or working notes:
- exact files changed,
- why each change was necessary,
- screenshots of the corrected homepage surface,
- screenshot of successful `bo*`-style people lookup returning real principals,
- screenshot of selected-person chips,
- screenshot of successful submission path,
- confirmation that fresh build output made it into the packaged artifact.

## Hard prohibitions
- Do not say typed mode is already present and stop there.
- Do not leave the current search adapter in place if known users still do not resolve.
- Do not claim the issue is just test data if the featured card is still washed out.
- Do not claim closure without real in-host proof.
- Do not re-read files that are already in your active context unless needed for a precise change.

## Deliverable
Implement the changes, then provide a concise remediation summary with:
- root cause fixed,
- files changed,
- proof captured,
- remaining gaps, if any.

# P05 — Runtime Validation, Build, and Packaging

## Objective

Validate the completed Kudos Composer implementation in the real repo runtime, then produce a fresh `hb-webparts.sppkg` through the repo’s authoritative packaging path.

This phase is not optional.

---

## Validation Scope

### A. Interaction validation
Verify:
- every Give Kudos action opens the same composer
- no old anchor-jump behavior remains
- form validation works
- success state works
- error state preserves draft
- close/unsaved behavior works

### B. SharePoint submission validation
Verify:
- the composer can create a live item in the **People Culture Kudos** list on `HBCentral`
- submitter metadata is populated correctly
- moderated defaults are respected
- new items do not auto-publish to the homepage unless that is explicitly intended and supported

### C. Responsive validation
Verify:
- desktop flyout behavior
- tablet behavior
- mobile sheet behavior
- narrow-width overflow handling
- reduced-motion behavior

### D. Regression validation
Verify:
- `PeopleCultureMerged` visual hierarchy remains intact
- current warm premium surface is not regressed
- no obvious impact to unrelated homepage webparts
- no mount/runtime regressions in `hb-webparts`

---

## Build / Packaging Requirement

Use the repo’s authoritative packaging command path.

Primary build/package command:
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

If the repo truth requires an adjacent command before packaging, run it, but do not replace the above packaging path with an improvised alternative.

---

## Packaging Proof Requirement

After packaging:
1. confirm whether the build succeeded
2. confirm whether the resulting package was updated
3. identify the output `.sppkg`
4. state any warnings or failures exactly
5. do not claim success if packaging failed

---

## Completion Notes Required

At the end of the implementation, provide:

1. concise summary of the Kudos Composer implementation
2. list of changed files
3. resolved SharePoint field mapping for submission
4. any live schema mismatches discovered versus the CSV export
5. fallback behavior when SharePoint context is unavailable
6. exact build/package command(s) run
7. package status and output path

---

## Final Reminder

The end state must be:

- **repo-specific**
- **SharePoint-backed**
- **moderated**
- **premium**
- **People & Culture brand-aligned**
- **properly built and packaged**

Do not stop at “the UI looks good in code.”
Prove the runtime path.

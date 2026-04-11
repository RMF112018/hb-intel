# 08 — Prompt: People Picker Placeholder Text and Left-Aligned Footer Actions

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct two specific HB Kudos flyout defects in the SharePoint-hosted Give Kudos panel:

1. the people picker placeholder text is rendering the literal escaped sequence `\u2026` instead of a proper ellipsis
2. the panel footer action buttons must be left-aligned rather than right-aligned

These changes must be implemented cleanly, at the correct ownership seam, without regressing the previously remediated host-aware flyout, footer safe-zone, or people-picker behavior.

## Screenshot-backed defects

### Defect 1 — Placeholder text renders incorrectly
Current observed behavior:
- the people picker input displays `Search for a person\u2026`

Required behavior:
- the placeholder must render as natural UI copy with a real ellipsis character or equivalent proper output, for example:
  - `Search for a person…`

This is a production-polish defect and must be treated as real UI breakage, not as a harmless cosmetic issue.

### Defect 2 — Footer actions are right-aligned
Current observed behavior:
- the footer actions are positioned on the right side of the panel
- this increases visual crowding near the lower-right SharePoint assistant button and weakens the action hierarchy

Required behavior:
- the footer action group must be aligned left
- button spacing, focus states, and click targets must remain strong
- the footer must continue to reserve safe clearance for the persistent SharePoint assistant button

## Mandatory audit scope

At minimum inspect and update all relevant code in:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`
- `packages/ui-kit/src/HbcPeoplePicker/`
- any shared footer/action-row primitives used by the Kudos composer
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` only if a thin consumer bridge is still required

Do not re-read files already in active context unless needed for validation.

## Required implementation direction

### A. Placeholder text correction

1. Find the exact source of the placeholder string used by the people picker input in the Give Kudos flow.
2. Determine why the escape sequence is surfacing literally.
3. Correct it at the strongest ownership seam.
4. Ensure the final rendered placeholder uses proper UI text, not a literal escape sequence.
5. Confirm there are no similar escaped-text defects elsewhere in the picker/composer path.

#### Placeholder correction rules

- do not patch the rendered DOM after the fact
- do not use a brittle string replace in runtime UI code unless it is clearly the true owner
- do not leave inconsistent placeholder definitions between shared picker and local composer paths
- if duplicate picker definitions still exist, correct the text at the durable shared owner or thin bridge that is actually used

### B. Footer button alignment correction

1. Audit the footer action-row layout in the shared composer/flyout infrastructure.
2. Move the action group to a left-aligned layout.
3. Preserve correct spacing between primary and secondary actions.
4. Preserve footer safe-zone clearance for the persistent SharePoint assistant button.
5. Ensure left alignment remains visually intentional across desktop SharePoint-hosted runtime.

#### Footer alignment rules

- do not solve with a one-off local override in `HbKudos.tsx` unless the shared footer is provably not the owner
- do not regress the safe-area / host-control clearance logic
- do not create a visually unbalanced footer
- do not reduce button prominence or accessibility

## Expected ownership

### Placeholder text
Preferred owner:
- shared picker or shared composer input definition, whichever is truly rendering the field

Not preferred:
- local Kudos-only patch, unless repo-truth proves the placeholder is intentionally owned there

### Footer alignment
Preferred owner:
- shared composer / flyout footer layout seam

Not preferred:
- ad hoc per-consumer alignment override

## Validation requirements

You must prove all of the following:

- the people picker placeholder renders correctly as human-readable UI text
- the literal `\u2026` sequence no longer appears
- footer actions are aligned left
- footer actions remain fully visible at 100% browser zoom
- footer actions remain clear of the SharePoint assistant button
- no regression was introduced to:
  - flyout header visibility
  - host-aware top offset behavior
  - scroll behavior
  - people search functionality
  - selected-recipient rendering
  - button focus/hover/active states

## Required deliverables

Return all of the following:

1. concise change summary
2. exact files changed
3. final ownership summary for both fixes
4. before/after explanation for:
   - placeholder text
   - footer alignment
5. hosted validation proof at 100% zoom
6. explicit statement that the SharePoint assistant button was present during validation

## Closure rule

Do not declare this work complete unless:

- the placeholder reads correctly
- the footer buttons are left-aligned
- the footer still accommodates the persistent SharePoint assistant button
- no regression exists in the Give Kudos hosted experience

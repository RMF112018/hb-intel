# Workstream E · Step 03 — Closure

## Objective
Add stronger accessibility guidance and author assistance for alt text, captions, media roles, and gallery grouping in the media composer.

## What changed

### New: `altTextGuidance.ts`
`apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/altTextGuidance.ts` — pure assessment helpers:
- `assessAltText(raw)` returns `{ level, message }` across four levels:
  - `problem` — empty, whitespace-only, or longer than the hard 250-char ceiling (alt text has become a caption).
  - `warn` — leading "image of" / "picture of" / "photo of" / "photograph of" / "graphic of" / "screenshot of" / "screen shot of" / "illustration of" phrasing; alt shorter than 10 characters; alt past the soft 125 ceiling.
  - `good` — otherwise, with a positive "alt text looks good" message.
- `assessCaption({ caption, altText })` returns `ok` when the caption is blank (captions are optional), `warn` when the caption duplicates the alt text case-insensitively, `good` otherwise.
- `roleGuidance(role)` — short role-help copy explaining the difference between Gallery and Supporting roles.

All three helpers are pure, DOM-free, and SPFx-safe.

### New: `altTextGuidance.test.ts` (14 tests)
Covers every branch: empty / whitespace, each leading phrase, short alt, well-formed alt, soft-ceiling warn, hard-ceiling problem, empty caption → ok, duplicate-of-alt caption → warn (case-insensitive), editorial caption → good, role help copy for both roles.

### `MediaComposer.tsx` — assistance surfaced inline
- Alt-text field now shows a level-keyed guidance message below the textarea (ok / good / warn / problem), announced via `aria-live="polite"`; `role="alert"` when the level is `problem` so the screen reader surfaces it immediately. The textarea also carries `aria-describedby="media-composer-alt-guidance"` + `aria-invalid` when the assessment is blocking, and **save is now blocked when the alt text is at the problem level** (empty or past the hard ceiling) rather than only when the alt text is empty — a missing dependency that the Step-02 composer had.
- Caption field shows its own level-keyed guidance message whenever the caption is non-empty, so the duplicate-of-alt warn fires in real time.
- Role chooser gains a live role-help line below the radio group that updates as the author flips between Gallery and Supporting, using `roleGuidance(role)` + `aria-live="polite"`.

### Styles
- `mediaComposer.module.css` + `.d.ts` — new `.guidanceMuted` / `.guidanceGood` / `.guidanceWarn` / `.guidanceProblem` utility classes with tinted backgrounds matching the existing editorial palette (neutral, green, ochre, red). Already consistent with the `editorialNotice` treatment used elsewhere in the Publisher.

### Barrel
- `mediaComposer/index.ts` exports `assessAltText`, `assessCaption`, `roleGuidance`, and their types so other surfaces (future gallery grouping UI, or a preview inspector) can reuse the same assessment.

## Gallery grouping
The Step-01 design explicitly scopes `GalleryGroup` authoring out of the composer until product validates the need. The author-assistance surface added in this step is structured so a future step can add a `assessGalleryGroup` helper and a grouping chooser without disturbing the current layout — the `fieldHelper` / guidance-message pattern is in place.

## Doctrine alignment
- **Author-confident, accessible-first.** Problem-level alt text blocks save; warn-level guidance steers without blocking.
- **Editorial tone.** Guidance copy frames the reader audience ("screen-reader users depend on this"; "editorial context"), not rulebook tone.
- **Host-safe.** Pure string work, no new dependencies, no schema change. Local styles only.
- **Reusable primitives preserved.** No shared UI-kit churn; the guidance banners are feature-scoped utility classes consistent with the existing editorial palette.

## Accessibility
- Guidance messages update via `aria-live="polite"` for non-blocking levels, `role="alert"` for the problem level, so screen-reader users get real-time assistance.
- `aria-describedby` links the alt-text textarea to its guidance so assistive tech announces it together.
- `aria-invalid` on the alt-text textarea when blocking.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run mediaComposer altTextGuidance` — 37/37 pass (adds 14 guidance tests to the existing 27 media composer tests).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/altTextGuidance.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/altTextGuidance.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaComposer.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaComposer.module.css.d.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/index.ts`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-e-media-and-gallery-redesign/step-03/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 04** — Persistence + preview + gallery-contract hardening. Extend `validationEngine` with a non-blocking alt-text length / quality warning that mirrors the composer's assessment, so the validation panel surfaces the same guidance at save time.
- **Step 05** — Full behavioural scrub + workstream README + closure.

No blockers.

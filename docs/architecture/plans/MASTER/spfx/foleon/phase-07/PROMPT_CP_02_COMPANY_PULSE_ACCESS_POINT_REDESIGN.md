# CP-02 — Company Pulse Access-Point Redesign

## Objective

Implement the Phase 1 Company Pulse redesign as a **Foleon publication access point / current edition launcher**, using the already reworked `ProjectSpotlightReaderLayout` as the governing reference model for product logic, interaction posture, and data honesty.

Company Pulse must **not** become a parallel internal news reader, article feed, digest board, newsroom database, or HB-managed content system.

The corrected product relationship is:

> HB Central introduces and launches the current Company Pulse Foleon edition. Foleon remains the system of record for the full publication, editorial structure, rich media, sequencing, and content management.

This prompt is an implementation prompt. Make the code changes necessary to convert Company Pulse from the current briefing/digest posture into a polished access-point lane while preserving the existing Foleon viewer governance, preview behavior, disabled/refusal semantics, and no-inline-iframe posture.

---

## Controlling Inputs

Use current `main` as repo truth.

Use the completed CP-01 audit as the immediate planning input. CP-01 found that Company Pulse is already architecturally compatible with the access-point model because it uses the shared full-window viewer path and no inline iframe, but the current UI and copy still carry digest-board framing through header/digest/timeline/category-chip structures.

Do not rely on memory, prior summaries, screenshots, or assumptions when source files are available.

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level implementation details, contradictions, dependencies, or drift after changes.

---

## Research Anchors to Preserve

Do not conduct a broad redesign outside the access-point model. The research direction is settled:

1. **Foleon is the content creation and publishing system.** Foleon’s platform and governance model center around centralized brand controls, templates, workspaces, user permissions, and publication operations. HB Central must not duplicate that content lifecycle.

2. **Foleon embedded publications can update without redeploying the host site.** Foleon iframe guidance supports host pages acting as launch/display surfaces while the Foleon Doc remains the live content experience.

3. **SharePoint/Viva news surfaces act as entry points.** Microsoft news layouts and employee-experience cards are launch/entry patterns into larger content, not replacements for the full content experience.

4. **Fluent card guidance supports one clear card action.** The existing Project Spotlight single-card launch pattern is the correct accessibility and interaction model: one obvious action, keyboard-accessible via a real actionable control, with the full-card hit target achieved through the existing `::after` pattern.

---

## Files to Inspect First

Inspect these files before changing code:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
```

Inspect only as needed:

```text
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/FoleonViewerTypes.test.ts
packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
```

---

## Do-Not-Touch Boundaries

Do not modify the following unless repo truth proves a narrow, necessary reason and you document it in the closure report:

```text
packages/foleon-reader/src/components/FoleonIframeHost.tsx
packages/foleon-reader/src/services/FoleonOriginPolicy.ts
packages/foleon-reader/src/services/FoleonReaderContentService.ts
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
```

Do not:

- weaken accepted origins;
- weaken iframe governance;
- reintroduce inline iframe rendering in the Company Pulse lane;
- fabricate ready-state stories, events, recognition items, operations items, authors, read times, or category routing;
- make static category labels appear to be working filters/tabs;
- create a parallel Company Pulse article system in HB Central;
- break PFV preview viewer behavior;
- break Project Spotlight or Leadership Message;
- use global `overflow-x: hidden`;
- hide layout overflow rather than fixing it;
- create a white-card-inside-colored-card composition;
- copy Apple News or any proprietary product UI.

---

## Product Definition

### Correct definition

Company Pulse is a **Foleon publication access point**.

### Incorrect definitions

Company Pulse is not:

- a native HB Central news reader;
- a digest board;
- a multi-article feed;
- a story database;
- a newsroom dashboard;
- a replacement for Foleon;
- an authoring surface for Marketing.

---

## Project Spotlight Reference Pattern

Use `ProjectSpotlightReaderLayout` as the product-logic reference, not as a visual copy source.

Reuse these patterns:

- one dominant media-forward card;
- one interactive card-launch `<button>`;
- full-card hit target through the existing accessible `::after` pattern;
- full-window viewer opening through `useFoleonFullWindowViewer`;
- no inline iframe in the lane;
- publication title as the launchable headline;
- optional CTA pill as a visual affordance only, not a second control;
- archive action outside the launch card;
- visible disabled/refusal reason using `aria-disabled` and `aria-describedby`;
- preview honesty signaling.

Do not reuse these Project Spotlight-specific pieces:

- project-specific `projectFacts`;
- project-specific `projectMedia` naming if a Company Pulse-specific media model is more honest;
- `projectLabel`;
- `featureCallout`;
- “Project · …” kicker;
- Location / Market / Featured fact chips;
- Spotlight-specific “Monthly feature” semantics except as a conceptual parallel.

---

## Required End-State Structure

Replace the current Company Pulse briefing/digest composition with a current-edition launcher structure.

Use these component concepts inside `CompanyPulseReaderLayout.tsx` or equivalent local helpers:

```text
CompanyPulseEditionLauncher
  CompanyPulseMediaStage
  CompanyPulseEditionOverlay
  CompanyPulseLaunchButton
  CompanyPulseCoverageLabels
  CompanyPulseFooter
```

The rendered structure should conceptually follow this wireframe:

```text
ARTICLE: Company Pulse edition launcher surface

  LAUNCH CARD: one dominant card, full-card clickable through one button
    MEDIA STAGE:
      - heroImageUrl or thumbnailUrl if available and ready
      - editorial gradient / publication-cover placeholder if no media or preview
      - scrim/overlay for text readability

    OVERLAY / CONTENT:
      - eyebrow: Company Pulse
      - state/cadence chip:
          ready: Current edition OR record cadence if employee-facing
          preview: Preview
      - optional freshness:
          Updated {formatted lastEditorialUpdate/publishedOn}
      - title:
          record title in ready state
          preview title in preview state
      - teaser:
          record summary if present
          honest fallback if absent
      - coverage labels:
          Company News
          Events
          Recognition
          Operations
        These are coverage cues only, not buttons/tabs/filters.
      - visual CTA pill:
          Open Company Pulse
        This must sit inside the one launch button or otherwise remain non-interactive.

  FOOTER OUTSIDE LAUNCH CARD:
    - optional HbcButton: View previous editions
    - optional archive note, rewritten without system/admin language

  WARNINGS:
    - only if viewModel warnings exist
```

---

## Required Markers

Change the lane-specific layout marker from the current briefing marker to a new access-point marker:

```text
data-foleon-layout="company-pulse-edition-launcher"
```

Preserve:

```text
data-foleon-reader-layout="company-pulse"
data-foleon-reader-lane="companyPulse"
data-foleon-reader-state={viewModel.state}
data-foleon-article-card
data-foleon-article-lane="companyPulse"
data-foleon-viewer-target-id={target.id}
data-foleon-article-state={articleState}
```

Do not remove stable markers unless tests and repo authority prove the marker is obsolete.

---

## Data Mapping Requirements

Use only record-backed fields in ready state.

Allowed ready-state sources from `FoleonContentRecord`:

```text
title
summary
lastEditorialUpdate
publishedOn
issueDate only if repo truth shows it is appropriate
cadence
thumbnailUrl
heroImageUrl
contentTypeKey
primaryAudience only if the final copy remains employee-facing
archiveGroup only if the final copy remains employee-facing
publishedUrl
embedUrl
allowEmbed
requiresExternalOpen
```

Allowed preview-state sources:

```text
LANE_PREVIEW_COPY.companyPulse
previewLabel
preview target from createPreviewFoleonViewerTarget
static preview coverage labels if clearly marked as sample/preview
```

Ready state must not invent:

```text
secondary stories
story cards
authors
bylines
read time
event details
recognition details
operations notes
department ownership
individual article thumbnails
story category assignments
real category filter behavior
timeline entries
```

---

## View-Model Guidance

Prefer the smallest safe change.

### Acceptable approach

Keep existing `briefingLead` temporarily if changing the public view-model contract creates unnecessary churn, but reinterpret it in the layout as the **edition lead**, not as a news article lead.

If adding optional fields improves clarity and testability, add non-breaking optional fields such as:

```ts
readonly pulseMedia?: {
  readonly primaryImageUrl?: string;
  readonly thumbnailUrl?: string;
  readonly hasRecordMedia: boolean;
  readonly isPlaceholder: boolean;
  readonly accessibleLabel?: string;
};

readonly pulseCoverageLabels?: readonly {
  readonly id: string;
  readonly label: string;
}[];

readonly pulseEditionLabel?: string;
readonly pulseCtaLabel?: string;
```

Only add these if they materially improve implementation clarity. Do not add future-schema article-feed fields.

### Remove/demote digest-specific fields

Remove from active rendering in `CompanyPulseReaderLayout`:

```text
renderDigest(viewModel)
briefingDigest grid
digestEmpty panel
pulseTimeline strip
categoryChips as chip rail
hardcoded "Frequent" chip
```

You may leave view-model fields intact for compatibility if tests are updated and layout no longer renders them as a digest/feed. Do not over-refactor in Phase 1.

---

## Copy Requirements

Rewrite visible Company Pulse copy to avoid “reader / digest / briefing / in-line viewer” system language.

### Required copy direction

Use:

```text
Company Pulse
Current edition
Open Company Pulse
View previous editions
Preview
Preview — no live edition selected
Updated {date}
Published {date}
The full Company Pulse publication opens in the governed Foleon viewer.
```

Avoid:

```text
Company Pulse Reader
Company Pulse reader
Preview layout
Frequent
Latest Company Pulse update
Recent Company Pulse updates
More updates
Open full archive
in-line viewer
briefing
digest
newsroom
sample news update
sample upcoming event
sample recognition note
sample operations update
```

### Disabled copy replacements

Replace employee-facing disabled copy with publication-first language.

Use:

```text
Preview only — the current Company Pulse edition will open here when published.
This Company Pulse edition is missing its Foleon viewer link.
This Company Pulse edition cannot open in the embedded viewer.
This Company Pulse edition must open outside HB Central.
This Company Pulse edition is not available yet.
```

Avoid:

```text
in-line viewer
embeddable Foleon URL
governance policy
published link if available
```

Use technical language only if it is deliberately admin/diagnostic text and not part of the employee-facing surface.

---

## Visual Design Requirements

The Company Pulse lane must be visually distinct from Project Spotlight but equal in quality.

### Direction

Use a warm, editorial communications surface:

- publication-cover feel;
- strong dominant title;
- restrained metadata;
- high contrast text on media/scrim;
- one primary visual CTA;
- coverage labels as supporting cues;
- no dense card grid.

### Avoid

- nested white card inside a large colored/gradient card;
- four equal digest cards;
- preview timeline cards;
- fake story tiles;
- tab-like category chips;
- excessive metadata;
- developer/system copy.

### Suggested class names

Add Company Pulse-specific CSS classes. Example:

```css
.pulseEditionSurface
.pulseEditionCard
.pulseMediaStage
.pulseMediaImage
.pulseMediaPlaceholder
.pulseMediaScrim
.pulseEditionOverlay
.pulseEyebrowRow
.pulseEyebrow
.pulseStateChip
.pulseFreshness
.pulseEditionTitle
.pulseEditionTeaser
.pulseLaunchButton
.pulseCtaPill
.pulseCoverageLabels
.pulseCoverageLabel
.pulseDisabledReason
.pulseFooter
.pulseArchiveNote
.pulseWarning
```

You may choose different names if consistent and typed in `FoleonReaderLayouts.module.css.d.ts`.

### Edge and overflow posture

Preserve existing edge-bleed-ready behavior:

- outer surface `margin-inline: 0`;
- no root inline margin override;
- no global overflow suppression;
- internal safe area handled through clamp-based spacing;
- no hidden overflow masking unless needed for rounded media/card internals.

---

## Interaction Requirements

### Launch behavior

The primary edition card must open the shared full-window viewer through:

```ts
useFoleonFullWindowViewer().openViewer(target, event.currentTarget)
```

### One-control rule

Inside the card marked with `data-foleon-article-card`, there must be exactly one interactive control:

```text
button
```

Do not add nested links, buttons, or interactive chips inside the launch card.

The CTA pill must be visual only when inside the button:

```tsx
<span aria-hidden="true">Open Company Pulse →</span>
```

### Preview behavior

Preview state must:

- remain actionable;
- open local preview content;
- not mount an iframe;
- clearly identify itself as preview/sample;
- not present fake live articles.

### Ready behavior

Ready state must:

- use only the active Foleon record;
- open iframe only inside the full-window viewer;
- not render inline iframe;
- not render secondary digest/story cards.

### Disabled behavior

For disabled ready records:

- preserve `aria-disabled`;
- preserve `aria-describedby`;
- preserve `data-foleon-article-last-refusal`;
- render visible employee-facing reason text;
- do not open the viewer.

---

## Accessibility Requirements

Maintain or improve current accessibility:

- `article` has `aria-labelledby` pointing to the visible title.
- The launch button has a clear accessible name from the publication title.
- Disabled states remain focusable and explain refusal through visible text.
- Coverage labels are non-interactive text/list items, not fake buttons.
- Focus ring is visible across the launch card.
- Preview and full-window viewer behavior remains keyboard operable.
- Escape close/focus restoration is preserved by the provider.
- Image alt text must be honest:
  - if no editorial alt text exists, use conservative generated fallback such as `Company Pulse cover image for {title}`;
  - decorative placeholders must be `aria-hidden="true"`.

---

## Tests to Update

Update `CompanyPulseReaderLayout.test.tsx` aggressively. The current test suite encodes digest assumptions and must move to the access-point model.

### Remove or replace tests expecting

```text
data-foleon-layout="company-pulse-briefing"
Preview layout
populated digest spanning four conceptual categories
ready empty digest state
More updates
Recent Company Pulse updates
pulse timeline
```

### Add or update tests for

1. **Layout marker**
   - renders `data-foleon-layout="company-pulse-edition-launcher"`;
   - preserves `data-foleon-reader-layout="company-pulse"`;
   - preserves `data-foleon-reader-lane="companyPulse"`;
   - preview/ready states share the same layout marker with only state differing.

2. **Access-point structure**
   - renders one dominant `data-foleon-article-card`;
   - renders “Company Pulse”;
   - renders “Open Company Pulse” visual CTA;
   - renders title from active record in ready state;
   - renders summary from active record in ready state.

3. **No digest/feed fabrication**
   - ready state does not render populated digest;
   - ready state does not render preview timeline;
   - ready state does not render fake secondary cards;
   - category/coverage labels are non-interactive if rendered.

4. **Preview honesty**
   - preview state is visibly marked as preview;
   - preview state does not claim live content;
   - preview state opens local preview viewer;
   - preview mode mounts no iframe.

5. **Viewer behavior**
   - ready valid target opens full-window viewer;
   - full-window viewer uses iframe only inside the viewer;
   - the lane itself renders no inline iframe even if `iframeSurface` is provided.

6. **Disabled/refusal behavior**
   - `allowEmbed: false` records refusal and visible reason;
   - missing `embedUrl` records refusal and visible reason;
   - `requiresExternalOpen: true` records refusal and visible reason;
   - disabled target does not open viewer.

7. **Single-control card pattern**
   - exactly one interactive control inside `[data-foleon-article-card]`;
   - the control is a `button`.

8. **Regression**
   - Project Spotlight layout tests still pass;
   - Leadership Message tests still pass if suite includes them;
   - no global overflow suppression is introduced.

---

## View-Model Tests

If view-model tests exist and fail after copy or field changes, update them to assert the corrected access-point language.

Expected direction:

- `LANE_LABELS.companyPulse.eyebrow` should be `Company Pulse`, not `Company Pulse Reader`.
- Preview title should not be `Company Pulse reader`.
- Preview labels should not imply a live feed.
- Ready `briefingDigest` may remain `[]` for compatibility, but layout must no longer render an empty digest board.
- Static coverage labels may exist only as non-interactive coverage cues.

---

## Full-Window Preview Content

If the preview viewer content is touched in this prompt, keep the change narrow.

Preferred Company Pulse preview viewer copy:

```text
Title: Company Pulse Preview
Summary: This preview shows how HB Central introduces the current Company Pulse edition. Marketing manages the full publication in Foleon.
Notice: When a live edition is selected, this window opens the governed Foleon viewer.
Primary label: Current edition
Secondary label: Foleon publication
Bullets:
  - Current edition
  - Company updates
  - Recognition and events
  - Full Foleon publication
```

Do not turn the preview viewer into a fake publication or fake multi-article feed.

If preview viewer changes expand scope too much, defer them to CP-03 and document the deferral.

---

## Validation Commands

Run the package-level validations:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

If broader homepage package/runtime behavior is affected, also run:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types
```

Do not claim success for commands that were not run.

---

## Package / Version Guidance

This prompt primarily changes source behavior in `@hbc/foleon-reader` embedded into the homepage runtime. Before packaging, inspect repo authority for homepage package versioning.

If changes affect shipped homepage runtime behavior, bump only the HB Homepage lockstep set if repo policy requires it:

```text
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

Do not bump `HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION` unless repo truth proves it controls the changed package.

Do not bump standalone Foleon package authority unless standalone SPFx package source changes or authority tests require it.

If runtime changes are intended to ship in the homepage SPPKG, rebuild using the repo-authoritative packaging command:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

Expected artifact:

```text
dist/sppkg/hb-intel-homepage.sppkg
```

Package proof must include:

```text
command run
artifact path
modified timestamp
file size
SHA-256
manifest/package version
bundled string proof for company-pulse-edition-launcher
bundled string proof for Open Company Pulse
bundled string proof that obsolete digest strings are not present, if applicable
```

---

## Acceptance Criteria

Implementation is acceptable only if:

- Company Pulse reads as a Foleon publication access point, not a native HB article/feed system.
- The lane visually aligns with the Project Spotlight quality level while remaining distinct.
- The lane has one dominant launch card.
- The launch card has one interactive control.
- The card opens the full-window Foleon viewer.
- Preview opens local preview content and mounts no iframe.
- Ready valid target opens the governed iframe inside the full-window viewer.
- Ready disabled target refuses with visible reason.
- The lane renders no inline iframe.
- Ready state renders no fabricated secondary stories.
- Digest/timeline behavior is removed from the visible layout.
- Coverage labels, if retained, are clearly non-interactive coverage cues.
- Employee-facing copy avoids “reader / briefing / digest / in-line viewer” language.
- Project Spotlight remains unchanged and its tests pass.

---

## Closure Report Format

Return this exact structure:

```text
Summary:
<brief summary of the implemented Company Pulse access-point redesign>

Files changed:
- <file path>: <what changed>

Repo-truth notes:
- <any source contradictions or decisions>

Implementation details:
- <layout changes>
- <view-model changes>
- <copy changes>
- <interaction/accessibility changes>

Data honesty:
- <what ready-state data is used>
- <what was intentionally not invented>

Tests run:
- <command>: <pass/fail + relevant notes>

Package/version:
- <whether package/version was touched>
- <if built, artifact proof>

Risks / follow-ups:
- <remaining risk or CP-03/CP-04 follow-up>

Commit summary:
Foleon reader: redesign Company Pulse as edition launcher

Commit description:
Refactors Company Pulse from a digest-style briefing board into a Project-Spotlight-aligned edition launcher for Foleon-managed content. Preserves full-window viewer behavior, preview targets, disabled refusal semantics, and no-inline-iframe posture while removing fabricated ready-state secondary content and employee-facing digest/reader language.
```

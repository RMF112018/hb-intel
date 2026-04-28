# PROMPT_PS_02_PROJECT_SPOTLIGHT_VISUAL_FIRST_LAYOUT_IMPLEMENTATION_UPDATED.md

# Project Spotlight Foleon Reader — Visual-First Layout Implementation

You are working in a fresh local code-agent session against the live `RMF112018/hb-intel` repository.

## Objective

Implement the **Project Spotlight Visual Storyboard / Cinematic Hybrid** layout for the HB Homepage embedded Foleon Project Spotlight reader.

The current Project Spotlight surface still reads like a developer-visible Foleon reader preview with metadata labels. The required outcome is an employee-facing, media-forward monthly project showcase that invites users to open the full-window Foleon story.

The implementation must move Project Spotlight from:

> “developer-visible Foleon reader preview with metadata labels”

to:

> “employee-facing visual monthly project showcase that invites users into a full-window Foleon story.”

This is an implementation prompt. Make code changes only within the scope defined below.

---

## Mandatory Context Handling

Do **not** re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependency behavior, or drift after changes.

When source files are available, repo truth controls over summaries, memories, or prior assumptions.

---

## Controlling Baselines

Treat these as controlling references:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md
```

If any baseline document is missing or stale, document the issue in the closure report and proceed from current source truth.

---

## Binding PS-01 Audit Findings

The PS-01 audit confirmed the following. Treat these findings as binding unless current repo truth directly contradicts them.

### Renderer / Mount Path

- Project Spotlight is rendered by:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
```

- It is registered as `projectSpotlight` in:

```text
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
```

- It is mounted on the homepage through:

```text
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

- It occupies the homepage major-left Row 1 slot:

```text
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
```

Specifically:
- occupant: `project-portfolio-spotlight`
- slot: `slot-row-1-project-portfolio-spotlight`
- band: `band-row-1-operational-spotlight`
- role: `primary`
- column span: `major`

### Existing Supported Fields

The PS-01 audit confirmed these fields already exist on `FoleonContentRecord` and may be used in PS-02 without schema changes:

```text
title
summary
cadence
heroImageUrl
thumbnailUrl
previewUrl
issueDate
publishedOn
relatedProjectName
relatedProjectNumber
region
sector
embedUrl
publishedUrl
allowEmbed
requiresExternalOpen
archiveGroup
primaryAudience
```

### Fields Not Supported Yet

Do **not** introduce these in PS-02. Defer them to PS-03 schema/content-model follow-up:

```text
image gallery
video URL
video thumbnail
captions
alt text
focal point
project team
distinct client field separate from relatedProjectName / relatedProjectNumber
```

### Viewer / Interaction Invariants

Project Spotlight uses the full-window viewer exclusively.

Preserve all of the following:

- no inline iframe in the Project Spotlight lane;
- full-window viewer launch remains the route for ready content;
- preview target remains disabled with `disabledReason: 'preview-only'`;
- ready target gating remains:

```text
embedUrl && allowEmbed && !requiresExternalOpen
```

- no accepted-origin policy changes;
- no Foleon iframe governance changes;
- no backend sync changes;
- no SharePoint/Foleon list schema changes.

### CSS / Edge-Bleed Invariants

Preserve the shell edge contract:

- `.featureSurface` must remain edge-bleed-ready;
- no outer `padding-inline` on `.featureSurface`;
- keep `margin-inline: 0`;
- internal safe area must stay on inner blocks using a clamp-based variable;
- do not use global `overflow-x: hidden`.

### Test Invariants

Keep the following Project Spotlight tests green or update them only to match the intended visual-first behavior while preserving the invariant:

- no inline iframe;
- single interactive control per article card;
- structured `data-foleon-article-last-refusal` markers;
- preview/disabled card behavior;
- full-window viewer keyboard/click behavior;
- sibling lane marker isolation;
- no invented ready-state data.

---

## Required Source Files to Inspect

At minimum inspect these current files before changing code:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
packages/foleon-reader/src/readers/readerConfigs.ts
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
```

Also inspect version/package authority files only if implementation changes require a version bump under repo policy.

---

## Files Likely to Change

Primary expected changes:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
```

Possible, only if required by repo truth:

```text
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

Do not touch unrelated reader lanes except for shared type/test updates that are strictly necessary.

---

## Do-Not-Touch Boundaries

Do not modify:

```text
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/components/FoleonIframeHost.tsx
packages/foleon-reader/src/services/FoleonOriginPolicy.ts
packages/foleon-reader/src/services/FoleonReaderContentService.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

unless repo truth proves a narrow, necessary change. If you must touch any of these, document why in the closure report.

Do not change:

- Foleon accepted origins;
- iframe governance;
- backend sync;
- SharePoint/Foleon list schemas;
- runtime registry behavior;
- homepage shell band/slot ordering;
- Company Pulse or Leadership Message visual design;
- Project Spotlight full-window viewer launch model.

Do not reintroduce:

- inline iframe in Project Spotlight;
- developer/status metadata as the dominant primary UI;
- raw DOM-order-dependent edge behavior;
- global `overflow-x: hidden`;
- multiple nested interactive controls inside the Project Spotlight article card.

---

## Required Design Direction

Implement the **Visual Storyboard / Cinematic Hybrid**.

The layout should feel like a polished monthly project feature, not a reader/debug panel.

### Required Structure

The Project Spotlight lane should include:

1. **Dominant media area**
   - Use `heroImageUrl` when present.
   - Fall back to `thumbnailUrl` when `heroImageUrl` is absent.
   - Fall back to a polished gradient/media-placeholder treatment in preview or when neither image field is present.
   - Do not generate or fabricate production images.
   - Do not use external placeholder image services.

2. **Supporting visual tiles**
   - Use existing supported image fields only.
   - If both `heroImageUrl` and `thumbnailUrl` exist and differ, use `thumbnailUrl` as a supporting tile.
   - If there are insufficient real image fields, render honest visual preview blocks or editorial teaser blocks, not fake production media.
   - Do not invent gallery media.

3. **Employee-facing headline**
   - Prefer project/story language.
   - Avoid “reader” as primary title language.
   - Ready state should use the record title.
   - Preview state should use a realistic, honest preview title such as:
     - `Project Spotlight`
     - `Inside the Project`
     - `This Month’s Project Spotlight`

4. **Short teaser**
   - Use `summary` when present.
   - If summary is absent in ready state, use an honest missing-copy fallback:
     - `A project summary has not been provided for this spotlight.`
   - Keep the homepage teaser concise.

5. **Clear launch action**
   - Use employee-facing CTA language:
     - `View project spotlight`
     - `Open full spotlight`
   - The visible card launch control may remain bound to the title for the single-button card-launch pattern, but the visual surface should clearly communicate the action.
   - Preserve the single interactive control inside the card.

6. **Minimal employee-relevant metadata**
   - Keep only employee-relevant facts on the primary visual surface:
     - location/region;
     - sector/market;
     - monthly feature/cadence;
     - optionally project name if distinct from title.
   - Demote or remove these from the primary visual surface:
     - `Audience`
     - `Archive group`
     - duplicated `Cadence`
     - `Monthly Status`
   - Archive information may remain in a footer/action area or test/diagnostic marker, not in the primary visual hierarchy.

7. **Preview honesty**
   - Preview must be clearly labeled but not developer-facing.
   - Replace `Preview layout` with `Preview` or `Coming soon`.
   - Avoid `Sample client`, `Sample location`, `Sample market`, `Sample team`, `Sample milestone` as dominant UI copy.
   - Preview should read as a realistic sample of the final employee experience, not a system/debug panel.

---

## Copy Requirements

Replace developer/system language with employee-facing copy.

### Replace / Demote

| Current | Required Direction |
|---|---|
| `Project Spotlight Reader` eyebrow | `Project Spotlight` |
| `Project Spotlight reader` title | ready: `{record.title}`; preview: `This Month’s Project Spotlight` or `Project Spotlight` |
| `Preview layout` | `Preview` or `Coming soon` |
| `Monthly Status` | remove from primary UI or convert to `Featured this month` |
| `Audience` | remove from primary UI |
| `Archive group` | remove from primary UI; keep only in archive/footer/admin context if needed |
| duplicated `Cadence` row | consolidate into one `Monthly feature` chip |
| `Why this project matters` | replace with `Why we’re featuring it` or remove if teaser copy covers it |
| `Preview only — a live Project Spotlight edition will open here when published.` | `Preview shown. The full spotlight will open when this month’s feature is published.` |
| `Sample client/location/market/team/milestone` | remove from dominant UI; use clearly sample preview language only where necessary |

### Required Copy Deck

Implement or prepare for the following copy states.

#### Preview State

- Eyebrow: `Project Spotlight`
- Status chip: `Preview`
- Cadence chip: `Monthly feature`
- Title: `This Month’s Project Spotlight`
- Teaser: `A visual project feature will appear here once this month’s Foleon spotlight is published.`
- Disabled reason: `Preview shown. The full spotlight will open when this month’s feature is published.`
- CTA-style visual text: `View project spotlight` or `Open full spotlight` must appear as visible affordance, even if disabled in preview.

#### Ready State With Complete Data

- Eyebrow: `Project Spotlight`
- Cadence chip: `Monthly feature` or record-backed cadence if provided.
- Title: record title.
- Teaser: record summary.
- CTA: `View project spotlight`
- Metadata/facts:
  - `Location` from `region`;
  - `Market` from `sector`;
  - `Featured` from `issueDate` / `publishedOn`;
  - optional `Project` from `relatedProjectName` if distinct from title.

#### Ready State With Missing Optional Data

- Do not invent data.
- Omit optional fact chips when absent unless the absence would confuse the user.
- If a required visual field is missing, use a polished non-deceptive fallback visual.
- If summary is missing, use:
  - `A project summary has not been provided for this spotlight.`

#### Disabled / No Embed State

Keep current structured disabled behavior, but make visible copy employee-facing:

- `This spotlight is not available in the viewer yet.`
- If embed is not allowed:
  - `This spotlight cannot open in the embedded viewer.`
- If no embed URL:
  - `This spotlight is missing its Foleon viewer link.`
- If external open required:
  - `This spotlight must open outside the homepage.`

Do not change the underlying disabled-reason enum.

---

## Data Mapping Requirements

Use only existing `FoleonContentRecord` fields.

### Ready-State Mapping

| UI Need | Source |
|---|---|
| title/headline | `record.title` |
| teaser | `record.summary` |
| primary media | `record.heroImageUrl ?? record.thumbnailUrl` |
| supporting media | `record.thumbnailUrl`, only if present and meaningfully distinct from `heroImageUrl` |
| cadence chip | `record.cadence ?? 'Monthly'` |
| location | `record.region` |
| market | `record.sector` |
| project label | `record.relatedProjectName ?? record.relatedProjectNumber` |
| featured date | `record.issueDate ?? record.publishedOn` |
| viewer URL | existing `resolution.embedUrl` / `record.embedUrl` path only |
| external URL | existing `record.publishedUrl` path only |

### Preview-State Mapping

Preview may use clearly labeled sample text and non-deceptive visual placeholders.

Do not present preview placeholders as live project information.

### Data Honesty Rules

- Do not fabricate client names.
- Do not fabricate team names.
- Do not fabricate gallery/video media.
- Do not infer alt text from filenames as a production data substitute.
- Do not display `Not listed` repeatedly in the primary visual layout; prefer omitting absent optional facts.
- If a field is absent, either omit it or use an honest fallback copy.

---

## Media Handling Requirements

### Primary Media

Add a media model to the view model if needed, for example:

```ts
interface FoleonReaderProjectMedia {
  readonly primaryImageUrl?: string;
  readonly thumbnailUrl?: string;
  readonly hasRecordMedia: boolean;
  readonly isPlaceholder: boolean;
}
```

Use existing fields:

```ts
primaryImageUrl = record.heroImageUrl ?? record.thumbnailUrl;
thumbnailUrl = record.thumbnailUrl;
```

Preview may use styled placeholder panels and editorial labels. Do not use generated images.

### Accessibility

Because the schema does not currently carry alt text:

- For record-backed project media, use a conservative generated accessible label based on known record fields:
  - `Project Spotlight image for {title}`
- For decorative gradient/placeholder blocks, set:
  - `aria-hidden="true"`
- Do not claim the generated label is editorial alt text.
- Do not introduce empty alt text on meaningful project imagery unless the image is strictly decorative.

### Visual Placeholder

When no record media exists:

- Use a polished gradient/abstract construction/editorial visual treatment.
- Label preview state clearly.
- In ready state, do not say an image exists; keep the visual as a branded fallback.

---

## Layout Behavior Requirements

### Desktop Paired Layout

For the major-left slot in Row 1:

- dominant media should carry the visual weight;
- text should be concise and layered or adjacent;
- supporting tiles should not overwhelm the primary image;
- the lane should visually blend with the homepage rather than feeling like a bordered admin panel;
- avoid large metadata ribbons.

### Desktop / Full-Width

When the shell gives Project Spotlight more room:

- use a cinematic primary image/banner;
- allow storyboard tiles to sit alongside or below the primary media;
- maintain internal safe areas;
- do not rely on fixed pixel widths that break at intermediate viewport sizes.

### Tablet

- stack media and content cleanly;
- keep CTA visible;
- preserve focus outline and hit area;
- avoid text overflow.

### Mobile

- single-column stack;
- primary image first;
- concise title + teaser;
- one clear launch affordance;
- preview/disabled state remains understandable;
- no horizontal overflow.

---

## Specific Implementation Expectations

### ProjectSpotlightReaderLayout.tsx

Refactor the layout from the current metadata-heavy structure to the Visual Storyboard / Cinematic Hybrid.

Expected changes include:

- remove the primary metadata ribbon from the dominant visual hierarchy;
- replace `Project Spotlight Reader` with `Project Spotlight`;
- replace `Preview layout` with `Preview` or `Coming soon`;
- replace the title/summary block with an employee-facing project showcase heading;
- add a visual media stage;
- add supporting visual/story tiles where existing supported data allows;
- render compact facts only when useful and backed by existing fields;
- keep card launch button as the only interactive control inside the card;
- keep archive action/footer outside the article card if it remains visible;
- keep disabled reason visible and connected through `aria-describedby`.

### FoleonReaderViewModel.ts

Update the view model only as needed.

Expected changes may include:

- add Project Spotlight media fields;
- add employee-facing Project Spotlight copy fields;
- adjust preview copy;
- adjust lane labels from `Project Spotlight Reader` to `Project Spotlight`;
- avoid changing Company Pulse or Leadership copy unless shared typing requires it;
- keep ready-state values sourced only from `FoleonContentRecord`.

### FoleonReaderLayouts.module.css

Update/add classes for:

- visual storyboard surface;
- primary media frame;
- media fallback;
- supporting tiles;
- overlay/scrim text readability;
- concise fact chips;
- CTA affordance styling;
- preview chip;
- responsive behavior;
- focus-visible card outline.

Preserve:

- `.featureSurface` edge-bleed posture;
- no outer inline padding;
- no global overflow-x suppression;
- scoped styles only.

### FoleonReaderLayouts.module.css.d.ts

Update the CSS module declaration to match added/removed classes.

---

## Testing Requirements

Update or add tests covering:

### View Model

- preview uses employee-facing title/copy;
- preview label is `Preview` or `Coming soon`, not `Preview layout`;
- ready state maps `heroImageUrl` / `thumbnailUrl` correctly;
- ready state maps `cadence`, `region`, `sector`, `relatedProjectName`;
- missing optional fields are omitted or handled honestly;
- no invented team/client/gallery/video fields.

### Layout

- renders visual-first Project Spotlight marker(s);
- does not render `Project Spotlight reader`;
- does not render `Project Spotlight Reader` as the primary eyebrow;
- does not render `Monthly Status`, `Audience`, `Archive group`, and duplicated `Cadence` in the primary visual surface;
- uses `heroImageUrl` as primary media when provided;
- falls back to `thumbnailUrl` when `heroImageUrl` is absent;
- renders polished fallback when neither media URL exists;
- keeps preview visibly labeled;
- keeps disabled reason visible and connected to `aria-describedby`;
- keeps no inline iframe;
- keeps single interactive control inside the card;
- opens full-window viewer for ready content when wrapped in provider;
- records structured refusal for preview/disabled targets.

### Regression

Preserve sibling-lane isolation:

- Company Pulse layout markers remain scoped to Company Pulse;
- Leadership layout markers remain scoped to Leadership;
- Project Spotlight visual changes do not alter the mounted homepage shell/preset.

---

## Validation Commands

Run the most focused commands first.

Required:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

If homepage package/source files are changed or version authority is touched, also run:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If package/version files are changed, run the repo’s package authority/version proof tests used by the homepage package.

If an existing unrelated failure blocks a broader suite, document:

- command run;
- failure;
- why it is unrelated;
- focused validation that did pass.

Do not claim validation passed if it did not run.

---

## Versioning / Package Guidance

Use conditional version bumps only.

Do not churn:

```text
HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION
```

unless the repo’s package/version policy requires it because bundled runtime behavior changed.

If source behavior in the shipped SPFx surface changes and repo policy requires version advancement:

- update all required package/version authority files together;
- keep manifest/package/constant versions in lockstep;
- run the associated version authority tests;
- document the version bump in the closure report.

If no package/version bump is made, explicitly state why.

---

## Documentation / Proof Requirements

Create or update a concise implementation proof document only if the repo already has a natural location for this wave.

Recommended path if documentation is expected by the existing plan structure:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/07_PROJECT_SPOTLIGHT_VISUAL_FIRST_IMPLEMENTATION_REPORT.md
```

The report should include:

- source files changed;
- data fields consumed;
- media behavior;
- copy changes;
- preserved viewer/iframe governance;
- preserved edge contract;
- tests run and results;
- known limitations;
- follow-up PS-03 schema items.

Do not create noisy docs if the repo convention for this phase does not require a new report. Use judgment based on existing plan structure.

---

## Acceptance Criteria

The implementation is acceptable only when all of the following are true:

- Project Spotlight visually reads as a monthly employee-facing project showcase.
- Imagery/media receives the dominant visual weight.
- `heroImageUrl` / `thumbnailUrl` are consumed when present.
- Preview state is honest but no longer developer-facing.
- Primary UI no longer emphasizes `Reader`, `Monthly Status`, `Audience`, `Archive group`, or duplicated `Cadence` labels.
- The layout has one clear launch affordance into the full-window viewer.
- Full-window viewer behavior is preserved.
- Inline iframe remains absent.
- Disabled/preview refusal behavior remains structured and visible.
- No production project data is invented.
- Missing unsupported fields are omitted or honestly handled.
- Edge-bleed readiness is preserved.
- No global overflow suppression is introduced.
- Tests prove the critical invariants.
- Validation results are reported honestly.

---

## Closure Report Requirements

At completion, provide a concise closure report with:

```text
Summary:
<what changed>

Files changed:
<paths and purpose>

Data fields consumed:
<existing FoleonContentRecord fields used>

Behavior preserved:
<viewer, iframe governance, card launch, data honesty, edge contract>

Validation:
<commands and results>

Versioning:
<whether version bump was required and why>

Known limitations:
<items deferred to PS-03>

Commit:
<commit hash if committed, or explicit no-commit status>
```

---

## Commit Summary / Description Target

Use this commit format if changes are committed:

```text
Summary:
Project Spotlight Foleon reader: implement visual-first monthly showcase layout

Description:
Refactors the Project Spotlight homepage Foleon lane into a visual-first monthly project showcase using existing FoleonContentRecord media and project fields. Consumes heroImageUrl/thumbnailUrl where available, replaces developer-facing reader/metadata language with employee-facing spotlight copy, preserves full-window viewer routing, keeps inline iframe absent, retains single-button card-launch behavior, and maintains the homepage edge-bleed contract.

Validation:
- pnpm --filter @hbc/foleon-reader test
- pnpm --filter @hbc/foleon-reader check-types
- pnpm --filter @hbc/foleon-reader lint
- <homepage validation if run>
```

Do not commit unless the local workflow expects the agent to commit. If you do not commit, provide the exact suggested commit summary/description in the closure report.

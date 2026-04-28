# PROMPT PS-01 — Project Spotlight Visual Audit and Data Mapping

You are working in the `RMF112018/hb-intel` repository. Use current `main` as repo truth.

## Objective

Conduct a final, line-level repo-truth audit of the Project Spotlight Foleon reader lane before implementation. Produce a concise mapping of current data, language, media support, full-window viewer behavior, tests, and package/version authority. Do not implement code changes in this prompt.

## Critical Instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.

## Files to Inspect

At minimum inspect:

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
```

Also inspect package/version authority files used by hbHomepage package tests.

## Required Audit Output

Create a local markdown report or paste into closure report with these sections:

### 1. Current renderer

- Which component renders Project Spotlight?
- Which registry path selects it?
- Which homepage host mounts it?
- Which occupant/slot does it map to?

### 2. Current language

List every primary Project Spotlight user-facing string and classify as:

- keep;
- replace now;
- hide/demote;
- future/admin only.

Explicitly include:

```text
Project Spotlight reader
Project Spotlight Reader
Preview layout
Monthly Status
Audience
Archive Group
Cadence
Why this project matters
Sample client/location/market/team/milestone
Preview only — a live Project Spotlight edition will open here when published.
```

### 3. Current data mapping

Map preview and ready fields:

- title
- summary
- eyebrow
- preview label
- freshness label/value
- audience
- archive group
- project facts
- feature callout
- primary article
- viewer target

### 4. Media support

Audit whether current code/schema supports:

- hero image
- thumbnail image
- gallery images
- video URL
- video thumbnail
- captions
- alt text
- media type
- focal point
- project team
- client
- region/location
- sector/market
- project number/name
- embed URL
- published URL

Separate into:

```text
Already supported
Available indirectly / can be mapped
Not supported / future schema
Must not be invented
```

### 5. Viewer behavior

Confirm:

- Project Spotlight uses full-window viewer.
- Inline iframe is not rendered.
- Preview target is disabled.
- Ready target opens only when `embedUrl`, `allowEmbed`, and `!requiresExternalOpen` are satisfied.
- Origin policy remains in `FoleonIframeHost`.

### 6. CSS/edge behavior

Confirm current edge-bleed posture:

- outer surface margin/padding;
- internal safe area;
- absence of global overflow suppression;
- shell edge contract dependencies.

### 7. Tests

List existing tests that will need updates and proposed assertions.

### 8. Package/version authority

Identify exact files/tests governing package version lockstep.

## Do-Not-Touch Boundaries

- No source changes.
- No package/version changes.
- No schema changes.
- No Company Pulse/Leadership changes.
- No Foleon origin/backend changes.

## Closure Requirements

Return:

```text
Summary:
Audit findings:
Implementation implications:
Files inspected:
No-code-change confirmation:
Recommended next prompt:
```

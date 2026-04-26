# Prompt 03 — Project Spotlight and Company Pulse Reader UI

## Objective

Implement the shared `FoleonReaderModule` and the two dedicated homepage reader routes:

- Project Spotlight Reader
- Company Pulse Reader

## Global Rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in your current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety/backend files outside Foleon scope, or untracked phase docs.
- Do not weaken Foleon reader gate, origin allowlist, preview URL blocking, or runtime proof.
- Preserve the scalar-safe public content registry projection.
- Do not add public `$select` of `MarketingOwner`, `AudienceGroups`, or any person field without a specific `$expand` design and tests.
- Do not make tenant changes unless this prompt explicitly asks for a tenant migration step.
- Keep generated artifacts out of commits unless repo policy proves they are committed.


## Required Files

Add or update:

```text
src/readers/FoleonReaderModule.tsx
src/readers/ProjectSpotlightReader.tsx
src/readers/CompanyPulseReader.tsx
src/readers/FoleonReaderPreview.tsx
src/readers/readerConfigs.ts
src/FoleonApp.tsx
src/runtime/foleonRuntimeContract.ts
src/types/foleon-event.types.ts
src/webparts/foleon/FoleonWebPart.manifest.json
```

## Route Requirements

Add routes:

```text
projectSpotlight
companyPulse
```

Update:

- route type;
- route announcement;
- nav parsing;
- renderPage;
- runtime proof route union;
- tests.

## Toolbox Requirements

Add toolbox entries:

```text
HB Intel Project Spotlight Reader
HB Intel Company Pulse Reader
```

Keep Manager entry. Do not remove legacy Highlights unless specifically approved.

## UI Requirements

### Project Spotlight

- primary / immersive;
- metadata rail;
- monthly status;
- larger default iframe area;
- archive affordance.

### Company Pulse

- secondary / operational;
- latest update label;
- compact reader chrome;
- archive affordance.

## Mobile Requirements

Do not eagerly mount both iframes on mobile. Render a collapsed card-first state and mount/open the iframe only on user action.

## Preview Requirements

Route-specific previews must show the intended shape of each reader. Do not use fake Foleon content, fake CTAs, anchors, fake iframes, or disabled reader buttons.

## Telemetry

Add page contexts if needed:

```text
Project Spotlight
Company Pulse
```

Do not emit production content telemetry for previews.

## Tests

Add tests for:

- route parsing/rendering;
- toolbox defaults if package proof tests cover manifest;
- Project Spotlight preview;
- Company Pulse preview;
- ready record iframe path;
- blocked real record path;
- mobile collapsed behavior;
- no preview telemetry.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

## Commit

```text
hb-intel-foleon: add project spotlight and company pulse readers
```

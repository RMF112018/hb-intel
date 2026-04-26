# 05 — Data Fixture and Content Model

## Model decision

Use a preview-specific model, not fake live `FoleonContentRecord` values.

Reasoning:

- Prevents accidental use of production telemetry callbacks.
- Prevents accidental reader routing.
- Avoids confusing preview records with SharePoint list items.
- Keeps fixture validation independent from live schema mapping.

## Recommended TypeScript types

```ts
import type { FoleonContentType } from '../types/foleon-content.types.js';

export type FoleonPreviewLayoutRole = 'feature' | 'compact';

export interface FoleonPreviewRecord {
  readonly id: string;
  readonly title: string;
  readonly contentTypeKey: FoleonContentType;
  readonly summary: string;
  readonly issueDateLabel: string;
  readonly relatedProjectName?: string;
  readonly relatedProjectNumber?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly layoutRole: FoleonPreviewLayoutRole;
}
```

Optional helper:

```ts
export function isFoleonPreviewRecord(value: unknown): value is FoleonPreviewRecord
```

## Fixture placement

Recommended file:

`apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`

Export:

```ts
export const FOLEON_PREVIEW_HIGHLIGHTS: ReadonlyArray<FoleonPreviewRecord>;
export const FOLEON_PREVIEW_ARCHIVE: ReadonlyArray<FoleonPreviewRecord>;
```

## Sample fixture records

Use clear sample data:

```ts
export const FOLEON_PREVIEW_HIGHLIGHTS = [
  {
    id: 'preview-project-spotlight',
    title: 'Project Spotlight: Coastal Residence Progress',
    contentTypeKey: 'Project Highlight',
    summary: 'Sample preview of a monthly project spotlight that will profile active work once Foleon publications are connected.',
    issueDateLabel: 'Sample issue',
    relatedProjectName: 'Sample Project',
    relatedProjectNumber: 'Preview',
    region: 'Southeast Florida',
    sector: 'Ultra-luxury Residential',
    layoutRole: 'feature',
  },
  {
    id: 'preview-company-pulse',
    title: 'Company Pulse: Quarterly News Digest',
    contentTypeKey: 'Company News',
    summary: 'Sample preview of company updates, events, and internal announcements.',
    issueDateLabel: 'Sample issue',
    region: 'Companywide',
    sector: 'Internal Communications',
    layoutRole: 'compact',
  },
  {
    id: 'preview-market-update',
    title: 'Market Update: Florida Construction Outlook',
    contentTypeKey: 'Market Update',
    summary: 'Sample preview of a market intelligence publication for operational awareness.',
    issueDateLabel: 'Sample issue',
    region: 'Florida',
    sector: 'Commercial / Multifamily',
    layoutRole: 'compact',
  },
  {
    id: 'preview-leadership-message',
    title: 'Leadership Message: Building Continuity Across Teams',
    contentTypeKey: 'Leadership',
    summary: 'Sample preview of a leadership communication distributed through the Foleon content program.',
    issueDateLabel: 'Sample issue',
    region: 'Companywide',
    sector: 'Leadership',
    layoutRole: 'compact',
  },
] as const;
```

## Forbidden fixture fields

Preview fixture records must not include:

- `foleonDocId`
- `publishedUrl`
- `previewUrl`
- `embedUrl`
- `contentRegistryItemId`
- `SharePoint item IDs`
- real Foleon document IDs
- real unpublished publication identifiers

## Image strategy

Do not include external placeholder services or random internet images.

Preferred methods:

1. CSS-only editorial placeholders:
   - gradient panels;
   - subtle pattern backgrounds;
   - abstract geometric shapes;
   - content-type icon overlays.

2. Approved local assets only if repo already contains them and licensing is clear.

3. Decorative image semantics:
   - use CSS background where possible;
   - if `<img>` is used for decorative sample art, `alt=""`.

## Safe action model

Preview cards should render one of:

- disabled button with visible helper copy;
- `aria-disabled="true"` non-routing button-like element;
- muted status pill: `Preview only`.

Recommended:

```tsx
<button type="button" disabled aria-describedby={helperId}>
  Preview only
</button>
<p id={helperId}>Sample card — no publication is currently linked.</p>
```

If using a disabled button, ensure the helper copy is visible because disabled controls may be skipped by keyboard users.

## Fixture tests

Add tests proving:

- fixture IDs start with `preview-`;
- no fixture has URL-like fields;
- all records have non-empty `title`, `summary`, and `contentTypeKey`;
- at least one feature and three compact preview records exist;
- every title or helper text communicates sample/preview status either in the surrounding region or card affordance.

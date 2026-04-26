# 04 — Technical Architecture Plan

## Architecture decision

Implement preview fallback as isolated frontend-only view model and components. Do not add backend calls, SharePoint fixtures, or list provisioning changes.

## Files likely to add

Recommended names:

- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css` or equivalent CSS module
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`
- route tests under `apps/hb-intel-foleon/src/__tests__/` or existing colocated test convention

## Files likely to modify

- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx` only if the route-safe preview wrapper cannot be achieved separately
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts` at final packaging for `1.0.17.0`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json` at final packaging for `1.0.17.0`
- `apps/hb-intel-foleon/README.md`
- `apps/hb-intel-foleon/docs/*` where existing runbooks should mention preview fallback

## Preview data isolation

Do not mutate `FoleonContentRecord` globally with a preview flag. Instead:

```ts
export interface FoleonPreviewRecord {
  readonly id: string;
  readonly title: string;
  readonly contentTypeKey: FoleonContentType;
  readonly summary: string;
  readonly issueDateLabel: string;
  readonly relatedProjectName?: string;
  readonly region?: string;
  readonly sector?: string;
  readonly layoutRole: 'feature' | 'compact';
}
```

If reuse of `FoleonCard` is strongly preferred, convert preview records to a separately named `FoleonPreviewCardViewModel`, not to fake live `FoleonContentRecord` instances with synthetic live IDs. That avoids accidental telemetry and reader routing.

## Component approach

### `FoleonPreviewFallback`

Props:

```ts
interface FoleonPreviewFallbackProps {
  readonly route: 'highlights' | 'hub';
  readonly compact?: boolean;
}
```

Responsibilities:

- render preview banner;
- render preview feature/card grid;
- render route-specific copy;
- expose accessible region labels;
- never call live `onOpenReader`, `onOpenExternal`, or `onCardImpression`.

### `FoleonPreviewCard`

Props:

```ts
interface FoleonPreviewCardProps {
  readonly record: FoleonPreviewRecord;
  readonly variant: 'feature' | 'compact';
}
```

Responsibilities:

- display Preview badge;
- render safe CSS/image placeholder;
- render metadata, title, summary;
- render `Preview only` non-routing affordance;
- do not accept live callbacks.

## Highlights integration

Current logic:

```ts
if (state.records.length === 0) return <FoleonEmpty ... />
```

Replace with:

```tsx
if (state.records.length === 0) {
  return <FoleonPreviewFallback route="highlights" />;
}
```

Do not call `onCardImpression` with preview records. Current effect calls `onCardImpression(records)` after materialization. This is safe for empty records but ensure no preview records are inserted into `records`.

## Content Hub integration

Current logic uses `filtered.length === 0` only. Refactor:

```ts
const hasLiveRecords = state.kind === 'ready' && state.records.length > 0;
const hasActiveFilter = query.trim().length > 0 || typeFilter !== 'All';

if (state.kind === 'ready' && state.records.length === 0) {
  return <FoleonPreviewFallback route="hub" />;
}

if (hasLiveRecords && filtered.length === 0) {
  return <FoleonEmpty title="No publications match your filters." ... />;
}
```

## Manager integration

Add a small guidance panel when `state.kind === 'ready' && state.content.length === 0`, preferably within the main column before the empty editor panel.

Do not block actions. Do not present sample content as editable records.

## Telemetry protection

Hard rule: preview components must not receive or call live route callbacks.

Tests should prove:

- `onCardImpression` is not called for preview records;
- `onOpenReader` is not called by preview cards;
- `onOpenExternal` is not rendered/called for preview cards;
- preview state emits no live telemetry unless a future explicit preview event type is added.

No new telemetry type is required for the first pass.

## Runtime proof preservation

Do not modify:

- `resolveFoleonRuntimeContract()` blocking rules;
- `publishRuntimeBindingProof()`;
- `buildFoleonRuntimeConfigBridge()`;
- `FOLEON_DIAGNOSTICS_QUERY_FLAG`;
- existing typed issue codes.

The proof must continue to show `canInitialize` based on configuration readiness, not content availability.

## Package versioning

If all implementation lands in one feature branch:

- change `FOLEON_PACKAGE_VERSION` from `1.0.16.0` to `1.0.17.0`;
- change manifest `version` from `1.0.16.0` to `1.0.17.0`;
- update manifest `expectedPackageVersion` defaults from `1.0.16.0` to `1.0.17.0`;
- update docs that refer to healthy proof version.

Do not bump per prompt unless each prompt is deployed independently.

## Dependency impacts

No new dependencies are required. Current package already includes the approved premium stack. Use existing `@hbc/ui-kit/homepage`, CSS modules, and available icons where useful.

## Unrelated areas to avoid

- Do not modify Safety app files.
- Do not modify unrelated `.gitignore`.
- Do not modify untracked phase docs.
- Do not change shell bridge behavior except if a direct bug is found and documented.
- Do not alter provisioning assets unless the implementation proves a schema-dependent need, which is not expected.

# 03 — Backend API Contract

## Route group

All routes live under:

```text
/api/foleon
```

## Role model

Suggested backend app roles:

```text
HBIntelFoleonViewer
HBIntelFoleonEditor
HBIntelFoleonPublisher
HBIntelFoleonAdmin
HBIntelFoleonOperator
```

## Route map

| Method | Route | Purpose | Required role |
|---|---|---|---|
| GET | `/api/foleon/content` | List/search managed content | Viewer |
| GET | `/api/foleon/content/{id}` | Get content record detail | Viewer |
| POST | `/api/foleon/content` | Create content draft | Editor |
| PATCH | `/api/foleon/content/{id}` | Update editable metadata | Editor |
| POST | `/api/foleon/content/{id}/validate` | Validate reader/display readiness | Editor |
| POST | `/api/foleon/content/{id}/publish` | Publish visible content | Publisher |
| POST | `/api/foleon/content/{id}/suppress` | Suppress content | Publisher |
| GET | `/api/foleon/placements` | List homepage placements | Viewer |
| POST | `/api/foleon/placements` | Create placement | Publisher or Homepage Manager |
| PATCH | `/api/foleon/placements/{id}` | Update placement | Publisher or Homepage Manager |
| DELETE | `/api/foleon/placements/{id}` | Deactivate/delete placement | Publisher or Homepage Manager |
| POST | `/api/foleon/sync/docs` | Sync Foleon Docs | Operator |
| POST | `/api/foleon/sync/projects` | Sync Foleon Projects | Operator |
| GET | `/api/foleon/sync/status` | Current sync health | Viewer |
| GET | `/api/foleon/sync/runs` | Run history | Operator |
| POST | `/api/foleon/provision-sharepoint` | Provision/repair lists | Admin |
| POST | `/api/foleon/validate-sharepoint` | Validate list contract | Admin or Operator |
| GET | `/api/foleon/config` | Safe frontend config | Viewer |

## DTOs

### ContentSummaryDto

```ts
interface FoleonContentSummaryDto {
  id: string;
  sharePointItemId: number;
  etag: string;
  title: string;
  foleonDocId: number;
  contentTypeKey: string;
  publishStatus: string;
  isVisible: boolean;
  isHomepageEligible: boolean;
  publishedUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  summary?: string;
  region?: string;
  sector?: string;
  publishedOn?: string;
  validationStatus: 'valid' | 'warning' | 'blocked' | 'unknown';
  blockingReasons: string[];
}
```

### ContentDetailDto

```ts
interface FoleonContentDetailDto extends FoleonContentSummaryDto {
  previewUrl?: string;
  heroImageUrl?: string;
  marketingOwner?: string;
  issueDate?: string;
  displayFrom?: string;
  displayThrough?: string;
  relatedProjectNumber?: string;
  relatedProjectName?: string;
  relatedProjectSiteUrl?: string;
  tags: string[];
  openMode: 'Inline Reader' | 'Fullscreen Reader' | 'New Tab Only';
  allowEmbed: boolean;
  requiresExternalOpen: boolean;
  syncSource: 'Manual' | 'Foleon API' | 'Hybrid';
  lastSynced?: string;
  adminNotes?: string;
}
```

### ContentMutationRequest

```ts
interface FoleonContentMutationRequest {
  etag?: string;
  title: string;
  foleonDocId: number;
  contentTypeKey: string;
  publishStatus: string;
  isVisible: boolean;
  isHomepageEligible?: boolean;
  publishedUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  summary?: string;
  region?: string;
  sector?: string;
  tags?: string[];
  displayFrom?: string;
  displayThrough?: string;
  openMode: 'Inline Reader' | 'Fullscreen Reader' | 'New Tab Only';
  allowEmbed: boolean;
  requiresExternalOpen?: boolean;
  adminNotes?: string;
}
```

### PlacementDto

```ts
interface FoleonPlacementDto {
  id: string;
  sharePointItemId: number;
  etag: string;
  title: string;
  placementKey: 'Hero' | 'Primary Card' | 'Secondary Card' | 'Carousel' | 'Archive Rail';
  contentItemId: number;
  foleonDocId: number;
  isActive: boolean;
  displayFrom?: string;
  displayThrough?: string;
  sortRank: number;
  layoutVariant?: 'Large Feature' | 'Compact Card' | 'Square Tile' | 'Text Rail';
  validationStatus: 'valid' | 'warning' | 'blocked';
  blockingReasons: string[];
}
```

## Validation contract

Every mutation must return validation output:

```ts
interface FoleonValidationResult {
  status: 'valid' | 'warning' | 'blocked';
  blockingReasons: string[];
  warnings: string[];
  normalizedFields: Record<string, unknown>;
  checkedAtUtc: string;
  correlationId: string;
}
```

## Required validation rules

Backend must validate:

- Foleon Doc ID exists or is accepted as manual pending.
- Published URL is not a preview URL when publishing.
- URL is HTTPS.
- URL origin is in accepted origin list.
- `AllowEmbed` and `RequiresExternalOpen` are coherent.
- `OpenMode = New Tab Only` forces or implies external behavior.
- `PublishStatus=Published` requires `IsVisible=true` for display.
- `DisplayThrough` is after `DisplayFrom`.
- Homepage placement content is published/visible or marked as intentionally scheduled.
- `ContentIdCache` equals selected content `FoleonDocId`.
- Mutations include matching eTag when updating existing records.

## Error model

Use stable error shapes:

```ts
interface FoleonApiError {
  errorCode: string;
  message: string;
  details?: unknown;
  correlationId: string;
  retryable: boolean;
}
```

Suggested error codes:

```text
FOLEON_AUTH_FORBIDDEN
FOLEON_ROLE_MISSING
FOLEON_CONFIG_MISSING
FOLEON_GRAPH_WRITE_FAILED
FOLEON_GRAPH_CONFLICT
FOLEON_DOC_NOT_FOUND
FOLEON_URL_PREVIEW_BLOCKED
FOLEON_ORIGIN_NOT_ALLOWED
FOLEON_PLACEMENT_INVALID
FOLEON_SHAREPOINT_CONTRACT_INVALID
FOLEON_SYNC_FAILED
```

## Concurrency

Graph list item updates must use eTag/`if-match` where available. On stale eTag return 409 or 412-style domain error and require UI refresh before overwrite.

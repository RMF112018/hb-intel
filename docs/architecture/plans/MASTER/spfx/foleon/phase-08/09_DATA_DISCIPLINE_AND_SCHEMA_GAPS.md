# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Data Discipline and Schema Gap Table

Do not invent content. The layout must render only available, derivable, or explicitly governed data.

| Field | Current status | Recommendation |
|---|---|---|
| executive name | Not available in `FoleonContentRecord` | Add optional Manager/SharePoint field `executiveName`; otherwise omit. |
| executive role/title | Not available | Add optional `executiveRole`; otherwise omit. |
| executive photo | Not available | Add optional `executivePhotoUrl` and `executivePhotoAlt`, or integrate governed directory/photo source. Do not fake. |
| source/office label | Not available as dedicated field | Add optional `sourceLabel`; fallback to `A message from leadership`. |
| headline | Available: `title` | Use as primary heading. |
| subhead/summary | Available: `summary` | Use as teaser only; do not render full message body. |
| pull quote | Currently derived from `summary` | Stop deriving for production. Add optional `pullQuote` or omit. |
| published date | Available: `publishedOn`, `lastEditorialUpdate`, `issueDate` | Use formatted date when present. |
| message period | Partly derivable from dates/archive group | Add optional `messagePeriodLabel` if needed. Do not show raw archive group. |
| topic/category | `contentTypeKey` too broad | Add optional `topicLabel` or `messageTheme`; omit if unavailable. |
| audience | Available: `primaryAudience` | Show only when targeted or meaningful. Omit `Companywide` unless space allows. |
| estimated read time | Not available | Add optional `estimatedReadTimeMinutes` or derive only from real word count if available from Foleon API. |
| estimated watch time | Not available | Add optional `estimatedWatchTimeMinutes` or `hasVideo` + duration metadata. |
| video indicator | Not available | Add optional `hasVideo` / `mediaType`. |
| thumbnail/hero image | Available: `thumbnailUrl`, `heroImageUrl` | Use only if real. No dead image well if missing. |
| image alt text | Not available | Add optional `heroImageAlt`. Generated fallback may be acceptable but should not over-describe. |
| Foleon URL | Available: `publishedUrl` | Use for external-open-only/new-tab path. |
| embed URL | Available: `embedUrl` | Use for full-window viewer when allowed. |
| preview URL | Available: `previewUrl` | Use only in safe preview/admin contexts. |
| open mode | Available: `openMode` | Drive CTA behavior. |
| allow embed | Available: `allowEmbed` | Drive viewer eligibility. |
| blocked reason | Derivable from viewer target | Keep internal structured reasons; render employee-safe copy. |
| archive/expired state | Partly available: `publishStatus`, `activeEdition`, `displayThrough` | Create normalized state in view model. |
| cadence | Available | Do not show to employees. Use internally only. |
| archive group | Available | Do not show to employees. Use archive filtering only. |
| sync source | Available | Never show in reader. |

## Minimum viable no-schema implementation

Without schema additions, the rebuilt reader can still be improved using:

- title;
- summary;
- publish/freshness date;
- state/open mode;
- viewer target;
- optional hero/thumbnail image;
- audience only if not generic.

It should omit identity, pull quote, read/watch time, and topic if unavailable.

## Recommended schema additions

Add optional fields through the Foleon Manager/SharePoint list layer:

```ts
executiveName?: string;
executiveRole?: string;
sourceLabel?: string;
executivePhotoUrl?: string;
executivePhotoAlt?: string;
topicLabel?: string;
messageTheme?: string;
pullQuote?: string;
estimatedReadTimeMinutes?: number;
estimatedWatchTimeMinutes?: number;
mediaType?: 'article' | 'video' | 'rich-media';
heroImageAlt?: string;
messagePeriodLabel?: string;
```

These fields are optional. The layout must remain premium when they are absent.

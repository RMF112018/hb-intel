# TeamViewer — Photo, Identity, and Fallback Policy (Phase-01 Prompt-04)

## Locked photo precedence

1. **Explicit `person.photoUrl`** — provided directly on the article
   team-member row. Wins unconditionally.
2. **SharePoint Delve photo** — `/_layouts/15/userphoto.aspx?accountname=<email|upn>&size=L`,
   computed synchronously via `createSharePointUserPhotoResolver`
   (no fetch needed — the URL itself is deterministic).
3. **Graph-backed blob URL** — `createGraphPersonPhotoFn` fetches the
   photo only when **no** SharePoint site URL is available. When both
   are available they resolve to the same Delve photo; we skip Graph
   to avoid redundant work.
4. **Initials fallback** — applied by the card component when no URL
   resolves OR when an `<img onError>` fires against a broken URL.

## Caching strategy

- Deterministic URLs (precedence 1 & 2) are synchronous; no cache
  needed.
- Graph blob URLs (precedence 3) are cached in the hook's internal
  `graphCache` keyed by email/upn, deduplicated across renders.
- No module-level cache is introduced. Adding one should reuse
  `createCacheInvalidationBus` (same pattern as `usePeopleCultureData`).

## Fallback behavior (all encoded in code, not implied)

| Condition | Result |
|---|---|
| Missing photo | Initials avatar with accent-gradient background. |
| Broken image URL (`<img onError>`) | Card state flips to initials avatar; layout preserved. |
| Missing title (`jobTitle`) | Title row omitted, card rhythm preserved. |
| Missing display name | Row dropped at normalization; never rendered. |
| Malformed scalar fields | Coerced to `undefined` at normalization. |
| Missing email AND upn | Skip SP/Graph lookup; initials fallback. |
| Graph fetch error | Silently ignored; initials fallback. |
| SP endpoint 404 for user without Delve photo | `<img onError>` → initials fallback. |

## Identity metadata preserved for the drawer

The normalization layer preserves all fields the flag-gated drawer
depends on (`email`, `upn`, `profileUrl`, `bio`, `resumeRichText`,
`resumeDocumentUrl`, `department`, `teamLabel`). Photo hydration is
purely additive — no field is stripped.

## Generalization decision

- **Local hook**: photo hydration stays in `hooks/useTeamViewerPhotoHydration.ts`.
- Consolidation to a shared `homepage/shared/usePersonPhotoHydration.ts`
  remains earmarked for when a second consumer appears. Kudos today
  uses a recipient-specific hook; TeamViewer uses a person-generic one;
  making both drive through a shared hook is a Wave-2 concern.

## Data-exposure review

- The hook never exposes Graph tokens — it only consumes the token
  provider callback.
- `userphoto.aspx` URLs embed the user's email/upn, same as existing
  webparts; this is not treated as sensitive by HB Intel doctrine.
- Graph blob URLs are object URLs scoped to the document; they are
  not persisted beyond the component lifecycle.
- `sources` map (diagnostics) contains only person ids plus a
  `TeamViewerPhotoSource` string — no PII.

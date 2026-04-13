# 08 — Prompt 04: Photo, Identity, and Fallback System

You are working in the live local HB Intel repo.

## Objective

Implement the final photo / identity / fallback system for `teamViewer` so people render correctly and degrade gracefully across real SharePoint-hosted scenarios.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Repo-truth reference seams

Inspect and learn from:
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureProfilePhotoResolver.ts`
- `packages/ui-kit/src/HbcAvatarStack/index.tsx`
- any Graph token/photo seam already used by homepage webparts

## Required output decisions

Lock and document:
1. photo precedence order
2. caching strategy
3. fallback avatar behavior
4. title/name fallback behavior
5. malformed-record policy
6. whether a generic photo hydration helper was extracted or a local `teamViewer` hook was used

## Required implementation work

Implement the final person-photo behavior for `teamViewer`.

This may include:
- `useTeamViewerPhotoHydration.ts`
- resolver composition
- initials fallback logic
- field normalization
- safe handling of broken image URLs
- safe handling of missing titles

## Mandatory photo precedence

Implement a clear order such as:
1. explicit photo URL
2. SharePoint profile photo resolver
3. Graph-backed person photo
4. initials fallback

If you choose a different order, justify it in code comments and docs.

## Closure requirements

Before closing this prompt:

- prove missing-photo behavior is intentional
- prove missing-title and missing-name behavior is intentional
- prove broken images do not break layout
- prove the runtime does not expose internal-only data accidentally


## Additional identity/content rule

Because `teamViewer` is article-bound, your normalization must preserve enough identity metadata to support:
- card/row display
- article-linked ordering/grouping
- future-enabled bio/resume drawer rendering

Do not normalize away fields the detail drawer will need.

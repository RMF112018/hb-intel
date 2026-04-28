# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Repo-Truth Findings

### Files inspected

- `packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx`
- `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts`
- `packages/foleon-reader/src/types/foleon-content.types.ts`
- `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts`
- `packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md`

### Current implementation summary

The current Leadership Message layout is a lane-owned layout, not the legacy compatibility shell. It uses:

- `data-foleon-reader-layout="leadership-message"`
- `data-foleon-reader-lane="leadershipMessage"`
- `data-foleon-layout="leadership-message"`
- shared `articleCard` and `cardLaunch` interaction classes;
- `useFoleonFullWindowViewer()` for the full-window launch;
- no inline iframe for this lane.

This is architecturally sound as a launch model. The user-facing composition is the weak point.

### Current view-model issues

`FoleonReaderViewModel.ts` still defines Leadership with weak product language and placeholder fields:

- lane eyebrow: `Leadership Message Reader`;
- preview title: `Leadership Message reader`;
- preview label: `Preview layout`;
- preview byline: `Sample executive byline`;
- preview role: `Sample role`;
- preview quote: `Sample pull quote — ...`;
- preview body: `Sample message body — ...`;
- context notes: `Audience: Sample audience`, `Cadence: Leadership`;
- ready context notes: `Audience`, `Archive group`.

These are the direct source of the hosted screenshot’s “pile of sample text” problem.

### Current layout issues

`LeadershipMessageReaderLayout.tsx` renders the following order:

1. eyebrow row;
2. cadence chip `Executive update`;
3. preview label;
4. H2 title as launch button;
5. summary;
6. byline row;
7. pull quote;
8. message body;
9. context notes list;
10. disabled reason;
11. archive footer;
12. warnings.

This sequence lacks a decisive employee reading path. The layout has no visible primary CTA except the title button. It duplicates summary/body behavior in ready state and gives equal visual weight to byline, quote, body, and metadata.

### Current data model

`FoleonContentRecord` currently supports:

- `title`
- `contentTypeKey`
- `readerKey`
- `cadence`
- `homepageSlot`
- `archiveGroup`
- `activeEdition`
- `primaryAudience`
- `lastEditorialUpdate`
- `publishStatus`
- visibility flags
- `publishedUrl`
- `previewUrl`
- `embedUrl`
- `thumbnailUrl`
- `heroImageUrl`
- `summary`
- `issueDate`
- `publishedOn`
- `displayFrom`
- `displayThrough`
- project-specific fields
- `openMode`
- `allowEmbed`
- `requiresExternalOpen`
- `syncSource`

It does **not** currently support:

- executive name;
- executive role/title;
- executive portrait;
- executive office/source label;
- editorial pull quote as its own field;
- topic/category label beyond broad content type;
- estimated read/watch time;
- video indicator;
- image alt text;
- CTA intent.

### Comparison: Project Spotlight

Project Spotlight has a stronger product identity because it uses a media stage, overlay, CTA pill, controlled fact row, and a visual-first hierarchy. It does not show internal placeholders as the dominant content.

Leadership should not copy the visual drama of Project Spotlight, but it should match the discipline:

- clear single focal object;
- visible CTA;
- restrained metadata;
- no fake body content;
- state-specific copy.

### Comparison: Company Pulse

Company Pulse has a clearer “top story + supporting stories” IA and uses board-level structure. It has some preview language, but the user can still understand the product function quickly.

Leadership should remain more restrained than Company Pulse, but it needs the same clarity:

- top-level heading should be employee-facing;
- current/preview/live state should be understandable;
- supporting content should be subordinate;
- card action should be obvious.

### Tests

`LeadershipMessageReaderLayout.test.tsx` asserts many architectural invariants:

- lane markers are emitted;
- no Project Spotlight / Company Pulse markers;
- no legacy support skeleton;
- no inline iframe;
- single interactive control inside the card;
- provider-wrapped click opens viewer;
- disabled records produce refusal markers;
- sibling lanes remain stable.

The tests currently validate mechanics more than product quality. New tests must enforce copy discipline and absence of internal/sample fields.

## Root Causes

| Root cause | Impact |
|---|---|
| View model still uses developer/product labels | Production and preview read as internal scaffolding. |
| Preview placeholders are too literal | Screenshot looks unfinished, not intentionally preview-only. |
| Ready-state absence is rendered as visible absence | `Executive byline not provided.` is honest but not employee-grade. |
| Layout renders article-like body despite Foleon ownership | HB Intel appears to own or partially publish the content. |
| CTA is not visibly expressed | Users are not clearly told to open the full Foleon message. |
| Metadata is unfiltered | Audience/cadence/archive concepts leak internal management concerns. |
| Leadership has no source/identity model | Executive-grade trust cues cannot render without fake content. |
| Tests do not fail on poor copy | Mechanical pass allows product-quality failure. |

## Audit Conclusion

The current lane is mechanically viable and architecturally close to the other reader lanes, but it fails the product, content, hierarchy, and copy standards required for a leadership communication surface. The fix should start in the view model, then rebuild the layout around an access-point model.

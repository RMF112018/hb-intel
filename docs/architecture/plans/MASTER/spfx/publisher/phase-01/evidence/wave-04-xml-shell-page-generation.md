# Wave 4 / Prompt-04 — XML-Shell Page-Generation Engine

**Closed:** 2026-04-13
**Scope:** Canonical v1 shell manifest + parser, pure page compositor, SharePoint Pages REST creation service, shell-service facade, and unit tests for the full deterministic chain.

---

## 1. Shell service surface

All Wave 4 code lives under
`apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/` —
co-located with the publisher adapter so repository, resolver, and
page-generation code share one typed boundary.

| Module | Role |
|--------|------|
| `xmlShellManifest.ts` | Typed, inert mirror of the canonical PnP XML. Freezes shell identity (`ps-shell-inprogress-oob-banner-team-gallery-v1` / `1.0.0`), source site/page path, header flags, three-section layout, and `controlsBySlot` lookup. Control IDs match arch doc 05 §"Suggested logical mapping" exactly: banner `cbe7b0a9…`, subhead `00dbc510…`, body `d4061c71…`, team `c2f1b4e7…`, gallery `af8be689…`. |
| `xmlShellParser.ts` | Pure `parseProjectSpotlightShellXml(xml)` parser over PnP `Provisioning/ClientSidePage` nodes. Not called at runtime in v1 (the manifest is authoritative); exists to unit-test that the committed manifest matches the canonical XML and to support future shell variants without hand-transcribing control IDs. |
| `pageCompositor.ts` | Pure `composeProjectSpotlightPage(context, shell)`. Consumes a `PublishResolutionContext` and produces a `ComposedPage` with five typed slot payloads (`BannerControlPayload`, `TextControlPayload` × subhead+body, `TeamViewerControlPayload`, `ImageGalleryControlPayload`) plus `HiddenControlPayload` for suppressed blocks. Respects `Template.ShowTeamBlock` / `ShowGalleryBlock`, renderer-kind `none`, and post-level `ShowTeamViewer` / `ShowGallery`. `validateComposedPageStructure` enforces the five-slot-single-occurrence contract. |
| `pageCreationService.ts` | SharePoint Pages REST wrapper (`/_api/sitepages/pages`). Two-step workflow: (1) POST to ensure a page record under the target `FileName`, falling back to a GET-by-`FileName` when the tenant returns 409/500 (existing page), then (2) MERGE-PATCH the resolved page's `CanvasContent1` with a serialized canvas built by `serializeCanvasContent`. `serializeCanvasContent` is exported pure so tests can assert the JSON shape without network I/O. |
| `pageShellService.ts` | Thin facade: `composePage(context)` (pure, used by preview) and `publishPage(context)` (composes + structural-validates + delegates to the injected `PageCreationService`). Does **not** write the page-binding row — that is Wave 5 / Prompt-05. |
| `index.ts` | Barrel. Re-exported from the parent `publisherAdapter` barrel so consumers import everything from a single path. |

## 2. Shell-version strategy

Shell identity is stamped on every composed page via
`ComposedPageIdentity`:

```
{ shellKey, shellVersion, templateKey, templateVersion, sourceTemplatePath, ... }
```

These fields propagate unchanged to the `ClientSidePage` write call
and are the exact values Wave 5 will persist into the
`Project Spotlight Page Bindings` list (fields `PageShellKey`,
`PageShellVersion`, `TemplateKey`, `TemplateVersion`,
`SourceTemplatePath`). Wave 5 / later republish logic compares the
shell version on the binding row to the current manifest's
`shellVersion` to decide between in-place update and full
regeneration.

Changing the shell requires three aligned edits: (a) the canonical
XML, (b) a new `PageShellKey` + bumped `PageShellVersion` in
`xmlShellManifest.ts`, (c) an architecture-doc update for the new
shell family. The xml-parser test will fail if (a) ↔ (b) drift.

## 3. Shell-structure verification evidence

The composed-page tests assert the five mandated v1 zones in exact
section order — section 1 banner (FullWidthImage), section 2
subhead / body / team, section 3 gallery — and the parser tests
assert the same order against the canonical XML.

**Test run (vitest, all publisherAdapter):**

```
Test Files  3 passed (3)
     Tests  25 passed (25)
```

Breakdown:
- `templateResolver.test.ts` — 12 cases (Wave 3 carryover, still green).
- `xmlShellParser.test.ts` — 3 cases:
  - the canonical committed XML parses into a manifest whose
    `controlsBySlot` matches `PROJECT_SPOTLIGHT_V1_SHELL` for every
    slot, section layouts are `OneColumnFullWidth → OneColumn →
    OneColumn`, and section-2 slot order is `subhead, body, team`;
  - malformed XML fails cleanly;
  - a mutated `LayoutType` other than `FullWidthImage` fails.
- `pageCompositor.test.ts` — 10 cases:
  - five controls emitted in shell order;
  - `BannerTitleOverride` wins when set;
  - TeamViewer properties (heading, layout, density, feature flag,
    `articleId=PostId`, `destinationKey='projectSpotlight'`) and
    SortOrder-driven ordering with `IncludeInViewer=false` honored;
  - template-disabled team block produces a hidden control;
  - gallery hides when no `gallery`-role media;
  - gallery hides when `post.ShowGallery=false`;
  - gallery images ordered ascending by `SortOrder`;
  - shell + template identity stamped onto
    `ComposedPageIdentity`;
  - `GeneratedPageName` wins over `{Slug}.aspx` when set;
  - `validateComposedPageStructure` returns empty on a happy
    path.

## 4. Unavoidable implementation constraints

1. **TeamViewer canvas serialization** — the Modern Pages API preserves
   `webPartData.properties` for Custom web parts, but the exact
   outbound JSON envelope (e.g., `controlType` numeric code) is
   tenant-stable per observation but not documented. Hosted
   validation in Wave 9 will confirm.
2. **Publish permissions** — blocking unknown #4 from Wave 1 remains
   open. The Pages API requires `Sites.FullControl.All` or an
   authenticated SPFx context on `/sites/ProjectSpotlight`. The
   service does not yet pick a principal; callers (Wave 6 UI + Wave
   9 hosted run) supply context.
3. **Existing-page handling** — the 409/500 branch relies on tenant
   behavior we have not yet observed directly. A GET-by-`FileName`
   lookup reconciles both the newly-created and already-existing
   paths; worst case the PATCH overwrites prior content.
4. **Photo hydration timing** — blocking unknown #3 remains open. The
   compositor emits only the `articleId` binding for the TeamViewer
   webpart; photo lookup happens at render time via the TeamViewer's
   existing Graph adapter, not at page-generation time. This
   preserves Rule 1 of the charter (single destination) without
   embedding tenant-specific photo URLs in the page.
5. **Page-binding writes remain deferred** — Prompt-04 stops when the
   destination page has been created or updated. The binding row
   write belongs to Wave 5 alongside the content-mapping layer.

## 5. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ clean |
| `pnpm exec vitest run src/homepage/data/publisherAdapter/` | ✅ 25/25 pass |
| Canonical XML ↔ committed manifest parity (parser test) | ✅ verified |
| Legacy Team Viewer webpart | ✅ untouched |
| Legacy provisioner | ✅ untouched |
| `@hbc/sharepoint-platform` public API | ✅ untouched |
| Hosted page write against ProjectSpotlight | ⏸ deferred to Wave 9 |

## 6. Files delivered

**New:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/xmlShellManifest.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/xmlShellParser.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/xmlShellParser.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/index.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel now re-exports `pageGeneration/*`.
- `apps/hb-webparts/config/package-solution.json` — manifest version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 4 flipped to ✅.

## 7. Out of scope (by design)

- Content mapping for the binding row (Wave 5 / Prompt-05).
- Page-binding write to `Project Spotlight Page Bindings` (Wave 5).
- Regeneration policy / republish decisioning logic (Wave 5).
- Publishing (moving a draft page to published state) (Wave 5).
- Authoring UI + workflow (Wave 6).
- Validation + preview surface (Wave 7).

## 8. Handoff to Prompt-05

Prompt-05 / Wave 5 (Content mapping and page binding) consumes:
- `createPageShellService({ pageCreation }).publishPage(context)` as
  the single entry point for taking a resolved post to a live page.
- `page.identity` to write the `Project Spotlight Page Bindings` row
  (shell key/version, template key/version, source template path,
  generated page name, last-operation, last-operation-date).
- `creation.pageId` / `creation.pageUrl` to populate the binding's
  `PageId` / `PageUrl`.

Blocking unknowns carried forward unchanged:
#1 SharePoint Pages REST permission model (partially exercised here
— confirmed endpoint shape, left principal resolution to callers),
#2 webpart property injection (TeamViewer canvas shape committed but
unvalidated against tenant — Wave 9), #3 photo hydration timing
(routed to runtime adapter), #4 publish principal (open), #5
rollback / version-history policy (Wave 5), #6 scheduled publishing
(Wave 5/6), #7 OOB Image Gallery layout variant (compositor defaults
to `layout=4` grid, `layout=2` for carousel profile).

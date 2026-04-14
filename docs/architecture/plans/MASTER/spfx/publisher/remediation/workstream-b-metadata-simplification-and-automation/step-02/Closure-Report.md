# Workstream B — Step 02 Closure Report

**Prompt:** Phase-08 / Phase-2 / Prompt-02 — Replace manual project ID and name with the authoritative project picker
**Status:** Closed.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.271

---

## 1. Summary of what was changed

The Article Publisher Identity section already used `<ProjectPicker>` (debounced search bound to the HBCentral `Projects` list via `createProjectsLookupSearch`) when `searchProjects` was available, but kept a *fallback* to two manual `<input>` fields for `ProjectId` and `ProjectName` whenever `searchProjects` was undefined. That fallback was an authoring escape hatch left in for "test / offline contexts" — it actively contradicted the workstream-B objective of removing manual identity work.

This step retires the manual fallback so authoritative project identity always flows through the picker. Specifically:

- **Manual ProjectId / ProjectName text inputs removed** from `MetadataPanel`. There is no longer any code path on the authoring surface that lets an author type a raw project id or project name.
- **Replacement when `searchProjects` is unavailable:**
  - If a project is *already* bound to the row (loaded from the article record), the Identity section renders the prior selection as a **read-only chip** showing the project name, project id, and location, alongside an inline `Lookup unavailable` hint. The author can see what is bound but cannot edit it through manual entry. (The chip carries `data-testid="project-picker-readonly"` so this state is testable.)
  - If no project is bound, an editorial notice (`role="status"`) explains: *"Project lookup is unavailable in this context. Reload the Publisher in its hosted page so the HBCentral Projects list can be searched."* This is the only state in which a project cannot be selected, and it directs the author to the recovery action.
- **Authoritative field hydration verified end-to-end.** The picker hydrates `ProjectId`, `ProjectName`, and `ProjectLocation` from the selected `ProjectLookupEntry` into the article draft via the existing `handleProjectChange` callback. These are the three project fields modeled by `PublisherArticleRow`. `ProjectNumber` is exposed by `ProjectLookupEntry` and rendered live by `<ProjectPicker>` while a session selection is active, but is not persisted on the article today (the article contract does not model it). Authors still see the project number during selection; on later reloads, the chip falls back to the persisted name + id + location. Persisting `ProjectNumber` is a tenant-schema change beyond this prompt's scope.
- **Stale comment scrub.** Removed the multi-line comment that justified the manual fallback ("Fallback for test / offline contexts where `siteUrl` has not been threaded through. Preserves manual entry so existing unit tests…"). The author-facing surface no longer needs that justification because the manual path is gone.

Preserved seams (unchanged):
- `ProjectPicker.tsx` and `projectsLookupSource.ts` — no changes; the picker behavior, debounce, ARIA contract, and search semantics are reused as-is.
- `createProjectsLookupSearch` is still scoped to `siteUrl` and threaded from `mount.tsx` (`<ArticlePublisher siteUrl … />`) into the picker via `searchProjects` memoised on the live HBCentral site URL — unchanged.
- `PublisherArticleRow` shape, `publisherListDescriptors`, and the adapter persistence path — unchanged.
- All preserved seams from workstream-a step-01 — unchanged. Lifecycle behavior (publish / republish / archive / withdraw / preview) — unchanged.
- Governed labels from workstream-b step-01 — unchanged.

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (Identity section: removed manual fallback, added read-only chip / unavailable notice)
- `apps/hb-webparts/config/package-solution.json` (`1.0.0.270` → `1.0.0.271`)

No changes to:
- `apps/hb-webparts/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` / `.d.ts` (reused existing `projectPickerChip`, `projectPickerChipMain`, `projectPickerChipName`, `projectPickerChipMeta`, `projectPickerHint`, and `editorialNotice` classes)
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json` (webpart id unchanged)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`, `authorLabels.test.ts`, `authorLabels.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 34/34 pass (12 article-publisher pure-export tests + 22 author-label governance tests).
- Manual scrub of `MetadataPanel` JSX — no remaining manual project-id or project-name `<input>` controls; the only project-input path is the authoritative `<ProjectPicker>`.
- `ProjectPicker` keyboard contract preserved: `ArrowUp` / `ArrowDown` / `Enter` / `Escape` plus listbox `aria-controls` + option `aria-selected` are unchanged.
- Empty / loading / error states preserved at the picker level (search hint, "Searching…", error message, "No projects match …") and reinforced at the panel level (read-only chip + lookup-unavailable notice for the no-`searchProjects` runtime path).
- 28 pre-existing failures in `publisherAdapter/**` test suites remain unchanged and out of scope.

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/step-02/Closure-Report.md`

---

## 5. Real blockers remaining

None for this prompt.

**Acknowledged limitation (out of scope, surfaced for transparency):** `ProjectNumber` is exposed by `ProjectLookupEntry` and rendered while the picker chip is fresh from the lookup, but the `PublisherArticleRow` contract does not persist `ProjectNumber`. After save and reload, the chip shows the project name, id, and location only. Persisting `ProjectNumber` is a tenant-schema concern and belongs to a future schema-change workstream — not Prompt-02 of Workstream B.

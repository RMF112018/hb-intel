# Wave 3 / Prompt-03 — Service Layer and Template Resolution

**Closed:** 2026-04-13
**Scope:** Service / repository layer, deterministic template resolver, and shared preview/publish resolution context for the Project Spotlight publisher.

---

## 1. Repository layer

All repositories live in `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts` and expose interfaces plus a factory (`createPublisherRepositories`). Each interface covers the list it owns from Wave 2's `PUBLISHER_LISTS` descriptor map.

| Interface | Read surface (Wave 3 — implemented) | Write surface (deferred) |
|-----------|-------------------------------------|--------------------------|
| `PostRepository` | `getByPostId`, `listByWorkflowState` | `upsert` → throws `PublisherWriteNotImplementedError('Wave 5 / Prompt-05')` |
| `TeamMembersRepository` | `listByPost` | `replaceAllForPost` → Wave 5 |
| `MediaRepository` | `listByPost` | `replaceAllForPost` → Wave 5 |
| `TemplateRegistryRepository` | `listActive`, `getByKey` | n/a (registry is authored outside the publisher) |
| `PageBindingRepository` | `getByPostId` | `upsert` → Wave 5 |
| `WorkflowHistoryRepository` | `listByPost` | `append` → Wave 6 |
| `PublishingErrorsRepository` | `listByPost` | `append` → Wave 5 |

**Access seam:** `PublisherListAccess` abstracts the SharePoint read call. The default implementation (`createSharePointPublisherListAccess`) uses list-title-based REST (`/_api/web/lists/getbytitle(...)`) to match the `heroBannerListSource` precedent and to stay compatible until tenant GUIDs are cataloged. Callers can inject a mocked access object for tests without touching repository code.

**UI decoupling:** UI surfaces (to be built in Wave 6) will consume only repository interfaces; raw SharePoint field names never cross the publisherAdapter boundary because `publisherRowMappers.ts` normalizes every incoming row into typed `Publisher*Row` shapes before repositories return them.

## 2. Raw → typed row mappers

`publisherRowMappers.ts` provides per-list pure mappers: `mapPostRow`, `mapTeamMemberRow`, `mapMediaRow`, `mapTemplateRegistryRow`, `mapPageBindingRow`, `mapWorkflowHistoryRow`, `mapPublishingErrorRow`. Each mapper:

- Validates MVP=Yes `Required=true` fields and returns `undefined` if any required field is missing or malformed.
- Coerces SharePoint types defensively (`bool`, `num`, `str`, `url`, enum membership checks against the `publisherEnums` tuples).
- Never throws; callers decide whether to skip invalid rows or surface an error.
- Uses the enum value sets from `publisherEnums.ts` as the single source of truth — only declared literal values pass through.

## 3. Deterministic template resolver

`templateResolver.ts` exposes `resolveTemplate(input, registry)` and a loose-semver `compareTemplateVersions` helper. The resolver is pure, never reads SharePoint, and returns a typed discriminated-union result (`{ok:true, entry, trace}` | `{ok:false, reason, message, trace}`).

**Decision hierarchy** (arch doc 05 §Registry behavior rules + prompt-03 spec):

1. **Admin override** — if the post carries an explicit `TemplateKey`, the resolver returns that registry entry iff `TemplateStatus === 'active'`. An inactive override fails with `reason='overrideInactive'`; a missing override key fails with `reason='overrideNotFound'`.
2. **Applicability filter** — candidates must satisfy every declared applicability array (`PostFamily`, `SpotlightType`, `ProjectStage`, `ArticleSubject`). Missing/empty applicability arrays act as wildcards.
3. **Status filter** — only `TemplateStatus === 'active'` entries are candidates.
4. **Specificity tie-break** — among candidates, the entry with the most declared-and-matching applicability filters wins. This lets specific entries like `ps-inprogress-monthly-v1` beat wildcards.
5. **Version tie-break** — if specificity ties, the highest `TemplateVersion` wins via `compareTemplateVersions` (numeric-segment aware; pre-release suffixes rank below releases).
6. **Stable ordering** — if versions also tie, input-registry order wins.

**Inspectability:** every result carries a `TemplateResolutionTrace` with per-entry `{entryKey, status, reason?, specificityScore?}` steps and a `selectionRule` label (`'adminOverride' | 'applicability' | 'specificityTieBreak' | 'versionTieBreak'`). This is the paper trail the future governance/debug UI in Wave 7 will surface.

**Failure modes:** `emptyRegistry`, `overrideNotFound`, `overrideInactive`, `noCandidate`, `ambiguous` (reserved for future policies; not emitted by the current algorithm which always tie-breaks).

## 4. Shared publish resolution context

`publishResolutionContext.ts` exposes `buildPublishResolutionContext(repositories, postId)` that returns a single context object consumed by both preview (Wave 7) and publish (Wave 5) pipelines:

```ts
interface PublishResolutionContext {
  post: PublisherPostRow;
  template: PublisherTemplateRegistryRow;
  teamMembers: readonly PublisherTeamMemberRow[];
  media: readonly PublisherMediaRow[];
  existingBinding: PublisherPageBindingRow | undefined;
  decisionTrace: TemplateResolutionTrace;
}
```

This is the concrete enforcement of operating-charter rule 8 ("preview and publish must use the same resolution pipeline"): both surfaces will build on `PublishResolutionContext` and cannot diverge without changing the service-layer contract.

Failure paths are typed: `{ok:false, reason:'postNotFound'|'templateResolutionFailed', ...}`.

## 5. Resolver test evidence

`templateResolver.test.ts` (Vitest) — 12 tests, all passing:

```
Tests  12 passed (12)
```

Coverage:
- `emptyRegistry` failure when the registry is empty.
- Admin override honored when the key is active.
- `overrideNotFound` failure when admin key is absent.
- `overrideInactive` failure when admin key exists but status is not `'active'`.
- Single-candidate match by `PostFamily` + `SpotlightType`.
- `noCandidate` failure when nothing matches.
- Wildcard vs. specific tie-break — specific entry wins.
- Inactive entries are skipped even when applicability would otherwise match.
- Specificity tie-break by higher `TemplateVersion`.
- `projectUpdate` with `SpotlightType in {inProgress, update}` applicability multi.
- `compareTemplateVersions` — numeric-segment ordering (e.g., `1.10.0 > 1.2.0`).
- `compareTemplateVersions` — pre-release suffix ranking (e.g., `1.0.0 > 1.0.0-beta`).

Command: `pnpm exec vitest run --config vitest.config.ts src/homepage/data/publisherAdapter/templateResolver.test.ts` from `apps/hb-webparts/`.

## 6. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ `tsc --noEmit` passes clean |
| Resolver unit tests (12 cases) | ✅ all passing |
| Legacy Team Viewer data paths | ✅ untouched (`apps/hb-webparts/src/webparts/teamViewer/` unchanged) |
| Legacy provisioner | ✅ untouched (`provision-publisher-lists.ps1` unchanged) |
| `@hbc/sharepoint-platform` public API | ✅ untouched |
| Hosted/tenant reads against live publisher lists | ⏸ deferred to Wave 9 (requires provisioned GUIDs) |

## 7. Files delivered

**New:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel now re-exports Wave 3 modules alongside Wave 2 contracts.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 3 flipped to ✅.

## 8. Out of scope (by design)

- Writers / mutations (Wave 5 / Prompt-05 for page and binding writes; Wave 6 / Prompt-06 for workflow transitions).
- XML-shell page-generation logic (Wave 4).
- Content mapping (banner/text/team/gallery population) (Wave 5).
- Authoring UI (Wave 6).
- Validation engine beyond `RequiredFieldSetKey` lookup pass-through (Wave 7).
- Team Viewer migration from legacy lists (future named prompt).

## 9. Handoff to Prompt-04

Prompt-04 / Wave 4 (XML-shell page-generation engine) consumes:
- `PublishResolutionContext` from `publishResolutionContext.ts` as the single structured input to the generator.
- `PublisherTemplateRegistryRow.ControlMapJson` for logical-to-control-id mapping against the canonical XML shell.
- `PublisherRepositories.pageBindings.upsert` stub (to be implemented in Wave 5; Wave 4 can surface the intended call sites without landing writes).

Blocking unknowns from Wave 1 still open: SharePoint Pages REST API path + auth model (#1), webpart property injection (#2), photo hydration timing (#3), publish permissions (#4), rollback/version-history policy (#5), scheduled publishing (#6), OOB Image Gallery layout variant (#7). Waves 4–5 will either resolve or document assumptions.

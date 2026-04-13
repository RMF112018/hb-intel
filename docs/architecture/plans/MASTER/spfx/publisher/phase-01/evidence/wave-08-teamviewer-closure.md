# Wave 8 / Prompt-08 — Team Viewer Integration and Renderer Closure

**Closed:** 2026-04-13
**Scope:** Formal single-source-of-truth adapter between the publisher's `Project Spotlight Post Team Members` child rows and the Team Viewer webpart's two consumption shapes; compositor refactored to delegate; contract-confirmation + zero/small/large behavior notes; adapter test coverage.

---

## 1. Repo-truth audit

Team Viewer (commits `3bb8dd10` → `35b0f38c`, completed 2026-04-13) already lives at `apps/hb-webparts/src/webparts/teamViewer/` with the following pieces relevant to Wave 8:

| Surface | File | Shape |
|---------|------|-------|
| Runtime property contract | `teamViewerConfig.ts` | `TeamViewerConfig { heading, articleId, destinationKey, listHostOverride, layout, density, flags }` — populated by `resolveTeamViewerConfig(raw)` from the webpart's `properties` bag. |
| Normalized render row | `teamViewerContracts.ts` | `TeamViewerPerson { id, articleId, articleTeamMemberId?, displayName, jobTitle?, photoUrl?, sortOrder?, bio?, resumeRichText?, resumeDocumentUrl?, resumeDocumentLabel?, profileUrl? }` + auxiliary types. |
| Host-site lock | `data/teamViewerHostContext.ts` | `TEAM_VIEWER_CANONICAL_LIST_HOST_URL = https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` — pinned; changes require an ADR. |

TeamViewer's reader currently binds to the legacy `HB Article Team Members` list (from `provision-publisher-lists.ps1`). The new `Project Spotlight Post Team Members` list (Wave 2) is authored by the publisher but not yet read by the deployed TeamViewer. That gap is **documented** in §7 of this artifact and is not closed by Prompt-08 — an architecturally-scoped migration prompt owns it. Prompt-08's "do not overgeneralize the renderer contract beyond what the architecture and shell need right now" rule prohibits reshuffling the TeamViewer reader here.

## 2. Property contract confirmation

The XML shell (`Project-Spotlight-In-Progress.page-template.xml`) writes a `Custom` webpart for Team Viewer with a `webPartData.properties` JSON bag matching exactly what `teamViewerConfig.resolveTeamViewerConfig` consumes:

```
heading, articleId, destinationKey, listHostOverride, layout, density, featureFlags
```

The publisher compositor emits that exact bag via `buildTeamViewerProperties(post)`. Field-level mapping (arch doc 07 §"Team Viewer inputs" ↔ `PublisherPost` fields):

| Shell / `TeamViewerConfig` key | Publisher source | Default when unset |
|---|---|---|
| `heading` | `Post.TeamSectionHeading` | `'Team'` (`TEAM_VIEWER_DEFAULT_HEADING`) |
| `articleId` | `Post.PostId` | required |
| `destinationKey` | locked constant | `'projectSpotlight'` (operating-charter rule 1) |
| `listHostOverride` | — | `undefined` (TeamViewer falls back to its pinned HBCentral host) |
| `layout` | `Post.TeamViewerLayout` | `'grid'` (matches shell XML default) |
| `density` | `Post.TeamViewerDensity` | `'standard'` |
| `featureFlags.profileDetailDrawer` | `Post.TeamViewerEnableProfileDrawer` | `false` (profile drawer disabled by default per arch doc 07) |

Structural equality of this contract with the TeamViewer runtime config is asserted in `teamViewerAdapter.test.ts#buildTeamViewerProperties`.

## 3. Adapter module

`apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts` exposes four pure entry points used by three surfaces (publisher compositor, authoring preview, future publisher-aware TeamViewer reader):

| Export | Role |
|--------|------|
| `TEAM_VIEWER_DEFAULT_HEADING` | `'Team'` — arch-doc-locked default heading when a post omits the section heading. |
| `buildTeamViewerProperties(post)` | Produces the XML-shell-ready `PublisherTeamViewerProperties` bag. Locks `destinationKey` to `'projectSpotlight'`. |
| `selectVisibleTeamMembers(rows)` | Visibility filter + ordering: drops `IncludeInViewer === false`, sorts by `SortOrder` with a `DisplayName` tiebreaker. Returns a `readonly` array so callers cannot mutate. |
| `mapPublisherRowToTeamViewerPerson(row)` | `PublisherTeamMemberRow` → `PublisherTeamViewerPerson` (subset of `TeamViewerPerson` the publisher can populate; Graph-hydrated fields like `upn/email/department` are filled by the TeamViewer reader at render time). |
| `buildTeamViewerPersonList(rows)` | Convenience composition of the above two. |
| `classifyTeamSize(count)` | `'empty' | 'small' | 'medium' | 'large'` informational bucket (0 / ≤3 / ≤8 / >8) for authoring/hosted notes; does not affect render density. |

The compositor's `composeTeam` (`pageGeneration/pageCompositor.ts`) now delegates to `selectVisibleTeamMembers` + `buildTeamViewerProperties` instead of inlining the transforms — single source of truth across publisher compose, preview, and the deployable TeamViewer contract.

## 4. Empty-state, density, layout behavior notes

| Scenario | Behavior |
|----------|----------|
| **Empty team** (zero rows after visibility filter) | Compositor emits `HiddenControlPayload { slot:'team', reason:'noContent' }`. The published page gets no team section. TeamViewer webpart is not instantiated for this post. |
| **Template-disabled team** (`template.ShowTeamBlock=false` or `TeamRendererKind='none'`) | Compositor emits `HiddenControlPayload { reason:'templateDisabled' }`. Independent of how many rows exist. |
| **Post-disabled team** (`Post.ShowTeamViewer=false`) | Same as template-disabled (`reason:'templateDisabled'`). |
| **Small team (1–3 members)** | Rendered by TeamViewer at `layout='grid'` / `density='standard'` defaults unless the post overrides. Classification: `'small'`. |
| **Medium team (4–8 members)** | Same default; authors may tighten with `density='compact'`. Classification: `'medium'`. |
| **Large team (>8 members)** | Authors typically pick `layout='list'` or `density='compact'`; TeamViewer handles overflow internally. Classification: `'large'`. |
| **Profile drawer** | `featureFlags.profileDetailDrawer` defaults `false`; authors opt in on the Content tab. TeamViewer gates the drawer rendering on this flag — no change required here. |

Validation interplay (Wave 7): when `ShowTeamViewer !== false` and `template.ShowTeamBlock === true` but the visibility filter yields zero members, `validatePublishContext` emits `invalid-team-configuration` (error) **before** publish. The publisher UI cannot silently ship an empty Team Viewer.

## 5. Article/post-bound data loading

- **Property-based binding:** `articleId` = `PostId` is stamped into the Custom webpart JSON at page-generation time. When the TeamViewer webpart renders on the page, its existing `useTeamViewerArticleBinding` hook reads this `articleId` directly and hits the HBCentral-bound list.
- **Host-site binding:** `listHostOverride` is left `undefined`; TeamViewer defaults to `TEAM_VIEWER_CANONICAL_LIST_HOST_URL` (HBCentral). No override is emitted from the publisher because the architecture pins the control plane.
- **Data shape parity:** `mapPublisherRowToTeamViewerPerson` returns the publisher-owned subset of `TeamViewerPerson`. Graph-enriched fields (`upn`, `email`, `department`, `teamLabel`) are left for TeamViewer's own reader; the contract is field-compatible.
- **Known gap (documented):** the deployed TeamViewer reader currently points at the legacy `HB Article Team Members` list. Authoring via the publisher writes to the new `Project Spotlight Post Team Members` list. Bridging / migrating that read path is outside Prompt-08's "do not overgeneralize" charter and is queued for a dedicated migration prompt. Hosted verification in Wave 9 confirms the property contract is correctly stamped; reader-side consumption of the new list is verified when the migration prompt lands.

## 6. Test evidence

```
Test Files  9 passed (9)
     Tests 75 passed (75)
```

Breakdown:
- `templateResolver.test.ts` — 12 (carryover)
- `xmlShellParser.test.ts` — 3 (carryover)
- `pageCompositor.test.ts` — 10 (carryover; still green after the adapter delegation refactor — no behavior change)
- `republishPolicy.test.ts` — 11 (carryover)
- `workflowStateMachine.test.ts` — 7 (carryover)
- `publishOrchestrator.test.ts` — 9 (carryover)
- `validationEngine.test.ts` — 10 (carryover)
- `previewBuilder.test.ts` — 5 (carryover)
- `teamViewerAdapter.test.ts` — 8 (**new**)

New test cases:
- `buildTeamViewerProperties` emits the exact shell-property contract.
- `buildTeamViewerProperties` falls back to canonical defaults.
- `buildTeamViewerProperties` locks `destinationKey='projectSpotlight'` regardless of input.
- `selectVisibleTeamMembers` drops `IncludeInViewer=false` rows.
- `selectVisibleTeamMembers` orders by `SortOrder` with `DisplayName` tiebreaker.
- `mapPublisherRowToTeamViewerPerson` maps every render-visible field.
- `buildTeamViewerPersonList` applies filter+order+mapping in one pass.
- `classifyTeamSize` buckets 0/1/3/4/8/9/40 correctly.

Run command: `pnpm exec vitest run src/homepage/data/publisherAdapter/` from `apps/hb-webparts/`.

## 7. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ clean |
| `pnpm exec vitest run src/homepage/data/publisherAdapter/` | ✅ 75/75 pass |
| Compositor still emits the correct Team Viewer payload after adapter delegation (compositor test `TeamViewer properties from post fields and includes only IncludeInViewer members`) | ✅ unchanged |
| Preview builder still shares the compositor output (`previewBuilder.test.ts#shares compositor output with the publish pipeline`) | ✅ unchanged |
| `@hbc/sharepoint-platform` public API | ✅ untouched |
| TeamViewer webpart source (`apps/hb-webparts/src/webparts/teamViewer/`) | ✅ **untouched** (prompt-08 rule: do not overgeneralize the renderer contract) |

## 8. Files delivered

**New:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.test.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts` — `composeTeam` now delegates to `selectVisibleTeamMembers` + `buildTeamViewerProperties`; inlined versions removed.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel re-exports the new adapter.
- `apps/hb-webparts/config/package-solution.json` — manifest version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 8 ✅.

## 9. Out of scope (by design)

- **TeamViewer reader migration** from the legacy `HB Article Team Members` list to `Project Spotlight Post Team Members`. Tracked as the follow-up migration prompt referenced since Wave 2.
- **TeamViewer density heuristic changes** — density stays author-controlled; no automatic override based on `classifyTeamSize`.
- **Profile-drawer content validation beyond presence** — Wave 7 validation flags required fields at row level only; drawer content rules remain author-owned.
- **New TeamViewer layout / renderer variants** beyond the current `grid | list` + `standard | compact | comfortable`.

## 10. Handoff to Prompt-09

Prompt-09 / Wave 9 (Testing, hosted vetting, build proof) consumes:
- A stable, tested Team Viewer property contract emitted by `buildTeamViewerProperties`.
- Behavior notes above for the zero/small/medium/large scenario runbook in the hosted verification checklist.
- The documented reader-side gap (§5) as an explicit "future migration" note in the hosted evidence bundle — hosted verification confirms property stamping now; reader consumption is revisited when the migration prompt lands.

Blocking unknowns carried forward: #3 photo hydration timing (TeamViewer continues to own runtime Graph resolution); #4 publish principal (Wave 9); no others affected by Prompt-08.

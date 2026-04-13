# 02 — Current State Architecture and Gap Register

## Repo-truth implementation map

### Primary runtime entry

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

This file is now a thin public-runtime orchestrator.

It owns composition and event wiring, but major concerns are pushed into dedicated hooks/components.

### Mount and runtime wiring

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`

These together prove:

- webpart ID is centralized for anti-drift
- mount-map wiring is explicit
- `getGraphToken` is passed into the runtime
- Kudos public and companion responsibilities are explicitly split

### Shared/local product layer

- `apps/hb-webparts/src/webparts/hbKudos/kudosSurfaceFamily.ts`

This is a local surface-family barrel for Kudos public + companion.

Important conclusion:

- it is useful as a *pattern example*,
- but it should not become a dependency of `teamViewer` unless a genuinely cross-product family is intentionally created

### Public surface composition files

- `PublicKudosSurface.tsx`
- `ArchiveList.tsx`
- `KudosArticleReader.tsx`
- `KudosFeedPanel.tsx`
- `KudosFeedBody.tsx`
- `KudosComposerPanel.tsx`

These prove the public app is decomposed into role-specific surface pieces instead of one dense render file.

### Focused hooks

- `hooks/usePublicKudosData.ts`
- `hooks/useRecipientPhotoHydration.ts`
- `hooks/useCurrentUserId.ts`
- `hooks/useHostSafeLayout.ts`
- `hooks/kudosFeatured.ts`

These show a good concern split:
- data filtering
- photo hydration
- current-user lookup
- hosted layout behavior
- featured/recent selection

### Shared homepage seams used by Kudos

- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureProfilePhotoResolver.ts`
- `apps/hb-webparts/src/homepage/shared/kudosShells.tsx`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

### UI-kit seams

- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcAvatarStack/index.tsx`

These prove the repo already expects homepage surfaces to consume:
- `@hbc/ui-kit/homepage`
- premium stack tools
- governed avatar / people-picker / photo helpers

### Validation seam

- `apps/dev-harness/src/harness/kudosHarness.ts`

This is strong evidence that Kudos has moved beyond cosmetic code and into runtime-grade seeded validation.

---

## What is reusable, what is not

### Reuse directly or nearly directly

#### 1. Host-safe layout pattern
`useHostSafeLayout.ts` is a clean, generic runtime pattern.

Recommendation:
- either reuse as-is if semantically suitable,
- or extract to a homepage-shared host-safe helper

#### 2. Photo hydration pattern
`useRecipientPhotoHydration.ts` is one of the best candidate seams.

Recommendation:
- do not import it directly into `teamViewer`
- create a generalized person-photo hydration hook based on the same pattern

#### 3. SharePoint people search adapter
`useSharePointPeopleSearch.ts` is strongly reusable when `teamViewer` needs:
- authoring-time people search
- filter/search overlays
- lookup experiences

#### 4. Avatar / initials fallback posture
`HbcAvatarStack` and its fallback behavior are reusable.

Recommendation:
- use as part of grouped display,
- or derive a single-person card/avatar primitive from the same visual/fallback standard

#### 5. Thin-orchestrator architecture
The overall runtime shape of `HbKudos.tsx` is worth replicating in principle.

### Adapt / generalize

#### 6. Featured / recent selection logic
`kudosFeatured.ts` proves the value of extracting ranking/selection logic.

Recommendation:
- create a `teamViewer`-specific display model selector
- do not reuse Kudos’ content-worthiness rules

#### 7. Semantic shell splitting
`kudosShells.tsx` proves a good semantic-shell approach.

Recommendation:
- if `teamViewer` gets a detail drawer or modal,
- define people-viewer-specific shells or use generalized homepage shells,
- not `kudosShells` directly

### Do not reuse

#### 8. Public/archive/associated visibility predicates
`usePublicKudosData.ts` and `kudosContracts.ts` are deeply recognition-specific.

Do not reuse:
- archive eligibility
- associated visibility
- age-off semantics
- workflow-based filtering

#### 9. Composer state and submission
`useKudosComposer.ts` and `KudosComposerPanel.tsx` are not relevant to a display-first people viewer unless a future authoring workflow is explicitly added.

#### 10. Governance / audit / celebrate logic
All of this must stay inside Kudos.

---

## Major findings

### Finding 1 — Kudos public is a benchmark-grade reference for seam discipline
**Importance:** High

**Evidence:** thin orchestrator, focused hooks, explicit runtime contract, semantic surface decomposition

**Why it matters:** this is the strongest lesson to carry into `teamViewer`

**Correction direction:** preserve this posture in the new app from the start

---

### Finding 2 — The best transferable seam is photo handling, not workflow handling
**Importance:** High

**Evidence:** `useRecipientPhotoHydration.ts`, `createGraphPersonPhotoFn`, `peopleCultureProfilePhotoResolver.ts`, `HbcAvatarStack`

**Why it matters:** `teamViewer` is fundamentally a people display product, so photo correctness and fallback behavior are central

**Correction direction:** build a generalized people-photo strategy with:
- deterministic resolver chain
- cache
- fallbacks
- host-safe behavior

---

### Finding 3 — Kudos local surface family should not become a hidden dependency
**Importance:** High

**Evidence:** `kudosSurfaceFamily.ts` explicitly scopes itself to two Kudos runtimes

**Why it matters:** direct dependency would import accidental Kudos visual grammar and product coupling

**Correction direction:** create either:
- `teamViewer`-local surface family,
- or a new generic people-viewer surface family if real reuse is justified

---

### Finding 4 — Existing People & Culture public code proves a boundary, but not the target quality bar
**Importance:** Medium-high

**Evidence:** `PeopleCulturePublic.tsx` explicitly rejects Kudos coupling; `PeopleCulturePublicSurface.tsx` remains more self-contained and less benchmark-grade than Kudos

**Why it matters:** teamViewer should respect the same boundary discipline, but target the stronger runtime quality bar demonstrated by Kudos

**Correction direction:** do not base `teamViewer` on the current PeopleCulture public surface architecture

---

### Finding 5 — Validation sophistication is part of the Kudos benchmark
**Importance:** High

**Evidence:** `kudosHarness.ts` seeded runtime, fault modes, probe hooks, invalidation tracking

**Why it matters:** a premium homepage component should prove runtime quality, not only render quality

**Correction direction:** give `teamViewer` at least:
- seeded harness coverage
- photo-missing scenarios
- empty / malformed / partial person record scenarios
- hosted layout proof

---

### Finding 6 — Kudos interaction richness should be translated carefully, not copied
**Importance:** Medium-high

**Evidence:** featured hero, recent rail, archive browse, feed panel, article reader, celebrate, composer

**Why it matters:** this proves completeness, but much of the richness is recognition-specific

**Correction direction:** for `teamViewer`, keep only purpose-fit richness such as:
- layout variants
- density variants
- detail expansion where useful
- grouped views / overflow handling
- maybe search or filter
- keyboard-safe hover/focus states

---

## Gap register for `teamViewer` implementation

### Gap A — No current generic people viewer seam
**Type:** Architecture gap

The repo does not appear to contain a benchmark-grade generic people viewer surface that can simply be dropped in.

**Action:** build a new `teamViewer` app

### Gap B — No generalized person-photo hydration hook
**Type:** Reusable-seam gap

The repo has good photo logic, but it is still packaged around Kudos recipients.

**Action:** extract or rewrite as a generic person-photo hydration module

### Gap C — No `teamViewer` domain contracts
**Type:** Contract gap

There is no explicit people viewer contract layer defining:
- person identity
- title
- photo source
- group membership
- ordering
- display density
- fallback rules

**Action:** define clean `teamViewer` contracts first

### Gap D — No `teamViewer` hosted validation seam
**Type:** Validation gap

Kudos has harness-backed proof. `teamViewer` currently has none.

**Action:** add a harness adapter and seeded scenarios

### Gap E — Risk of cloning Kudos interaction language
**Type:** Product-fit gap

Because Kudos is currently the strongest reference, there is a risk of cargo-culting its surface and workflow vocabulary.

**Action:** decision-lock the anti-clone rule before implementation

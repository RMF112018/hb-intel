# Prompt 04 — Media, Preview, Homepage, and Milestone Operations Report

Phase-14 · People & Culture + HR Operating Companion implementation
package.

Deliverable for
[`Prompt-04-Media-Preview-Homepage-and-Milestone-Operations.md`](./Prompt-04-Media-Preview-Homepage-and-Milestone-Operations.md).
This prompt lands the real media-source runtime, multi-context
preview, homepage-composition operations, and recurring-milestone
auto-generation for both the People & Culture public webpart and the
HR operating companion.

## 1. Media Behavior Implemented

**Profile-photo-first with real resolver wiring.**

New helper:
`apps/hb-webparts/src/homepage/helpers/peopleCultureProfilePhotoResolver.ts`

Exports three resolver factories wrapped around the shared
`ProfilePhotoResolver` type from the split model:

- `createSharePointUserPhotoResolver({ siteUrl, size?, accountNameLookup?, buildAltText? })`
  — builds the classic `/_layouts/15/userphoto.aspx?accountname=…&size=L`
  URL for every person id that looks like a resolvable SharePoint
  account name (email, `i:0#.f|membership|…`, or any token mapped
  through the optional `accountNameLookup`). Returns `undefined`
  for the `legacy:<name>` placeholder the PC public legacy adapter
  emits, so legacy data does not silently render broken image
  URLs.
- `createStaticProfilePhotoResolver(map)` — wraps a prebuilt
  `{ personId → { src, alt } }` lookup. Used by unit tests and by
  local/dev scenarios where no tenant endpoint is reachable.
- `composeProfilePhotoResolvers(...)` — composes multiple resolvers
  in priority order; the first hit wins. Enables layering a static
  map on top of the live SharePoint resolver without either helper
  knowing about the other.

`mount.tsx` wiring:

- `storeSiteUrl` + `spfxContext.pageContext.web.absoluteUrl` already
  flows through the mount bootstrap. Prompt-04 adds a
  `siteUrl` field to the `WebPartRendererContext` and threads it
  into both the `PeopleCulturePublic` and
  `PeopleCultureCompanion` renderer entries.
- Both webparts now receive a `profilePhotoResolver` built from
  `createSharePointUserPhotoResolver({ siteUrl })` at mount time
  when a site URL is available, so `profilePhoto`-sourced items
  render through the real SP endpoint. When no site URL is
  available (local dev or unattached SPFx context), the resolver
  is omitted and media falls through to the initials placeholder
  exactly as in Prompt-02.

**Media-source badge in the companion content-family list.**

`sections/ContentFamilySection.tsx` now:

- calls `resolveMediaSource` per row with the active resolver,
- stamps `data-hbc-companion-item-media-source` on every row with
  the active source kind (`profilePhoto` / `hrUpload` /
  `campaignArtwork` / `eventPhotography` / `none`), and
- renders a short label badge inline in the row's meta line so HR
  can see at a glance which media channel a published item is
  using.

Conflict badges are also surfaced inline when an item carries a
propagated `homepage.conflictReason` (see §3).

## 2. Preview Behavior Implemented

**New multi-context preview panel.**

New file:
`apps/hb-webparts/src/webparts/peopleCultureCompanion/preview/PreviewPanel.tsx`

New companion tab "Preview" added to `PeopleCultureCompanion.tsx`
(seventh tab, hidden until a content-family row is previewed).

The preview panel renders the selected item through every
`PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS` variant in the Prompt-01
contracts:

1. Public webpart · featured · desktop
2. Public webpart · supporting · desktop
3. Public webpart · featured · mobile
4. Companion item card

Each frame re-uses `resolveMediaSource` with the companion's
injected `profilePhotoResolver`, so the preview honors the same
profile-photo-first + HR override rules the live public surface
will apply at render time. Featured frames render a 16:9
hero image; the mobile variant switches to a taller 4:5 aspect so
HR can see the tighter crop. Supporting frames render the compact
row treatment from the public surface. The companion card frame
mirrors the content-family row treatment and surfaces the active
media channel explicitly.

The header of each frame calls out the active media channel via
an on-screen label (`Profile photo` / `HR uploaded` / `Campaign
artwork` / `Event photo` / `No image`) so HR does not have to
cross-reference the editor to know which channel rendered.

**Preview routing from content-family rows.**

Every row in `ContentFamilySection` gains a new `Preview` button
alongside the existing `Full editor` button. Clicking `Preview`:

1. sets the selected item id on the companion shell
2. switches the active tab to `preview`

The quick-edit drawer is suppressed while the preview tab is
active so the overlay doesn't collide with the preview grid.
Conflict state flows into the preview panel automatically via the
Prompt-04 conflict-propagation change (§3).

## 3. Homepage Operations Implemented

**Conflict propagation onto item state.**

Prompt-03 introduced `detectHomepageConflicts` and rendered
per-row conflict badges inside the Homepage section. Prompt-04
extends the companion shell to derive an
`itemsWithConflicts` view that projects the
`Map<itemId, reason>` back onto each item's
`homepage.conflictReason` field before handing the items to every
downstream section (content family, approvals, homepage, preview,
quick-edit drawer, full editor).

Consequences:

- The preview panel's data attribute
  `data-hbc-companion-preview-conflict` reflects the item's
  current conflict state without any bespoke plumbing.
- Content-family rows render a `Conflict` badge inline next to
  the tier / pinned / approval-trigger badges.
- The homepage governance section still consumes the conflict
  map directly so the per-rule conflict labels (pinnedOverflow,
  featuredOverflow, supportingOverflow, expiringWhilePinned)
  remain unchanged.
- Reducer state stays pure — conflicts are derived every render
  and never persisted onto the reducer's item objects.

**Operations in the Homepage surface (from Prompt-03, re-verified):**

- Tier override chips (Featured / Supporting / Excluded) gated
  by `canManageHomepage`.
- Pin toggle gated by `canPin`; flipping a pin propagates
  `approvalTrigger: 'homepagePinned'` on the item.
- `overrideSource` flips from `systemDefault` to `hrOverride` on
  any HR action, surfacing the source of every placement.
- Inline conflict warnings for over-pinned, over-featured,
  over-supporting, and expiring-while-pinned composition.

## 4. Milestone Operations Implemented

**Recurring milestone candidate generator.**

New helper:
`apps/hb-webparts/src/homepage/helpers/peopleCultureMilestoneGenerator.ts`

Pure, deterministic generator that converts a trusted people
source snapshot into a
`PeopleCultureMilestoneCandidate[]` ready for the HR review
queue. Rules:

- Per-person: at most one birthday candidate and one
  service-anniversary candidate per forward window.
- Birthdays are generated for every person whose birth month/day
  occurs within the forward window starting at `referenceDate`.
- Anniversaries are generated for every person whose hire-date
  anniversary falls inside the forward window with
  `yearsOfService >= 1`. Year-1 milestones use the
  `newHireAnniversary` candidate type; later years use the
  `serviceAnniversary` type.
- Every candidate lands in
  `reviewState: 'pendingReview'` — the Decision-Lock Appendix
  hybrid-intake rule: never auto-publish, always hand off to HR.
- Candidate ids use the stable scheme
  `mc:<type>:<personId>:<yyyy-mm-dd>` so re-running the generator
  with the same reference date never double-enqueues. The
  `dedupeAgainst` option lets callers pass previously-generated
  candidates and have them skipped.
- Output is deterministically sorted by
  `(occursOn, personId, candidateType)` so snapshot tests stay
  stable.
- Default window is 14 days; overridable via `windowDays`.
- Default source system stamp is `PeopleData`; overridable via
  `sourceSystem`.

**Companion wiring.**

`PeopleCultureCompanion.tsx` gains two new optional props:

- `peopleSource?: ReadonlyArray<PeopleSourceRecord>` — trusted
  people snapshot. When supplied, the companion seeds its
  reducer-backed milestone queue at mount time via
  `generateMilestoneCandidates`, deduping against any candidates
  already present in the split config. Real persistence lands
  later; the reducer boundary is the hook point.
- `milestoneWindowDays?: number` — forward window override.
  Ignored unless `peopleSource` is supplied.

Generated candidates flow through the same
`OverviewSection` Milestone queue the Prompt-03 reducer already
wired — Accept / Suppress actions unchanged. Generated candidates
are indistinguishable from HR-authored candidates from the
downstream surface perspective.

**HR never skipped.** Every auto-generated candidate lands in
`pendingReview`. A unit test asserts this explicitly.

## 5. Verification

- `apps/hb-webparts` `npm run check-types`: **clean**
- `apps/hb-webparts` `npm run lint`: **clean**
- New `peopleCultureMediaAndPreview.test.tsx`: **18 / 18** pass
  covering:
  - SharePoint user-photo resolver URL shape
  - Legacy placeholder returns undefined
  - Custom accountName lookup
  - Blank site URL returns undefined
  - Composed resolver first-hit semantics
  - Birthday candidate generation inside window
  - Birthday skipping outside window
  - newHireAnniversary vs serviceAnniversary disambiguation
  - Dedupe against prior candidates
  - Every generated candidate in `pendingReview`
  - Preview panel placeholder state
  - Preview panel from content-family row opens 4 frames with
    the right media source and item id
  - Active media source badge on content-family rows (resolved)
  - Active media source reporting with no resolver (declared)
  - Milestone generator seeding from peopleSource prop
  - Milestone generator dedupe against seed candidates
  - Homepage conflict propagation surfaces `pinnedOverflow` on
    list rows
  - PC public runtime resolver integration
- Prompt-01 / Prompt-02 / Prompt-03 tests re-verified:
  - `peopleCultureSplitModel.test.ts`: 36 / 36 pass
  - `peopleCulturePublicRuntime.test.tsx`: 16 / 16 pass
  - `peopleCultureCompanionRuntime.test.tsx`: 16 / 16 pass
    (after updating the shell-tab list test to expect the new
    Preview tab)
- Full `apps/hb-webparts` suite: **200 passing**, 14 pre-existing
  failures in unrelated test files (bundleBudget,
  compositionPreview, discoveryWebpart, interactiveStates,
  motionAndAccessibility, operationalAwarenessWebparts,
  topBandWebparts, utilityWebparts). Same baseline as Prompts
  01/02/03 — no regressions introduced.
- `PeopleCulturePublicWebPart.manifest.json`: bumped
  `0.0.3.0` → `0.0.4.0` (runtime now receives an injected
  profile-photo resolver from mount.tsx).
- `PeopleCultureCompanionWebPart.manifest.json`: bumped
  `0.0.1.0` → `0.0.2.0` (runtime gains Preview tab, media
  source badges, conflict propagation, milestone generator
  seeding).
- `apps/hb-webparts/config/package-solution.json`: bumped
  `1.0.0.116` → `1.0.0.117` (solution + feature in lockstep).
- `hb-webparts.sppkg` rebuilt via
  `npx tsx tools/build-spfx-package.ts --domain hb-webparts`.
  All 14 shim entries preserved (no new webparts), `.sppkg`
  structure re-verified.

## 6. Remaining Unresolved Edge Cases

1. **Real SP list persistence for generated candidates.**
   Generated milestone candidates live only in the companion
   reducer today. A later prompt must persist the generator's
   output into the authoring list so the queue survives
   reload. The generator's deterministic id scheme and
   `dedupeAgainst` option are designed to make that safe.
2. **`peopleSource` plumbing.** The companion accepts a
   `peopleSource` prop but mount.tsx does not yet populate it
   from a real people directory (Graph `/users`, Azure AD term
   set, or a SharePoint roster list). Until that adapter lands,
   the queue seeds only from HR-authored entries in the split
   config. The hook point is stable — the adapter can substitute
   without reshaping the companion.
3. **Profile-photo 404 handling.** The SharePoint
   `/_layouts/15/userphoto.aspx` endpoint returns a placeholder
   image when the account has no photo; our current
   `<img>` tag accepts that as a valid render. A future pass can
   add an `onError` path to fall back to the initials placeholder
   when the returned image is the empty placeholder.
4. **Viewer audience resolver.** The PC public surface still
   renders `companyWide` items only because `mount.tsx` does not
   yet derive a `PeopleCultureViewerAudience` from the SPFx page
   context. The runtime accepts the prop; the derivation is
   deferred to a later prompt.
5. **Preview fidelity.** The preview frames are visually close to
   but not pixel-identical with the live public surface. Once
   the UI-kit promotion decision happens (Prompt-05 or later),
   the preview panel should import the exact same primitives the
   public surface renders so preview fidelity is automatic.
6. **Calendar overlap across families.** The calendar view lives
   per content-family tab; a cross-family calendar is out of
   scope for v1 per the Decision-Lock Appendix calendar-mode
   rule.

## Report Back Summary

1. **Media behavior.** Profile-photo-first with a real SharePoint
   `userphoto.aspx` resolver factory, a static resolver for tests,
   and a composer. `mount.tsx` threads the site URL through the
   renderer context so both the PC public webpart and the
   companion receive a live resolver. Media source badges in
   content-family rows.
2. **Preview behavior.** New Preview tab on the companion shell;
   multi-context preview panel renders the selected item across
   four default preview keys (featured desktop, supporting
   desktop, featured mobile, companion card) with live media
   resolution and explicit active-source labels.
3. **Homepage operations.** Conflict propagation through an
   `itemsWithConflicts` projection so every section, including
   the preview panel and content-family rows, agrees about the
   current conflict state. Homepage tier and pin controls from
   Prompt-03 re-verified.
4. **Milestone operations.** New deterministic milestone
   generator with stable ids, dedupe, window, and pendingReview
   guarantee. Companion shell accepts a `peopleSource` prop and
   seeds the reducer-backed queue at mount. Accept / suppress /
   promote flows unchanged from Prompt-03.
5. **Remaining edge cases.** Real SP persistence for generated
   candidates, mount-level people source plumbing, profile-photo
   404 fallback, viewer audience resolver, preview fidelity via
   ui-kit promotion, and cross-family calendar — all deferred to
   later prompts.

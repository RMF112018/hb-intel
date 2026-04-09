# Prompt 02 — People & Culture Public Surface and Homepage Integration Report

Phase-14 · People & Culture + HR Operating Companion implementation
package.

Deliverable for
[`Prompt-02-People-and-Culture-Public-Surface-and-Homepage-Integration.md`](./Prompt-02-People-and-Culture-Public-Surface-and-Homepage-Integration.md).
This prompt replaces the Phase-14 Prompt-01 structural scaffold at
`apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
with a real production public runtime that consumes the split contracts
landed in Prompt-01, enforces homepage feature/supporting hierarchy,
honors audience targeting, and keeps the HB Kudos boundary strictly
separated.

## 1. Public-Surface Changes Implemented

**`PeopleCulturePublic.tsx`** — rewritten from the orange-bordered
scaffold to the production runtime. Flow:

1. Resolve effective config via `resolvePublicConfig` — prefers
   split-aware `PeopleCulturePublicConfig`, otherwise bridges legacy
   `PeopleCultureMergedConfig` through `adaptLegacyConfigToSplit`.
2. Normalize with `normalizePeopleCulturePublicConfig` using the
   optional viewer audience (scoping, lifecycle filtering, tier
   partition, sorting, caps).
3. Render with `PeopleCulturePublicSurface`, passing the normalized
   output and an optional `profilePhotoResolver`.

The component is stateless beyond two `useMemo` memoizations and makes
no SharePoint REST calls directly — data resolution happens either
through the host config blob (current path) or, in a later prompt,
through an updated list adapter when the announcements/celebrations
list schemas have been extracted.

**New file:
`apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicSurface.tsx`**
— self-contained composition. Renders:

- a header with the PC eyebrow + heading,
- a featured grid (`PeopleCulturePublicFeaturedCard`), one per featured
  item, with image, title, body, family badge, pinned badge, and CTA,
- a supporting list (`PeopleCulturePublicSupportingRow`), compact rows
  with media (or initials placeholder) and title/body,
- an explicit empty-state panel when both tiers are empty.

This surface is **deliberately not** imported from
`@hbc/ui-kit/homepage`. The existing `HbcPeopleCultureSurface` is
merged-shape (it carries a Kudos module), and pulling it in would
re-couple PC public to recognition content. Keeping the composition
local to the webpart folder preserves the split boundary hard. If the
pattern later justifies promotion to `@hbc/ui-kit`, that decision
should go through `hb-ui-ux-conformance-reviewer`.

**New file:
`apps/hb-webparts/src/webparts/peopleCulturePublic/legacyAdapter.ts`**
— non-recognition bridge from `PeopleCultureMergedConfig` →
`PeopleCulturePublicConfig`. Exports:

- `isSplitPublicConfig` / `isLegacyMergedConfig` shape detectors,
- `adaptLegacyConfigToSplit(legacy, { now })` — maps announcements and
  celebrations into `PeopleCultureItem` form. **Drops kudos entries
  entirely.** A unit test asserts that recognition content can never
  leak through the bridge.
- `resolvePublicConfig(input, opts)` — the single entry point used by
  the runtime component.

**Manifest bump:** `PeopleCulturePublicWebPart.manifest.json` version
`0.0.2.0` → `0.0.3.0`, and the manifest description was updated to
reflect the real runtime (from "Phase-14 structural scaffold seam" to
"Consumes the split-aware governance model and hides recognition
content"). The GUID (`e39d9662-34c4-43e6-9425-5770f62da626`) is
unchanged so already-placed page instances continue to resolve.

**`package-solution.json`** bumped `1.0.0.114` → `1.0.0.115`. Solution
feature version bumped in lockstep. `hb-webparts.sppkg` rebuilt
cleanly (`tools/build-spfx-package.ts --domain hb-webparts`) — all 13
existing shim entries preserved, no new webparts discovered or
registered, and the `.sppkg` structure re-verified.

## 2. Homepage-Governance Integration Implemented

The public surface now drives its hierarchy entirely from the split
contract's `PeopleCultureHomepageGovernance` field on each item, via
`normalizePeopleCulturePublicConfig`:

- **System default** placement is encoded directly on the item's
  `homepage.tier`.
- **HR override** is expressed through `homepage.overrideSource =
  'hrOverride'`; the tier field remains the single source of truth.
  Downstream prompts that introduce the companion's homepage surface
  will flip the `overrideSource` flag when HR reorders placements.
- **Pinning** is enforced by the sort comparator
  (`compareByHomepagePriority`): pinned items rank above unpinned
  within the same tier regardless of order/publish date.
- **Order** is honored via `homepage.order` ascending.
- **Featured vs supporting** partition is enforced strictly — items
  with `homepage.tier === 'excluded'` are dropped before rendering.
- **Empty/sparse** — the surface renders the empty state when both
  tiers are empty. Partial states (only featured, only supporting) are
  rendered without awkward gaps.

The bridge from legacy config (`adaptLegacyConfigToSplit`) maps
`isPinned` → `tier: 'featured' + isPinned: true`, `priorityOverride` →
`order`, and `homepageEnabled: false` → `tier: 'excluded'`. Celebrations
default to `tier: 'supporting'`. Once the real SP list adapter lands,
the tier field will be read from the companion-authored metadata
directly instead of derived from the pin flag.

## 3. Media / Profile-Photo Behavior Implemented

All rendering goes through `resolveMediaSource` from the split model:

- **Profile-photo first** — items with `mediaSource.kind ===
  'profilePhoto'` resolve through an injectable `profilePhotoResolver`
  prop on the webpart. When the resolver is not supplied (current
  host path), `profilePhoto` sources fall through to `undefined`,
  and the supporting row renders an initials placeholder derived from
  the `personRef.displayName`. Featured cards hide the image area in
  that case.
- **HR override media** — `hrUpload`, `campaignArtwork`, and
  `eventPhotography` sources render directly using the supplied
  `src`/`alt`, with `data-hbc-pc-media-source` reflecting the
  originating channel so DOM tests and the companion can verify which
  channel is active.
- **Campaign/event artwork for non-person culture programming** — the
  `cultureProgramEvent` family uses `campaignArtwork` or
  `eventPhotography` sources as the primary media. No `profilePhoto`
  fallback.
- **Legacy compatibility** — the legacy bridge surfaces pre-resolved
  `HomepageMediaSlot` entries as `hrUpload` sources. Legacy data does
  not carry person email/account-name, so `profilePhoto` cannot be
  derived from legacy payloads — those items fall through to the
  initials placeholder. This is a known, temporary limitation that
  ends when the new SP list adapter (with person email fields) lands
  in a later prompt.

## 4. Audience and Sparse-State Validation Performed

Audience filtering is enforced at the normalizer layer via
`isAudienceVisibleToViewer`:

- `companyWide` items always render.
- `targeted` items require a matching viewer tag on
  (`dimension`, `value`). The legacy bridge projects flat
  `audiences: string[]` onto the `office` dimension as a best effort.
- **Fail-closed** — when `viewerAudience` is not supplied by the host,
  targeted items are hidden. The public webpart never leaks targeted
  content to an unknown viewer.

Sparse-state behavior is exercised by unit tests in
`apps/hb-webparts/src/homepage/__tests__/peopleCulturePublicRuntime.test.tsx`:

- Empty-config render paths show the empty-state status panel.
- Featured-only and supporting-only partitions render correctly.
- A kudos-only legacy input renders the empty state (no recognition
  leakage — validates the bridge).
- Targeted items with mismatched viewers are absent from the output.
- Pinned items rank above unpinned within the featured tier.
- Viewer-audience matching on `office` tags filters correctly.

Full test summary:

- `apps/hb-webparts` `npm run check-types`: **clean**
- `apps/hb-webparts` `npm run lint`: **clean**
- `apps/hb-webparts` `npm run build` (tsc + vite build): **clean**
- `peopleCulturePublicRuntime.test.tsx`: **16 / 16** pass
- `peopleCultureSplitModel.test.tsx` (Prompt-01 coverage):
  **36 / 36** pass
- Full `apps/hb-webparts` suite: **166 passing**, 14 pre-existing
  failures in unrelated test files
  (`bundleBudget`, `compositionPreview`, `discoveryWebpart`,
  `interactiveStates`, `motionAndAccessibility`,
  `operationalAwarenessWebparts`, `topBandWebparts`,
  `utilityWebparts`). These 14 failures were verified to pre-exist
  on `main` without this change during Prompt-01 verification.
- `tools/build-spfx-package.ts --domain hb-webparts`: **clean**.
  `hb-webparts.sppkg` rebuilt (3006.7 KB). All 13 shim entries
  preserved, `.sppkg` structure re-verified.

## 5. Known Remaining Public-Surface Gaps

1. **SharePoint list adapter for `People Culture Announcements` and
   `People Culture Celebrations` is still pending.** The current
   runtime reads from the host manifest config blob only. The legacy
   bridge is a sufficient stopgap for already-placed page instances
   while the new list schemas are extracted and a split-aware adapter
   is wired. This matches the Prompt-01 note that the two list
   schemas (`2cd191fc-…` and `b87bf664-…`) have not yet been
   extracted.
2. **Viewer audience is not yet plumbed through `mount.tsx`.** The
   component accepts a `viewerAudience` prop but `mount.tsx` does not
   currently populate it from the SPFx page context. Until the
   companion-driven audience identity resolver lands, the public
   surface renders `companyWide` items only. A narrow `mount.tsx`
   enhancement in a later prompt will wire this through.
3. **Profile-photo resolver is not yet provided by the host.** The
   component accepts `profilePhotoResolver` but the default path
   resolves to `undefined`, so profile-photo media currently falls
   through to initials placeholders. The resolver will be supplied
   when the real SP list adapter surfaces the person email /
   account-name fields.
4. **Local composition vs `@hbc/ui-kit` primitives.** The surface
   composition lives locally inside `peopleCulturePublic/` because
   promoting to `@hbc/ui-kit` without the companion's presentation
   patterns in view would force two ui-kit edits for overlapping
   needs. Once the companion's shared building blocks take shape
   (Prompt-03), `hb-ui-ux-conformance-reviewer` should decide whether
   to promote the featured-card / supporting-row primitives into a
   new `@hbc/ui-kit/homepage` entry so the companion and public
   webpart can share them.
5. **Targeted audience tagging from legacy data.** Legacy `audiences:
   string[]` entries are projected onto the `office` dimension as a
   best-effort. Real dimensional tagging (office / department /
   region / roleFamily / projectTeam) requires either explicit
   dimensional authoring or a mapping lookup — both are deferred to
   the list-adapter prompt.
6. **Pre-existing homepage test failures unchanged.** Eight test
   files unrelated to PC public are red on `main`. This prompt did
   not attempt to fix them; they should be triaged separately.

## 6. Boundary Verification

The following was explicitly checked to preserve the hard
People & Culture / HB Kudos boundary:

- No imports from `hbKudos/`, `hbKudosCompanion/`, or
  `@hbc/ui-kit/homepage`'s Kudos primitives in any new or modified
  file.
- No imports from `useKudosComposer.ts`,
  `peopleCultureSubmissionSource.ts`, or any Kudos-labeled submission
  source.
- `adaptLegacyConfigToSplit` drops `PeopleCultureMergedConfig.kudos`
  on entry; a unit test asserts the resulting items array is empty
  when the legacy config carries only kudos entries.
- `normalizePeopleCulturePublicConfig` operates only on
  `PeopleCultureItem` — no path accepts a `KudosEntry`.
- The rendered DOM carries no `data-hbc-*="kudos*"` hooks; the
  runtime test asserts that a legacy kudos payload renders the
  empty state rather than any kudos content.

## Report Back Summary

1. **Public-surface changes.** PeopleCulturePublic.tsx rewritten to real runtime; new `PeopleCulturePublicSurface.tsx` composition and `legacyAdapter.ts` bridge; manifest bumped to `0.0.3.0`; description updated; sppkg rebuilt at `1.0.0.115`.
2. **Homepage-governance integration.** Featured/supporting partition + pin ordering driven entirely by `homepage.tier`/`isPinned`/`order`/`overrideSource`. `homepageEnabled: false` maps to excluded tier.
3. **Media / profile-photo behavior.** `resolveMediaSource` wired with optional injectable `profilePhotoResolver`; HR upload / campaign / event channels render directly with tagged source kind; supporting rows show initials placeholder when no media is resolvable; campaign artwork supports non-person culture programming.
4. **Audience / sparse-state validation.** 16 new runtime unit tests (legacy bridge + runtime rendering + audience filtering + kudos non-leakage + pin ordering + media source tagging). Typecheck / lint / full test suite / sppkg rebuild all clean. Pre-existing failures in unrelated test files remain unchanged.
5. **Known remaining gaps.** Real SP list adapter, mount-level viewer audience, mount-level profile photo resolver, UI-kit promotion decision, legacy dimensional tagging, and pre-existing unrelated test failures are all deferred to later prompts.

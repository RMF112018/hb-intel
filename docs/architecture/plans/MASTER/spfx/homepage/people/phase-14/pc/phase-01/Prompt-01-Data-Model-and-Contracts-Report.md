# Prompt 01 — Data Model and Contracts Report

Phase-14 · People & Culture + HR Operating Companion implementation package.

Deliverable for
[`Prompt-01-Data-Model-and-Contracts.md`](./Prompt-01-Data-Model-and-Contracts.md).
This prompt introduces the explicit, strongly-typed data model for the
People & Culture public webpart and the HR operating companion webpart.
The contracts are additive — they do not replace or modify the legacy
merged contracts (`PeopleCultureMergedConfig` and friends) that back the
backward-compatibility `peopleCulture/` webpart.

## 1. Contracts Introduced

New file:
`apps/hb-webparts/src/homepage/webparts/peopleCultureSplitContracts.ts`

Adjacent to the legacy `communicationsContracts.ts`, this module is the
authoritative data model for the PC split surfaces. It is strongly typed,
narrow, and deliberately excludes HB Kudos recognition primitives — the
Kudos boundary remains owned by the separate HB Kudos webpart.

The module exports the following core types (section numbers match the
file headings):

1. **Content family** — `PeopleCultureContentFamily` (`announcement`, `celebrationMilestone`, `cultureProgramEvent`) plus `PEOPLE_CULTURE_CONTENT_FAMILIES` tuple.
2. **Lifecycle state** — `PeopleCultureLifecycleState` union of all eight states (`draft`, `needsApproval`, `scheduled`, `live`, `expiringSoon`, `expired`, `archived`, `suppressed`) plus `PEOPLE_CULTURE_LIFECYCLE_STATES` tuple. `archived`, `expired`, and `suppressed` are deliberately distinct literal types to satisfy the Decision-Lock rule that these must never collapse into a single flag.
3. **Approval trigger** — `PeopleCultureApprovalTrigger` (`standard`, `enterpriseWide`, `homepagePinned`).
4. **Audience model** — `PeopleCultureAudienceDimension` (`office`, `department`, `region`, `roleFamily`, `projectTeam`), `PeopleCultureAudienceTag`, `PeopleCultureAudienceScope` as a discriminated union (`companyWide` vs `targeted`), and `PeopleCultureViewerAudience`.
5. **Homepage governance** — `PeopleCultureHomepageTier` (`featured`/`supporting`/`excluded`), `PeopleCultureHomepageOverrideSource` (`systemDefault`/`hrOverride`), `PeopleCultureHomepageConflictReason`, and the `PeopleCultureHomepageGovernance` aggregate (`tier`, `overrideSource`, `isPinned`, `order`, `conflictReason`).
6. **Media source** — `PeopleCultureMediaSource` discriminated union for `profilePhoto`, `hrUpload`, `campaignArtwork`, `eventPhotography`, and `none`. `PeopleCultureResolvedMedia` tags the resolved `HomepageMediaSlot` with the originating `sourceKind` so the companion can surface which media channel is active.
7. **Milestone candidate** — `PeopleCultureMilestoneCandidate` with candidate type, person reference, provenance source, review state, reviewer identity, and optional `linkedItemId` for post-promotion tracking.
8. **Role / permission** — `PeopleCultureRole` (`editor`/`approver`/`admin`), `PeopleCultureRoleCapabilities` (14 explicit capability flags), and a frozen `PEOPLE_CULTURE_ROLE_CAPABILITIES` capability map.
9. **Notification and intake** — `PeopleCultureNotificationRecipientKind`, `PeopleCultureNotificationTrigger`, `PeopleCultureIntakeSubmitterRole`, `PeopleCultureIntakeReviewState`, and `PeopleCultureIntakeSubmission` (including `linkedItemId` once HR promotes the submission).
10. **Preview model** — `PeopleCultureRenderContext`, `PeopleCultureRenderVariant`, `PeopleCultureRenderViewport`, `PeopleCulturePreviewKey`, and a `PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS` tuple for the standard multi-context preview set.
11. **Core item** — `PeopleCultureItem`: the unit of content. All lifecycle-relevant timestamps (`submittedAt`, `approvedAt`, `scheduledStart`, `scheduledEnd`, `publishedAt`, `expiresAt`, `archivedAt`, `suppressedAt`) are distinct fields so the lifecycle classifier can distinguish `archived`/`expired`/`suppressed` unambiguously. Optional `milestoneCandidateId` and `intakeSubmissionId` preserve provenance.
12. **Public webpart config** — `PeopleCulturePublicConfig`, `PeopleCulturePublicOutput`, and `DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG`.
13. **Companion webpart config** — `PeopleCultureCompanionConfig`, `PeopleCultureLifecycleCounts`, `PeopleCultureLifecycleCountsByFamily`, and `PeopleCultureCompanionOverview`.

The types are re-exported from
`apps/hb-webparts/src/homepage/webparts/index.ts` so downstream consumers
can import them from the shared `../webparts/index.js` barrel alongside
the existing contracts.

## 2. State and Audience Model Implemented

The lifecycle state model is enforced at two layers:

- **Contract layer** — `PeopleCultureLifecycleState` is the only place a
  state value is expressed. `PeopleCultureItem.lifecycleState` is
  required. There is no catch-all "status" string.
- **Derivation layer** — `deriveLifecycleState` in
  `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`
  classifies an item from its timestamps, in explicit priority order:

  1. `suppressedAt` → `suppressed`
  2. `archivedAt` → `archived`
  3. `expiresAt` exceeded → `expired`
  4. `publishedAt` within expiring-soon window → `expiringSoon`
  5. `publishedAt` in the past → `live`
  6. `scheduledStart` in the future → `scheduled`
  7. `approvedAt` set → `scheduled`
  8. `submittedAt` set → `needsApproval`
  9. otherwise → `draft`

  The expiring-soon window defaults to 7 days and is overridable via
  `DEFAULT_EXPIRING_SOON_WINDOW_DAYS`. The classifier guarantees that
  `archived`, `expired`, and `suppressed` can never collapse — a unit
  test exercises all three distinctly.

The audience model is enforced the same way:

- Contract: `PeopleCultureAudienceScope` is a discriminated union. An
  empty `targeted` tag set is invalid and is treated as not-visible
  (fail-closed) by the matcher.
- Matcher: `isAudienceVisibleToViewer` returns true for company-wide
  items or when the item's tag set intersects the viewer's tag set on
  (dimension, value). Company-wide scope never requires a viewer;
  targeted scope requires one.

## 3. Homepage / Media / Milestone Fields Implemented

**Homepage governance** is expressed on every `PeopleCultureItem` as a
required `homepage: PeopleCultureHomepageGovernance` field. It carries
`tier`, `overrideSource` (system default vs HR override),
`isPinned`, optional manual `order`, and optional `conflictReason`.
Conflict detection is provided by `detectHomepageConflicts`, which
flags `pinnedOverflow`, `featuredOverflow`, `supportingOverflow`, and
`expiringWhilePinned` using the public tier caps from
`DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG`. HR override always wins over
the system default because the tier field is the single source of
truth — the `overrideSource` flag is metadata only.

**Media sourcing** is expressed as a discriminated union on every
item (`mediaSource`). Profile-photo-first is the intended default for
person-centric items; HR override channels are `hrUpload`,
`campaignArtwork`, and `eventPhotography`; non-person campaign/event
items use `campaignArtwork`/`eventPhotography` directly. The
`resolveMediaSource` helper resolves a source into a concrete
`HomepageMediaSlot` tagged with the originating `sourceKind`, and
accepts an injectable `ProfilePhotoResolver` so the companion can
display the active media channel without coupling to any specific
identity source.

**Milestone candidates** are modeled end-to-end:

- `PeopleCultureMilestoneCandidate` carries the candidate type,
  person, occursOn date, source-system provenance, review state,
  reviewer, and an optional `linkedItemId` back to the promoted
  `PeopleCultureItem`.
- `buildCompanionOverview` projects the `pendingReview` subset into
  the companion overview dashboard so HR can act on the queue.
- `PeopleCultureItem.milestoneCandidateId` preserves the candidate
  provenance once HR promotes a candidate into a real item.

## 4. Helper / Normalizer Changes

New file:
`apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`

Pure, deterministic, DOM-free helpers operating on the new contracts:

- `deriveLifecycleState` — lifecycle classifier described above.
- `deriveApprovalTrigger` — hybrid-governance path classifier. Pinned
  items always trigger `homepagePinned`. Company-wide items default
  to `enterpriseWide` (overridable via
  `treatCompanyWideAsEnterprise: false`). Targeted audiences alone do
  NOT trigger the hybrid path, matching the Decision-Lock rule.
- `isAudienceVisibleToViewer` — company-wide vs targeted dimensional
  visibility check.
- `resolveMediaSource` — profile-photo-first resolver with optional
  injectable resolver and explicit sourceKind tagging.
- `hasPeopleCultureCapability` — role-based capability gate over the
  14-flag capability sheet.
- `normalizePeopleCulturePublicConfig` — the public webpart
  normalizer. Validates, filters to `live` / `expiringSoon` only,
  applies viewer-audience scoping, drops `excluded` tier items,
  partitions into `featured` vs `supporting`, sorts by
  (pinned first, order, publishedAt desc, title), and enforces
  `maxFeatured` / `maxSupporting` caps.
- `countLifecycleStatesByFamily` — companion overview per-family
  counters across all eight lifecycle states.
- `buildCompanionOverview` — aggregates pending approvals, upcoming
  scheduled (within a configurable window), expiring-soon items,
  homepage conflicts, pending milestone candidates, and pending
  intake submissions.
- `detectHomepageConflicts` — returns a `Map<itemId, conflictReason>`
  implementing the four conflict rules described above.

Legacy helpers in `communicationsConfig.ts`
(`normalizePeopleCultureMergedConfig` and friends) are **unchanged**.
Backward compatibility with the merged webpart is fully preserved.

## 5. Consumer Seam — PeopleCulturePublic Webpart

`apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
was updated to accept two optional typed prop slots:

- `splitConfig?: Partial<PeopleCulturePublicConfig>` — the strongly
  typed split config. The scaffold intentionally does not consume it
  yet; Prompt-02 will reimplement the public runtime on top of it.
- `viewerAudience?: PeopleCultureViewerAudience` — viewer identity
  for audience scoping.

These additions are additive and backward compatible. The scaffold
still renders the same Phase-14 placeholder panel. The manifest
version bumps from `0.0.1.0` → `0.0.2.0` to signal that the webpart's
TypeScript props contract widened even though the rendered output is
unchanged — Prompt-02 will follow with `0.0.3.0` when the runtime
lands.

## 6. Remaining Repo-Truth Constraints

Two observations for downstream prompts. Neither blocks Prompt-02.

1. **SharePoint `People Culture Kudos` list is Kudos-owned.** The
   live schema in
   `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-sharepoint-schema-report.md`
   is the authoritative field set for the HB Kudos product. It is
   **not** a source for PC announcements/celebrations/culture
   programming — those back onto the separate `People Culture
   Announcements` (`2cd191fc-a7ea-49f2-af05-c395c2326e57`) and
   `People Culture Celebrations` (`b87bf664-0531-418b-902c-726e5fb87083`)
   lists, whose canonical schemas have not yet been extracted. The
   split contracts are intentionally list-agnostic: they describe
   the target data model and leave the SharePoint adapter mapping
   to Prompt-02 / Prompt-05. When Prompt-02 begins, the announcements
   and celebrations list schemas should be extracted via the same
   PnP-based method used for the Kudos list schema so the adapter
   can map InternalNames exactly.

2. **Mangled celebration `HomepageEnabled` internal name.** The
   existing celebration list source already hard-codes
   `HomepageEnabledGovernanceextensi` as the live mangled internal
   name. The split-aware adapter in Prompt-02 must preserve this
   fallback until the field is re-provisioned with a clean name.

No other repo-truth constraints surfaced. The split boundary between
People & Culture and HB Kudos is preserved: the new contract module
does not import any Kudos primitive, and consumers cannot
accidentally pull Kudos types through the split barrel.

## 7. Verification Performed

- `npm run check-types` in `apps/hb-webparts` — clean.
- `npm run lint` in `apps/hb-webparts` — clean.
- `npm test -- peopleCultureSplitModel` — **36 / 36** tests pass
  (`src/homepage/__tests__/peopleCultureSplitModel.test.ts`).
- Full `npm test` in `apps/hb-webparts` — 150 passing, 14 pre-existing
  failures in unrelated test files (`bundleBudget`,
  `compositionPreview`, `discoveryWebpart`, `interactiveStates`,
  `motionAndAccessibility`, `operationalAwarenessWebparts`,
  `topBandWebparts`, `utilityWebparts`). Verified via
  `git stash` that the same 14 failures exist on `main` without this
  prompt's changes, confirming no regressions were introduced.

No `hb-webparts.sppkg` rebuild was performed. Prompt-01 is contracts
+ helpers + one optional prop widening — no runtime behavior change,
no mount.tsx change, no package-solution.json change.

## 8. Readiness for Prompt-02

Prompt-02 can now reimplement `PeopleCulturePublic.tsx` on top of
`PeopleCulturePublicConfig` and `normalizePeopleCulturePublicConfig`,
extract the live announcements and celebrations list schemas, and
wire the SharePoint adapter into the new contract shape. The
companion work in Prompt-03 has its full data model ready:
`PeopleCultureCompanionConfig`, `buildCompanionOverview`,
`detectHomepageConflicts`, and `hasPeopleCultureCapability` cover
the companion's core behavior without any additional contract
work.

## Report Back Summary

1. **Contracts introduced.** `peopleCultureSplitContracts.ts` adds the 13-section split data model. Types are re-exported through `homepage/webparts/index.ts`.
2. **State and audience model.** Eight-state lifecycle union with priority-ordered `deriveLifecycleState` classifier. Discriminated `PeopleCultureAudienceScope` with dimensional tags and fail-closed `isAudienceVisibleToViewer` matcher.
3. **Homepage / media / milestone fields.** Required `homepage` governance aggregate with tier/override/pin/order/conflict fields. `PeopleCultureMediaSource` discriminated union with profile-photo-first and HR override channels, plus tagged `resolveMediaSource` resolver. End-to-end `PeopleCultureMilestoneCandidate` with provenance and `linkedItemId`.
4. **Helper / normalizer changes.** `peopleCultureSplitModel.ts` adds lifecycle / approval / audience / media / capability / normalizer / overview / conflict-detection helpers. Legacy merged normalizers unchanged.
5. **Remaining repo-truth constraints.** SharePoint announcements and celebrations list schemas are not yet extracted — Prompt-02 should extract them before wiring the runtime. The mangled `HomepageEnabledGovernanceextensi` celebration field must be preserved in the adapter.

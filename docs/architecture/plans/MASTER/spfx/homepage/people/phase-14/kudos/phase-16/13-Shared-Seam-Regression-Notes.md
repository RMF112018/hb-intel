# 13 — HB Kudos Shared Seam Regression Notes

Vitest coverage added by phase-16 prompt 07. These tests are
always-runnable via `pnpm --filter @hbc/spfx-hb-webparts test` and
catch classes of regressions that the E2E stress suite (prompts 05/06)
cannot catch while its dev-harness wiring is still pending (and even
after it lands, they fire faster and closer to the source).

## Specs added

All under `apps/hb-webparts/src/homepage/__tests__/`:

| Spec | Seam | Cases |
|---|---|---|
| `useKudosComposer.test.ts` | composer state hook | 11 |
| `useSharePointPeopleSearch.test.ts` | SP people-picker adapter | 5 |
| `submitKudosDraft.test.ts` | SP submission writer | 6 |
| `buildKudosPatchPlan.test.ts` | governance patch planner | 9 |
| `kudosSharedExports.test.ts` | `@hbc/ui-kit/homepage` export contract | 6 (parametric) |
| `kudosDetailPanelBoundary.test.tsx` | public/admin detail boundary | 4 |

All 42 cases pass.

## What each spec catches

### useKudosComposer
- Dirty detection drift (close without prompt when content exists → silent data loss).
- Validation gate regressions (empty submit reaching the network).
- Typed vs text-mode recipient rule drift.
- Headline length cap drift.
- `submit` success/error state transitions and `submitError` capture.
- `reset` contract for Send-Another path.

### useSharePointPeopleSearch
- Query-threshold regression (dispatch on 1-char queries would hammer SP).
- Digest failure silently collapsed into empty results (currently throws — guarded).
- Non-ok search response swallowed into `[]` (guarded).
- Response-shape drift where SP returns a body lacking any of the known principal payload keys (guarded).

### submitKudosDraft
- Pending/internal-only defaults on the POST payload
  (`WorkflowStatus: 'pending'`, `HomepageEnabled: false`,
  `WasEverPublished: false`, `IsPinned/IsFeatured/IsScheduled: false`,
  `ProminenceIntent: 'standard'`, `CelebrateCount: 0`).
- Typed-recipient bucket handling: individuals are resolved via
  `ensureUser`, unresolved/label buckets land in `ModeratorNotes`.
- Text-mode backward-compat validation.
- Cache invalidation fires on success — and does NOT fire on server
  rejection (regression guard for a class of phantom-invalidation bugs).

### buildKudosPatchPlan
- Approve / reject / requestRevision / flagAdminReview fields + paired
  audit-event types.
- Input validation on required reasons (empty rejectionReason,
  revisionGuidance, adminReviewReason).
- Actor coupling: patch planner adds `ApprovedById` / `ReviewedById`
  only when `actorUserId` is provided.
- Public/admin note boundary: notes are attached to the audit event,
  never to the list-item field payload (so public surfaces can never
  accidentally pull internal notes off the kudos item row).
- Trimming of user-supplied text.

### kudosSharedExports
- Export drift on the six Kudos-critical primitives
  (`HbcPeopleCultureSurface`, `HbcKudosComposerFlyout`,
  `HbcKudosComposerForm`, `HbcKudosComposerPreview`, `HbcPeoplePicker`,
  `HbcAvatarStack`). A rename in `@hbc/ui-kit/homepage` fails here
  instead of at runtime in a hosted webpart.

### kudosDetailPanelBoundary
- Viewer role MUST NOT render the audit timeline, governance metadata
  section, internal moderator notes, or admin review reason.
- Admin and reviewer roles MUST render the audit timeline + governance
  metadata + internal notes.
- Viewer role still renders public recognition content (excerpt +
  submitter attribution) — proves the boundary doesn't over-hide.

## Relationship to the rest of phase-16

- Complements `kudosContracts.test.ts` (pre-existing, covers F-axis
  visibility / mapping / recipient summary helpers).
- Complements the E2E stress lane under `e2e/webparts/kudos/**` — E2E
  proves user-visible behavior; these tests prove hook / writer / pure
  function contracts.
- The cache-invalidation probe asserted by the E2E
  `kudos.public.celebrate` and `kudos.admin.failure-paths` specs lines
  up with the `invalidatePeopleCultureCache` coupling proven here at
  the source.

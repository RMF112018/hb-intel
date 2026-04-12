# 11 — HB Kudos Fixture Catalog

Scenario catalog for the deterministic fixture system under
`e2e/webparts/kudos/fixtures/`. Consumed by prompts 05–08. All
fixtures are importable from `fixtures/index.ts`.

## How to consume

```ts
import {
  workflowBaseline,
  governanceBaseline,
  prominenceBaseline,
  auditTimelineBaseline,
  setPeopleSearchMode,
  setHostedFault,
  ENTRIES,
  AUDIT_SEQUENCES,
  USERS,
  RECIPIENTS,
} from '../fixtures';

await gotoKudosPublic(page, workflowBaseline());
await setPeopleSearchMode(page, 'zero-matches');
await setHostedFault(page, 'pin-slot-collision');
```

Rules:

- Call a baseline factory *once per test*. Factories reset the seed
  id counter internally so id output is stable across runs.
- Compose narrow scenarios by cloning `ENTRIES.*()` output and
  overriding only the fields the test needs. Do not hand-write
  fixture JSON.
- Audit sequences are pure functions of a `kudosId`. Attach them via
  the `audits` field on the `SeedPayload`.

## Named baselines

| Baseline | Current user | Items | Intended tests | Expected visible | Expected hidden |
|---|---|---|---|---|---|
| `workflowBaseline` | unrelated public | A1–A7 one per state | public filtering, drift guard, cache probe | approvedLive (A3) only | A1, A2, A4 (pre-schedule), A5, A6, A7 |
| `visibilityBaseline` | unrelated public | approvedLive + archiveEligible + agedOff | archive search, age-off, C3/C4 | approvedLive on feed; archive-eligible in archive search | agedOff on feed |
| `governanceBaseline` | admin | flagged/claimed/assigned/approved/reviewed | queue filters, B1–B8, admin detail boundary | all items in companion queues | (admin surface) |
| `prominenceBaseline` | admin | pinned + featured + standard (slots occupied) | D1–D6 collision proofs | slot-occupied conflict on new pin/feature | — |
| `identityMediaBaseline` | unrelated public | approved × G1/G2/G3/G4 | G-axis rendering | each recipient shape renders correctly | — |
| `interactionBaseline` | recipient | approvedZeroCelebrates + approvedManyCelebrates | E1/E2/E3/E4/E5 | celebrate count increments correctly | — |
| `submitterPerspectiveBaseline` | submitter | own pending/revision/rejected | C5 associated-to-submitter, withdraw/resubmit | own non-public items surface to submitter | public feed entries hidden (no A3) |
| `recipientPerspectiveBaseline` | recipient | approvedLive | C6 associated-to-recipient affordances | recipient-side affordance | — |
| `reviewerPerspectiveBaseline` | reviewer | pendingFlagged + approvedLive | reviewer-role gating | admin-review queue entries | admin-only bulk actions |
| `auditTimelineBaseline` | admin | 13 entries, one per canonical audit sequence | D-axis audit coverage | admin timeline renders each sequence | public detail omits timeline |

## Named entries (overlay-explicit factories)

Each factory in `ENTRIES` produces a `SeededKudosItem`:

| Factory | Workflow | Overlays | Intended test families |
|---|---|---|---|
| `pending` | pending | — | A1, composer submit-success |
| `revisionRequested` | revisionRequested | — | A2, resubmit |
| `approvedLive` | approved | celebrate=3 | A3, C1, E2 |
| `approvedScheduled` | approvedScheduled | publishAt=+3d | A4, C2 |
| `rejected` | rejected | — | A5, reopen |
| `withdrawn` | withdrawn | — | A6 |
| `removedUnpublished` | removedUnpublished | — | A7, restore |
| `approvedArchiveEligible` | approved | createdIso=archive | C3 |
| `approvedAgedOff` | approved | createdIso=aged-off | C4 |
| `approvedPinned` | approved | prominence=pinned | D2, D6 collision |
| `approvedFeatured` | approved | prominence=featured | D3, D6 collision |
| `pendingFlagged` | pending | flaggedForAdminReview | B1, B2 |
| `pendingClaimed` | pending | claimOwnerId=admin | B3, B4 |
| `pendingAssigned` | pending | assignedOwnerId=other-admin | B4, B7 |
| `approvedReviewed` | approved | reviewedByCurrentUser | B5 |
| `approvedZeroCelebrates` | approved | celebrateCount=0 | E1 |
| `approvedManyCelebrates` | approved | celebrateCount=42 | E2, E5 |
| `approvedIndividualNoPhoto` | approved | recipients=[G2] | G2 |
| `approvedMixedIndividuals` | approved | recipients=G3 | G3 |
| `approvedMixedBucket` | approved | recipients=G4 (RT*) | G4 |

Additional factory: `removedThenRestored()` — history shape for A7 → A3 restore.

## Audit sequences

All sequences in `AUDIT_SEQUENCES` are pure `(kudosId) => SeededAuditEvent[]`.

| Key | Sequence | Axis D item |
|---|---|---|
| `submitApprove` | submit → approve | D1 |
| `submitRevisionResubmitApprove` | submit → requestRevision → resubmit → approve | D2 |
| `submitReject` | submit → reject | D3 |
| `submitWithdraw` | submit → withdraw | D4 |
| `approveScheduleUnschedule` | approve → schedule → unschedule | D5 |
| `approvePinUnpin` | approve → pin → unpin | D6 |
| `approveFeatureUnfeature` | approve → feature → unfeature | D7 |
| `approveRemoveRestore` | approve → remove → restore | D8 |
| `claimReassign` | claim → reassign | D9 |
| `flagClear` | flagAdminReview → clearAdminReview | D10 |
| `celebrateIncrements` | celebrate ×3 | D11 |
| `reopen` | reject → reopen | D12 |
| `updateContent` | approve → updateContent | D13 |

## People-search adapter modes

Toggle via `setPeopleSearchMode(page, mode)`.

| Mode | Shape | Covers |
|---|---|---|
| `exact-match` | 1 result | F8 |
| `multiple-matches` | 3 results | composer ranking |
| `zero-matches` | 0 results | F9 |
| `malformed-partial` | defensive shape (blank name, null id) | adapter hardening |
| `photo-unavailable` | 1 result, `hasPhoto=false` | G2 via picker |
| `directory-error` | throw directory error | F10 |
| `digest-failure` | throw digest error | F10 (digest variant) |

## Hosted fault injection

Toggle via `setHostedFault(page, fault)`.

| Fault | Writer behavior | Covers |
|---|---|---|
| `none` | normal | baseline |
| `stale-after-action` | skip cache invalidation | cache-invalidation proof |
| `pin-slot-collision` | writer denies pin | D6 |
| `feature-slot-collision` | writer denies feature | D6 |
| `role-capability-denied` | writer rejects on capability gate | role-gate proof |
| `list-item-not-found` | 404 on lookup | writer-contract spec |
| `audit-write-failure` | mutation ok, audit fails | writer-contract spec |
| `patch-rejected-etag` | 412 on MERGE | writer-contract spec |

## Users

`USERS.submitter`, `USERS.recipient`, `USERS.recipientNoPhoto`,
`USERS.unrelated`, `USERS.reviewer`, `USERS.admin`, `USERS.otherAdmin`.
All are deterministic and keyed for role-gating proofs.

## Recipients

`RECIPIENTS.individualWithPhoto`, `RECIPIENTS.individualNoPhoto`,
`RECIPIENTS.teamLabel`, `RECIPIENTS.departmentLabel`,
`RECIPIENTS.projectGroupLabel` plus
`multipleIndividualsMixedPhoto` and `mixedBucket` composites.
Non-individual buckets are RT\* (label-only; no term-store completion).

## Consumption rules for prompts 05–08

1. Use named baselines when the scenario maps to one directly.
2. Use `ENTRIES.*()` + `SeedPayload` composition when the scenario is
   narrow or combinatorial.
3. Always pass a current-user perspective; never leave the role
   implicit.
4. For writer/cache/seam tests, combine a baseline with a
   `setHostedFault` toggle rather than hand-building failure items.
5. For people-picker tests, combine the composer flow with
   `setPeopleSearchMode`.
6. Never extend the workflow union. New overlay needs go on
   `SeededKudosOverlays` and into this catalog.

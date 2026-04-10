# HB Kudos Comprehensive Test Notes

Phase-14 testing package · Prompt-02 deliverable.

## Suite structure

The HB Kudos comprehensive suite lives at `scripts/testing/people-kudos/kudos/` with five sub-workflow modules:

| Module | File | Step count | Coverage |
|---|---|---|---|
| Submission + recipients | `submission.ts` | 12 steps | Create, persist, recipient fields, submitter persistence |
| Approval transitions | `approval.ts` | 9 steps | Happy path (revision → resubmit → approve), rejection, withdrawal |
| Prominence + scheduling | `prominence.ts` | 10 steps | Schedule/unschedule, pin/unpin, feature/unfeature, publish window |
| Lifecycle | `lifecycle.ts` | 12 steps | Celebrate, visibility modes, remove/restore, archive eligibility |
| Audit parity | `auditParity.ts` | 26 steps | 12 event types created, count verification, per-type presence assertion |
| **Total** | | **69 steps** | |

## Synthetic data conventions

- Every item uses `KudosId = TEST-HBI-{runId}-{seq}` for deterministic cleanup.
- The suite creates up to 5 kudos items (seq 1, 4–8) and 12 audit events (seq 9).
- Cleanup deletes by `startswith(KudosId, 'TEST-HBI-{runId}-')` and by exact KudosId on audit rows.

## Unsupported / partially provable flows

| Flow | Reason | Status |
|---|---|---|
| **Taxonomy recipient persistence** | `TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients` are managed-metadata fields requiring term-store resolution via the taxonomy API, which the harness does not implement. Schema presence is proven via the extracted artifacts. | Blocked |
| **Individual recipient persistence (live)** | `IndividualRecipientsId` is a UserMulti field. The vitest unit tests for `submitKudosDraft` prove the `ensureUser → IndividualRecipientsId: { results: [ids] }` path. The live harness defers this because it requires a valid email → user ID resolution. | Partially covered |
| **CelebrateCount atomicity** | The harness uses a read-modify-write pattern that is inherently racy in concurrent scenarios. The test passes for sequential execution but the approach is documented as a known race condition. | Fully covered (with warning) |
| **Prominence conflict enforcement** | Featured max=1 and pinned max=3 are documented rules but are not enforced at write time by the current governance writer. The harness does not test conflict behavior. | Not applicable (enforcement deferred) |

## Running the suite

```bash
# Dry-run (default, no token needed)
npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --dry-run

# Live run with explicit token
SHAREPOINT_BEARER_TOKEN=<token> npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --live

# Verbose dry-run
npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --dry-run --verbose

# Full suite (all domains)
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
```

## Key assertions by workflow

### Submission
- `KudosId` matches synthetic ID
- `WorkflowStatus` = `pending`
- `HomepageEnabled` = `false`
- `IsPinned` = `false`
- `WasEverPublished` = `false`
- `CelebrateCount` = `0`
- `Headline` and `Excerpt` are defined

### Approval transitions
- Revision requested: `WorkflowStatus` → `revisionRequested`
- Resubmit: `WorkflowStatus` → `pending`
- Approve: `WorkflowStatus` → `approved`
- Reject: `WorkflowStatus` → `rejected`
- Withdraw: `WorkflowStatus` → `withdrawn`

### Prominence / scheduling
- Schedule: `WorkflowStatus` → `approvedScheduled`, `IsScheduled` = `true`
- Unschedule: `WorkflowStatus` → `approved`, `IsScheduled` = `false`
- Pin: `IsPinned` = `true`, `ProminenceIntent` = `pinned`
- Unpin: `IsPinned` = `false`, `ProminenceIntent` = `standard`
- Feature: `IsFeatured` = `true`, `ProminenceIntent` = `featured`
- Unfeature: `IsFeatured` = `false`, `ProminenceIntent` = `standard`
- Publish: `HomepageEnabled` = `true`, `WasEverPublished` = `true`

### Lifecycle
- Celebrate: `CelebrateCount` incremented by 1
- Visibility: `CurrentVisibilityMode` cycles through all 3 modes
- Remove: `WorkflowStatus` → `removedUnpublished`, `IsRemovedFromPublicView` = `true`
- Restore: `WorkflowStatus` → `approved`, `IsRemovedFromPublicView` = `false`
- Archive: `WasEverPublished` = `true`, `IsRemovedFromPublicView` = `false`

### Audit parity
- 12 event types created (submit, approve, reject, revisionRequested, reopen, schedule, unschedule, pin, feature, celebrate, remove, restore)
- Query by KudosId returns exactly 12 rows
- Each expected EventType is present in the result set

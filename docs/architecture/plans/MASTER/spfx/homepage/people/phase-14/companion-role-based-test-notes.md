# Companion & Role-Based Test Notes

Phase-14 testing package · Prompt-04 deliverable.

## Suite structure

The companion suite lives at `scripts/testing/people-kudos/companions/` with four sub-workflow modules:

| Module | File | Step count | Coverage type |
|---|---|---|---|
| Kudos roles | `kudosRoles.ts` | 28 steps | Pure-logic assertion (capability matrix + writer validation) |
| Kudos claim | `kudosClaim.ts` | 7 steps | Live list writes (claim, reassign, celebrate) |
| Kudos governance | `kudosGovernance.ts` | 39 steps | Live list writes (all admin-only actions) + audit traceability + notification state |
| PC companion | `pcCompanion.ts` | 12 steps | Live list writes (homepage governance) + deferred-coverage warnings |
| **Total** | | **80 steps** (excl. cleanup) | |

## Coverage categories

### Automated API/list/assertion coverage
- **Kudos capability matrix**: 21 flags across 3 roles, each verified against the Decision-Lock-Appendix matrix.
- **Writer validation gates**: 6 branches that return `ok=false` for invalid inputs (empty reason, guidance, date, fields) + exhaustive all-19-kinds check.
- **Claim/reassign/celebrate**: Live SharePoint field writes via `ClaimOwnerId`, `AssignedOwnerId`, `CelebrateCount`.
- **Admin-only governance overrides**: Schedule/unschedule, pin/unpin, feature/unfeature, flag/clear admin review, remove/restore — all exercised at the list field level with assertion.
- **Audit traceability**: 11 governance event types created in Kudos Audit Events + query-count verification.
- **Notification state**: Approve, reject, revisionRequested, schedule, remove — each verified against the notification builder's intent rules (proven in vitest).
- **PC homepage governance**: HomepageEnabled suppress/re-enable + IsPinned/PriorityOverride pin/unpin.
- **PC role capabilities**: `hasPeopleCultureCapability` matrix for editor/approver/admin/viewer (proven in vitest).

### Smoke-only coverage (proven via vitest, not exercised live in harness)
- `deriveKudosCapabilities` for each role — tested in `hbKudosCompanionRuntime.test.tsx`.
- `buildKudosNotificationIntents` for approve/reject/revisionRequested — tested in `hbKudosCompanionRuntime.test.tsx`.
- `hasPeopleCultureCapability` — tested in `peopleCultureSplitModel.test.ts`.

### Manual validation still required
| Item | Why | What to check |
|---|---|---|
| **Approvals inbox queue** | UI surface; lifecycle state filtering is a React render concern | Visual queue shows only `needsApproval` items; approved/expired items are hidden |
| **Milestone candidate review** | Runtime-derived in companion webpart; not a list field | Generation logic produces candidates from celebration/anniversary data; review state transitions work |
| **Limited intake (non-HR submission)** | IntakeSection is a companion UI workflow | Non-HR users can submit through the intake form; HR reviewers see the submission |
| **PC notification delivery** | Delivery channel not wired | Notification intents are correct (proven); actual email/Teams delivery requires manual trigger |
| **PC moderation audit trail** | Relies on SharePoint item version history | InternalNotes field persists (proven); full version-diff audit requires SP version API or manual inspection |

## Running the suite

```bash
# Dry-run (default)
npx tsx scripts/testing/people-kudos/runSuite.ts --suite companions --dry-run

# Live run
SHAREPOINT_BEARER_TOKEN=<token> npx tsx scripts/testing/people-kudos/runSuite.ts --suite companions --live

# Full suite (all domains)
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
```

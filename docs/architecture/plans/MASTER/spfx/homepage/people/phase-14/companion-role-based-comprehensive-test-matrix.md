# Companion & Role-Based Comprehensive Test Matrix

Phase-14 testing package · Prompt-04 deliverable.

## HB Kudos companion workflows

| # | Workflow | Preconditions | List(s) | Key fields/assertions | Expected result | Live eligible | Cleanup | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Admin capability matrix** | None (pure logic) | N/A | 7 capability flags per role × 3 roles | All 21 flags match Decision-Lock-Appendix | N/A (vitest proven) | N/A | Fully covered |
| 2 | **Writer validation gates** | None (pure logic) | N/A | 6 validation branches + all-19-kinds exhaustive | Invalid inputs rejected; valid inputs accepted | N/A (vitest proven) | N/A | Fully covered |
| 3 | **Claim** | Approved kudos item | People Culture Kudos | ClaimOwnerId, ClaimedAt | Owner stamped | Yes | Included | Fully covered |
| 4 | **Reassign** | Claimed item | People Culture Kudos | AssignedOwnerId, ReassignedById, ReassignedAt | New owner assigned | Partial (target user must exist) | Included | Partially covered |
| 5 | **Celebrate** | Published item | People Culture Kudos | CelebrateCount incremented | Count +1 | Yes | Included | Fully covered |
| 6 | **Flag admin review** | Approved item | People Culture Kudos | IsFlaggedForAdminReview=true, AdminReviewReason, AdminReviewFlaggedAt | Flagged | Yes | Included | Fully covered |
| 7 | **Clear admin review** | Flagged item | People Culture Kudos | IsFlaggedForAdminReview=false, AdminReviewedAt | Cleared | Yes | Included | Fully covered |
| 8 | **Schedule (admin-only)** | Approved item | People Culture Kudos | WorkflowStatus=approvedScheduled, IsScheduled=true | Scheduled | Yes | Included | Fully covered |
| 9 | **Unschedule** | Scheduled item | People Culture Kudos | WorkflowStatus=approved, IsScheduled=false | Unscheduled | Yes | Included | Fully covered |
| 10 | **Pin (admin-only)** | Approved item | People Culture Kudos | IsPinned=true, PinOrder | Pinned | Yes | Included | Fully covered |
| 11 | **Unpin** | Pinned item | People Culture Kudos | IsPinned=false | Unpinned | Yes | Included | Fully covered |
| 12 | **Feature (admin-only)** | Approved item | People Culture Kudos | IsFeatured=true | Featured | Yes | Included | Fully covered |
| 13 | **Unfeature** | Featured item | People Culture Kudos | IsFeatured=false | Unfeatured | Yes | Included | Fully covered |
| 14 | **Remove (admin-only)** | Published item | People Culture Kudos | WorkflowStatus=removedUnpublished, IsRemovedFromPublicView | Removed | Yes | Included | Fully covered |
| 15 | **Restore** | Removed item | People Culture Kudos | WorkflowStatus=approved | Restored | Yes | Included | Fully covered |
| 16 | **Audit traceability** | Governance actions | Kudos Audit Events | 11 event types created + query count match | Full audit trail | Yes | Included | Fully covered |
| 17 | **Notification: approve** | Approved item | (runtime-derived) | submitter notified + recipients on first publish | Notification intents correct | N/A (vitest) | N/A | Fully covered |
| 18 | **Notification: reject** | Rejected item | (runtime-derived) | submitter notified with reason | Intent correct | N/A (vitest) | N/A | Fully covered |
| 19 | **Notification: schedule** | Scheduled item | (runtime-derived) | recipients NOT notified at schedule time | No premature notification | N/A (vitest) | N/A | Fully covered |

## People & Culture companion workflows

| # | Workflow | Preconditions | List(s) | Key fields/assertions | Expected result | Live eligible | Cleanup | Status |
|---|---|---|---|---|---|---|---|
| 20 | **Homepage suppress/re-enable** | Announcement exists | PC Announcements | HomepageEnabled toggles | Override cycle | Yes | Included | Fully covered |
| 21 | **Pin/unpin override** | Announcement exists | PC Announcements | IsPinned, PriorityOverride | Pin cycle | Yes | Included | Fully covered |
| 22 | **PC role capability matrix** | None | N/A | hasPeopleCultureCapability | Correct gates | N/A (vitest) | N/A | Fully covered |
| 23 | **Approvals inbox** | None | (UI surface) | Lifecycle state filter | Queue correctness | No (UI) | N/A | Manual validation |
| 24 | **Milestone candidate review** | None | (runtime-derived) | Candidate generation | Review state | No (runtime) | N/A | Manual validation |
| 25 | **Limited intake** | None | (UI surface) | IntakeSection | Non-HR submission | No (UI) | N/A | Manual validation |
| 26 | **PC notifications** | None | (runtime-derived) | Trigger contract | Notification intent | No (delivery unwired) | N/A | Manual validation |
| 27 | **PC moderation audit** | None | (version history) | InternalNotes + item versions | Traceability | No (SP version API) | N/A | Manual validation |

## Summary

- **Automated API/list coverage:** 22 workflows (steps 1–19 kudos, 20–22 PC)
- **Smoke-only (vitest-proven, no live list write):** 5 (capability matrices, notification intents, writer validation)
- **Manual validation required:** 5 (approvals inbox UI, milestone review, limited intake, PC notifications, PC audit trail)

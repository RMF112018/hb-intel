# HB Kudos Comprehensive Test Matrix

Phase-14 testing package · Prompt-02 deliverable.

## Workflow coverage

| # | Workflow | Preconditions | List(s) | Key fields asserted | Expected result | Live-run eligible | Cleanup | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | **Create submission** | None | People Culture Kudos | KudosId, Headline, Excerpt, WorkflowStatus=pending, HomepageEnabled=false, IsPinned=false, WasEverPublished=false, CelebrateCount=0 | New pending item with deterministic synthetic ID | Yes | Delete by KudosId prefix | Fully covered |
| 2 | **Recipient persistence (Individual)** | Submission exists | People Culture Kudos | IndividualRecipientsId (UserMulti via ensureUser) | Resolved user IDs persisted | Partial (requires ensureUser) | N/A | Partially covered (vitest unit tests prove the resolution path; live harness defers to ensureUser availability) |
| 3 | **Recipient persistence (Taxonomy)** | Submission exists | People Culture Kudos | TeamRecipients, DepartmentRecipients, ProjectGroupRecipients | Taxonomy terms persisted | No (requires term-store write) | N/A | Blocked (taxonomy write deferred; schema presence proven) |
| 4 | **Submitter persistence** | Submission exists | People Culture Kudos | SubmittedById | User field set via Id suffix | Yes | Included in item cleanup | Fully covered |
| 5 | **Revision requested** | Pending item | People Culture Kudos | WorkflowStatus=revisionRequested, RevisionRequestedById, RevisionGuidance | Status transitions to revisionRequested | Yes | Included | Fully covered |
| 6 | **Resubmit (back to pending)** | Revision-requested item | People Culture Kudos | WorkflowStatus=pending | Status reverts to pending | Yes | Included | Fully covered |
| 7 | **Approval** | Pending item | People Culture Kudos | WorkflowStatus=approved, ApprovedById, ApprovedDate | Status transitions to approved | Yes | Included | Fully covered |
| 8 | **Rejection** | Pending item | People Culture Kudos | WorkflowStatus=rejected, RejectionReason, ReviewedById | Status transitions to rejected with reason | Yes | Included | Fully covered |
| 9 | **Withdrawal** | Pending item | People Culture Kudos | WorkflowStatus=withdrawn, WithdrawnById, WithdrawnAt | Status transitions to withdrawn | Yes | Included | Fully covered |
| 10 | **Schedule** | Approved item | People Culture Kudos | WorkflowStatus=approvedScheduled, IsScheduled=true, ScheduledPublishAt, ScheduledById | Scheduled for future publish | Yes | Included | Fully covered |
| 11 | **Unschedule** | Scheduled item | People Culture Kudos | WorkflowStatus=approved, IsScheduled=false, ScheduleCancelledAt | Reverts to approved, schedule cleared | Yes | Included | Fully covered |
| 12 | **Pin** | Approved item | People Culture Kudos | IsPinned=true, PinOrder, ProminenceIntent=pinned | Pinned with order | Yes | Included | Fully covered |
| 13 | **Unpin** | Pinned item | People Culture Kudos | IsPinned=false, PinOrder=null, ProminenceIntent=standard | Unpinned, prominence reverted | Yes | Included | Fully covered |
| 14 | **Feature** | Approved item | People Culture Kudos | IsFeatured=true, FeaturedExpiresAt, ProminenceIntent=featured | Featured with expiration | Yes | Included | Fully covered |
| 15 | **Unfeature** | Featured item | People Culture Kudos | IsFeatured=false, FeaturedExpiresAt=null, ProminenceIntent=standard | Unfeatured, prominence reverted | Yes | Included | Fully covered |
| 16 | **Publish window** | Approved item | People Culture Kudos | HomepageEnabled=true, WasEverPublished=true, PublishStartDate, PublishEndDate | Item goes live on homepage | Yes | Included | Fully covered |
| 17 | **Celebrate** | Published item | People Culture Kudos | CelebrateCount incremented | Count increases by 1 | Yes | Included | Fully covered (with race-condition warning) |
| 18 | **Visibility mode transitions** | Published item | People Culture Kudos | CurrentVisibilityMode cycles: public → associatedOnly → internalOnly → public | Mode transitions correctly | Yes | Included | Fully covered |
| 19 | **Remove** | Published item | People Culture Kudos | WorkflowStatus=removedUnpublished, IsRemovedFromPublicView=true, RemovedReason | Removed from public view | Yes | Included | Fully covered |
| 20 | **Restore** | Removed item | People Culture Kudos | WorkflowStatus=approved, IsRemovedFromPublicView=false | Restored to approved | Yes | Included | Fully covered |
| 21 | **Archive eligibility** | Restored item | People Culture Kudos | WasEverPublished=true, IsRemovedFromPublicView=false | Eligible for archive browse | Yes | Included | Fully covered |
| 22 | **Audit event creation** | None | Kudos Audit Events | Title, KudosId, EventType (12 types), EventAt, ActorId | One audit row per event type | Yes | Delete by KudosId filter | Fully covered |
| 23 | **Audit event query parity** | Audit events created | Kudos Audit Events | Row count = 12, each EventType present | All created events queryable by KudosId | Yes | Included | Fully covered |

## Summary

- **Fully covered:** 21 workflows
- **Partially covered:** 1 (Individual recipient persistence — proven in unit tests, harness defers to ensureUser)
- **Blocked:** 1 (Taxonomy recipient persistence — requires term-store write API)

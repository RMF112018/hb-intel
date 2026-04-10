# People & Culture Comprehensive Test Notes

Phase-14 testing package · Prompt-03 deliverable.

## Suite structure

The People & Culture comprehensive suite lives at `scripts/testing/people-kudos/people-culture/` with three sub-workflow modules:

| Module | File | Step count | Coverage |
|---|---|---|---|
| Announcements | `announcements.ts` | 20 steps | Create (promotion, newHire), lifecycle (enable/suppress), display dates, pin+priority, audience/media warnings |
| Celebrations | `celebrations.ts` | 13 steps | Create (birthday, anniversary with years), lifecycle (mangled HomepageEnabled field), audience/UserMulti/cultureProgramEvent warnings |
| Governance | `governance.ts` | 19 steps | Homepage governance fields, suppress/re-enable, expiration, InternalNotes, lifecycle derivation, milestone review, draft/approval warnings |
| **Total** | | **52 steps** | |

## Content family mapping

| Content family | SharePoint list | List GUID | HomepageEnabled field |
|---|---|---|---|
| announcement | People Culture Announcements | `2cd191fc-a7ea-49f2-af05-c395c2326e57` | `HomepageEnabled` (standard) |
| celebrationMilestone | People Culture Celebrations | `b87bf664-0531-418b-902c-726e5fb87083` | `HomepageEnabledGovernanceextensi` (mangled) |
| cultureProgramEvent | No dedicated list | N/A | N/A (blocked) |

## Cleanup behavior

Announcement and celebration items use `AnnouncementId = TEST-HBI-{runId}-{seq}` as their synthetic key (same prefix convention as kudos). Cleanup queries by `startswith(AnnouncementId, 'TEST-HBI-{runId}-')` on each list and deletes matching rows.

## Unsupported / partially provable flows

| Flow | Reason | Alternative coverage |
|---|---|---|
| Taxonomy field writes (AudienceTags) | Requires term-store API | Schema presence proven; audience vs company-wide logic tested in vitest (`peopleCultureSplitModel.test.ts`) |
| UserMulti field writes (PersonName) | Requires ensureUser for each person | Read-path extraction proven in `peopleCultureListSource.ts mapCelebrations()` |
| cultureProgramEvent create/lifecycle | No dedicated SharePoint list | Contract type + lifecycle derivation tested in vitest |
| Lifecycle state machine (8 states) | Derived from field combinations, not a list column | `deriveLifecycleState()` tested in vitest (36 tests in `peopleCultureSplitModel.test.ts`) |
| Milestone candidate review | Runtime-derived in companion webpart | Contract type + generation tested in vitest |
| Draft → needsApproval → approved | Derived states using HomepageEnabled as publish gate | Field-level enable/suppress transitions proven in harness; approval-flow tested in vitest |
| Media/CTA persistence | URL/Hyperlink fields — schema proven but not lifecycle-critical | Schema field presence proven; not exercised live |

## Running the suite

```bash
# Dry-run (default)
npx tsx scripts/testing/people-kudos/runSuite.ts --suite pc --dry-run

# Live run
SHAREPOINT_BEARER_TOKEN=<token> npx tsx scripts/testing/people-kudos/runSuite.ts --suite pc --live

# Full suite (all domains)
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
```

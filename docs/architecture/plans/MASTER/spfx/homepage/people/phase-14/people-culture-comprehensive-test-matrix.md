# People & Culture Comprehensive Test Matrix

Phase-14 testing package · Prompt-03 deliverable.

## Workflow coverage

| # | Workflow | Content family | Preconditions | List(s) | Key fields asserted | Expected result | Live-run eligible | Cleanup | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Create promotion announcement** | announcement | None | People Culture Announcements | AnnouncementType=promotion, HomepageEnabled=false, Headline, Summary, PersonDisplayName | New announcement with correct type | Yes | Delete by AnnouncementId prefix | Fully covered |
| 2 | **Create newHire announcement** | announcement | None | People Culture Announcements | AnnouncementType=newHire | Correct announcement type | Yes | Included | Fully covered |
| 3 | **Announcement HomepageEnabled lifecycle** | announcement | Announcement exists | People Culture Announcements | HomepageEnabled toggles true → false | Enable then suppress | Yes | Included | Fully covered |
| 4 | **Announcement display date window** | announcement | None | People Culture Announcements | StartDisplayDate, EndDisplayDate | Dates persisted | Yes | Included | Fully covered |
| 5 | **Announcement pin + priority** | announcement | None | People Culture Announcements | IsPinned=true, PriorityOverride=5 | Pinned with priority | Yes | Included | Fully covered |
| 6 | **Announcement audience targeting** | announcement | None | People Culture Announcements | AudienceTags (Taxonomy) | Term-store write | No (Taxonomy) | N/A | Blocked (schema proven, vitest covered) |
| 7 | **Announcement media/CTA fields** | announcement | None | People Culture Announcements | PrimaryImage, ImageAltText, CtaLabel, CtaUrl | Media + CTA persisted | Partial | N/A | Partially covered (schema proven) |
| 8 | **Create birthday celebration** | celebrationMilestone | None | People Culture Celebrations | CelebrationType=birthday, HomepageEnabledGovernanceextensi=false, PersonDisplayName, CelebrationDate | New birthday item | Yes | Delete by AnnouncementId prefix | Fully covered |
| 9 | **Create anniversary celebration** | celebrationMilestone | None | People Culture Celebrations | CelebrationType=anniversary, AnniversaryYears=10 | Anniversary with years | Yes | Included | Fully covered |
| 10 | **Celebration HomepageEnabled lifecycle** | celebrationMilestone | Celebration exists | People Culture Celebrations | HomepageEnabledGovernanceextensi toggles true → false | Enable then suppress (mangled field) | Yes | Included | Fully covered |
| 11 | **Celebration audience targeting** | celebrationMilestone | None | People Culture Celebrations | AudienceTags (Taxonomy) | Term-store write | No (Taxonomy) | N/A | Blocked (schema proven) |
| 12 | **Celebration PersonName (UserMulti)** | celebrationMilestone | None | People Culture Celebrations | PersonName (UserMulti) | Multi-person binding | No (ensureUser) | N/A | Partially covered (read path proven) |
| 13 | **Culture program/event item** | cultureProgramEvent | None | (no dedicated list) | N/A | N/A | No | N/A | Blocked (no list provisioned; contracts typed + vitest covered) |
| 14 | **Homepage governance fields** | announcement | Announcement exists | People Culture Announcements | HomepageEnabled, IsPinned, PriorityOverride, StartDisplayDate, EndDisplayDate | Full governance field set | Yes | Included | Fully covered |
| 15 | **Homepage suppress + re-enable** | announcement | Homepage-enabled item | People Culture Announcements | HomepageEnabled toggles false → true | Override cycle | Yes | Included | Fully covered |
| 16 | **Homepage expiration** | announcement | Homepage-enabled item | People Culture Announcements | EndDisplayDate set to past | Item expires | Yes | Included | Fully covered |
| 17 | **InternalNotes persistence** | announcement | None | People Culture Announcements | InternalNotes | Moderator notes saved | Yes | Included | Fully covered |
| 18 | **Lifecycle state derivation** | all | None | (derived) | HomepageEnabled + dates | Correct state derived | N/A (vitest) | N/A | Partially covered (vitest proven, field-level transitions proven above) |
| 19 | **Milestone candidate review** | celebrationMilestone | None | (runtime-derived) | MilestoneCandidateReviewState | Candidate generation | N/A (vitest) | N/A | Partially covered (contracts + vitest) |
| 20 | **Draft → approval transitions** | all | None | (derived) | HomepageEnabled as publish gate | Draft → live flow | N/A (vitest) | N/A | Partially covered (vitest proven) |

## Summary

- **Fully covered:** 12 workflows (field-level create + lifecycle transitions)
- **Partially covered:** 4 workflows (contract-typed + vitest unit-tested, harness covers field combinations)
- **Blocked:** 4 workflows (Taxonomy write, UserMulti live binding, cultureProgramEvent list, media/CTA URL fields)

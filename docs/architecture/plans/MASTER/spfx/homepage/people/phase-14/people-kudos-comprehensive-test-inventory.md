# Comprehensive Test Suite — Inventory

Phase-14 testing package · Prompt-01 deliverable.

## Suite modules

| Module | Path | Status | Prompt |
|---|---|---|---|
| **kudos** | `scripts/testing/people-kudos/kudos/` | Stub (deferred) | Prompt-02 |
| **people-culture** | `scripts/testing/people-kudos/people-culture/` | Stub (deferred) | Prompt-03 |
| **companions** | `scripts/testing/people-kudos/companions/` | Stub (deferred) | Prompt-04 |
| **smoke** | `scripts/testing/people-kudos/smoke/` | Stub (deferred) | Prompt-05 |

## Named workflows — kudos suite (Prompt-02)

| Workflow | Status |
|---|---|
| Create kudos submission (pending state) | Proven (preliminary harness) |
| Recipient persistence (IndividualRecipients, Team, Dept, ProjectGroup) | Proven |
| Author/submitter persistence | Proven |
| Revision requested → resubmit flow | Proven |
| Approval → public-live transition | Proven |
| Rejection + rejection reason | Proven |
| Withdrawal | Proven |
| Schedule → unschedule | Proven |
| Pin → unpin with PinOrder | Proven |
| Feature → unfeature with expiration | Proven |
| Celebrate (CelebrateCount increment) | Proven |
| Remove → restore | Proven |
| Visibility mode transitions | Proven |
| Audit event creation + query parity | Proven |

## Named workflows — people-culture suite (Prompt-03)

| Workflow | Status |
|---|---|
| Create announcement (promotion, newHire, baby, wedding, special) | Partially inferable (schema proven, lifecycle untested) |
| Create celebration/milestone (birthday, anniversary) | Partially inferable |
| Audience targeting vs company-wide | Partially inferable |
| Media/photo source behavior | Partially inferable |
| Draft → approval → live → expired → suppressed → archived transitions | Partially inferable (lifecycle states defined in contracts) |
| Homepage-governance fields (HomepageEnabled, tier, pin) | Partially inferable |

## Named workflows — companions suite (Prompt-04)

| Workflow | Status |
|---|---|
| HB Kudos companion role gating (admin/reviewer/viewer) | Proven (vitest unit tests) |
| HB Kudos approval inbox behavior | Partially inferable |
| Claim/reassign workflow | Proven (patch builder) |
| People & Culture companion section rendering | Proven (vitest unit tests) |
| Homepage governance override paths | Partially inferable |
| Milestone review queue paths | Partially inferable |

## Named workflows — smoke suite (Prompt-05)

| Workflow | Status |
|---|---|
| Package build validation (vite bundle emitted) | Proven (build-spfx-package.ts) |
| Manifest inclusion for all 16 webpart GUIDs | Proven (sppkg verification) |
| Stale-artifact prevention (release asset hash rotation) | Proven (build audit) |
| Deployed-surface smoke (lightweight runtime mount check) | Blocked (requires live tenant) |

## Shared test foundation (Prompt-01)

| Component | Path | Status |
|---|---|---|
| Config loader | `shared/config.ts` | Complete |
| Token source | `shared/auth.ts` | Complete |
| RunContext factory | `shared/context.ts` | Complete |
| SP REST client | `shared/spClient.ts` | Complete |
| Assertions | `shared/assertions.ts` | Complete |
| Logging | `shared/logging.ts` | Complete |
| Cleanup | `shared/cleanup.ts` | Complete |
| Fixtures | `shared/fixtures.ts` | Complete |
| Types | `shared/types.ts` | Complete |
| Full-suite runner | `runAll.ts` | Complete |
| Filtered runner | `runSuite.ts` | Complete |

## Preliminary harness (preserved)

The original preliminary harness at `scripts/testing/people-kudos-workflow/` (3 files, ~1500 lines) is preserved until Prompt-06 closure confirms the migration is complete. It can still be run independently via:

```bash
npx tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run
```

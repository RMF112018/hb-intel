# Prompt 01 — Persistence and Contract Closure

## Use

Run this after Prompt 00. This prompt closes the durable data model and persistence gaps.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to bring the People & Culture implementation to full contract and persistence compliance.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Eliminate the remaining simulated / partial operating-model gaps by introducing or tightening the durable typed contracts and the persistence behavior required for a true People & Culture operating application.

Work from current repo truth. Do not let historical prompt packages narrow or weaken the scope.

Minimum focus areas:
- `apps/hb-webparts/src/homepage/webparts/peopleCultureSplitContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureMilestoneGenerator.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureNotificationBuilder.ts`
- `apps/hb-webparts/src/homepage/data/`
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- any existing People & Culture SharePoint read/write helpers already present in the repo

Required remediation goals:
1. Ensure the People & Culture operating model is backed by first-class typed durable data, not only local reducer state.
2. Define and/or tighten first-class representations for:
   - People & Culture item records
   - approval ownership / assignment
   - milestone candidates
   - intake submissions
   - homepage governance state
   - notification / transition derivation inputs where needed
3. Remove avoidable tag-based workflow ownership or pseudo-schema behavior where a first-class field/model should exist.
4. If the repo does not yet contain a sufficiently explicit operating-list schema, add the schema contract(s) and the supporting adapter/writer layer now so the runtime is no longer structurally vague.
5. Keep the split boundary intact:
   - no HB Kudos data or primitives inside People & Culture Public / Companion
6. Keep the legacy adapter temporary and safe, but do not allow it to be the long-term execution path for the new operating model.

Specific issues to close:
- lossy or weak approval-ownership representation
- missing durable linkage between milestone candidates and created items
- missing durable linkage between intake submissions and promoted draft items
- weak or ambiguous persistence seams in the companion runtime
- any contract comments that are stale relative to the current implementation

Implementation requirements:
- prefer incremental extension of existing repo patterns instead of inventing a parallel store
- keep contracts narrow and explicit
- avoid stringly-typed escape hatches
- update docs/comments where the final model differs from stale repo commentary
- add or update tests for any pure helpers you change

Required validation:
- types compile cleanly
- changed helpers have updated test coverage where practical
- the companion runtime now depends on explicit durable contract shapes rather than vague state patches
- any new adapter/writer seams are wired coherently to the existing data layer

Required output:
- summary of contract/persistence changes
- list of files changed
- note any true blocker that still cannot be closed from repo truth alone
- validation performed
```
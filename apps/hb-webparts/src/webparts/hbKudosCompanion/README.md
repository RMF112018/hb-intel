# hbKudosCompanion — placeholder (not a webpart yet)

**Status**: Phase-14 Prompt-01 placeholder. No manifest. No runtime
component. Not registered in `mount.tsx`. Not in
`package-solution.json` `componentIds`.

## Why this folder exists

Phase-14 Prompt-01 ("Structural Split and Registration") explicitly
defers companion / admin surface implementation to a later wave. This
README exists only as a naming claim so that when the HB Kudos
moderation companion webpart is added in a later phase, it lands in
the agreed location with the agreed folder name, preventing a rename
churn after the real wiring is in place.

## Intended future scope

When a later prompt implements this seam it will cover:

- HR / admin kudos moderation workspace (review pending, request
  revision, approve, reject, schedule, pin, feature, remove, restore),
- workflow transitions on `People Culture Kudos`
  (`b01fa4d2-29b1-4e11-b581-4cb3d0951a79`) against the proven
  `WorkflowStatus` choice column,
- audit-aware surfacing of `Kudos Audit Events`
  (`c031c08f-25ac-407c-aa15-650b791efeb0`) entries for reconstructed
  workflow history.

A support component already exists at
`apps/hb-webparts/src/webparts/kudosPage/KudosModerationWorkspace.tsx`
but it is NOT currently wired as a webpart. When the companion seam
is implemented, that component becomes a candidate library module
for the real companion runtime — it is not a drop-in.

## What must happen before a manifest is added here

1. A Phase-14 prompt (not Prompt-01) must justify a minimum viable
   companion scope, its target audience (HR / admin / both), and its
   placement rules.
2. A fresh GUID must be allocated — do NOT reuse the legacy People &
   Culture GUID (`27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`), the new
   public People & Culture GUID
   (`e39d9662-34c4-43e6-9425-5770f62da626`), or the new HB Kudos GUID
   (`f14e59a3-4d6b-43b2-952e-ba02dea11dad`).
3. A new `HbKudosCompanionWebPart.manifest.json` + runtime component +
   `mount.tsx` import + `WEBPART_RENDERERS` entry must be added
   together, not piecemeal.
4. The new component must be scaffold-grade only — no final approval
   transitions, no final permission enforcement, no real audit-write
   behavior — until the companion implementation wave lands. The
   preliminary harness at
   `scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts`
   already exercises the Kudos lifecycle transitions in dry-run and
   is the expected contract reference for this future work.

See `docs/architecture/reviews/people-culture-split-initiation-structure.md`
for the full structural decision history.

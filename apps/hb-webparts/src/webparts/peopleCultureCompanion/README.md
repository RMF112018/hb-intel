# peopleCultureCompanion — placeholder (not a webpart yet)

**Status**: Phase-14 Prompt-01 placeholder. No manifest. No runtime
component. Not registered in `mount.tsx`. Not in
`package-solution.json` `componentIds`.

## Why this folder exists

Phase-14 Prompt-01 ("Structural Split and Registration") explicitly
defers companion / admin surface implementation to a later wave. This
README exists only as a naming claim so that when a People & Culture HR
companion webpart is added in a later phase, it lands in the agreed
location with the agreed folder name, preventing a rename churn after
the real wiring is in place.

## Intended future scope

When a later prompt implements this seam it will cover:

- HR / admin moderation and approval surface for the public People &
  Culture runtime,
- authoring / intake flows that are intentionally not exposed on the
  public surface,
- audit visibility derived from `Kudos Audit Events`
  (`c031c08f-25ac-407c-aa15-650b791efeb0`) where relevant.

## What must happen before a manifest is added here

1. A Phase-14 prompt (not Prompt-01) must justify a minimum viable
   companion scope and its placement rules.
2. A fresh GUID must be allocated — do NOT reuse the legacy People &
   Culture GUID (`27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`) or the new
   public GUID (`e39d9662-34c4-43e6-9425-5770f62da626`).
3. A new `PeopleCultureCompanionWebPart.manifest.json` + runtime
   component + `mount.tsx` import + `WEBPART_RENDERERS` entry must be
   added together, not piecemeal.
4. The new component must be scaffold-grade only — no final moderation
   behavior, no final permission enforcement — until the companion
   implementation wave lands.

See `docs/architecture/reviews/people-culture-split-initiation-structure.md`
for the full structural decision history.

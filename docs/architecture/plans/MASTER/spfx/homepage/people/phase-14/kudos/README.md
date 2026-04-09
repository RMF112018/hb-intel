# HB Kudos + HR Approval Companion Prompt Package

## Purpose

This package is the implementation prompt set for a local code agent to complete the **HB Kudos** product following the split from the merged People & Culture surface, with a specific focus on building the **HR approval companion webpart** and completing the runtime, governance, scheduling, prominence, visibility, and work-management logic that was locked during the product interview.

This package is for **implementation**, not fresh discovery.

The agent should treat the locked decisions in this package as governing unless a repo-truth conflict makes implementation impossible. If a repo-truth conflict is found, the agent must stop, document it precisely, and propose the narrowest viable correction rather than silently improvising.

## Package Contents

- `README.md`
- `Plan-Summary.md`
- `Decision-Lock-Appendix.md`
- `Prompt-00-Authority-and-Scope-Lock.md`
- `Prompt-01-Data-Model-and-Contracts.md`
- `Prompt-02-HB-Kudos-Employee-Experience.md`
- `Prompt-03-HR-Approval-Companion-Webpart.md`
- `Prompt-04-Scheduling-Prominence-and-Detail-Panel.md`
- `Prompt-05-Permissions-Notifications-and-Work-Management.md`
- `Prompt-06-Validation-Packaging-and-Closure.md`

## Repo / Source-of-Truth Inputs

Use the live repo as authoritative:

- `https://github.com/RMF112018/hb-intel`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent seams under `apps/hb-webparts/src/homepage/`
- `packages/ui-kit/`
- `docs/reference/ui-kit/`

Primary known current files/components involved in the work include, at minimum:

- `PeopleCultureMerged.tsx`
- `PeopleCulture.tsx`
- `KudosComposerFlyout.tsx`
- `KudosComposerForm.tsx`
- `KudosComposerPreview.tsx`
- `KudosModerationWorkspace.tsx`
- `KudosPage.tsx`
- `PeopleCultureWebPart.manifest.json`
- related Kudos submission/data/hooks/contracts/normalization files

## Global Execution Rules

1. Respect the locked decisions in `Decision-Lock-Appendix.md`.
2. Do not keep the current merged People & Culture surface as the end-state product simply because it compiles.
3. The end-state target is:
   - a **People & Culture** webpart for announcements / celebrations
   - a dedicated **HB Kudos** webpart for recognition
   - an **HR approval companion webpart** for moderation and governance
4. Preserve repo truth. If a plan assumption conflicts with the live repo, document the conflict and resolve it explicitly.
5. Follow SPFx/UI-kit doctrine, but do not let weaker existing abstractions prevent a better product outcome.
6. Promote reusable primitives into shared layers only where reuse is real and justified.
7. Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.
8. Keep all implementation changes production-safe, strongly typed, and packaging-aware.
9. Rebuild and verify `hb-webparts.sppkg` at the phases that change webpart registration/runtime behavior.
10. Every execution report must name:
    - files changed
    - decisions implemented
    - unresolved gaps
    - validation performed
    - packaging result

## Recommended Execution Order

1. Prompt 00
2. Prompt 01
3. Prompt 02
4. Prompt 03
5. Prompt 04
6. Prompt 05
7. Prompt 06

## Expected Outcome

After full execution, the repo should support:

- a dedicated HB Kudos experience
- a dedicated HR approval companion webpart
- a locked, explicit workflow/state model
- proper recipient handling
- role-aware visibility and moderation behavior
- scheduling and prominence control
- queue/work-management behavior
- packaging/build validation for the final SharePoint artifact

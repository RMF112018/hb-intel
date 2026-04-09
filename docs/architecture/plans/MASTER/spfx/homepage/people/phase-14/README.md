# People & Culture SPFx Split Initiation Prompt Package

## Purpose

This package is the **pre-implementation structural split package** for the existing merged People & Culture SPFx/webpart runtime inside `apps/hb-webparts`.

It is **not** the implementation package for:

- the final People & Culture public surface,
- the final HB Kudos public surface,
- the final People & Culture companion surface,
- or the final HB Kudos companion / moderation surface.

Its sole purpose is to instruct the local code agent to establish the correct **split-ready structural seams** and to prove that the resulting `hb-webparts.sppkg` is packaging the intended webpart registrations without stale or half-split artifacts.

## Why this package exists

Current evidence shows the product direction is already locked toward a split, but the current surface is still structurally merged.

The existing People & Culture webpart still carries mixed responsibilities for:

- announcements,
- celebrations,
- kudos display,
- kudos composer state,
- and kudos submission.

At the same time, the repo already contains early standalone Kudos-oriented components such as `KudosPage.tsx` and `KudosModerationWorkspace.tsx`, which indicates that the split has **partially started conceptually** but has **not yet been completed as authoritative SPFx runtime/package wiring**.

## Governing architectural stance

The agent must work from these assumptions unless local HEAD proves a narrow conflict:

1. The split is already a locked product decision.
2. The split-initiation work stays inside the existing `apps/hb-webparts` domain.
3. The split-initiation work keeps **one authoritative package domain** and **one authoritative SharePoint package**: `hb-webparts.sppkg`.
4. This package must not jump ahead into final UI/UX rebuild work.
5. This package must preserve a safe migration path from the current merged runtime to the future split runtime.

## Recommended execution order

1. `Prompt-00-Repo-Truth-and-Target-State-Lock.md`
2. `Prompt-01-Structural-Split-and-Registration.md`
3. `Prompt-02-Packaging-Pipeline-Validation-and-Stale-Artifact-Prevention.md`
4. `Prompt-03-Verification-Report-and-Deferred-Scope.md`

## Package contents

- `README.md`
- `Plan-Summary.md`
- `Prompt-00-Repo-Truth-and-Target-State-Lock.md`
- `Prompt-01-Structural-Split-and-Registration.md`
- `Prompt-02-Packaging-Pipeline-Validation-and-Stale-Artifact-Prevention.md`
- `Prompt-03-Verification-Report-and-Deferred-Scope.md`

## Mandatory operating rules for the agent

1. Use the local repo at HEAD as the final authority.
2. Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.
3. Do not blend this split-initiation work with the later implementation waves.
4. Do not create a second app domain or a second `.sppkg` unless local HEAD proves the existing `hb-webparts` packaging model cannot safely support the split.
5. Do not retire the current merged runtime in a way that breaks existing page placements without an explicit compatibility plan.
6. Do not claim the package is correct unless the built `.sppkg` is inspected and the new component registrations are proven present.

## Expected outcome after this package only

After execution of this package, the repo should have:

- a locked repo-truth note for the split,
- explicit split-ready file/folder seams,
- authoritative manifest/registration intent for new split surfaces,
- compatibility treatment for the current merged surface,
- and packaging/build proof for the structural split state.

It should **not** yet claim completion of the final product behavior.

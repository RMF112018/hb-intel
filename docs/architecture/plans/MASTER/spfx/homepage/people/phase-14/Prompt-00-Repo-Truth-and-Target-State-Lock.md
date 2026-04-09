# Prompt 00 — Repo Truth and Target-State Lock

## Objective

Audit local HEAD and write the authoritative repo-truth note required before any structural split work begins for the existing People & Culture SPFx/webpart packaging.

## Required source of truth

Use the local repo at HEAD as authoritative:

- `https://github.com/RMF112018/hb-intel`

Primary source areas to inspect first:

- `apps/hb-webparts/src/webparts/peopleCulture/`
- `apps/hb-webparts/src/webparts/kudosPage/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/`

Supporting references already known to exist conceptually:

- `PeopleCultureMerged.tsx`
- `index.ts`
- `PeopleCultureWebPart.manifest.json`
- `KudosPage.tsx`
- `KudosModerationWorkspace.tsx`

## What to determine

Determine and explicitly document all of the following:

1. What file is the current authoritative People & Culture runtime consumer at local HEAD.
2. What the current People & Culture manifest inventory actually is.
3. Whether `HB Kudos` already exists as a registered SPFx webpart or only as supporting component files.
4. Whether any companion/admin surfaces already exist as registered webparts or only as supporting component files.
5. How `mount.tsx` currently routes People & Culture and whether the current routing is merged or already split.
6. How `tools/build-spfx-package.ts` discovers `hb-webparts` manifests and injects them into the shell packaging flow.
7. Whether the current split is partially started and, if so, which artifacts are authoritative versus non-authoritative.
8. What compatibility constraints exist for the current deployed People & Culture webpart GUID.

## Required decisions to lock in this step

Unless local HEAD proves a conflict, lock the following as the structural target:

1. Keep the split inside `apps/hb-webparts`.
2. Keep `hb-webparts.sppkg` as the package target.
3. Preserve the current merged People & Culture seam as temporary compatibility.
4. Create a new explicit public webpart seam for **HB Kudos**.
5. Create a new explicit public webpart seam for the future **People and Culture** public surface if that seam does not already exist as a first-class manifest/runtime path.
6. Defer final companion/admin implementation to later waves unless a minimal placeholder seam is required now.

## Deliverables

Create a concise repo-truth note at:

- `docs/architecture/reviews/people-culture-split-initiation-repo-truth.md`

The note must include:

- current authoritative runtime path,
- manifest inventory,
- packaging inventory,
- split artifacts already present,
- compatibility constraints,
- recommended immediate target state,
- unresolved questions if any remain.

## Guardrails

- Do not change code in this step unless a tiny non-behavioral annotation is necessary for clarity.
- Do not start rebuilding the public surfaces.
- Do not invent a second packaging domain.
- Do not assume uploaded supporting files outrank local HEAD.
- Do not re-read files that are still within your active context window or memory unless you need to verify a specific detail that is genuinely uncertain.

## Completion report

Report back with:

- files inspected,
- current authoritative People & Culture runtime entry,
- current registered webpart inventory related to the split,
- target-state lock decisions,
- and any exact conflicts found.

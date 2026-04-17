# Prompt 07 — Mount, Manifest, Packaging, and Homepage Integration

## Objective
Complete all mount, manifest, packaging, and homepage integration work required for the public rail and the new admin webpart to build, mount, and package correctly in SharePoint-hosted output.

## Current-state repo-truth
- `apps/hb-webparts/src/mount.tsx` already dispatches the public rail and `HbHeroBannerAdmin`.
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx` already exists.
- `apps/hb-webparts/README.md` documents the single-bundle/multi-webpart packaging model and adjacent-manifest requirement.
- Public rail packaging is already part of the homepage package, but admin packaging for Priority Actions does not yet exist.

## Relevant SharePoint list-schema truth
List truth is indirect here, but packaging must not break the runtime assumption that:
- the public rail reads the canonical lists
- the admin writes to the canonical lists
- proof and packaged runtime validate those same seams, not mock-only paths

## Why the current implementation is insufficient
Even correct feature code is not complete if:
- manifests are missing or misaligned
- mount dispatch is not updated
- proof-case paths do not reflect the upgraded implementation
- package build omits the new admin webpart
- `.sppkg` output does not preserve intended structural behavior

## Relevant governing doctrine / benchmark authorities
- manifest adjacency is binding
- structural intent must survive packaging
- hosted SharePoint output is part of closure, not optional follow-up
- homepage webparts must remain inside the governed package/import/mount structure

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/`
- `apps/hb-webparts/README.md`
- `tools/build-spfx-package.ts`
- any package/config files in `apps/hb-webparts` that register webparts or manifests

## Required implementation outcome
Deliver package/runtime closure for both surfaces:
- ensure public rail remains correctly mounted
- add admin dispatch wiring
- ensure both manifests are adjacent and valid
- preserve existing proof-case support and add/admin-update proof entry if warranted by repo pattern
- ensure package build includes the new admin webpart
- update any relevant local package docs if the repo keeps webpart inventory documentation current

## What done really looks like
- both webparts are buildable and mountable through the standard hb-webparts package
- manifests sit next to their webpart entries
- proof seams reflect the current implementation, not stale examples
- build/package scripts run without missing-entry errors
- the repo’s documented homepage webpart inventory stays accurate if that documentation is maintained in-tree

## Proof of closure required
- `mount.tsx` dispatch supports the finished surfaces
- manifests validate
- build output succeeds
- package output includes the intended surfaces
- proof-case mounting still works for the public rail and any required admin proof entry

## Constraints / prohibited shortcuts
- Do not treat manifests or packaging as afterthoughts.
- Do not leave the admin unregistered because “it can be added later.”
- Do not break existing public rail mounting while wiring the admin.
- Do not add fake shell behavior or host-chrome manipulation during mount work.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

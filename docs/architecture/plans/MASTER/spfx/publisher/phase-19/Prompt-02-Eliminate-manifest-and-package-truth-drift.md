# Prompt 02 — Eliminate manifest and package-truth drift

## Objective
The audit found that the uploaded `hb-publisher.sppkg` does not cleanly match live `main` repo truth. Close that gap so the emitted package can be trusted as a deterministic product of the audited source state.

## Observed problem frame
- `main` repo `apps/hb-publisher/config/package-solution.json` was still on one version while the uploaded `.sppkg` carried a later AppManifest version.
- Discovery semantics in the emitted package did not fully align with the repo’s documented intent.
- Existing package-truth verification did not protect against that drift.

## Files to inspect first
- `apps/hb-publisher/config/package-solution.json`
- `tools/build-spfx-package.ts`
- any generated package-truth / shim-proof / deployment-plan generation seams for `hb-publisher`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required work
1. Make the emitted package version deterministically match repo truth.
2. Identify every seam where `hb-publisher` deployment/discovery semantics can drift between source manifest, generated shell manifest, and packaged artifact.
3. Add build-time assertions so packaging fails when those seams diverge.
4. Ensure proof artifacts for `hb-publisher` explicitly record the final deployment/discovery posture.
5. Remove any hardcoded or stale assumptions that can cause false confidence about what the package actually does.

## Minimum verification additions
At minimum, build/package verification must fail if any of the following diverge:
- repo version vs emitted AppManifest version
- intended deployment model vs emitted deployment-plan posture
- source manifest discovery posture vs packaged manifest discovery posture
- stable component GUID mismatch

## Proof of closure
Return:
- exact files changed
- exact new assertions/guards added
- the rebuilt `.sppkg` version
- proof that the emitted artifact now matches source truth for the validated seams

## Constraints
- no generic observability work unless directly needed for this closure
- no unrelated package cleanup
- no deferral language

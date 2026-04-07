# Prompt 01 — Packaging and Build Proof Plan

## Objective

Implement the **packaging and build proof plan** for Tool Launcher / Work Hub so the completed launcher is validated against the real cumulative `hb-webparts` build and `.sppkg` packaging path rather than assumed safe from source-only inspection.

## Context you must respect

- Earlier phases should already have completed the launcher’s live-list seam, composition, hierarchy, responsive behavior, and refinement work.
- This phase is not permission to redesign the launcher.
- The launcher lives inside the cumulative Lane A homepage package, so packaging proof must be performed against the real build path and output model.

## Repo-truth targets

Audit and validate the relevant build and packaging surfaces, including at minimum:

- `apps/hb-webparts/`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`
- any package / manifest / shell-entry files directly relevant to `hb-webparts`

## Required work

1. Audit the current launcher implementation and identify every packaging-sensitive assumption:
   - webpart manifest / identity expectations
   - mount / dispatch registration expectations
   - asset-path expectations
   - any packaging-sensitive import or output assumptions
2. Define the exact build and proof sequence for the launcher inside `hb-webparts`.
3. Execute or prepare the build-validation steps needed to prove launcher survival through the cumulative package.
4. Identify any launcher-specific packaging risks and remediate them only when evidence supports the change.
5. Document the validated build path and what constitutes proof of success.

## Explicit exclusions

- Do not redesign launcher UI under the guise of packaging work.
- Do not broaden into non-launcher homepage changes unless required to resolve a proven build or package regression.
- Do not rely on hand-waving about package readiness without artifact or runtime proof.

## Validation requirements

- prove the launcher survives the actual `hb-webparts` build path
- prove `.sppkg` generation completes cleanly
- prove launcher-relevant manifests and shell-entry expectations remain intact
- document any packaging-sensitive risks or fixes clearly

## Deliverables

- packaging and build proof plan
- any necessary packaging-safe launcher adjustments
- updated docs or build notes where needed
- concise evidence of successful package generation

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- prefer evidence-driven packaging fixes over speculative cleanup
- preserve the existing launcher hierarchy and homepage doctrine posture

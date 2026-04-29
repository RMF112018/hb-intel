# Wave 2 Document Control Architecture Correction Closeout

Date: 2026-04-29

## Summary

This closeout records a documentation-only correction to PCC planning/architecture artifacts so Document Control is consistently defined as a two-lane architecture and no longer framed as an access-hub-only posture.

## Files Changed

- docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/Prompt_06_Wave_2_Document_Control_External_Systems_and_Site_Health_Frames.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Decision_Closure_Register.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Wireframe_and_Layout_Contract.md
- docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Human_Decision_Register.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Interface_Assumptions.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
- docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
- docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md

## Old Incorrect Posture

Prior planning language described Document Control as an access-hub-only surface, which incorrectly flattened Microsoft file-management intent into launch behavior and blurred the distinction between Microsoft and external document systems.

## Corrected Two-Lane Posture

1. Microsoft Files Lane

- Applies to SharePoint Drive / SharePoint document libraries and OneDrive.
- Future-state PCC behavior is a Microsoft Graph-backed file-management surface.
- Target capabilities include browse, open, upload, download, copy/share link, metadata display, permission/access states, and approval/status cues.
- Future governed approval actions may be supported only if separately authorized by a later implementation gate.
- Wave 2 renders these as disabled/preview-only affordances only.

2. External Document Systems Lane

- Applies to Procore Files, Document Crunch, Adobe Sign, and future external document/file systems.
- PCC is an access/deep-link/visibility hub for these systems.
- Wave 2 renders launch/deep-link states, missing-config states, access-issue prompts, and source-of-record labels.
- PCC does not own, store, mirror, sync, mutate, or write back external-platform documents.

## Boundary Clarification

"Not a document workflow engine" is now explicitly defined as:

- no standalone submittal workflow replacement;
- no transmittal/revision-routing replacement;
- no document review/routing workflow execution in Wave 2;
- no approval execution in Wave 2;
- no replacement for Procore, Document Crunch, Adobe Sign, or native external-platform workflows.

## Prompt 06 Safety Confirmation

Prompt 06 now aligns to preview-only execution for Wave 2:

- Microsoft lane uses disabled/preview-only file-management affordances.
- External lane uses launch/deep-link/missing-config/access-issue states only.
- No live Graph/PnP/API calls.
- No upload/download/copy-link execution.
- No approval execution.
- No permission mutation.
- No external API runtime.
- No Procore SDK/client/secrets.
- No sync, mirror, write-back, or mutation.

## Non-Code Change Confirmation

No runtime source, app code, backend code, provisioning code, Graph/PnP code, Procore code, manifests, package versions, CI/CD files, or lockfiles were changed in this correction.

## Follow-Up Recommendation

Keep `packages/models/src/pcc/DocumentControl.ts` unchanged in this correction. Schedule a follow-up model-alignment prompt to add formal lane/action metadata for:

- source lane;
- allowed preview actions;
- future Graph-backed capability flags;
- external launch/deep-link behavior;
- disabled/preview-only action state.

## Follow-Up Cleanup

- Canonical Wave 2 decision register was corrected, including W2-ODR-013 two-lane language in `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/01_Wave_2_Decision_Closure_Register.md`.
- Executed-state ledger stale/corrupted language was fixed for W2-ODR-001 and W2-ODR-002 in `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Decision_Closure_Register.md`.
- Roadmap and target architecture scaffold status was corrected to reflect that `apps/project-control-center/` scaffold exists and Wave 2 is active/in-progress preview work.
- Stale phrase search was completed for: `access hub only`, `currently absent`, `not yet present`, `not yet implemented in runtime app code`, and `released for the next scaffold prompt only`, with relevant in-scope governance-doc hits corrected.
- No source/runtime/backend/provisioning/Graph/PnP/Procore/package/manifest/CI/lockfile changes were made.

## Final Narrow Governance Cleanup

- README stale Wave 2 scaffold status was corrected to active/in-progress posture with `apps/project-control-center/` scaffold-exists truth.
- Open Decision Register stale language was corrected for OD-001 (resolved/superseded by Prompt 02 scaffold) and OD-008 (two-lane posture resolved; runtime/model details remain open).
- Stale-phrase sweep was completed in targeted governance docs (`README.md`, `Register_Open_Decisions.md`, and this closeout).
- No source/runtime/backend/provisioning/Graph/PnP/Procore/package/manifest/CI/lockfile changes were made.

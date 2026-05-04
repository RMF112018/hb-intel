# Controlling Objective — Wave 14 Approvals / Checkpoints

## Module Identity

- Phase: Phase 3
- Wave: Wave 14
- Module: Approvals / Checkpoints
- PCC surface ID: `approvals`
- Primary work-center affinity: `action-center`
- Authority path: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`

## Controlling Objective

Implement a PCC-native approval/checkpoint control layer that governs approval/checkpoint routing, queueing, decision semantics, stale/supersession handling, audit trail, and downstream readiness/Priority Actions impacts while preserving source-module ownership.

## Wave 14 Owns

- approval/checkpoint queue semantics;
- approval route-step semantics;
- decision action semantics;
- reason-code/evidence/stale/supersession validation;
- decision-history read model;
- audit-event vocabulary;
- Priority Actions linking/dedupe/resolve/suppress semantics;
- HBI no-authority/refusal semantics.

## Wave 14 Does Not Own

- Procore/Sage/Autodesk/DocCrunch/AdobeSign source-system records;
- SharePoint document/file content;
- tenant permissions, groups, lists, or security settings;
- evidence binary storage or sync;
- pricing, award, legal, accounting, claim, entitlement, or delay determinations;
- live approval execution unless a future command gate authorizes it.

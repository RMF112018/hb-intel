# 02 — Implementation Sequence Overview

## Target Implementation Shape

Wave 11 should be implemented as a Project Readiness module and PCC surface that plugs into existing PCC contracts:

1. Shared model contracts and deterministic fixtures.
2. Backend GET-only mock read-model route.
3. SPFx read-model client and fixture/backend parity.
4. User-facing read-only/safe-action surface shell with eight lanes.
5. Integration seams into Priority Actions, Project Readiness, Approvals / Checkpoints, Team & Access, and HB Document Control.
6. Guardrail regression tests and closeout documentation.

## Architectural Bias

Use existing PCC seams before creating new ones:

- `packages/models/src/pcc/` for type contracts and fixture exports.
- `PccReadModels.ts` for read-model response-map extension.
- `backend/functions/src/hosts/pcc-read-model/` for GET-only mock read-model route.
- `apps/project-control-center/src/api/` for SPFx read-model clients.
- `apps/project-control-center/src/surfaces/projectReadiness/` and/or a repo-consistent dedicated surface if local route/shell conventions require it.
- Existing Priority Actions / Project Readiness / Team & Access / Document Control contracts for references only.

## Module UX Target

The SPFx surface must not be a spreadsheet launcher. It must present a flagship, executive-grade control center with:

1. Overview
2. Matrix View
3. Item Register
4. Owner-Contract Mapping
5. My Responsibilities
6. Gaps & Conflicts
7. Handoffs
8. Template / Source Mapping Admin

Global elements:

- `Who Owns This?` lookup
- Matrix Health Score
- current action owner / ball-in-court posture
- owner-contract placeholder/schema-only messaging
- corrected `109 / 98 / 0` workbook posture
- exception cards
- evidence-link references only
- detail drawer/region if repo-standard pattern exists

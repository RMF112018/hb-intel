# Wave 16 Control Center Settings Target Architecture

## Objective

Define the canonical Wave 16 target architecture for Control Center Settings as a governed, role-aware settings domain inside PCC.

## Architectural Outcome

- Global defaults and policy are managed in HBCentral-backed canonical settings contracts.
- Project effective settings and approved override workflows are managed in project-site lists.
- Read models expose effective values with redaction and authority metadata.
- Future commands remain backend-mediated and approval-governed; SPFx direct mutation remains forbidden.

## Architecture Components

- Settings Definition and Policy Layer (global authority).
- Effective Value and Override Layer (project authority within policy constraints).
- Change Request and Approval-Linked Workflow Layer.
- Validation, Audit, and Health Evidence Layer.
- Read-model API boundary for SPFx consumers.

## System Boundaries

- PCC owns settings governance records and derived effective posture.
- HBCentral hosts global defaults/policy and secret references only.
- Project sites host effective values, approved overrides, requests, validation, audit, and health snapshots.
- Secrets remain outside SharePoint in approved secret stores; only references are allowed.

## Prohibited Behaviors

- Direct SPFx writes to settings lists.
- Direct SPFx Graph/tenant mutation.
- Secret value storage in SharePoint.
- Runtime behavior that bypasses approval/validation policy contracts.

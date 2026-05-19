# 11 | Supersession and Code Retirement Plan

## 1. Objective

Prevent the redirected implementation from leaving the repository in a confusing hybrid state where both:

- Azure Table + Service Bus, and
- SharePoint Pending Work + SharePoint state/control lists

appear to be active MVP targets.

## 2. Governing Rule

> Do not maintain two active operational-state implementations in parallel for MVP.

## 3. Classification Framework

Every existing B05.13 artifact must be classified as:

| Classification | Meaning |
|---|---|
| Retain | Still active and directly reused |
| Redirect | Logic remains, persistence/trigger layer changes |
| Supersede | No longer active MVP behavior; remove from active docs/config/composition |
| Quarantine | Code remains temporarily for staged removal/future optional reuse, but not active |
| Delete | Remove when repo truth and tests prove safe |

## 4. Expected Classifications

| Area | Classification |
|---|---|
| Projection domain/reconcile logic | Retain |
| Registry schema/list/provider | Retain |
| Projection-backed read provider | Retain |
| Read-mode flag | Retain |
| Graph subscription manager logic | Redirect |
| Graph delta client logic | Retain/Redirect around state persistence |
| Seed/rebuild logic | Redirect |
| Azure Table state repositories | Supersede active MVP; quarantine/delete based on repo truth |
| Service Bus sender | Supersede active MVP; quarantine/delete based on repo truth |
| Service Bus queue-trigger worker | Supersede active MVP; replace with timer worker |
| Table/Service Bus settings matrix | Supersede |
| Queue message resource contract | Supersede |
| Azure resource runbooks | Supersede / replace |
| Telemetry inventory | Redirect/update |
| Parity evidence posture | Retain |

## 5. Required Active-Path Cleanup

At the end of implementation:

- active config validation must not require Table/Service Bus settings;
- active webhook composition must not require Service Bus sender;
- active worker composition must use timer + Pending Work;
- active readiness docs must not tell operators to provision Service Bus or projection Table Storage;
- active environment matrix must mark superseded settings historical or removed.

## 6. Package Docs Replacement Map

The prior package docs tied to Table/Service Bus must be replaced in the current implementation package, not treated as equal active references.

## 7. Safe Deletion vs Quarantine

The local agent must decide delete vs quarantine by repo truth, but the package closes the criterion:

### Delete when
- no active import path remains;
- tests can be updated safely;
- no current docs rely on the code as active;
- removal does not collapse future interface migration value.

### Quarantine when
- removal would balloon scope;
- code is useful future reference;
- tests/docs can explicitly mark it inactive and non-MVP.

## 8. Required Documentation

The implementation closeout must state:

- which files were retained;
- which were redirected;
- which were superseded;
- which were quarantined/deleted;
- whether any Table/Service Bus code remains and why;
- why remaining code cannot be mistaken for an active MVP dependency.

## 9. Acceptance Criteria

- one active MVP architecture remains;
- docs/config/code composition agree;
- developers do not need to infer whether Service Bus/Table are still required;
- future reintroduction of Azure-native storage remains possible behind repository interfaces.

## 10. Current Repo-Truth Disposition (2026-05-19)

Prompt closeout posture for B05.16 is:

- active MVP persistence/control plane = SharePoint lists;
- Azure Table + Service Bus seams = superseded from active MVP and quarantined for compatibility/staged retirement;
- no active readiness documentation should require provisioning Service Bus or projection Table Storage for MVP operation.

Prompt 10/11 evidence artifacts:

- `resources/Prompt_10_Closeout_Evidence.md`
- `resources/Prompt_11_Closeout_Report.md`

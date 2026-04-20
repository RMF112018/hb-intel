# P1-F1: Native Integration Backbone - Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P1-F1 |
| **Phase** | Phase 1 |
| **Workstream** | F (Native Integration Backbone Expansion and Reconciliation) |
| **Document Type** | Native Integration Backbone Family - T-File Master Index |
| **Owner** | Platform / Core Services Leadership |
| **Last Updated** | 2026-03-25 |
| **Status** | Specification - T01 through T12 authored; family is the governing umbrella for the authored `P1-F2` through `P1-F19` connector and expansion-pack families |
| **Related contracts / docs** | [P1 Closeout Audit](P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md), [Phase 1 Plan](../02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md), [current-state-map](../../../blueprint/current-state-map.md), [HB Intel Unified Blueprint](../../../blueprint/HB-Intel-Unified-Blueprint.md), [HB Intel Delivery Roadmap](../../../blueprint/HB-Intel-Dev-Roadmap.md), [Phase 3 Plan](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md) |

---

## T-File Index

This document is the master index for the complete P1-F1 Native Integration Backbone family. T01 through T12 define the governed integration operating model, custody alignment, publication boundary, wave structure, and readiness gates for the next connector-planning stage.

| T-File | Title | Authored | Key coverage |
|---|---|---|---|
| [T01](P1-F1-T01-Operating-Model-Scope-and-Locked-Positions.md) | Operating Model, Scope, and Locked Positions | Yes | Program purpose, in/out of scope, locked architectural positions, anti-goals, and relation to current repo truth |
| [T02](P1-F1-T02-Source-of-Truth-Custody-and-Current-Data-Layer-Alignment.md) | Source of Truth, Custody, and Current Data-Layer Alignment | Yes | Current custody reality, adapter/query/backend reconciliation, and existing seams that future implementation must reuse |
| [T03](P1-F1-T03-Raw-Normalized-Canonical-and-Published-Read-Model-Architecture.md) | Raw, Normalized, Canonical, and Published Read-Model Architecture | Yes | Target information flow, Azure custody layers, SharePoint transitional publication role, and downstream read-model boundary |
| [T04](P1-F1-T04-Identity-Mapping-Reconciliation-Replay-and-Audit.md) | Identity, Mapping, Reconciliation, Replay, and Audit | Yes | Source identity, canonical identity, registry expectations, mapping, replay, reconciliation, and provenance requirements |
| [T05](P1-F1-T05-Security-Permissions-Secrets-Tenancy-and-Masking.md) | Security, Permissions, Secrets, Tenancy, and Masking | Yes | Credential boundaries, permission propagation, masking, sensitivity handling, and operator-only surfaces |
| [T06](P1-F1-T06-Batch-Webhook-and-Orchestration-Model.md) | Batch, Webhook, and Orchestration Model | Yes | Batch-led ingestion, event assist, orchestration, retry, replay triggers, and official-source discipline |
| [T07](P1-F1-T07-Admin-Operations-Observability-Recovery-Dead-Letter-and-Replay.md) | Admin Operations, Observability, Recovery, Dead-Letter, and Replay | Yes | Operator workflows, run ledgers, recovery, dead-letter handling, and observability requirements |
| [T08](P1-F1-T08-Downstream-Consumer-Boundary-Publication-Model-and-Phase-3-Reconciliation.md) | Downstream Consumer Boundary, Publication Model, and Phase 3 Reconciliation | Yes | Published read-model boundary, allowed consumption paths, and required Phase 3 follow-on planning updates |
| [T09](P1-F1-T09-Wave-1-Connector-Program-and-Expansion-Pack-Model.md) | Wave 1 Connector Program and Expansion-Pack Model | Yes | Procore, Sage Intacct, BambooHR, Wave 1 rationale, and expansion-pack preservation |
| [T10](P1-F1-T10-Wave-2-Connector-Program.md) | Wave 2 Connector Program | Yes | Unanet CRM, Autodesk BuildingConnected, Autodesk TradeTapp, Microsoft 365 Graph Content, Autodesk ACC Core |
| [T11](P1-F1-T11-Wave-3-Connector-Program.md) | Wave 3 Connector Program | Yes | Oracle Primavera, Microsoft 365 Graph Work-Orchestration, Autodesk ACC Advanced Governance |
| [T12](P1-F1-T12-Implementation-Acceptance-and-Readiness-Gates.md) | Implementation, Acceptance, and Readiness Gates | Yes | Sequencing, acceptance criteria, required downstream updates, and gating for implementation use of the authored child families |

---

## Family Overview

P1-F1 converts the locked native-integration decision set into a governed HB Intel integration program that is explicitly grounded in:

- current repo truth,
- current implemented data-layer reality,
- the audited contradictions in the original Phase 1 plan stack,
- the preserved downstream published read-model boundary.

This family is not a connector inventory and it is not a claim that the Azure-first target architecture is already implemented. It is the umbrella planning family that:

- reconciles the original Phase 1 data-plane assumptions against current implementation reality,
- locks the operating model for a multi-wave native integration program,
- defines the publication boundary for downstream consumers,
- identifies the changes future implementation must make to current adapter/query/backend seams,
- stages Wave 1, Wave 2, and Wave 3 as governed families rather than ad hoc follow-on plans.

---

## Locked Decisions Summary

The following positions are binding for P1-F1 and all future `P1-F2` through `P1-F19` family files:

1. **Transitional hybrid custody** remains the governing posture during implementation transition.
2. **Azure owns raw custody, normalized records, replay, reconciliation, audit, and canonical mapping.**
3. **SharePoint may continue to host selected published operational read models during transition.**
4. **`v1` is read-only and ingest-first.**
5. **Batch-led sync is the default; events/webhooks are assistive accelerators where official source material supports them.**
6. **HB Intel uses a thin canonical core over source-aligned normalization.**
7. **Downstream consumers use published read models or governed repositories only.**
8. **Connector-specific runtime logic does not belong in feature packages or PWA source modules.**
9. **Wave 1 expansion-pack concept is preserved for Procore, Sage Intacct, and BambooHR.**
10. **Current repo truth is not yet fully at the Azure-first target and must be described honestly in all downstream planning.**

---

## Cross-Reference Map

| Concern | Governing or adjacent source |
|---|---|
| Repo-truth audit basis | [P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md](P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md) |
| Present-state authority | [current-state-map](../../../blueprint/current-state-map.md) |
| Program narrative | [HB-Intel-Unified-Blueprint.md](../../../blueprint/HB-Intel-Unified-Blueprint.md) |
| Delivery sequencing | [HB-Intel-Dev-Roadmap.md](../../../blueprint/HB-Intel-Dev-Roadmap.md) |
| Phase 1 governing plan | [02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md](../02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md) |
| Current data-access and package boundary posture | [package-relationship-map](../../../blueprint/package-relationship-map.md) |
| Phase 1 deliverables index | [README.md](README.md) |
| Phase 3 downstream planning set | [04_Phase-3_Project-Hub-and-Project-Context-Plan.md](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md), [phase-3-deliverables/README.md](../phase-3-deliverables/README.md) |

---

## Implementation Sequencing Overview

The P1-F1 family should be read and implemented in this order:

1. T01 — lock scope, anti-goals, and the authoritative positions before any connector-wave work begins.
2. T02 — align the family to current repo truth and current seam reuse requirements.
3. T03 — lock the end-to-end custody and publication architecture.
4. T04 — define identity, mapping, replay, reconciliation, and audit so later connector families inherit one model.
5. T05 and T06 — establish security and orchestration boundaries before connector-family specifics are written.
6. T07 and T08 — lock operator workflows and downstream consumer boundaries before Phase 3 follow-on work is reopened.
7. T09 through T11 — define the governed Wave 1, Wave 2, and Wave 3 connector programs.
8. T12 — use the implementation and acceptance guide as the gate before treating the authored child families as implementation inputs.

---

## Blockers, Dependencies, and Governed Prerequisites

| Type | Requirement | Why it matters |
|---|---|---|
| Repo-truth baseline | The audit remains the governing execution basis for this family | Prevents a return to stale SharePoint-native assumptions |
| Data-layer transition | Current registry, proxy wiring, route alignment, and mock PWA seams must be addressed in future implementation | These are the concrete transition gaps surfaced by repo truth |
| Connector contract discipline | Exact contract shapes must come from official source material in later family files | Prevents memory-based route invention |
| Downstream planning alignment | Phase 3 consumer docs will need targeted follow-on updates | Published read-model boundary must stay coherent across the platform |
| Operational platform | Existing backend observability and admin seams are useful but do not yet satisfy the full target | The family must extend current seams honestly, not overclaim them |

---

## Acceptance Framing

The P1-F1 family is acceptance-ready when:

- it defines the native integration program as a governed HB Intel program rather than a loose list of connector plans,
- the custody model is explicit about current repo truth and target transition,
- Azure-first target custody is locked without claiming it already exists,
- the downstream published read-model boundary is explicit and enforceable in planning language,
- Wave 1, Wave 2, and Wave 3 are all named and structurally first-class,
- the family names the required current seam changes and the required Phase 1 / Phase 3 follow-on updates,
- `P1-F2` through `P1-F19` are authored, linked, and consistent with the umbrella custody and publication rules.

---

## Authored Child Families

- [P1-F2 Wave 1 Connector Index](P1-F2-Wave-1-Connector-Index.md)
- [P1-F3 Wave 2 Connector Index](P1-F3-Wave-2-Connector-Index.md)
- [P1-F4 Wave 3 Connector Index](P1-F4-Wave-3-Connector-Index.md)
- [P1-F5 Procore](P1-F5-Procore-Connector-Family.md)
- [P1-F6 Sage Intacct](P1-F6-Sage-Intacct-Connector-Family.md)
- [P1-F7 BambooHR](P1-F7-BambooHR-Connector-Family.md)
- [P1-F8 Wave 1 Expansion-Pack Index](P1-F8-Wave-1-Expansion-Pack-Index.md)
- [P1-F9 Unanet CRM](P1-F9-Unanet-CRM-Connector-Family.md)
- [P1-F10 Autodesk BuildingConnected](P1-F10-Autodesk-BuildingConnected-Connector-Family.md)
- [P1-F11 Autodesk TradeTapp](P1-F11-Autodesk-TradeTapp-Connector-Family.md)
- [P1-F12 Microsoft 365 Graph Content](P1-F12-Microsoft-365-Graph-Content-Connector-Family.md)
- [P1-F13 Autodesk Construction Cloud Core](P1-F13-Autodesk-Construction-Cloud-Core-Connector-Family.md)
- [P1-F14 Oracle Primavera](P1-F14-Oracle-Primavera-Connector-Family.md)
- [P1-F15 Microsoft 365 Graph Work-Orchestration](P1-F15-Microsoft-365-Graph-Work-Orchestration-Connector-Family.md)
- [P1-F16 Autodesk Construction Cloud Advanced Governance](P1-F16-Autodesk-Construction-Cloud-Advanced-Governance-Connector-Family.md)
- [P1-F17 Procore Expansion Pack](P1-F17-Procore-Expansion-Pack-Family.md)
- [P1-F18 Sage Intacct Expansion Pack](P1-F18-Sage-Intacct-Expansion-Pack-Family.md)
- [P1-F19 BambooHR Expansion Pack](P1-F19-BambooHR-Expansion-Pack-Family.md)

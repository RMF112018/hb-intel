# P1-F4: Wave 3 Connector Index

## Purpose

Wave 3 formalizes the deeper schedule, work-orchestration, and governance connectors under the same integration backbone, even where official-source detail is still partial.

## Family Inventory

| Family | Scope | Status |
|---|---|---|
| [P1-F14-Oracle-Primavera-Connector-Family.md](P1-F14-Oracle-Primavera-Connector-Family.md) | Schedule and program context | Provisional family backed by official REST reference |
| [P1-F15-Microsoft-365-Graph-Work-Orchestration-Connector-Family.md](P1-F15-Microsoft-365-Graph-Work-Orchestration-Connector-Family.md) | Work orchestration and task context | Provisional family; supplied Graph source set does not verify a work-orchestration contract surface |
| [P1-F16-Autodesk-Construction-Cloud-Advanced-Governance-Connector-Family.md](P1-F16-Autodesk-Construction-Cloud-Advanced-Governance-Connector-Family.md) | Governance and review-control context | Provisional family; broader contract details unresolved from supplied Autodesk sources |

## Source-Sufficiency Matrix

| Connector | Official source posture | Planning use |
|---|---|---|
| Primavera | Official REST reference exists | Capability-level planning supported |
| Graph Work-Orchestration | Supplied Graph docs cover Graph generally, not a dedicated orchestration contract | Role and gating only |
| ACC Advanced Governance | ACC overview URL redirected to Forma; reviews blog gives only a narrow read-only slice | Role and gating only |

## Dependency Map

- Wave 3 depends on accepted Wave 1 operator, replay, and publication patterns.
- Wave 3 also depends on stronger shared identity and mapping services, especially for schedule and governance domains.
- Where source evidence is thin, implementation is gated on later official contract capture.

## Sequencing and Readiness Gates

1. Wave 1 and Wave 2 publication patterns are stable enough to absorb more complex domains.
2. Each Wave 3 family retains explicit unresolveds rather than inventing contracts.
3. Runtime implementation cannot begin until the unresolved contract gaps are accepted or closed.

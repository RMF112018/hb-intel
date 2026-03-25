# P1-F3: Wave 2 Connector Index

## Purpose

Wave 2 extends the integration backbone proven by Wave 1 into CRM, preconstruction network, content, and broader Autodesk project-context surfaces without relaxing the `P1-F1` custody or publication rules.

## Family Inventory

| Family | Scope | Status |
|---|---|---|
| [P1-F9-Unanet-CRM-Connector-Family.md](P1-F9-Unanet-CRM-Connector-Family.md) | CRM and opportunity context | Staged family; route inventory unresolved from accessible official content |
| [P1-F10-Autodesk-BuildingConnected-Connector-Family.md](P1-F10-Autodesk-BuildingConnected-Connector-Family.md) | Bidding and opportunity extraction | Staged family; overview-level source sufficiency only |
| [P1-F11-Autodesk-TradeTapp-Connector-Family.md](P1-F11-Autodesk-TradeTapp-Connector-Family.md) | Qualification and financial qualification extraction | Staged family; overview-level source sufficiency only |
| [P1-F12-Microsoft-365-Graph-Content-Connector-Family.md](P1-F12-Microsoft-365-Graph-Content-Connector-Family.md) | Content and change-tracking publication | Implementation-staged family backed by official Graph overview, OneDrive, and delta docs |
| [P1-F13-Autodesk-Construction-Cloud-Core-Connector-Family.md](P1-F13-Autodesk-Construction-Cloud-Core-Connector-Family.md) | Core Autodesk construction context | Staged family; supplied overview URL redirects to Forma and is insufficient for route planning |

## Source-Sufficiency Matrix

| Connector | Official source posture | Planning use |
|---|---|---|
| Unanet CRM | Swagger landing was accessible but did not expose route inventory in the audit surface | Role, dependency, and publication planning only |
| BuildingConnected | APS overview describes bidding/opportunity extraction role | Capability and staging only |
| TradeTapp | APS overview describes qualification and financial information role | Capability and staging only |
| Microsoft 365 Graph Content | Graph overview, OneDrive concepts, and delta docs are accessible | Capability-level contract and refresh planning supported |
| Autodesk ACC Core | Supplied URL redirects to Forma overview, not ACC route inventory | Role and dependency planning only |

## Dependency Map

- Wave 2 depends on the durable project registry, mapping service, and publication boundary defined in `P1-F1`.
- Wave 2 content and opportunity publications should build on Wave 1 operator and reconciliation patterns rather than inventing parallel ones.
- Autodesk and CRM connectors depend on stronger project identity alignment before their read models become shared-spine contributors.

## Sequencing and Readiness Gates

1. Wave 1 operator and publication patterns are accepted.
2. Official-source gaps are either resolved or explicitly accepted as staged unknowns for non-runtime planning.
3. Each connector preserves the published read-model boundary and does not leak direct connector access downstream.

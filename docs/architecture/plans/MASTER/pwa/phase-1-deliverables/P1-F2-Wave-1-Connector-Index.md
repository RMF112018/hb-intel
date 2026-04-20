# P1-F2: Wave 1 Connector Index

## Purpose

Wave 1 is the first executable connector wave under [P1-F1](P1-F1-Native-Integration-Backbone-Master-Index.md). It proves the HB Intel integration backbone against the highest-value read-only, ingest-first sources while preserving the published read-model boundary.

## Family Inventory

| Family | Scope | Status |
|---|---|---|
| [P1-F5-Procore-Connector-Family.md](P1-F5-Procore-Connector-Family.md) | Project-operational and financial-control backbone | Implementation-ready family; exact route inventory unresolved from supplied official source set |
| [P1-F6-Sage-Intacct-Connector-Family.md](P1-F6-Sage-Intacct-Connector-Family.md) | Financial and project-accounting backbone | Implementation-ready family; official contract URLs are authoritative but route inventory capture is gated by source accessibility |
| [P1-F7-BambooHR-Connector-Family.md](P1-F7-BambooHR-Connector-Family.md) | Workforce identity and staffing backbone | Implementation-ready family; employee and webhook capability level verified from official sources |
| [P1-F8-Wave-1-Expansion-Pack-Index.md](P1-F8-Wave-1-Expansion-Pack-Index.md) | Deferred deepening plans for Wave 1 connectors | Expansion-pack index |

## Source-Sufficiency Matrix

| Connector | Official source posture | Planning use |
|---|---|---|
| Procore | Introduction page confirms docs surface exists but not route/webhook shape | Domain and operating-contract planning only |
| Sage Intacct | Official OpenAPI and object-index URLs are authoritative; audit-time access was Cloudflare-blocked | Architecture-ready; exact contract inventory remains a gated capture step |
| BambooHR | Getting started, employee directory/detail, and webhooks docs were accessible | Capability and event-assist planning supported |

## Dependency Map

- Wave 1 depends on the [P1-F1 custody and publication rules](P1-F1-T03-Raw-Normalized-Canonical-and-Published-Read-Model-Architecture.md).
- Wave 1 implementation sequencing depends on the seam changes named in [P1-F1-T02](P1-F1-T02-Source-of-Truth-Custody-and-Current-Data-Layer-Alignment.md) and [P1-F1-T12](P1-F1-T12-Implementation-Acceptance-and-Readiness-Gates.md).
- Wave 1 publication targets depend on the downstream consumer boundary in [P1-F1-T08](P1-F1-T08-Downstream-Consumer-Boundary-Publication-Model-and-Phase-3-Reconciliation.md).

## Sequencing and Readiness Gates

1. Accept the connector families as governed child plans under `P1-F1`.
2. Resolve or explicitly accept official-source gaps before route-level implementation begins.
3. Implement raw custody, normalized source-aligned records, thin canonical core mapping, and published read models in that order.
4. Treat expansion packs as second-stage deepening work after base connector acceptance.

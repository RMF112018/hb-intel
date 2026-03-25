# P1-F1-T09: Wave 1 Connector Program and Expansion-Pack Model

## 1. Wave 1 Connectors

Wave 1 consists of:

- **Procore**
- **Sage Intacct**
- **BambooHR**

Wave 1 is the first executable connector wave because it best validates the full integration backbone model:

- custody,
- normalization,
- canonical mapping,
- reconciliation,
- publication,
- operator control,
- downstream read-model consumption.

## 2. Wave 1 Connector Posture

| Connector | Current family-level planning posture |
|---|---|
| Procore | First-class Wave 1 connector; exact endpoint and webhook shapes must be deferred to future official-source-backed family authoring |
| Sage Intacct | First-class Wave 1 connector; official contract-oriented sources support capability-level planning in this umbrella family |
| BambooHR | First-class Wave 1 connector; employee and webhook capability planning is supported at capability level in this umbrella family |

## 3. Wave 1 Expansion Packs

The Wave 1 expansion-pack concept is locked and preserved for:

- Procore
- Sage Intacct
- BambooHR

Expansion packs exist so the first connector-family pass can establish the governed backbone and the next pass can extend depth without reopening the umbrella architecture.

## 4. Authored Wave 1 Families

- [P1-F2 Wave 1 Connector Index](P1-F2-Wave-1-Connector-Index.md)
- [P1-F5 Procore Connector Family](P1-F5-Procore-Connector-Family.md)
- [P1-F6 Sage Intacct Connector Family](P1-F6-Sage-Intacct-Connector-Family.md)
- [P1-F7 BambooHR Connector Family](P1-F7-BambooHR-Connector-Family.md)
- [P1-F8 Wave 1 Expansion-Pack Index](P1-F8-Wave-1-Expansion-Pack-Index.md)
- [P1-F17 Procore Expansion Pack](P1-F17-Procore-Expansion-Pack-Family.md)
- [P1-F18 Sage Intacct Expansion Pack](P1-F18-Sage-Intacct-Expansion-Pack-Family.md)
- [P1-F19 BambooHR Expansion Pack](P1-F19-BambooHR-Expansion-Pack-Family.md)

## 5. Official-Source Discipline

The authored Wave 1 families do not invent exact endpoint structures. `P1-F5`, `P1-F6`, `P1-F7`, `P1-F17`, `P1-F18`, and `P1-F19` preserve official-source limits and carry forward any required route-capture work as explicit unresolveds.

## 6. Wave 1 Outcome

Wave 1 is complete only when it proves:

- ingest-first, read-only `v1`,
- batch-led operation with event assist where supported,
- thin canonical mapping over source-aligned normalization,
- published read-model delivery to downstream consumers,
- operator-grade replay and recovery.

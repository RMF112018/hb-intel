# P1-F1-T04: Identity, Mapping, Reconciliation, Replay, and Audit

## 1. Identity Model

The integration backbone distinguishes:

- **source identity**: the connector-native identifier for records and objects,
- **HB canonical identity**: the governed HB identifier used for cross-source linkage and published read-model consistency,
- **project identity**: the governed project anchor used to bind source records to HB project context.

## 2. Registry Expectations

Project identity cannot remain a purely in-memory concern. Future implementation must provide a durable governed identity and mapping service that:

- resolves HB project identity,
- maps external project and record identifiers,
- supports department or site reclassification,
- survives replay and republish operations,
- is queryable by downstream publication and ingestion logic.

## 3. Cross-Source Mapping

Cross-source mapping rules must:

- preserve the original source identity,
- record the mapped HB canonical identity,
- record mapping provenance,
- support partial or deferred mapping when identity is ambiguous,
- allow reconciliation workflows rather than forcing silent auto-merge behavior.

## 4. Reconciliation Model

Reconciliation is a first-class part of the architecture. It should:

- detect mismatches between source-aligned records and current published/canonical state,
- preserve ambiguous matches as governed reconciliation conditions,
- support operator review and replay,
- reuse the repo's existing Project Hub reconciliation concepts as a precedent for thin canonical handling.

## 5. Replay Model

Replay must be supported at the integration-runtime layer so operators can:

- rerun ingest for a connector/window,
- rerun normalization,
- rerun mapping,
- republish read models after correction,
- recover from partial failures without manual record surgery.

## 6. Audit and Provenance

Audit expectations include:

- source system,
- source identity,
- ingest trigger type,
- processing window,
- normalization outcome,
- mapping outcome,
- reconciliation status,
- publication status,
- operator and replay provenance where manual action occurs.

These audit requirements are planning constraints in this pass. No runtime schema is introduced here.

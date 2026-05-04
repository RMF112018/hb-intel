# Wave 14 Source Module Integration Contract

## Integration Doctrine

Wave 14 overlays approval/checkpoint governance across source modules while preserving source-module ownership of underlying workflow records.

## Ownership and Routing Contract

- Source modules own source records and module lifecycle behavior.
- Wave 14 owns checkpoint queue/routing/decision/audit/decision-history semantics.
- Integration must preserve source lineage and policy-version traceability.

## Stale and Supersession

- Source version drift marks the checkpoint stale and blocks terminal decisions until revalidation or supersession.
- Supersession must link replacement request lineage and archive prior route state as `superseded`.

## Validation Boundary

No runtime command execution is authorized by this contract. Command-model behavior remains architecture-defined and future-gated.

## Guardrails

No Procore/Sage/Power Automate writeback and no tenant mutation are authorized.

# P1-F7-T04: BambooHR Raw Landing Model

## Raw Custody

- Azure owns raw custody for workforce-directory, employee-detail, and webhook-driven change payloads.
- Raw landing stores source payloads, tenant/company-domain bindings, source employee IDs, and webhook verification metadata needed for replay and audit.

## Raw Boundaries

- Land only the source records required for workforce identity and staffing publication.
- Preserve raw payload fidelity and permission context for downstream masking and reconciliation.

# Wave 14 Source Module Integration Contract

## Integration Doctrine

Wave 14 provides approval/checkpoint governance overlays for source modules while preserving source module ownership of workflow records.

## Required Boundary

- Source modules own source records and module-native lifecycle behavior.
- Wave 14 owns checkpoint queue/routing/decision/audit semantics.
- Integration is lineage-preserving and non-overwriting.

## Writeback and Mutation Guardrails

No Procore/Sage/Power Automate writeback and no tenant mutation are authorized.

# Plan Summary — Wave 01

## Objective

Make the Foleon SharePoint integration real and auditable on `main`.

## Critical Path

1. Prove whether the claimed commit/app exists anywhere; reconcile to `main`.
2. Establish SPFx app/package identity and build registration.
3. Implement strict runtime config and safe runtime binding proof.
4. Add SharePoint list schemas, internal names, indexes, and query proof.

## Exit Criteria

- `apps/hb-intel-foleon` exists on `main`.
- The package can be built through the governed SPFx pipeline.
- The manifest GUID/version are proven in source and package.
- Runtime config fails closed with actionable diagnostics.
- SharePoint list schemas and indexes are defined and provable.

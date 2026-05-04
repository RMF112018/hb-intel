# Prompt 13B — HB Central Projects Registry and Procore Mapping Contract

## Objective

Implement shared mapping contracts and fixtures connecting HB Central `Projects` registry context to canonical PCC Procore project mapping.

## Required Work

1. Add `PccProcoreProjectMapping` and related status/ownership/freshness types.
2. Use `Projects.procoreProject` as a legacy/current hint only.
3. Map `ProjectId`, `ProjectNumber`, `ProjectName`, `SiteUrl`, PM/PX UPNs, and project-stage fields into mapping context.
4. Add deterministic fixture data and tests.
5. Document indexing/query recommendations for production list usage.
6. Preserve no-runtime/no-secret/no-writeback posture.

## Allowed Changes

`packages/models/src/pcc/**`, fixtures, tests, and related docs.

## Validation

Run @hbc/models check-types/test/build and JSON/doc validation.

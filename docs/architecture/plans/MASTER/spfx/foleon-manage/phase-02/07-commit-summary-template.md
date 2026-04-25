---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 07 — Commit Summary Template

## Commit Summary

```text
fix(foleon): harden SharePoint list provisioning schemas and proof
```

## Commit Description

```text
fix(foleon): harden SharePoint list provisioning schemas and proof

Closes the source/package portion of the Foleon list provisioning remediation by reducing risky launch-time indexes, de-risking cross-list lookup provisioning, correcting uniqueness validation posture, and adding schema/package proof coverage.

Changes:
- Reduces HB_FoleonContentRegistry launch-time indexes to query-critical fields.
- Aligns schema XML, code-level schema metadata, and list-schema documentation.
- De-risks HB_FoleonHomepagePlacements ContentLookup provisioning.
- Adds schema validation for CustomSchema references, field IDs, view refs, lookup ordering, index budget, and versioning/attachment posture.
- Enhances package proof to verify repo/package byte parity, feature relationships, stale schema absence, package SHA, toolbox entries, and indexed-field counts.
- Adds clean-site repro, tenant cleanup, and rollback documentation.

Validation:
- pnpm --filter @hbc/spfx-hb-intel-foleon lint
- pnpm --filter @hbc/spfx-hb-intel-foleon check-types
- pnpm --filter @hbc/spfx-hb-intel-foleon test
- pnpm --filter @hbc/spfx-hb-intel-foleon build
- pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
- npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
- pnpm --filter @hbc/spfx-hb-intel-foleon package:proof

Package proof:
- Output: dist/sppkg/<proof-file>.json
- Package SHA-256: <sha>
- Schema parity: pass/fail
- Stale schema check: pass/fail
- Indexed field budget: pass/fail

Tenant closure:
- Source/package closure is complete only if all local proof steps pass.
- Tenant closure remains pending until clean-site SharePoint validation proves all four lists open and REST metadata/fields/views succeed.
```

## Pull Request Description Template

```markdown
## Objective

Fix the HB Intel Foleon list provisioning defect where SharePoint lists are created by the SPFx Feature Framework package but become corrupted or unable to load.

## Root Cause Addressed

The prior package created complex business lists through Feature Framework provisioning with a high-risk schema, led by excessive launch-time indexed fields in `HB_FoleonContentRegistry` and a required same-feature lookup in `HB_FoleonHomepagePlacements`.

## Changes

- Reduced launch-time indexes in `HB_FoleonContentRegistry`.
- Aligned XML schema, TypeScript schema metadata, and list-schema docs.
- De-risked `ContentLookup` provisioning.
- Added schema validation script/tests.
- Enhanced package proof for repo/package byte parity and stale asset detection.
- Added tenant validation and cleanup documentation.

## Validation

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Package Proof

- Package path:
- Package SHA-256:
- Proof JSON:
- Version:
- Feature ID:
- Schema parity:
- Stale schema check:
- Index budget check:

## Tenant Validation

- Clean-site validation completed: Yes/No
- Site URL:
- All four lists open: Yes/No
- REST metadata/fields/views pass: Yes/No
- Manager route can configure content: Yes/No

## Remaining Risks

- Existing corrupted lists may require backup/delete/reprovision or repair.
- Tenant closure is separate from source/package closure.
```

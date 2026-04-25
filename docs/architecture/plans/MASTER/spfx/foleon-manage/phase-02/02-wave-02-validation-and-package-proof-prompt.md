---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 02 — Wave 02 Prompt: Validation and Package Proof Remediation

You are working in the live `RMF112018/hb-intel` repository after Wave 01 schema remediation.

## Objective

Add hard validation so the Foleon list provisioning defect cannot recur silently.

The current tests and proof are not sufficient because they validate asset presence and string alignment, but they do not prove:

- XML model validity,
- index-budget safety,
- CustomSchema resolution,
- package relationship integrity,
- byte-for-byte repo/package parity,
- stale schema-file absence,
- lookup ordering and target resolution,
- SharePoint field/view contract sanity.

## Files to Inspect

```text
apps/hb-intel-foleon/src/schema/__tests__/featureAssets.test.ts
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
apps/hb-intel-foleon/package.json
apps/hb-intel-foleon/sharepoint/assets/
tools/build-spfx-package.ts
```

Do not re-read files that remain in your active context unless verifying a line, contradiction, or diff.

## Implementation Tasks

### Task 1 — Add schema validation script

Add:

```text
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
```

Add package script:

```json
"schema:validate": "tsx scripts/validate-foleon-feature-assets.ts"
```

The script must fail on:

- XML parse failure.
- Missing expected schema file.
- Missing `elements.xml`.
- Missing `ListInstance`.
- `CustomSchema` reference that does not resolve.
- Unreferenced/stale schema XML files.
- Duplicate custom field IDs across all schemas.
- Duplicate field internal names within one schema.
- View `FieldRef` to unknown field or unknown built-in.
- Lookup target that does not match a declared `ListInstance` URL.
- Lookup target list declared after the lookup list.
- Indexed custom field count above allowed threshold.
- Missing required launch-time indexed fields.
- Unexpected index on a non-launch-critical field unless explicitly allowlisted.
- Unique-intent field without approved uniqueness posture.
- Incorrect versioning posture:
  - `HB_FoleonInteractionEvents` versioning disabled.
  - other three lists versioning enabled.
- attachments enabled when they should be disabled.

### Task 2 — Expand tests

Update or add tests under:

```text
apps/hb-intel-foleon/src/schema/__tests__/
```

Required tests:

1. `elements.xml` parses as XML.
2. Every schema file parses as XML.
3. `package-solution.json` declares exactly the intended feature assets.
4. Every `CustomSchema` in `elements.xml` resolves to a declared element file.
5. No stale schema files exist under `sharepoint/assets`.
6. No duplicate field IDs.
7. No duplicate field names per list.
8. Index counts are below the configured limit.
9. Required query fields are indexed.
10. Non-critical fields are not indexed at initial Feature Framework provisioning time.
11. Lookup field target exists and is declared before the lookup list.
12. View fields resolve.
13. Unique fields use the approved uniqueness approach.
14. Code-level schema metadata matches XML.

Use a real XML parser if repo dependencies permit. Do not rely only on fragile regex/string contains for new tests.

### Task 3 — Strengthen package proof

Update:

```text
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
```

Required proof output:

```json
{
  "packagePath": "...",
  "sha256": "...",
  "solutionVersion": "...",
  "feature": {
    "id": "...",
    "version": "...",
    "relationships": [...]
  },
  "sourceAssets": {
    "elements.xml": {
      "sha256": "..."
    },
    "schema-content-registry.xml": {
      "sha256": "...",
      "indexedFieldCount": 0
    }
  },
  "packagedAssets": {
    "elements.xml": {
      "archivePath": "...",
      "sha256": "...",
      "matchesSource": true
    }
  },
  "checks": [...]
}
```

The proof must fail if:

- package version is wrong,
- feature version is wrong,
- expected feature ID is missing,
- expected component ID is missing,
- manager toolbox entry is missing or hidden,
- highlights toolbox entry is missing or hidden,
- any schema file is missing,
- any stale schema file is packaged,
- packaged schema bytes differ from repo source,
- packaged `elements.xml` differs from repo source,
- `CustomSchema` references do not resolve,
- indexed field counts exceed threshold,
- lookup target cannot be validated statically.

### Task 4 — Ensure build tool staging is covered

Inspect:

```text
tools/build-spfx-package.ts
```

Confirm the Foleon package path stages Feature Framework assets without mutation.

Do not rewrite the packaging tool broadly unless there is a proven defect.

Add proof coverage instead of broad build-tool changes wherever possible.

### Task 5 — Produce proof artifacts

Expected commands:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon test
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Package proof must write a JSON artifact under:

```text
dist/sppkg/
```

## Required Output

Produce a Wave 02 closure report with:

- added/changed validation files,
- package proof output path,
- package SHA-256,
- indexed field count per schema,
- schema SHA-256 values,
- repo/package parity result,
- stale schema check result,
- validation command output,
- open tenant validation items.

## Do Not Claim

Do not claim tenant closure. Wave 02 only proves source/package closure.

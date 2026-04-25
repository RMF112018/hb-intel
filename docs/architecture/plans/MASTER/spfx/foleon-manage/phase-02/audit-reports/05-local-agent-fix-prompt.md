---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 05 — Local Agent Fix Prompt

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Fix the HB Intel Foleon list provisioning corruption by remediating the defective Feature Framework list schemas, strengthening static/package validation, and producing tenant validation documentation.

This is a narrow provisioning remediation. Do not make cosmetic UI changes. Do not change Foleon routes. Do not weaken runtime authorization. Do not change unrelated packages.

## Current Failure

When the `hb-intel-foleon` SPFx package is added to a SharePoint site:

- the Foleon list assets appear in Site Contents,
- opening one or more lists fails or the list cannot load,
- the Foleon app reports the integration is not fully configured.

## Required Repo Truth

Inspect, but do not re-read files already in your active context unless verifying a line/diff:

```text
apps/hb-intel-foleon/config/package-solution.json
apps/hb-intel-foleon/sharepoint/assets/elements.xml
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml
apps/hb-intel-foleon/sharepoint/assets/schema-interaction-events.xml
apps/hb-intel-foleon/sharepoint/assets/schema-sync-runs.xml
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
apps/hb-intel-foleon/src/schema/__tests__/featureAssets.test.ts
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/
tools/build-spfx-package.ts
```

## Required Subject-Matter Verification

Use current Microsoft Learn/SharePoint/SPFx documentation before finalizing the implementation. Verify:

- SPFx Feature Framework list provisioning behavior.
- `ListInstance` + `CustomSchema` requirements.
- Field XML attributes for index and unique-value enforcement.
- SharePoint Online indexed-column limits/current behavior.
- Cross-list lookup provisioning in the same feature.
- Modern-list rendering risks from invalid fields/views.
- Feature upgrade limitations after partially provisioned lists.

Document the links and findings in the remediation report.

## Mandatory Implementation Tasks

### 1. Fix Content Registry over-indexing

In:

```text
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
```

Reduce `Indexed="TRUE"` to launch-critical fields only.

Minimum recommended set:

```text
FoleonDocId
PublishStatus
IsVisible
IsHomepageEligible
PublishedOn
DisplayFrom
DisplayThrough
SortRank
AllowEmbed
SyncSource
```

Only keep additional indexes if current service code proves an immediate query/filter dependency and SharePoint index budget remains safely below the current Microsoft limit.

Update:

```text
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
```

so source, docs, tests, and XML do not drift.

If needed, split field metadata into:

```ts
indexedAtProvisioning
recommendedIndex
```

Do not let future query logic treat a recommended future index as a provisioned index.

### 2. De-risk the Homepage Placements lookup

Evaluate whether `ContentLookup` must be provisioned by Feature Framework.

Preferred implementation:

- Keep `ContentIdCache` as the runtime-critical field.
- Remove `ContentLookup` from initial Feature Framework provisioning or make it optional.
- Add a documented post-provision path for adding the lookup after `HB_FoleonContentRegistry` is validated.

Acceptable short-term implementation only if clean-site proof succeeds:

- Keep `ContentLookup`, but make it optional.
- Validate lookup target list ordering and lookup field creation.
- Add tenant validation steps to confirm the lookup field works.

### 3. Correct uniqueness enforcement

For:

```text
HB_FoleonContentRegistry.FoleonDocId
HB_FoleonInteractionEvents.EventId
HB_FoleonSyncRuns.RunId
```

Verify the current SharePoint-supported field XML or post-provisioning approach for unique values.

Do not treat `AllowDuplicateValues="FALSE"` as sufficient unless documentation and tenant proof confirm it.

### 4. Add schema validation tests

Add or expand tests under:

```text
apps/hb-intel-foleon/src/schema/__tests__/
```

Required checks:

- XML parse succeeds for all assets.
- `elements.xml` lists all four `ListInstance` entries.
- Each `CustomSchema` resolves to exactly one schema file.
- Feature relationship targets include the declared schema files.
- No duplicate custom field IDs across all schemas.
- No duplicate field names within a schema.
- View `FieldRef` references resolve.
- Lookup target URL exists and is declared before the lookup list.
- Indexed field count per list is under the configured threshold.
- Required query fields are indexed.
- Disallowed/unverified field attributes fail tests.
- Unique-value fields use the approved contract.

### 5. Strengthen package proof

Update:

```text
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
```

Required proof output:

- package SHA-256,
- package version,
- feature version,
- feature relationship entries,
- packaged `elements.xml` SHA-256,
- packaged schema file SHA-256 values,
- repo source SHA-256 values,
- byte-for-byte repo/package parity for `elements.xml` and schemas,
- `CustomSchema` to packaged-file resolution,
- stale schema-file detection,
- indexed-field count per schema,
- manager/highlights toolbox entries still visible.

Fail the proof if any schema parity, reference, stale-file, or index-budget check fails.

### 6. Add documentation

Create/update:

```text
docs/architecture/plans/MASTER/spfx/foleon/list-provisioning-remediation/
```

Include:

- root cause report,
- schema defect register,
- package proof instructions,
- clean-site repro test plan,
- tenant cleanup runbook,
- rollback plan.

### 7. Run validation commands

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If `schema:validate` does not exist before your work, add it.

## Tenant Validation

Do not claim tenant closure unless a clean-site test proves:

- all four lists are created,
- all four lists open in modern SharePoint UI,
- REST metadata succeeds,
- REST fields succeeds,
- REST views succeeds,
- the Foleon app can read/write expected lists,
- the manager route can configure content without direct SharePoint list editing.

## Constraints

- Do not change Foleon route behavior.
- Do not modify runtime auth.
- Do not hide the Manager toolbox entry.
- Do not move unrelated files.
- Do not change Safety Records code.
- Do not claim production readiness without tenant evidence.
- Do not treat Site Contents presence as provisioning success.
- Do not treat `.sppkg` generation as provisioning success.

## Required Output

Produce:

1. Traditional commit summary and description.
2. List of changed files.
3. Root cause evidence.
4. Validation command output.
5. Package proof output path and SHA.
6. Tenant evidence still required.
7. Explicit distinction between package closure and tenant closure.

## Commit Summary Template

```text
fix(foleon): harden list provisioning schemas and package proof
```

## Commit Description Template

```text
Fixes the Foleon Feature Framework list provisioning path by reducing risky launch-time indexes, de-risking cross-list lookup provisioning, correcting uniqueness validation posture, and adding schema/package proof coverage.

- Reduces HB_FoleonContentRegistry launch-time indexes to query-critical fields.
- Aligns source schema metadata and list-schema documentation.
- De-risks HB_FoleonHomepagePlacements ContentLookup provisioning.
- Adds XML/schema validation for field IDs, view refs, lookup ordering, index budget, and CustomSchema references.
- Enhances package proof to verify repo/package schema parity, feature relationships, stale files, and indexed-field counts.
- Adds clean-site repro, tenant cleanup, and rollback documentation.

Validation:
- pnpm --filter @hbc/spfx-hb-intel-foleon lint
- pnpm --filter @hbc/spfx-hb-intel-foleon check-types
- pnpm --filter @hbc/spfx-hb-intel-foleon test
- pnpm --filter @hbc/spfx-hb-intel-foleon build
- pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
- npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
- pnpm --filter @hbc/spfx-hb-intel-foleon package:proof

Tenant closure remains pending clean-site SharePoint validation.
```

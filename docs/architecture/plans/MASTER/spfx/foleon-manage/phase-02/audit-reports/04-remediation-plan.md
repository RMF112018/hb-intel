---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 04 — Remediation Plan

## Objective

Resolve the Foleon list provisioning corruption by fixing the source schema defects, proving package truth, proving clean-site provisioning, and defining a safe tenant cleanup/rollout path.

## Phase 0 — Freeze and Evidence Capture

1. Stop adding the current package to additional sites.
2. Identify the target site where the corrupted lists were created.
3. Capture:
   - site URL,
   - app catalog package version,
   - installed site app version,
   - list URLs,
   - list GUIDs,
   - failed-list-load correlation IDs,
   - browser console errors,
   - network request/response payloads,
   - REST metadata/fields/views responses.
4. Export any existing Foleon list data before any deletion.

## Phase 1 — Source Schema Remediation

### Step 1.1 — Reduce Content Registry indexes

Update:

```text
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
```

Remove `Indexed="TRUE"` from non-critical fields.

Keep launch-critical indexes only:

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

Optionally keep these if service code requires them immediately:

```text
FoleonProjectId
ContentTypeKey
IsFeatured
RequiresExternalOpen
```

### Step 1.2 — Align source schema authority

Update:

```text
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
```

The code-level `indexed` flags must reflect the fields actually indexed at initial provisioning. If the application wants to distinguish "initial index" from "recommended future index", add an explicit schema property:

```ts
indexedAtProvisioning: boolean
recommendedIndex: boolean
```

Do not let the service layer assume a field is indexed unless the provisioning route proves it.

### Step 1.3 — De-risk Homepage Placements lookup

Preferred production fix:

- Remove `ContentLookup` from Feature Framework initial schema.
- Provision it later through controlled PnP/Graph/backend.
- Keep `ContentIdCache` as the runtime dependency.

Short-term acceptable fix:

- Keep `ContentLookup`, but make it optional:

```xml
Required="FALSE"
```

- Add explicit validation that the target list exists before adding placements.

### Step 1.4 — Correct unique-value provisioning

Verify current Microsoft guidance. Then implement one of these:

- field XML with supported unique enforcement attribute, or
- post-provision PnP/REST field update to enforce uniqueness, or
- backend-level uniqueness enforcement if SharePoint field uniqueness is not reliable for this case.

Fields:

```text
HB_FoleonContentRegistry.FoleonDocId
HB_FoleonInteractionEvents.EventId
HB_FoleonSyncRuns.RunId
```

## Phase 2 — Test and Proof Remediation

### Step 2.1 — Add XML model tests

Create or expand tests under:

```text
apps/hb-intel-foleon/src/schema/__tests__/
```

Required test coverage:

- XML well-formed parse.
- Feature manifest references.
- Schema file references.
- No duplicate field IDs across all schemas.
- No duplicate field names inside a schema.
- No custom indexed field count above a configured threshold.
- Required query fields are indexed.
- Non-critical fields are not indexed at Feature Framework provisioning time.
- Lookup target URL exists in `elements.xml`.
- Lookup target list is declared before the lookup-list instance.
- View `FieldRef` references resolve.
- Field-type-specific required attributes exist.
- Unique fields use the approved uniqueness contract.

### Step 2.2 — Enhance package proof

Update:

```text
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
```

Add checks:

- Parse packaged `elements.xml`.
- Parse packaged schema files.
- Parse feature `.rels`.
- Confirm every `CustomSchema` reference has a packaged element file.
- Confirm every schema element file is referenced by one `ListInstance`.
- Confirm no stale schema files exist.
- Confirm packaged schema file SHA-256 equals repo source schema SHA-256.
- Confirm `elements.xml` in package equals repo source.
- Count indexed fields in packaged schemas.
- Fail if indexed field count exceeds launch threshold.
- Emit proof JSON with:
  - package SHA-256,
  - schema SHA-256 values,
  - elements SHA-256,
  - indexed field counts,
  - feature relationship targets,
  - CustomSchema references.

### Step 2.3 — Add optional schema lint command

Add a script:

```json
"schema:validate": "tsx scripts/validate-foleon-feature-assets.ts"
```

The script should run without SharePoint access and fail fast on risky schema defects.

## Phase 3 — Build Validation

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

## Phase 4 — Clean-Site Repro

1. Create a clean test site.
2. Upload and deploy remediated `.sppkg`.
3. Add app to clean site.
4. Confirm all four lists are created.
5. Open each list in modern UI.
6. Validate REST metadata.
7. Validate fields.
8. Validate views.
9. Validate Foleon app read capability.
10. Validate manager route can create/update content without direct list editing.

## Phase 5 — Tenant Cleanup

For test sites:

1. Export data if any.
2. Remove app from site.
3. Delete corrupted lists.
4. Empty recycle bin if necessary.
5. Reinstall remediated package.
6. Confirm clean provisioning.

For production or production-like sites:

1. Export list data.
2. Export field/view/list metadata.
3. Preserve list GUIDs and failure evidence.
4. Decide repair vs delete/reprovision.
5. Do not delete without written backup confirmation.

## Phase 6 — Production Rollout Decision

Decision A — Keep Feature Framework for demo only:

- Use reduced schemas.
- Clean-site proof required.
- Production app install still carries partial-failure risk.

Decision B — Preferred production path:

- Remove complex list provisioning from SPFx Feature Framework.
- Create Foleon provisioning backend/CLI route modeled after Safety Records.
- Manager route reports readiness and can trigger/guide provisioning.
- App install no longer mutates business-list schema.

## Completion Criteria

Do not close remediation until:

1. Source schema defect is fixed.
2. Package proof confirms schema parity and no stale schema.
3. Clean-site install creates usable lists.
4. All four lists open in SharePoint UI.
5. REST metadata/fields/views succeed for all four lists.
6. Foleon app can read/write intended lists.
7. Existing corrupted lists have a documented cleanup path.
8. Final report separates package closure from tenant closure.

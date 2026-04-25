---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 00 — Master Remediation Objective

You are working in a fresh ChatGPT / Codex session in the live `RMF112018/hb-intel` repository.

## Objective

Remediate the HB Intel Foleon SPFx list provisioning failure where SharePoint lists are created when the app is added to a site, but one or more lists are corrupted or unable to load.

The remediation must address the audit findings directly:

1. `HB_FoleonContentRegistry` is very likely over-indexed at Feature Framework provisioning time.
2. `HB_FoleonHomepagePlacements` contains a required same-feature cross-list lookup that can fail if `HB_FoleonContentRegistry` is partially provisioned or not resolvable at lookup creation time.
3. Current package proof confirms inclusion of XML assets but does not prove SharePoint usability.
4. Current tests do not enforce index-budget limits, CustomSchema resolution, package byte parity, field/view integrity, or clean-site tenant usability.
5. Existing corrupted tenant lists may remain broken even after source code is fixed.

This is not a UI redesign.  
This is not a route refactor.  
This is not a broad Foleon feature pass.  
This is a narrow list-provisioning remediation.

## Current Package Context

The current observed Foleon SPFx package is:

```text
apps/hb-intel-foleon/
```

Observed package version:

```text
1.0.11.0
```

Observed uploaded `.sppkg` SHA-256 from the audit:

```text
3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
```

Current Feature Framework assets include:

```text
elements.xml
schema-content-registry.xml
schema-homepage-placements.xml
schema-interaction-events.xml
schema-sync-runs.xml
```

The package manifest currently uses a site-installed feature and declares all four schema XML files as `elementFiles`.

## Required Repo Scope

Inspect at minimum:

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
apps/hb-intel-foleon/package.json
tools/build-spfx-package.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/
docs/architecture/plans/MASTER/spfx/foleon*/
```

Do not re-read files that remain within your active context or memory unless you are verifying a specific line, contradiction, or diff.

## Required Subject-Matter Research

Use current web research before implementation. Treat Microsoft Learn / SharePoint / SPFx documentation as primary authority.

Verify:

- SPFx Feature Framework list provisioning assets.
- `ListInstance` + `CustomSchema` behavior.
- SharePoint list schema XML requirements.
- field XML requirements for text, number, choice, multi-choice, user, date, URL, lookup, note, and boolean fields.
- current behavior and limits for indexed columns.
- uniqueness enforcement for SharePoint fields.
- cross-list lookup provisioning when source and target lists are created in the same feature.
- feature upgrade behavior after a failed or partial list provision.
- known causes of lists appearing in Site Contents but failing to load.

Document the exact references reviewed and the impact on the implementation.

## Non-Negotiable Constraints

- Do not change Foleon route behavior.
- Do not remove or hide the Manager toolbox entry unless an explicit package proof says it is unrelated to current deployment.
- Do not weaken runtime authorization.
- Do not make cosmetic UI changes.
- Do not touch Safety Records code except for reference-only comparison.
- Do not treat Site Contents list presence as success.
- Do not treat successful `.sppkg` generation as success.
- Do not claim tenant readiness without clean-site tenant proof.
- Do not delete existing tenant lists without backup/export and explicit test-vs-production distinction.
- Do not use stale SharePoint assumptions without verifying current documentation.

## Required Remediation Strategy

Execute in waves:

### Wave 01 — Source Schema Remediation

- Reduce risky indexed fields in `HB_FoleonContentRegistry`.
- De-risk `HB_FoleonHomepagePlacements.ContentLookup`.
- Correct uniqueness enforcement approach.
- Align XML, code-level schema metadata, and list-schema docs.
- Avoid unrelated runtime/UI changes.

### Wave 02 — Static Validation and Package Proof

- Add schema validation tests.
- Add index-budget checks.
- Add XML relationship checks.
- Add repo/package byte parity proof.
- Add stale packaged schema detection.
- Add improved proof output.

### Wave 03 — Clean-Site Tenant Validation

- Install remediated package on a clean SharePoint test site.
- Confirm all lists exist and open.
- Confirm REST metadata, fields, and views.
- Confirm Foleon app read/write behavior.
- Confirm Manager surface can configure content without direct list editing.

### Wave 04 — Existing Tenant Cleanup / Repair

- Capture evidence from corrupted site.
- Export data if any.
- Determine repair vs delete/reprovision.
- Do not use a corrupted site as proof that the package remains broken unless a clean site also fails.

### Wave 05 — Controlled Provisioning Path

- Evaluate whether Feature Framework should be retained only for webpart packaging.
- Propose or implement a PnP/Graph/backend provisioning path modeled after Safety Records.

## Required Validation Commands

At minimum:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If `schema:validate` does not exist, add it.

## Required Deliverables

Produce:

1. Changed source files.
2. Updated validation tests.
3. Updated package proof.
4. Updated docs/runbooks.
5. Package proof JSON path.
6. Clean-site validation checklist.
7. Tenant evidence checklist.
8. Traditional commit summary and description.
9. Clear distinction between:
   - source/package closure,
   - clean-site tenant closure,
   - corrupted-site cleanup closure.

## Final Closure Criteria

Do not claim full closure until all are true:

1. Source schema defect is fixed or ruled out with evidence.
2. Package staging defect is fixed or ruled out with byte-level evidence.
3. Clean-site repro succeeds.
4. All four lists open in SharePoint UI.
5. All four lists return valid REST metadata, fields, and views.
6. Foleon app can read/write intended lists.
7. Manager surface can configure content without direct SharePoint list editing.
8. Existing corrupted lists have a repair/delete/reprovision path.
9. Final report separates package closure from tenant closure.

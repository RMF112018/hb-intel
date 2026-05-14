# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 3 — Existing Provisioning Architecture Audit

### Existing legacy fallback provisioner

`scripts/provision-legacy-fallback-lists.ts` is the strongest existing implementation precedent. It currently:

- acquires a SharePoint token via `SHAREPOINT_BEARER_TOKEN` or `DefaultAzureCredential`;
- locks execution to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`;
- resolves existing lists by exact/equivalent title;
- creates missing lists;
- creates missing fields using PnPjs list field APIs;
- applies compatible field settings (`Required`, `Indexed`, `DefaultValue`, `Choices`);
- detects incompatible type drift and records unresolved mutations;
- emits a JSON provisioning report;
- fails when unresolved mutations exist unless `--allow-type-drift` is provided;
- fails when post-provision validation does not pass.

### Strengths to reuse

- Descriptor-driven list and field definitions.
- Type compatibility helper.
- HBCentral host lock.
- JSON report shape.
- Post-provision validation.
- App-only auth seam.
- Separation of wrong-type drift from safe compatible updates.

### Weaknesses to remediate before My Projects schema mutation

- No explicit default dry-run mode.
- No `--apply` gate.
- Scope is legacy fallback list creation/alteration, not My Projects source-list expansion.
- Can create missing lists; the My Projects provisioner should target existing lists only.
- Includes `FolderWebUrl` desired type `URL`, while the tenant-backed snapshot says live type is `Text`. That makes a full descriptor run noisy/risky for this objective.
- Duplicated field creation logic should be factored into a shared provisioner utility rather than cloned again.

### Existing read-only readiness verifier

`scripts/verify-my-project-role-fields.ts` is correctly scoped as a no-mutation gate. It queries both lists' field metadata and builds a readiness report from `projects-role-schema-readiness.ts`. It exits `0` only when every required field is live-verified with expected type.

### Existing backfill scripts

Both backfill scripts already follow the correct dry-run/apply pattern:

- `scripts/backfill-my-project-role-arrays.ts` migrates Projects legacy role fields into canonical role arrays.
- `scripts/backfill-my-project-legacy-registry-fields.ts` mirrors Projects authority into matched Registry rows and preserves operator-maintained legacy-only values.

These scripts must remain downstream of schema provisioning and readiness verification.

### Recommended architecture change

Create a shared utility layer, for example:

```text
backend/functions/src/services/sharepoint-schema-provisioning/
  field-definition.ts
  field-compatibility.ts
  list-field-provisioner.ts
  provisioning-report.ts
```

Then add:

```text
scripts/provision-my-projects-source-list-schema.ts
```

The new script should reuse the shared utility and keep legacy fallback list provisioning behavior unchanged except for importing the shared primitives once they exist.

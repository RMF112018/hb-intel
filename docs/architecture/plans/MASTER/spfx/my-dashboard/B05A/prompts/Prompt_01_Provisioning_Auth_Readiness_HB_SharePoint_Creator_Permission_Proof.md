# Prompt 01 — Provisioning Auth Readiness and `HB SharePoint Creator` Permission Proof

## Objective

Establish a precise, repo-truth and tenant-readiness plan for every SharePoint schema/data-write operation required by the My Projects initiative. This prompt must close the difference between:

1. the repo-documented `HB SharePoint Creator` app posture; and
2. the actual operator prerequisites needed before live provisioning, backfill, or mirroring commands can be run.

This prompt is primarily **audit, documentation, and readiness-gate** work. It must not execute destructive tenant mutations.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Repo-truth references to inspect

### Provisioner identity and runbook
- `docs/how-to/administrator/create-legacy-fallback-lists.md`
- `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- `scripts/provision-legacy-fallback-lists.ts`

### SPFx protected-API posture that must not be conflated with the provisioner identity
- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/README.md`

### Supporting implementation package materials
- `supporting/01_External_Research_Validation_Summary.md`
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md`

---

## Implementation scope

Create a provisioning-auth readiness artifact for the My Projects initiative. Recommended filename:

```text
01_My_Projects_HB_SharePoint_Creator_Permission_And_Provisioning_Readiness.md
```

The artifact must be sufficiently specific that an operator or reviewer can determine:

- whether the existing app path is ready for schema verification;
- whether it is ready for column/list schema mutation;
- whether it is ready for list-item backfill/mirroring writes;
- what still requires live tenant confirmation.

---

## Required sections in the readiness artifact

### 1. Current repo-documented posture

Document separately:

#### A. SPFx My Dashboard API permission seam
- resource name;
- scope;
- package file path;
- what this declaration does and does not prove.

#### B. App-only provisioning identity seam
- display name;
- app/client ID;
- current posture;
- target posture;
- exact environment keys from `hosting-config.ts`;
- existing runbook command.

### 2. Operation-by-operation permission matrix

Build a table for the operations required by this initiative:

| Operation | Repo/tooling path | Required proof | Live operator verification |
|---|---|---|---|
| Read list schema | Graph/PnP/descriptor validation | Confirm app can inspect columns | Required |
| Create missing list columns | provisioning script / schema tooling | Confirm schema-management permission posture | Required |
| Alter compatible field settings | provisioning script | Confirm schema-management permission posture | Required |
| Read Projects and Registry list items | backend/read-model provider | Confirm runtime app/service identity can read | Required |
| Write Projects backfill values | migration script or equivalent | Confirm item-write posture | Required |
| Write Registry mirror/preserve values | migration/discovery support | Confirm item-write posture | Required |
| Create list if missing | only if script still carries this capability | Confirm if applicable | Required |

### 3. Microsoft-documentation interpretation

Use the package’s authoritative research summary as the basis, but re-verify against live docs if the session requires freshness. Capture:

- schema read posture;
- create/update list-column posture;
- list creation posture if applicable;
- selected-resource consent + explicit resource-grant model;
- selected roles:
  - `read`
  - `write`
  - `owner`
  - `fullcontrol`;
- why selected-resource posture cannot be overclaimed for schema mutation without endpoint/tenant proof.

### 4. Existing `HB SharePoint Creator` app path decision

Close this decision:

- **No new app registration is proposed.**
- The implementation package must continue to use the existing app path.
- If current permissions are insufficient, the readiness artifact must describe:
  - what tenant-side permission/grant prerequisite is missing;
  - why the prerequisite matters;
  - which prompt or operator-run step is blocked until it is resolved.

### 5. Operator-owned checklist

Provide an operator checklist with checkboxes for:

- current app identity confirmed;
- current app permissions reviewed in Entra;
- HBCentral site/resource grants verified if selected-resource posture is being used;
- schema read tested;
- schema write ability tested or approved for next gated step;
- list item write ability tested or approved for next gated step;
- provisioner credential path chosen:
  - `SHAREPOINT_BEARER_TOKEN`;
  - or `DefaultAzureCredential`;
- no secrets entered into repo artifacts.

---

## Required non-goals

- Do not run live provisioning commands.
- Do not create or alter SharePoint lists or columns.
- Do not backfill tenant data.
- Do not change app registration code/config beyond docs-only recording unless Prompt 00 discovered a factual repo documentation bug.
- Do not propose a new Entra app registration.
- Do not collapse the SPFx `access_as_user` seam into the app-only provisioner seam.

---

## Validation requirements

Run:

```bash
git status --short
git rev-parse HEAD
```

Run targeted repo-truth searches:

```bash
rg -n "HB SharePoint Creator|08c399eb-a394-4087-b859-659d493f8dc7|pilot-interim|least-privilege-sites-selected" \
  docs/how-to/administrator/create-legacy-fallback-lists.md \
  backend/functions/src/services/legacy-fallback/hosting-config.ts \
  apps/my-dashboard/config/package-solution.json \
  apps/my-dashboard/README.md

rg -n "SHAREPOINT_BEARER_TOKEN|DefaultAzureCredential|--allow-type-drift" \
  scripts/provision-legacy-fallback-lists.ts
```

If the package/work folder contains the research summary, verify it has the required operation topics. Do not attempt live web browsing inside the repo; if using a browsing-enabled session, cite the authoritative docs in the closeout note.

---

## Evidence requirements

The closeout must include:

- exact repo paths proving current posture;
- whether current live tenant permission truth was available or remains operator-pending;
- operation-by-operation readiness status;
- statement that no live tenant mutation was executed;
- statement that no app registration replacement was proposed.

---

## Commit / closeout expectations

Preferred output is a docs-only artifact.  
If a commit is appropriate, recommend:

```text
docs(my-dashboard): document My Projects HB SharePoint Creator provisioning readiness
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Current repo-documented app posture
5. Operator-pending tenant proof, if any
6. Operation-by-operation readiness matrix summary
7. Validation commands and outcomes
8. Whether Prompt 02 may proceed
9. Recommended commit title/description if docs changed

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes.
- No speculative auth redesign.
- No destructive tenant operations.
- No new app registration recommendation unless it is proven impossible to satisfy the required actions with the existing `HB SharePoint Creator` app path; even then, document the blocker and stop rather than casually expanding scope.

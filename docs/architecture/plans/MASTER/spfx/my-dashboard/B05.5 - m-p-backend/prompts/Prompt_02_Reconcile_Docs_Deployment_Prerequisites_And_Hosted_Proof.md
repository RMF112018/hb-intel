# Prompt 02 — Reconcile Docs, Deployment Prerequisites, and Hosted Proof

## Objective

After Prompt 01 lands and passes validation, update only the minimal backend/operator documentation required to make the new federated Graph access posture explicit, then prepare the hosted proof sequence that confirms My Projects no longer fails at HBCentral site resolution.

Use:

- `supporting/00_Locked_Current_State_And_Root_Cause.md`
- `supporting/01_Operator_Completed_Entra_Federated_Credential_Evidence.md`
- `supporting/04_Runtime_Proof_Checklist_And_KQL.md`
- `supporting/05_Commit_Closeout_Template.md`

Preserve all non-negotiables from:

- `supporting/03_Implementation_Guardrails_And_Non_Negotiables.md`

---

# Required Documentation / Runtime Contract Updates

Review and update only the canonical docs/runbooks that materially need correction. Candidate docs include:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05A/01_My_Projects_HB_SharePoint_Creator_Permission_And_Provisioning_Readiness.md
docs/how-to/administrator/provision-legacy-fallback-hosting.md
```

Also update any directly relevant backend deployment/operator runbook only if repo truth shows it is the canonical place to capture this identity-flow correction.

Document the now-correct runtime posture:

```text
Function App UAMI
→ federated credential into HB SharePoint Creator
→ Microsoft Graph / SharePoint access as HB SharePoint Creator
```

Document that:

- `AZURE_CLIENT_ID` remains the Function App UAMI client ID;
- `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID` identifies HB SharePoint Creator;
- the federated credential exists on HB SharePoint Creator and trusts the Function App UAMI;
- `api://AzureADTokenExchange` is the federation audience;
- Graph downstream scope remains `https://graph.microsoft.com/.default`;
- Adobe Sign storage/auth posture is not altered by this Graph credential change.

Do not rewrite broader architecture docs unnecessarily.

---

# Runtime Proof Plan to Return

Use the exact checklist in:

```text
supporting/04_Runtime_Proof_Checklist_And_KQL.md
```

The final response must present that proof plan clearly enough for an operator to execute immediately after backend deploy.

---

# Validation Commands

Run any doc formatting/checks consistent with repo conventions, plus backend validations again only if Prompt 02 includes code/config touches.

At minimum, if docs only:

```bash
pnpm exec prettier --check <changed markdown files>
```

If any TypeScript/Bicep/config file changes land, rerun the necessary targeted validation and state why.

---

# Completion Criteria

Prompt 02 is complete only when:

- docs accurately describe the federated HB SharePoint Creator Graph path;
- operator proof sequence is exact and ready;
- no unneeded docs churn is introduced;
- no unrelated dirty files are staged;
- commit guidance is prepared.

---

# Required Response Format

Follow:

```text
supporting/05_Commit_Closeout_Template.md
```

For Prompt 02, include:

1. Documentation / Runbook Verdict
2. Runtime Proof Checklist
3. Validation Ledger
4. Commit Summary and Description

Do not push or deploy unless separately authorized.

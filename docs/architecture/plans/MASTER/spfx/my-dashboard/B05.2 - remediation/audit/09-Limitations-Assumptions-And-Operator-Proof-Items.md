# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 7 — Limitations, Assumptions, and Operator Proof Items

## Limitations

- The audit used repo files available through the GitHub connector and current public Microsoft/PnP documentation. It did not execute commands against the tenant.
- The operator-provided app-registration JSON was treated as strong evidence of app configuration, but not as final proof of admin consent or effective service-principal grants.
- The operator-provided Function App JSON was treated as proof of current Azure runtime identity posture, but not as proof that the UAMI has SharePoint/Graph permissions.
- No live schema probe was run from this session.
- No tenant mutation was performed.

## Assumptions

- The intended production HBCentral site is `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- The two source lists already exist and must not be recreated.
- Internal field names must exactly match the canonical repo constants.
- Existing `FolderWebUrl` Text-vs-URL drift should not be remediated by the My Projects source-list schema provisioner.
- `procoreProject` means a raw Procore token, not a Yes/No flag and not a full URL.

## Operator proof items still required

1. Confirm the identity that will execute provisioning: `HB SharePoint Creator` app registration or Function App UAMI.
2. Provide effective admin-consent / service-principal grant proof for the chosen identity.
3. Run the read-only readiness verifier and archive JSON output.
4. Run the new provisioner dry-run and confirm only expected missing fields are planned.
5. Run apply only after review.
6. Re-run readiness verifier and archive `ready: true` JSON.
7. Run backfill dry-run/apply sequence and archive JSON outputs.
8. Run functional My Projects read-model smoke test for a known assigned user.

## Hard no-go conditions

- The provisioner would create or recreate either source list.
- Any existing target field is present with wrong type and no explicit manual remediation decision exists.
- The execution identity cannot be proven.
- Runtime uses UAMI while all permissions are only proven on the `HB SharePoint Creator` app registration.
- The dry-run report includes unrelated fields such as `FolderWebUrl` unless the operator has explicitly chosen to remediate that separate drift.

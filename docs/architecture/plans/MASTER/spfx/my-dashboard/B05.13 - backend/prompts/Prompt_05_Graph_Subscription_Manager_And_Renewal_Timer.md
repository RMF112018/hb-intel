# Prompt 05 | Graph Subscription Manager and Renewal Timer

## Working Context

You are working in the `RMF112018/hb-intel` repository on the **My Dashboard | My Projects Incremental Projection** implementation package dated **2026-05-17**.

Read and obey the package's locked decisions. Do **not** reopen architecture choices that are closed in:
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `02_Azure_Infrastructure_Specification.md`
- the prompt-specific package files referenced below.

Do not re-read files that are still clearly present in your current context or memory; only re-open a file when verification of exact current contents is required.

## Required First Response

Return:
1. a concise execution plan,
2. the exact repo seams you will inspect or edit,
3. the validation lanes you expect to run,
4. any true blocking contradiction with repo truth.

Do **not** make edits until Bobby approves the plan, unless Bobby explicitly instructs you to proceed immediately.

---
## Objective

Implement the Microsoft Graph subscription control plane for Projects and Legacy Registry list subscriptions, including renewal and persisted state.

## Required Package Inputs

Review:
- `05_Subscription_Delta_Queue_State_Design.md`
- `08_Telemetry_Observability_And_Operational_Runbooks.md`
- `09_Security_Permissions_And_Governance.md`
- `runbooks/Runbook_03_Post_Permission_Live_Validation.md`

## Locked Implementation Requirements

1. Reuse the existing federated Graph token lane used by the current Graph list client unless repo truth proves it impossible.
2. Implement Graph subscription client/service for:
   - create subscription,
   - renew subscription,
   - read/replace stale subscription state when required.
3. Subscribe to list resources using package-defined source-list metadata.
4. Persist subscription ID, resource, expiration, and health state in the subscriptions Table repository.
5. Add renewal timer with package-defined schedule.
6. Add operator/admin action surface if the package design includes create/renew admin commands at this stage.
7. Implement telemetry for create/renew success/failure and near-expiry state.
8. Preserve precise validation gate language: live proof is blocked until `Sites.Read.All` Application permission is admin-consented.

## Expected Validations

- Unit tests for create/renew request shaping.
- Unit tests for persisted subscription state transitions.
- Timer handler tests.
- Typecheck backend.

## Do Not Do Yet

- Do not claim live subscription creation success before permission exists.
- Do not implement delta worker in this prompt.

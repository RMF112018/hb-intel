# Prompt 12 | Post-Permission Subscription, Delta Seed, and Live Validation

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

After `Sites.Read.All` Application permission is granted, perform the live validation work that was deliberately gated:
- delta checkpoint seeding,
- Graph subscription creation,
- webhook validation handshake,
- live notification → queue → delta → projection proof.

## Required Package Inputs

Review:
- `runbooks/Runbook_03_Post_Permission_Live_Validation.md`
- `09_Security_Permissions_And_Governance.md`
- `10_Validation_Acceptance_And_Test_Matrix.md`

## Preconditions

Do not start until all are true:
1. `Sites.Read.All` Application permission shows granted/admin-consented.
2. Backend build containing Prompts 01–11 has been deployed.
3. Service Bus, Table Storage, RBAC, and Function App settings are provisioned.

## Required Work

1. Execute delta `token=latest` seed path for both source lists.
2. Create live Graph subscriptions for both source lists through the implemented operator path.
3. Confirm webhook validation handshake succeeds.
4. Perform a controlled live source change and validate:
   - notification event,
   - queue enqueue/consume,
   - delta pull,
   - projection row update,
   - page read freshness within 1–5 minutes.
5. Execute as much delete/deactivation validation as is safe in the environment.
6. Capture exact evidence, telemetry event IDs/names, and operator observations.

## Required Closeout

State whether Prompt 13 cutover is authorized based on evidence. If not, identify the exact blocker.

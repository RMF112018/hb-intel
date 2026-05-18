# Prompt 04 | Service Bus Queue Contract and Webhook Ingress

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

Implement the queue ingress side of the projection subsystem:
- Microsoft Graph webhook receiver route shape,
- validation-token handshake,
- `clientState` verification hook,
- Service Bus enqueue adapter,
- fast HTTP acknowledgment contract.

## Required Package Inputs

Review:
- `05_Subscription_Delta_Queue_State_Design.md`
- `08_Telemetry_Observability_And_Operational_Runbooks.md`
- `09_Security_Permissions_And_Governance.md`
- `resources/Service_Bus_Message_Contract.json`

## Locked Implementation Requirements

1. Add public webhook route dedicated to My Projects projection Graph notifications.
2. Support Graph validation-token request handling with exact plain-text response semantics.
3. Validate stored/clientState secret equivalence before accepting real notifications.
4. Do not process projection logic inside webhook request.
5. On durable enqueue success, return accepted/success posture per package contract.
6. If queue enqueue fails, return a retry-signaling failure instead of falsely acknowledging.
7. Enqueue one source-kind wake-up message per source list notification class, deduplicable through deterministic message IDs.
8. Emit sanitized telemetry for:
   - validation requests,
   - received notifications,
   - accepted notifications,
   - clientState rejection,
   - enqueue failures.

## Expected Validations

- Route tests for validation-token flow.
- Route tests for accepted notification and rejected clientState.
- Enqueue adapter tests.
- Typecheck backend.

## Do Not Do Yet

- Do not implement delta worker in this prompt.
- Do not claim live Graph subscription proof.

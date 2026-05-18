# My Dashboard | My Projects Incremental Projection Architecture Implementation Package

**Package date:** 2026-05-17  
**Audience:** Bobby Fetting + local code agent  
**Target repository:** `RMF112018/hb-intel`  
**Primary application:** `apps/my-dashboard` + `backend/functions`

---

## 1. Purpose

This package converts the prior repo-truth audit into a **fully closed implementation and migration program** for replacing the current **per-page-load My Projects source aggregation** with an **incrementally maintained projection architecture**.

### Current problem being solved

Today, the My Projects backend read path performs expensive work during a user page load:

```text
SPFx card loads
→ backend read endpoint
→ full Projects list read
→ full Legacy Project Fallback Registry read
→ in-request reconciliation
→ user-specific projection assembly
→ response to page
```

The target architecture moves that work out of the request path:

```text
Source list changes
→ Graph list notification
→ webhook validation and queueing
→ delta sync worker retrieves changed items
→ projection worker recomputes only affected user/project slices
→ helper rows upserted/deactivated in My Projects Registry

Page load
→ backend reads precomputed My Projects Registry rows for current user
→ summary counts computed from helper rows
→ existing frontend envelope returned
```

---

## 2. Locked Architecture Decisions

| Topic | Locked decision |
|---|---|
| Runtime read path | **Backend-mediated helper-list read**. No direct SPFx read from the helper list. |
| Freshness tolerance | **1–5 minutes** after source-list changes is acceptable. |
| Projection store | SharePoint list: **`My Projects Registry`** on `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`. |
| Projection list visibility | **Do not hide the list**, but **break inheritance and permission-restrict it**. It is an operator/system-facing list, not an end-user browse surface. |
| Row lifecycle | **Soft-deactivate obsolete projection rows** with `IsActive=false`, `DeactivatedAtUtc`, `DeactivationReason`; retain inactive rows for **90 days**, then purge through a monthly job. |
| Persistent backend state | **Dedicated Azure Table Storage** in a new operational storage account; do not use the Function App host storage account as the primary state store. |
| Queue/debounce infrastructure | **New Azure Service Bus Standard namespace + queue**; no reusable Service Bus or Storage Queue infrastructure currently exists. |
| Queue name | `my-projects-projection-sync` |
| Queue dedupe | Enable **Service Bus duplicate detection**, 10-minute window, with deterministic message IDs by source-list debounce window. |
| Debounce interval | **60 seconds** for list-notification coalescing. |
| Service Bus auth | **Managed identity**, using the existing Function App UAMI for Azure resource access. |
| Graph auth path | Reuse repo-truth **federated Graph token provider**: Function App UAMI assertion → **HB SharePoint Creator** app token → Graph. |
| Graph permissions | `Sites.Read.All` **Application** is required for list subscription creation and is pending admin consent; `Sites.ReadWrite.All` is already available but does not remove the subscription gate. |
| Subscription lifetime | Create/renew subscriptions at **27 days**, renew when `< 7 days` remain. |
| Change tracking | **Microsoft Graph list subscriptions + `listItem/delta`**. |
| Delete handling | Delta tombstones trigger **targeted projection deactivation/recompute**, not blind hard-delete. |
| Reconciliation cadence | **Nightly read-only drift audit**; **weekly automated repair timer implemented but disabled during initial live stabilization**, then enabled after 14 days of clean production telemetry. |
| Manual rebuild controls | Staged in three layers: **backend admin endpoints**, **CLI/operator scripts**, then **admin UI controls** as a post-cutover stage. |
| Projection history | No separate history warehouse in MVP; rely on soft-deactivated helper rows, projection run records, App Insights telemetry, and 90-day retention. |
| Operator alerting | MVP: **Application Insights telemetry and KQL runbooks only**. Teams/email alerting is staged for a later enhancement. |
| Summary counts | Compute **identical summary counts from helper rows at read time**, preserving current envelope contract. |
| Read cutover | Projection read provider introduced behind a config gate; after parity validation, cut over to projection mode. No automatic page-load fallback to the old full aggregation path. |

---

## 3. Package Contents

### Core architecture and implementation documents

| File | Purpose |
|---|---|
| `00_Closed_Decision_Register.md` | Final decisions and non-negotiables. |
| `01_Target_Architecture.md` | End-state architecture, data flows, trust boundaries, and source-of-record posture. |
| `02_Azure_Infrastructure_Specification.md` | New Azure services, queue/storage choices, RBAC, and configuration posture. |
| `03_SharePoint_My_Projects_Registry_Schema.md` | Exact list schema, indexes, permissions, views, and retention. |
| `04_Backend_Service_Design.md` | Code structure, functions, providers, repositories, and feature flags. |
| `05_Subscription_Delta_Queue_State_Design.md` | Graph subscriptions, delta mechanics, Service Bus messages, and Azure Table state records. |
| `06_Projection_Recompute_Algorithm.md` | Slice recompute behavior for Projects changes, Registry changes, and deletions. |
| `07_Seed_Migration_Cutover_And_Rollback_Plan.md` | Seed, parity validation, live enablement, rollback, and stabilization. |
| `08_Telemetry_Observability_And_Operational_Runbooks.md` | Telemetry events, App Insights posture, DLQ monitoring, and KQL guidance. |
| `09_Security_Permissions_And_Governance.md` | Graph permissions, SharePoint list permissions, Azure RBAC, secrets, and least privilege. |
| `10_Validation_Acceptance_And_Test_Matrix.md` | Unit, integration, live smoke, migration, and cutover acceptance criteria. |

### Runbooks

| File | Purpose |
|---|---|
| `runbooks/Runbook_01_Azure_Portal_Provisioning.md` | Operator steps for Service Bus, storage account, RBAC, and app settings. |
| `runbooks/Runbook_02_Pre_Permission_Implementation_Work.md` | What can be implemented before `Sites.Read.All` is granted. |
| `runbooks/Runbook_03_Post_Permission_Live_Validation.md` | Live Graph subscription/delta validation once consent is granted. |
| `runbooks/Runbook_04_Seed_Cutover_And_Rollback.md` | Seed, parity, cutover, monitoring, rollback. |
| `runbooks/Runbook_05_Production_Monitoring.md` | Daily/weekly operator checks after cutover. |

### Resources

| File | Purpose |
|---|---|
| `resources/Source_Register.md` | Repo-truth seams and Microsoft primary-source references. |
| `resources/Repo_Truth_Seam_Map.md` | Files the agent must inspect and preserve. |
| `resources/Environment_Settings_Matrix.md` | Required backend settings and values/purpose. |
| `resources/Azure_Resource_Target_Spec.yaml` | Machine-readable target Azure resource posture. |
| `resources/My_Projects_Registry_Schema.json` | Machine-readable projection list field contract. |
| `resources/Service_Bus_Message_Contract.json` | Queue message schema. |
| `resources/Azure_Table_State_Entities.json` | State-store entity contracts. |
| `resources/Implementation_Sequence_Checklist.md` | Operator + agent execution tracker. |
| `resources/App_Insights_KQL_Query_Pack.md` | Starter KQL queries for MVP telemetry operations. |
| `resources/Prompt_Execution_Guide.md` | Instructions for running the prompt sequence with the local agent. |

### Prompt set

The `prompts/` folder contains a sequenced implementation prompt set for the local code agent. Prompts are intentionally granular and should be executed in order unless the agent identifies a repo-truth reason to split a prompt further. Use `prompts/Prompt_Index.md` together with `resources/Prompt_Execution_Guide.md`.

---

## 4. Execution Sequence

### Stage 0 — Audit lock and repo revalidation
Run:
- `Prompt_00_Repo_Truth_Revalidation_And_Scope_Lock.md`

### Stage 1 — Infrastructure and contract scaffolding
Run:
- `Prompt_01_Projection_Contracts_And_Config_Scaffolding.md`
- `Prompt_02_SharePoint_Registry_Descriptor_Provisioning_And_Verification.md`
- `Prompt_03_Azure_Table_Operational_State_Repositories.md`
- `Prompt_04_Service_Bus_Queue_Contract_And_Webhook_Ingress.md`

### Stage 2 — Graph change tracking and sync
Run:
- `Prompt_05_Graph_Subscription_Manager_And_Renewal_Timer.md`
- `Prompt_06_Graph_Delta_Client_And_Sync_Worker.md`

> `Sites.Read.All` consent is the live-validation gate for Graph list subscription creation. Implementation can proceed before consent; live subscription creation cannot be certified until consent exists.

### Stage 3 — Projection engine and migration controls
Run:
- `Prompt_07_My_Projects_Domain_Extraction_And_Projection_Slice_Engine.md`
- `Prompt_08_Initial_Seed_Full_Rebuild_Admin_Endpoints_And_CLI.md`

### Stage 4 — Read cutover and parity validation
Run:
- `Prompt_09_Projection_Backed_Read_Model_Provider_And_Cutover_Flag.md`
- `Prompt_10_Parity_Harness_Telemetry_And_Operator_Evidence.md`

### Stage 5 — Deployment, live validation, and cutover
Run:
- `Prompt_11_Deployment_Runbooks_And_Pre_Permission_Staging.md`
- `Prompt_12_Post_Permission_Subscription_Delta_Seed_And_Live_Validation.md`
- `Prompt_13_Projection_Read_Cutover_Production_Monitoring_And_Rollback.md`

### Stage 6 — Staged admin UI control plane
Run only after backend cutover is stable:
- `Prompt_14_Stage_Three_Admin_UI_Controls.md`

---

## 5. Operator Gates

### Gate A — Azure services do not currently exist
The implementation must provision:
- Service Bus Standard namespace
- Service Bus queue
- dedicated Table Storage operational state account
- Azure Table entities/tables
- managed identity RBAC

### Gate B — Graph `Sites.Read.All` is pending
Until admin consent is granted:
- implement and test code with mocked Graph subscription/delta clients;
- provision Azure resources;
- provision SharePoint helper list;
- build seed/rebuild projection paths;
- prepare live validation scripts.

After consent:
- create list subscriptions;
- seed delta tokens;
- exercise live webhook validation;
- run true end-to-end list change test.

### Gate C — Read cutover requires parity
Do not switch the production project-links read route to projection mode until:
- helper list seed completes;
- selected-user parity report is clean;
- projection summary counts match expected route semantics;
- live subscription/delta worker passes smoke validation;
- operator signs off.

---

## 6. Non-Negotiable Implementation Guardrails

1. **Do not reintroduce expensive Projects + Registry full aggregation on page load after cutover.**
2. **Do not make the My Projects Registry a direct frontend data source.**
3. **Do not store Graph subscription state, delta tokens, queue state, or client-state secrets in SharePoint.**
4. **Do not use the Function App host storage account as the preferred operational state store.**
5. **Do not hard-delete helper rows during ordinary incremental sync.**
6. **Do not deviate from the current My Projects reconciliation semantics without an explicit audit note and operator approval.**
7. **Do not create subscriptions with a write-permission-only assumption; `Sites.Read.All` consent remains the live validation gate.**
8. **Do not permit forged Graph notifications to enqueue work; validate `clientState`.**
9. **Do not process webhook notifications inline; validate, persist work, and return quickly.**
10. **Do not leave the system without drift detection, subscription renewal, and manual repair controls.**

---

## 7. Final Target Outcome

At completion, the production My Projects user experience should preserve the current UI/card behavior while the backend read route becomes:

```text
GET /api/my-work/me/project-links
→ authenticated actor UPN
→ My Projects Registry lookup
→ current-user helper rows only
→ summary counts derived from rows
→ existing envelope returned
```

The source-list maintenance path becomes:

```text
Projects / Registry edit
→ Graph change notification
→ Service Bus debounce queue
→ delta worker
→ source-slice recompute
→ helper projection upsert/deactivation
→ user-facing read updated within 1–5 minutes
```

---

## 8. Package Use Instruction for the Local Agent

Execute the prompt set in order.  
Each prompt instructs the agent to:
- revalidate only the repo truth needed for that step,
- avoid re-reading files still within current context,
- implement the exact target with no decisions left open,
- return a concise closeout with files changed, validations run, and blockers.

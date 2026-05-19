# HB Intel My Dashboard | My Projects SharePoint Storage Redirection Implementation Package

## Objective

This package defines the **fully closed implementation target** for redirecting the existing **My Dashboard > My Projects projection subsystem** away from its prior **Azure Table Storage + Azure Service Bus active MVP control plane** and into a **SharePoint-list-backed MVP persistence/control architecture** hosted at:

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

The package is intended for a local code agent working inside the live `RMF112018/hb-intel` repository. It is not a vague architecture note. It is an implementation package containing:

- closed target architecture;
- exact list inventory and schema contracts;
- queue-replacement mechanics;
- repository/adaptor boundaries;
- provisioning script requirements;
- code supersession instructions;
- permissions and governance posture;
- validation gates;
- operator runbooks;
- a staged prompt sequence that leaves no material design decision open.

## Context

The earlier `B05.13 - backend PENDING` package drove substantial implementation work through Prompts 00–11. Repo truth now includes, among other things:

- My Projects projection contracts/configuration;
- `My Projects Registry` list descriptor/provisioner/verifier;
- Azure Table state repositories;
- Service Bus ingress/worker seams;
- Graph subscription and delta logic;
- projection slice engine;
- seed/rebuild/admin/CLI seams;
- projection-backed read provider behind a read-mode flag;
- parity, telemetry, and operational-readiness materials.

This package **does not discard** that work. It classifies it and redirects it.

## Final MVP Architecture

### Retain

- Azure Functions orchestration.
- Graph subscriptions on:
  - `Projects`
  - `Legacy Project Fallback Registry`
- Microsoft Graph delta reads.
- Existing My Projects domain extraction and projection/reconciliation logic.
- Existing projection-backed public read route shape:
  - `GET /api/my-work/me/project-links`
- Config-driven cutover / rollback using:
  - `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE`
- Admin seed/rebuild concepts.
- Parity and telemetry discipline.

### Redirect

- Azure Table state repositories → SharePoint-backed control/state repositories.
- Service Bus queue + queue-trigger worker → SharePoint-backed `Pending Work` list + timer worker.
- Azure resource provisioning documentation → MyDashboard SharePoint storage/provisioning architecture.
- Run/failure state → durable SharePoint diagnostic lists.

### Supersede from the active MVP path

- Azure Table Storage as the required operational state store.
- Azure Service Bus as the required debounce/queue layer.
- `MyProjectsProjectionServiceBus__*` active MVP settings.
- `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL` active MVP dependency.
- queue-message contracts as the implementation target.

## Closed Decisions

This package locks the following decisions:

1. **SharePoint is the active MVP persistence/control plane** for My Projects projection state.
2. **Azure Table Storage and Azure Service Bus are not active MVP dependencies.**
3. **Seven MyDashboard lists are required**, exactly as described in `03_SharePoint_List_Schemas_And_Field_Contracts.md`.
4. **Normal page load reads the persisted My Projects Registry projection**, not live Graph aggregation.
5. **Rollback is configuration-based** (`readMode=legacy`), not silent per-request backend fallback.
6. **Graph subscriptions + delta remain required.**
7. **Webhook events create debounced Pending Work rows**; they do not perform long-running projection writes inline.
8. **Pending Work defaults are locked**:
   - 60-second debounce bucket;
   - 1-minute processor cadence;
   - 10-minute claim lease;
   - 5 attempts before dead-letter;
   - 30-day success retention;
   - 90-day failed/dead-letter retention.
9. **Source sync resync posture is locked**:
   - delta invalidation sets `NeedsResync=true`;
   - checkpoint is not advanced;
   - current Registry rows remain last-known-good;
   - incremental processing is blocked for that source until controlled resync.
10. **Retention is locked**:
    - inactive Registry rows: 90 days;
    - Runs: 180 days;
    - resolved Failures: 180 days.
11. **Operator/admin UI is deferred**. MVP retains backend admin endpoints, CLI/scripts, telemetry, and SharePoint operator lists.
12. **All storage access remains repository/adaptor-driven** so future Azure-native persistence can be reintroduced without changing UI contracts or domain logic.
13. **MyDashboard provisioning scripts are mandatory** and must follow the repo’s existing proven `scripts/provision-*` / verifier posture.

## Required Implementation Outcome

When implementation is complete:

- all seven MyDashboard SharePoint lists can be provisioned and verified deterministically;
- webhook ingestion writes Pending Work rows rather than Service Bus messages;
- timer processing drains Pending Work and executes delta-driven projection recompute;
- source sync, subscription state, runs, failures, and control leases persist in SharePoint lists;
- `GET /api/my-work/me/project-links` reads the Registry projection after cutover;
- rollback remains a config flip to `legacy`;
- stale and failure states are diagnostic, not silent;
- no unresolved architecture decisions remain in code or documentation.

## Package Structure

```text
.
├── README.md
├── PACKAGE_MANIFEST.md
├── 00_Closed_Decision_Register.md
├── 01_Revised_Target_Architecture.md
├── 02_SharePoint_MVP_Storage_And_Provisioning_Architecture.md
├── 03_SharePoint_List_Schemas_And_Field_Contracts.md
├── 04_Pending_Work_Debounce_And_Timer_Worker_Design.md
├── 05_Backend_Service_Redirection_Design.md
├── 06_Graph_Subscription_Delta_And_Resync_Design.md
├── 07_Seed_Rebuild_Cutover_And_Rollback_Plan.md
├── 08_Telemetry_Failure_Ledger_And_Operational_Runbooks.md
├── 09_Security_Permissions_And_Governance.md
├── 10_Validation_Acceptance_And_Test_Matrix.md
├── 11_Supersession_And_Code_Retirement_Plan.md
├── resources/
├── runbooks/
└── prompts/
```

## Prompt Execution Posture

Run the prompts in order unless a prompt explicitly allows parallel work. Prompts are written for a **fresh local agent session** and require the agent to:

- use live repo truth as authority;
- stop and report contradictions;
- avoid unrelated refactors;
- avoid re-reading files still in active context unless drift verification requires it;
- provide exact validation commands and closeout evidence;
- preserve production-grade copy and repo conventions.

## Success Decision

The implementation is complete only when:

- the architecture documents, descriptors, scripts, repositories, webhook, timer worker, and tests match this package;
- provisioning and verification succeed against the intended MyDashboard schema model;
- read-mode cutover readiness is evidenced;
- rollback instructions are executable;
- Azure Table / Service Bus are no longer represented as required active MVP dependencies.

## Current Closeout Status

Prompt 10 proof-gate results and Prompt 11 documentation closeout are tracked in:

- `resources/Prompt_10_Closeout_Evidence.md`
- `resources/Prompt_11_Closeout_Report.md`

Current gate decision remains controlled by hosted proof availability and authorized operator-lane execution results.

## Source Basis

This package is grounded in:

- repo truth observed after B05.13 Prompt 00–11 execution;
- the attached Adobe Sign SharePoint-cache target architecture as a pattern reference for SharePoint-backed read-model/cache storage and reconciliation posture;
- Microsoft Graph change notification, subscription, webhook validation, and delta guidance;
- Microsoft SharePoint large-list and throttling guidance.

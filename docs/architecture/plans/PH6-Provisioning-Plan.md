**Phase 6 Development Plan – Provisioning Modernization (MVP Critical – First Business-Value Delivery)**

**Version:** 1.0 (fully aligned with HB-Intel-Blueprint-V4.md §2i, §2j and all Option C decisions locked during the structured interview)  
**Purpose:** This document provides exhaustive, numbered, manual step-by-step instructions with complete copy-paste-ready code and file names for the entire provisioning workflow. It is designed so that any developer unfamiliar with the project can execute Phase 6 flawlessly and produce production-ready, comprehensively documented backend components. All decisions follow the comprehensive Option C choices we finalized (Durable Functions saga orchestrator, dual-store persistence, 7-step activity functions with compensation, SignalR communication, bifurcated execution with timer trigger, Accounting trigger + real-time checklist UI, and comprehensive error/rollback/retry/escalation with Admin dashboard). This plan incorporates the enhanced additional details (Azure Functions & Durable Functions setup, Security & Permissions, Monitoring & Observability, Testing Strategy, Performance & Timeout Considerations, and Legacy Code Mapping & Migration).

## Refined Blueprint Section for Phase 6 (Updated for Interview-Locked Decisions)

**Phase 6: Provisioning Modernization (MVP Critical – First Business-Value Delivery)**  
Modernize the entire SharePoint site provisioning workflow using the new Azure Functions backend (`provisioningSaga`, compensation logic, SignalR real-time updates, ProvisioningStatus persistence, bifurcated execution, rollback/retry/escalation). Integrate the Accounting trigger and the Estimating Project Setup page (real-time checklist).

**Locked Decisions (All Option C):**  
- Comprehensive Durable Functions saga orchestrator (7 atomic steps, automatic compensation, SignalR push, ProvisioningStatus persistence, bifurcated execution, rollback/retry/escalation, Accounting trigger integration).  
- Comprehensive ProvisioningStatus dual-store persistence (SharePoint list for UI + Azure Table for atomic durability, transactional helper, SignalR integration).  
- Comprehensive 7-step activity functions with explicit ordering, PnPjs/Graph best practices, per-step compensation, and full JSDoc.  
- Comprehensive Accounting trigger and real-time checklist UI (automatic redirect, SignalR-powered layman-friendly checklist with progress bar, retry/escalation buttons).  
- Comprehensive SignalR communication (targeted groups, SPFx authentication, automatic reconnection, typed payload, client-side hook).  
- Comprehensive bifurcated execution with Durable Functions timer trigger at 1:00 AM EST and cross-phase state management.  
- Comprehensive error handling with typed errors, automatic compensation, UI retry/escalation buttons, and full Admin “Provisioning Failures” dashboard.

**Additional Enhancements (All Option C):**  
- Comprehensive Azure Functions & Durable Functions setup (pinned extension, full `host.json` with task hubs and timeouts, managed identity, GitHub Actions deployment).  
- Comprehensive Security & Permissions (granular per-step least-privilege, on-behalf-of flow, exact Azure AD registration, runbook).  
- Comprehensive Monitoring & Observability (Application Insights with custom metrics, correlation IDs, alerts, Admin dashboard integration, observability runbook).  
- Comprehensive Testing Strategy (unit, integration, end-to-end Playwright, chaos testing, CI enforcement).  
- Comprehensive Performance & Timeout Considerations (intelligent throttling/batching, bifurcation optimizations, metrics, production runbook).  
- Comprehensive Legacy Code Mapping & Migration (detailed file references, phased rollout with feature flags, risk mitigation, onboarding guide).

**Success Criteria:** Accounting Manager can click “Save + Provision Site” and see live, layman-friendly progress on the Estimating page with zero data loss.  
**Deliverables:** Production-ready provisioning (highest-priority MVP feature).

## Exhaustive Step-by-Step Implementation Instructions

### 6.1 backend/functions Package

1. From the monorepo root, navigate to the backend folder and ensure the structure exists:  
   ```bash
   cd backend/functions
   ```

2. Update `host.json` with the comprehensive configuration (pinned Durable extension, task hub, timeouts):  
   ```json
   {
     "version": "2.0",
     "extensions": {
       "durableTask": {
         "hubName": "ProvisioningHub",
         "storageProvider": { "type": "azureStorage" }
       },
       "signalR": { "connectionStringSetting": "AzureSignalRConnectionString" }
     },
     "functionTimeout": "00:10:00"
   }
   ```

3. Update `local.settings.json` for dev-harness testing (add SignalR and storage settings).

4. Create the comprehensive saga orchestrator files:  
   - `provisioningSaga/Orchestrator.cs` (or TypeScript equivalent for Node.js runtime)  
   - Seven Activity functions (e.g., `CreateBasicSiteActivity.cs`, `ProvisionListsActivity.cs`, etc.)  
   - Compensation activities (one per step)  
   - Timer trigger for bifurcated full-spec (`TimerFullSpec.cs`)  

   **Exact example for the Orchestrator (simplified for clarity):**  
   ```ts
   /**
    * Durable Orchestrator – controls the 7-step saga with automatic compensation.
    */
   export async function provisioningOrchestrator(context: any) {
     const projectCode = context.input.projectCode;
     try {
       await context.callActivity("CreateBasicSite", projectCode);
       // ... call remaining 6 activities sequentially
       context.setCustomStatus({ status: "Completed" });
     } catch (err) {
       await context.callSubOrchestrator("CompensationOrchestrator", err);
       throw err;
     }
   }
   ```

5. Implement the dual-store persistence helper in `ProvisioningStatusHelper.ts` (transactional writes to SharePoint list + Azure Table).

6. Implement the comprehensive SignalR hub (`ProvisioningHub.cs`) with targeted groups and output binding.

7. Update the Accounting webpart trigger (in the existing Accounting SPFx webpart) to call the saga endpoint and auto-redirect to the Estimating page.

8. Create the Estimating Project Setup page checklist component (real-time SignalR hook, layman-friendly UI with progress bar, retry/escalation buttons).

9. Create the Admin “Provisioning Failures” dashboard (guided cards, one-click actions, audit trail).

10. Run the build and verify:  
    ```bash
    cd backend/functions
    func start
    ```
    Expected output: Orchestrator starts, timer trigger fires, SignalR updates appear in dev-harness.

11. Add documentation (as decided in Option C):  
    - One markdown file per major feature in `docs/reference/provisioning/`.  
    - Create ADR `docs/architecture/adr/0011-provisioning-saga.md`.  
    - Update `docs/how-to/developer/phase-6-provisioning-guide.md` (full migration mapping table, runbooks, checklists).

## Verification & Phase Completion
1. In the dev-harness, set `HBC_ADAPTER_MODE=proxy` and trigger from the Accounting preview.  
2. Confirm:  
   - Automatic redirect to Estimating page.  
   - Live, layman-friendly checklist updates via SignalR (no polling).  
   - Automatic compensation on simulated failure.  
   - Retry/escalation buttons work; Admin dashboard receives full context.  
   - Bifurcated timer fires correctly at 1:00 AM EST simulation.  
3. Success Criteria Checklist:  
   - Accounting Manager sees instant live progress with zero data loss.  
   - Rollback/retry/escalation fully functional.  
   - Legacy mappings verified with side-by-side testing.  
   - Performance: Initial response <10 seconds; throttling prevented.  
4. Incremental Migration: Follow phased steps (Accounting trigger first); use feature flags; rollback via git.
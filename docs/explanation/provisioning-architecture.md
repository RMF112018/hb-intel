# Provisioning Architecture — How It Works

**Traceability:** D-PH6-16

## Overview
The Phase 6 provisioning system automates the creation and configuration of SharePoint project sites. When a new construction project is approved, the system automatically creates the site, sets up document libraries and data lists, installs the HB Intel web parts, sets the correct permissions for every team member, and connects the site to the HB Intel hub. The entire process takes approximately 5–10 minutes for steps 1–4 and 6–7; step 5 (web parts) may run at 1:00 AM EST if it cannot complete in the initial window.

## Why a Class-Based Saga Orchestrator?
The provisioning workflow must be transactional: if step 3 fails, steps 1 and 2 must be rolled back (compensation). Azure Durable Functions would add significant operational complexity (new SDK surface area, separate storage, debugging challenges). A class-based `SagaOrchestrator` running inside a regular Azure Function achieves the same durability through Azure Table Storage checkpointing with none of the overhead. Every step writes its completion status before moving to the next step, making the entire saga resumable from any point.

## Why Two Identifiers?
`projectId` is a UUID v4 generated the moment the Estimating Coordinator submits a Project Setup Request. It never changes and is never shown to end users. It is used as the primary database key and in all internal system references. `projectNumber` (format: `##-###-##`) is entered by the Controller after the project is registered in Sage Intacct and Procore. It appears in SharePoint site URLs and titles because it is the canonical business reference number. Separating these two concerns eliminates the `projectCode` ambiguity that existed in Phase 5.

## Why Azure Table Storage + SharePoint Audit Log?
Azure Table Storage provides fast, cheap, structured persistence for every step state change during the provisioning run. It is the system of record for the saga. SharePoint's `ProvisioningAuditLog` list provides a human-readable, business-accessible audit trail of lifecycle events (Started, Completed, Failed) stored directly in the platform where project sites live. Writing to both stores gives operations staff a place to look without needing database access.

## How Real-Time Progress Works
When the saga begins, the front-end calls the `/api/provisioning-negotiate` endpoint with a Bearer token and `?projectId=`. The negotiate endpoint validates the token, determines which SignalR groups the user belongs to (`provisioning-{projectId}` for all project members; `provisioning-admin` for admins), and returns a connection token. The SignalR client connects and listens for `provisioningProgress` events. Each time a step completes or fails, the saga pushes a `IProvisioningProgressEvent` to the per-project group and to `provisioning-admin`. When the saga reaches a terminal state (Completed or Failed), the per-project group is closed.

## The Step 5 Problem
Installing SPFx web parts requires an App Catalog deployment and site-level installation that can take 30–180 seconds depending on SharePoint service load. This is too slow and too unpredictable to block the entire saga. The solution is a split approach: attempt step 5 immediately with a 90-second timeout and 2 retries. If it succeeds, great. If not, the saga records `step5DeferredToTimer`, sets overall status to `WebPartsPending`, and continues to steps 6 and 7. The 1:00 AM EST timer trigger picks up all `WebPartsPending` jobs and retries step 5 when SharePoint service load is minimal.

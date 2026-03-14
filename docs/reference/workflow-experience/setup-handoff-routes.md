# Project Setup Handoff Routes

> **Doc Classification:** Canonical Normative Plan — defines the canonical handoff contract for the Estimating → Project Hub transition after project setup completion.

**Source Task:** W0-G3-T02 — Ownership, Next Action, and Handoff Contract
**Package:** `@hbc/provisioning` → `src/handoff-config.ts`
**Consumers:** Estimating requester surface, provisioning status page, future Project Hub module

---

## Handoff Route: Project Setup → Project Hub

| Field | Value |
|-------|-------|
| `sourceModule` | `'estimating'` |
| `sourceRecordType` | `'project-setup-request'` |
| `destinationModule` | `'project-hub'` |
| `destinationRecordType` | `'project-record'` |
| `routeLabel` | `'Project Setup → Project Hub'` |

---

## Pre-flight Validation Rules

All four checks must pass before the handoff package is assembled. Failures return specific messages, not generic "not ready" errors.

| Check | Condition | Failure Message |
|-------|-----------|-----------------|
| Lifecycle complete | `state === 'Completed'` | "Project setup must be fully completed before handing off to Project Hub." |
| Site URL available | `siteUrl` is set and non-empty | "Provisioned site URL is not yet available. Wait for provisioning to complete." |
| Department set | `department` is set | "Department is not set on this request. Contact your administrator." |
| Project lead assigned | `projectLeadId` is set | "Project lead is not assigned. Update the project team before handoff." |

`validateSetupHandoffReadiness(request)` is exported from `@hbc/provisioning` for direct use in tests and consuming surfaces.

---

## Seed Data Mapping

Fields carried from `IProjectSetupRequest` to the Project Hub destination record:

| Seed Field | Source Field | Required |
|------------|-------------|----------|
| `projectName` | `request.projectName` | Yes |
| `projectNumber` | `request.projectNumber` | Yes (set by controller) |
| `department` | `request.department` | Yes |
| `siteUrl` | `request.siteUrl` | Yes |
| `projectLeadId` | `request.projectLeadId` | Yes |
| `groupMembers` | `request.groupMembers` | Yes |
| `startDate` | `request.startDate` | No |
| `estimatedValue` | `request.estimatedValue` | No |
| `clientName` | `request.clientName` | No |

The `IProjectHubSeedData` interface is exported from `@hbc/provisioning` as the typed seed shape.

---

## Recipient Resolution

The handoff recipient is the Project Lead (`request.projectLeadId`). If `projectLeadId` is not set, `resolveRecipient` returns `null` — the sender picks manually in the Composer Step 3.

---

## Wave 0 vs. Wave 1 Boundary

| Capability | Wave 0 Status | Wave 1 Action |
|-----------|---------------|---------------|
| Handoff lifecycle (draft → sent → received → acknowledged) | Fully operational | — |
| Pre-flight validation | Fully operational | — |
| Seed data mapping | Fully operational | — |
| Recipient resolution | Fully operational | — |
| `onAcknowledged` (create Project Hub record) | **No-op / log seam** | Implement `ProjectHubApi.createProject()` |
| `onRejected` (return to coordinator review) | **No-op / log seam** | Implement `ProjectSetupApi.returnToCoordinatorReview()` |
| Document attachment | Returns `[]` | Extend to include getting-started page or template files |

The handoff structure is correct now. Wave 1 only needs to implement the callback bodies.

---

## BIC ↔ Handoff Boundary

| Concern | Owned By |
|---------|----------|
| In-lifecycle ownership (Draft → Completed/Failed) | `@hbc/bic-next-move` via `PROJECT_SETUP_BIC_CONFIG` |
| Expected action strings | `@hbc/bic-next-move` via `resolveExpectedAction()` |
| Cross-module transition (post-completion) | `@hbc/workflow-handoff` via `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` |
| Pre-flight validation | `@hbc/workflow-handoff` via `validateReadiness()` |
| Destination record creation | `@hbc/workflow-handoff` via `onAcknowledged()` (Wave 1) |
| Rejection return-to-review | `@hbc/workflow-handoff` via `onRejected()` (Wave 1) |

These packages operate sequentially, not concurrently. Their responsibilities do not overlap.

---

## Deviations from Spec

- **`siteLaunch?.siteUrl` vs. `siteUrl`:** The spec references `request.siteLaunch?.siteUrl` (nested object). The model stores `siteUrl` directly on `IProjectSetupRequest`. Validation and mapping use `request.siteUrl`.
- **`projectLeadName`:** The spec uses `request.projectLeadName` for recipient display name. The model does not have this field. The recipient uses a static `'Project Lead'` display name — surface-level resolution can enrich this at render time.
- **`onAcknowledged` / `onRejected`:** Implemented as no-op log seams in Wave 0 with clear TODO markers for Wave 1.

---

*End of setup-handoff-routes.md — W0-G3-T02*

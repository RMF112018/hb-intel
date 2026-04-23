# 00 — Backend Audit Summary

## Objective
Determine what the current `backend/functions/` Azure Functions application requires to become a production-ready, secure, observable, resilient, maintainable backend for HB Intel, with specific focus on:
- the current Safety ingestion blocker,
- the Graph-only cutover target,
- staging/test broad-Graph stabilization versus pre-rollout tightening,
- and adoption of the updated workbook parse contract.

## Framing
This audit used:
- repo truth from the `main` branch,
- current Microsoft/Azure/Graph guidance,
- user-provided live operational evidence,
- the uploaded app-registration artifact,
- and direct inspection of the uploaded workbook.

The uploaded audit prompt established the target explicitly: this is a production-readiness and cutover audit, not a generic backend review.

## Current-state judgment
The backend is **partially hardened but not production ready**.

### What is solid enough to preserve
- Azure Functions v4-style code-centric registration posture and scoped host composition.
- Lazy JWT identity configuration with explicit production failure when `AZURE_TENANT_ID` or `API_AUDIENCE` are absent.
- Structured request/auth/handler telemetry and explicit request-id propagation.
- Fail-closed validation of authoritative Safety/HBCentral site targets and required reference lists before mutation attempts.
- Recovery from the earlier route-registration problem: the Safety routes now live under the admin-control-plane host composition rather than being assumed to come from the monolithic host.

### What is directionally correct but incomplete
- Managed-identity-backed control-plane access.
- Centralized service-factory and adapter-mode guard posture.
- Safety provisioning dry-run design and bounded diagnostics.
- GUID-overlay discipline for SharePoint list descriptors.
- Existing durable/admin observability foundations.

### What is structurally weak
- The Safety ingestion data plane still pivots into a SharePoint REST repository rather than a unified Graph-backed repository.
- The Safety repository performs operational reads/writes with a separate auth/data-plane seam than the provisioning/control-plane path.
- The parser still assumes the legacy visible-sheet contract even though the workbook now supplies a stronger parse-first contract.
- Authorization for Safety ingestion is under-modeled: it requires delegated scope but not a dedicated writer/admin policy boundary.
- There is no first-class preview/validation-before-commit ingestion contract even though the workbook now supports it and the risk profile justifies it.

## Core blocker diagnosis
Provisioning dry-run succeeds because it stays on the working control-plane seam: managed identity, PnP/SharePoint service validation, and bounded site/list checks. Ingestion fails because it instantiates `SharePointSafetyInspectionRepository` and immediately performs a SharePoint REST app-only read of `Safety Reporting Periods`. That read is the first failing data-plane hop, matching the observed `Fetch item 1 from Safety Reporting Periods failed (401)` condition. This is not a route-registration issue and not primarily a workbook-parsing issue; it is a repository/auth/data-plane issue.

## Direction of record
The Graph-only cutover is justified and should become the backend direction of record. It is not just a convenience refactor. It directly addresses:
- the current failing data-plane/auth seam,
- the user’s desire to eliminate split outbound permission models,
- and the maintainability risk of carrying both Graph and SharePoint REST/PnP operational lanes long-term.

## Workbook judgment
The uploaded workbook materially changes the design space. It now contains:
- a hidden `ParserMeta` sheet,
- explicit template and parser-contract version markers,
- parser-focused named ranges,
- validation on inspection date and inspection number,
- and a stronger key-findings parse seam.

The current parser stack does not use those seams. That gap is real and should be closed.

## Final recommendation
Do not treat the current backend as rollout-ready. Execute a two-wave remediation:
- **Wave 1:** unblock Safety ingestion and adopt parse-first workbook authority.
- **Wave 2:** complete Graph-only cutover, tighten permissions, and harden observability/release posture to true production standard.

## External guidance used
- Azure Functions Node.js developer guide (Functions v4 / `@azure/functions` v4, flexible code-centric registration).
- Azure Functions host.json reference.
- Azure Functions Flex Consumption guidance.
- Azure App Service / Azure Functions managed identity guidance.
- Azure Functions + OpenTelemetry / Application Insights guidance.
- Microsoft Graph SharePoint sites, lists, list items, file upload, throttling, and selected-permissions guidance.

## Repo-truth basis
- `backend/functions/src/hosts/admin-control-plane/index.ts`
- `backend/functions/src/functions/adminApi/index.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- related auth/config/runtime seams in `backend/functions/src/middleware/**`, `backend/functions/src/utils/**`, and `backend/functions/src/hosts/admin-control-plane/service-factory.ts`

## Uploaded artifacts incorporated
- Audit objective prompt uploaded in-session.
- `Safety_Checklist_Template.xlsx` inspected locally.
- `HB SharePoint Creator.json` inspected locally.


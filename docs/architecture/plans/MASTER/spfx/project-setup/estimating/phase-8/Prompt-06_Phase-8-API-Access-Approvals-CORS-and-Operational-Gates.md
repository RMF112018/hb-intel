# Prompt-06 — Phase 8 API-Access Approvals, CORS, and Operational Gates

## Objective

Convert known external prerequisites into explicit, auditable production gates so the solution cannot be mistaken for deployment-ready while API-access approvals, CORS configuration, and related operator-executed prerequisites remain incomplete.

## Context

The following are not yet done:
- SharePoint API-access approvals are not yet granted
- CORS origins are not configured
- production site/app permission grants are still external operational work

The repo must represent these facts clearly and enforce them where practical.

## Required Working Rules

- Do not attempt to “simulate” approvals or claim they are completed.
- Distinguish code-complete from operator-executed prerequisites.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Prefer hard release-gate language over soft TODO wording.

## Tasks

### 1. Audit current operator-executed prerequisites
Identify all external prerequisites that must be completed by tenant/admin operators, including at minimum:
- SharePoint API-access approvals for the SPFx package
- Entra/API audience configuration and consent posture
- Function App CORS origins
- SharePoint/Graph site permission grants
- any app catalog or site-app installation prerequisites that remain external

### 2. Implement explicit release-gate treatment
Where appropriate, add or strengthen:
- release-readiness checklists
- deployment docs
- config validation messages
- admin-facing diagnostics
- warning/error language in code comments and reports

The goal is to make incomplete operator actions impossible to mistake for “code defect fixed.”

### 3. Document exact CORS expectations
Based on repo truth and current architecture, document:
- which origins must be allowed
- which host surfaces call the Function App cross-origin
- any same-origin exceptions
- any environment-specific differences

If infra-as-code exists for this area, update it. If it does not exist, document the gap explicitly and provide the correct target configuration.

### 4. Document exact API-access approval expectations
Document:
- what API permissions the SPFx solution requires
- where those approvals must be granted
- what runtime symptoms occur when approvals are missing
- how the app should present or log those failures

## Deliverables

### Code / Repo Deliverables
- any justified diagnostics, readiness checks, or infra/config changes
- updated release documentation and operational gate treatment

### Documentation Deliverables
Update the Phase 8 report with:
- external prerequisite inventory
- release-gate changes implemented
- exact CORS and approval expectations
- files changed
- closure statement for Prompt-06
- carry-forward items for Prompt-07+

## Completion Standard

This prompt is complete only when the repo makes a sharp distinction between “implemented in code” and “still blocked on tenant/operator action.”

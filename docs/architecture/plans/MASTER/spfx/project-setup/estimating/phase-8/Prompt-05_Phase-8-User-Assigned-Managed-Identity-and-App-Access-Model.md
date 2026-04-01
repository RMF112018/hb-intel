# Prompt-05 — Phase 8 User-Assigned Managed Identity and App-Access Model

## Objective

Align the backend’s production identity posture to a user-assigned managed identity model and reconcile SharePoint/Graph access assumptions, code comments, validation, and deployment docs to that requirement.

## Context

Production deployment requires a user-assigned managed identity before go-live. Current repo truth uses managed identity patterns, but Phase 8 must ensure the implementation and documentation are correctly aligned to the user-assigned model rather than an ambiguous or system-assigned default posture.

## Required Working Rules

- Do not fake tenant configuration completion in code.
- Use repo truth to determine where identity assumptions currently live.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Prefer least privilege and explicitness.

## Tasks

### 1. Audit current managed identity assumptions
Identify where the repo currently assumes or implies:
- system-assigned identity
- user-assigned identity
- generic `DefaultAzureCredential` behavior with no explicit production guidance
- ambiguous use of `AZURE_CLIENT_ID`

Map all relevant code, comments, config examples, and deployment docs.

### 2. Implement the user-assigned production posture
Where appropriate:
- update config docs and examples so production clearly expects user-assigned identity
- update comments and operational guidance accordingly
- ensure any credential instantiation patterns remain compatible with user-assigned identity selection in Azure-hosted deployment

Do not break valid local-dev behavior.

### 3. Reconcile SharePoint and Graph app-access assumptions
Audit and document the exact expected grants for:
- SharePoint site/app access
- Graph group-management operations
- Sites.Selected or equivalent site-scoped access model
- any permission-confirmation env gates

Tighten wording and validation so the production path is unambiguous.

### 4. Reduce dangerous ambiguity
If `AZURE_CLIENT_ID` or related identity variables are overloaded across local dev and production posture, improve the clarity without destabilizing the app.

## Deliverables

### Code / Repo Deliverables
- any needed identity-related code or config clarifications
- improved validation/messages if warranted
- updated examples and docs aligned to user-assigned identity production posture

### Documentation Deliverables
Update the Phase 8 report with:
- current identity posture findings
- user-assigned identity alignment changes
- exact external grant prerequisites
- files changed
- closure statement for Prompt-05
- carry-forward items for Prompt-06+

## Completion Standard

This prompt is complete only when the repo’s production identity story clearly and consistently reflects user-assigned managed identity as the required go-live model.

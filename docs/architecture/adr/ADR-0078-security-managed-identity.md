# ADR-0062: API Security — Bearer Token Validation + Managed Identity

**Status:** Accepted
**Date:** 2026-03-07

## Context
All HTTP endpoints in the initial Phase 6 scaffold used authLevel: 'anonymous'.
A production system handling SharePoint site creation cannot have unauthenticated endpoints.

## Decision
All HTTP endpoints validate an Entra ID Bearer token via the `validateToken` middleware
(using the `jose` library). The `triggeredBy` / `submittedBy` fields are always overwritten
with the identity from the validated token — never trusted from the request body.

All SharePoint and Graph API calls use the Function App's system-assigned Managed Identity
(`DefaultAzureCredential`). No client secrets are used for SharePoint access in production.

The timer trigger uses Managed Identity only, with no user context.

## Consequences
Developers must configure a local service principal in `local.settings.json` (gitignored).
`Sites.FullControl.All` is a high-privilege Graph permission — scoping to specific site
collections should be evaluated in a future phase.

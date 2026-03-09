# ADR-0062: Bearer Token Auth + Managed Identity for SharePoint

- **Status:** Accepted
- **Date:** 2026-03-07
- **Traceability:** D-PH6-16
- **Deciders:** HB Intel Architecture Working Group

## Context
Phase 6 provisioning requires secure HTTP endpoints and privileged SharePoint operations without embedded credentials. Anonymous endpoints and secret-based runtime identities are not acceptable for production operations.

## Decision
- Require Bearer token validation for provisioning HTTP endpoints.
- Use Azure Managed Identity for backend SharePoint/Graph operations.
- Enforce production configuration with `HBC_ADAPTER_MODE=real` and real tenant resources.

SignalR negotiate and provisioning control endpoints validate audience/issuer and reject invalid or missing tokens.

## Consequences
- Eliminates anonymous access path in provisioning production flows.
- Removes dependency on long-lived embedded credentials for backend operations.
- Supports audited, policy-compliant access through Entra and Azure identity controls.

## Alternatives Considered
- Function key only auth: rejected due to weak user-level authorization semantics.
- Client secret in app settings as primary runtime identity: rejected due to rotation burden and security posture.

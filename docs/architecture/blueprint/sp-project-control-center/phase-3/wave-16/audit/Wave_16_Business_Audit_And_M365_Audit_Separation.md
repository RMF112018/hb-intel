# Wave 16 Business Audit And M365 Audit Separation

## Purpose

Define the Wave 16 audit posture that distinguishes PCC business audit events from Microsoft 365 compliance/security audit sources.

## Business Audit Event Contract

Wave 16 business audit events should capture at least:

- view attempt
- restricted view attempt
- redacted view attempt
- draft request created
- request submitted
- approval routed
- approval received
- rejection received
- validation failed
- override activated
- override expired
- unauthorized attempt
- HBI refusal
- admin verification requested

## Separation of Concerns

- PCC business audit: workflow intent, setting lifecycle, approvals, validation, and user-facing governance actions.
- Microsoft 365/Purview/Entra audit: tenant-level compliance, identity/security telemetry, and platform controls.
- Cross-reference is allowed, ownership is not merged.

## Evidence and Traceability

- Keep correlation keys between change requests, validation events, and audit events.
- Preserve source lineage for cited/derived actions.
- Maintain append-oriented history for reviewability.

## Redaction and Disclosure Guardrails

- Audit payloads must be redaction-safe.
- No secret-bearing fields in business audit records.
- Restricted data views must log policy-governed outcomes without exposing restricted content.

## Implementation Boundary

This document defines documentation governance only and does not authorize runtime execution changes.

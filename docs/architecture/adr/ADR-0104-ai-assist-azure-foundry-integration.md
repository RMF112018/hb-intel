# ADR-0104 — AI Assist Azure Foundry Integration Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-15 referenced ADR-0024. Canonical ADR number for SF15 is ADR-0104.

## Context

AI support in construction workflows is typically externalized, losing context and violating enterprise governance boundaries.

## Decisions

### D-01 — Named Action Model and Unified Canvas Entry
Use contextual named actions registered by extension-point APIs and surfaced through a single Project Canvas toolbar entry.

### D-02 — Tenant Boundary
Route model execution through Azure AI Foundry via backend proxy.

### D-03 — Smart Insert Acceptance Architecture
Use inline Smart Insert overlay for per-field/apply-all acceptance with live diff and versioned commit.

### D-04 — Trust Transparency Model
Require progressive Trust Meter disclosures from `confidenceDetails` by complexity tier.

### D-05 — Access, Policy, and Discovery Controls
Filter actions by role/tier, apply policy overrides, and rank with relevance signals.

### D-06 — Sensitive Field Exclusion
Exclude sensitive fields in both client and server paths.

### D-07 — Governance and Audit
Persist every invocation as `IAiAuditRecord` and provide admin-only AI Governance Portal for analytics/policy/transparency.

### D-08 — Streaming + Cancel
Support true inline stream-capable invocation with immediate cancel hard-stop.

### D-09 — Multi-Model Registry and Integrations
Resolve logical model keys via tenant-governed `AiModelRegistry`; integrate with project-canvas, auth, versioned-record, notifications, handoff, and annotations.

### D-10 — Built-In Action Delivery + Research Mandate
Ship six curated built-in actions on refined contracts and enforce mandatory Azure AI Foundry research before planning/implementation.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.

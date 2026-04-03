# Phase 4 Addendum — Managed App Binding Audit and Evidence

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Make explicit that Phase 4's durable audit/evidence model must account for binding publication, drift, and repair events.

---

## 1. Context

Phase 4 established durable run persistence, audit spine, evidence model, and retrieval APIs. The target architecture already lists a "Binding Store" alongside the Run Store and Audit Store, but the Phase 4 docs themselves do not mention binding. Phase 6A requires binding-specific audit events and evidence references. This addendum identifies the binding audit concerns that Phase 6A will add, consistent with Phase 4 patterns.

---

## 2. What Phase 4 already established (confirmed repo fact)

- `DurableAdminRunStore` — run lifecycle persistence using Azure Tables.
- `DurableAdminAuditStore` — audit event persistence with `IAdminAuditRecord` and `AdminAuditEventType`.
- `DurableAdminEvidenceStore` — evidence capture with `IAdminEvidenceReference` and structured evidence payloads.
- The evidence and retention boundaries (`admin-spfx-phase-4-evidence-and-retention-boundaries.md`) define what is retained, for how long, and in what form.
- The retrieval API contract (`admin-spfx-phase-4-retrieval-api-contract.md`) defines query patterns for runs, audits, and evidence.
- The persistence boundary matrix (`admin-spfx-phase-4-persistence-boundary-matrix.md`) maps persistence responsibilities.

---

## 3. What this addendum makes explicit (new architectural reconciliation)

### Binding publication events

When a binding record is created or updated, Phase 6A must persist an audit event including:

- The target app identifier
- The published binding payload (field values)
- The source of the publication (install run, manual repair, etc.)
- The binding version
- Operator identity

### Binding drift events

When a verification check detects a mismatch between the published binding and the live environment state, Phase 6A must persist an audit event including:

- The target app identifier
- The expected binding values
- The observed environment values
- The specific fields that drifted
- The drift detection timestamp

### Binding repair events

When a binding is repaired or re-published after drift or failure, Phase 6A must persist an audit event including:

- The target app identifier
- The prior binding snapshot
- The new binding payload
- The repair action type (operator-initiated, automated, etc.)
- Operator identity

### Evidence references for published binding payloads

Binding events must carry evidence references following the `IAdminEvidenceReference` pattern. Evidence payloads should include:

- The complete published binding payload at the time of the event
- Verification check results when applicable
- Drift comparison details when applicable
- The prior binding snapshot for repair events

### Consistency with Phase 4 infrastructure

- Binding audit events use the same `DurableAdminAuditStore` — no separate audit infrastructure needed.
- Binding evidence uses the same `DurableAdminEvidenceStore` — no separate evidence infrastructure needed.
- Binding records themselves may use a dedicated partition or table within the same Azure Tables infrastructure, following the persistence boundary matrix pattern.

---

## 4. Relationship to later phases

- **Phase 6A** implements the binding-specific audit event types, evidence payloads, and store operations.
- **Phase 10** may extend the audit/evidence model for broader configuration governance without replacing the binding-specific audit patterns.

---

## 5. Cross-references

| Document | Relevance |
|----------|-----------|
| `admin-spfx-phase-4-evidence-and-retention-boundaries.md` | Evidence model that binding evidence extends |
| `admin-spfx-phase-4-retrieval-api-contract.md` | Retrieval API pattern that binding queries follow |
| `admin-spfx-phase-4-persistence-boundary-matrix.md` | Persistence boundary that binding store fits within |
| `admin-spfx-phase-4-run-audit-evidence-baseline.md` | Baseline audit/evidence model |
| `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md` | Central reconciliation note |

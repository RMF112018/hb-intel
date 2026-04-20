# P3-E7-T01 — Product Shape, Scope, and Doctrine

**Doc ID:** P3-E7-T01
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 1 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Module Purpose

The Permits Module provides HB Intel with a **governed, auditable record of every permit required for project delivery** — from the moment an application is prepared through final permit closeout. It gives the project team and executives a single source of truth for:

- What permits are required and their current lifecycle state
- Whether all required inspections have been completed and passed
- What open deficiencies exist and who is responsible for resolving them
- Whether permit expiration is at risk
- Which permits are blocking downstream construction activity

The module does not replace jurisdiction systems. It maintains the project-side record of permit status, actions taken, inspection outcomes, and compliance health. It is the operative surface for permit-driven work queue items and compliance health publication.

---

## 2. What This Module Is Not

| Out of scope | Rationale |
|---|---|
| Jurisdiction permit management portal | HB Intel holds the project-side record only |
| Document management for permit drawings | `PermitEvidenceRecord` holds references/links, not the document management system |
| Direct permit application submission | Future integration path only; Phase 3 is record-keeping + workflow |
| Financial cost allocation for permit fees | Permit fees are referenced; allocation lives in P3-E4 Financial Module |
| Scheduling integration (critical path links) | Cross-link via `@hbc/related-items`; scheduling logic lives in P3-E5/E6 |

---

## 3. Multi-Record Architecture Principle

The prior single-record `IPermit` model collapsed all permit concern into one flat document. This created three structural deficiencies:

1. **No lifecycle auditability** — status changes overwrote prior state; no action record existed
2. **No first-class deficiency tracking** — issues were nested arrays with no identity, no assignment, no resolution workflow
3. **No compliance derivation** — a manual `complianceScore: number` substituted for derived health logic

The new architecture replaces this with **seven first-class record families**, each with its own identity, provenance, lifecycle, and responsibility model. See T02 for full record definitions.

---

## 4. Permit Thread Model

A single regulatory package may require multiple related permits (e.g., a master building permit with subpermits for electrical, mechanical, and plumbing; a phased release permit tied to the master). The thread model captures these relationships.

### 4.1 Thread Root and Children

Every permit thread has exactly one **thread root** — the master or primary permit for a regulatory scope. All other permits in the thread are **children** of that root or of another child in the thread.

```typescript
// On IssuedPermit
threadRootPermitId: string | null;      // null if this IS the root
parentPermitId: string | null;          // immediate parent; null if root
threadRelationshipType: PermitThreadRelationship;
```

### 4.2 Thread Relationship Types

```typescript
type PermitThreadRelationship =
  | 'THREAD_ROOT'         // Primary permit; no parent
  | 'SUBPERMIT'           // Jurisdiction-issued subpermit under master
  | 'PHASED_RELEASE'      // Phased release tied to master building permit
  | 'REVISION'            // Revision or amendment to parent permit
  | 'TEMPORARY_APPROVAL'  // Temporary certificate of occupancy or interim approval
  | 'CLOSEOUT_PATH'       // Closeout or final inspection permit branch
  | 'STANDALONE';         // Fully independent permit with no thread relationships
```

### 4.3 Thread Display Rules

- Thread root is always displayed first in the thread view
- Children are indented one level under their parent
- Thread health is the **worst child or root health** in the thread
- A blocked child permit propagates blocking status to the thread root's health spine entry
- `STANDALONE` permits do not appear in any thread view

---

## 5. Cross-Contract Positioning

| Cross-contract | Section | Relationship |
|---|---|---|
| P3-E1 Module Classification Matrix | §3.4 | Permits boundary and authority model |
| P3-E2 Source-of-Truth Action Boundary | §6 | What Permits owns as source of truth |
| P3-D1 Activity Spine | §N/A | Permits publishes lifecycle and inspection events |
| P3-D2 Health Spine | §N/A | Permits publishes permit health and compliance metrics |
| P3-D3 Work Queue | §13 | Permits publishes work queue items per T05 §3 |
| P3-D4 Related Items | §N/A | Permits links to schedule milestones, constraints, financial lines |
| P3-G1 Lane Capability Matrix | §4.4 | Permits lane capabilities in product surface |
| P3-G2 Permit Lane Detail | All | Per-lane interaction detail for Permits module |
| P3-G3 Cross-Lane Coherence | N/A | Permits cross-references with schedule and financial lanes |
| P3-H1 Acceptance Gate | §6.4 | Permits acceptance criteria (→ T08 for full gate) |

---

## 6. Shared Package Integration Summary

| Package | Role in Permits |
|---|---|
| `@hbc/related-items` | Links `IssuedPermit` to schedule milestones, constraints, financial lines |
| `@hbc/workflow-handoff` | Governs cross-party handoffs (e.g., GC to jurisdiction, inspector to PM) |
| `@hbc/acknowledgment` | Required for lifecycle actions that require a named party acknowledgment |
| `@hbc/field-annotations` | PER annotation layer on `IssuedPermit` and `InspectionVisit` records |
| `@hbc/versioned-record` | Audit trail on `IssuedPermit`; permits immutable lifecycle record |
| `@hbc/bic-next-move` | Surfaces next-action prompt for permit owner on each work queue item |

All six packages must be present and operational before Permits module goes to implementation. See T08 §1 for package blocker tracking.

---

## 7. Authority Model

### 7.1 Who May Mutate Permit Records

| Role | PermitApplication | IssuedPermit | InspectionVisit | InspectionDeficiency | PermitEvidenceRecord |
|---|---|---|---|---|---|
| Project Manager | Create, Update | Update (constrained fields) | Create, Update | Assign, Update | Create |
| Site Supervisor | Read | Read | Create, Update | Create, Update | Create |
| Executive (PER) | Read | Read + Annotate | Read + Annotate | Read | Read |
| System (derived) | — | Health, expiration | — | — | — |

### 7.2 Immutable Fields After Issuance

Once an `IssuedPermit` record is created, the following fields are immutable:

- `issuedPermitId`, `projectId`, `permitNumber`, `permitType`, `applicationDate`, `issuanceDate`

Immutability is enforced at the API layer. Status changes flow through `PermitLifecycleAction` records only — direct status mutation is rejected.

---

## 8. Compliance Health Doctrine

**No manual compliance score field exists in this module.**

Compliance health for each permit is **derived** from the following record truth signals:

1. `expirationDate` proximity → expiration risk tier (critical / at-risk / normal)
2. Open `InspectionDeficiency` records with `severity = HIGH` and `resolutionStatus ≠ RESOLVED`
3. `RequiredInspectionCheckpoint` records with `result = FAIL` and no subsequent PASS visit
4. `IssuedPermit.currentStatus` in a terminal-negative state (REJECTED, REVOKED, EXPIRED without renewal)
5. Active `PermitLifecycleAction` with `actionType = STOP_WORK` or `actionType = VIOLATION_ISSUED`

The derived health tier is: `CRITICAL | AT_RISK | NORMAL | CLOSED`.

Health is published to the health spine on every permit record update and on a daily expiration-proximity sweep. See T05 §2 for full health spine contract.

---

*[← Master Index](P3-E7-Permits-Module-Field-Specification.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T02 →](P3-E7-T02-Record-Architecture-and-Identity-Model.md)*

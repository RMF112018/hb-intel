# P1-A2: Source-of-Record Register

**Document ID:** P1-A2
**Phase:** 1 (Foundation)
**Classification:** Internal — Architecture
**Status:** Draft
**Date:** 2026-03-16
**References:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md), [package-relationship-map.md](../../blueprint/package-relationship-map.md)

---

## Purpose

Establish the authoritative source, read/write paths, and identity strategy for each HB Intel domain. This register is the operational handbook for adapter design: it tells developers where each domain's data lives, how to reach it safely, what identity key to use, and what class of write safety is required.

---

## Reading Guide

**Source of Record:** The authoritative system where the domain's business data originates and is stored.

**Adapter to Reach It:** The code path from AF (Azure Functions) to the source system, including middleware services (e.g., PnPjs for SharePoint).

**Identity Key:** The stable identifier for domain records across systems (e.g., SharePoint item ID, UPN, or composite).

**Write Safety Class:** The level of transactionality required:
- **Class A (Idempotent):** Safe to retry; duplicate creates return the existing record. Best for stateless CRUD.
- **Class B (Sequential):** Writes must be ordered; retries must check for prior success. Used when order or quantity matters.
- **Class C (Read-Mostly):** Writes rare, reads optimized. Used for reference data and user identity.
- **Class D (Audit-Only):** Append-only, never overwritten. Used for audit trails and immutable events.

**Phase Available:** The earliest phase in which this domain is available for use.

---

## Domain Source-of-Record Register

| Domain | Source of Record | Adapter to Reach It | Identity Key | Write Safety Class | Phase |
|--------|------------------|------------------|--------------|-------------------|-------|
| **leads** | SharePoint List on Sales/Business Development site | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | SharePoint numeric item ID (wrapped as `lead-{itemId}` for stability) | Class A | 1 |
| **project** | SharePoint Hub site + Project Metadata List on hub | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs hub site provision + (2) PnPjs list item CRUD | Project UUID (assigned during provisioning; maps to hub site ID) | Class A | 1 |
| **estimating** | SharePoint List on project site (Bid Items) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `123`; domain-scoped) | Class B | 1 |
| **schedule** | SharePoint List on project site (Milestones/Schedule) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `456`; domain-scoped) | Class A | 1 |
| **buyout** | SharePoint List on project site (Purchase Orders) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `789`; domain-scoped) | Class B | 1 |
| **compliance** | SharePoint List + Document Library on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs list.items for metadata + (2) PnPjs `web.getFolderByServerRelativePath().files.add()` | Numeric list item ID (metadata); doc URL for content | Class D | 1 |
| **contracts** | SharePoint Document Library + Contract Metadata List on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs `web.getFolderByServerRelativePath().files.add()` + (2) PnPjs metadata list item | Contract document URL or UUID; list item ID for metadata | Class A | 1 |
| **risk** | SharePoint List on project site (Risk Register) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `1001`; domain-scoped) | Class A | 1 |
| **scorecard** | SharePoint List on project site (Bid Scorecards) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `2001`; domain-scoped); linked to lead and project | Class A | 1 |
| **pmp** | SharePoint Document Library + PMP Index List on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs `web.getFolderByServerRelativePath().files.add()` + (2) PnPjs list item for index | PMP document URL; list item ID for metadata | Class A | 1 |
| **auth** | Microsoft Graph / Entra ID (read-only) | MSAL OBO flow → AF v4 → `@azure/identity` + `@microsoft/microsoft-graph-client` → Graph `/me`, `/users/{id}`, `/groups/{id}` | User Principal Name (UPN); object ID for groups | Class C | 1 |

### Operational State and Audit

| Data | Source of Record | Adapter to Reach It | Identity Key | Write Safety Class | Phase |
|------|------------------|------------------|--------------|-------------------|-------|
| **Provisioning state** | Azure Table Storage (partition key: `{projectId}`, row key: `provisioning-{timestamp}`) | AF v4 → `@azure/data-tables` → orchestration service reads/writes status | Project UUID (provisioning key) | Class D | 1 |
| **Audit log** | Azure Table Storage (partition key: `audit-{domain}`, row key: timestamp + UPN, append-only) | AF v4 → `@azure/data-tables` → audit service appends on every write | Composite: domain + timestamp + UPN | Class D | 1 |
| **Project identity mapping** | Azure Table Storage (partition key: `project-identities`, row key: `{projectId}`) | AF v4 → `@azure/data-tables` → identity mapping cache | Project UUID | Class A | 1 |

---

## Identity Key Strategy

HB Intel uses a multi-layered identity approach to maintain stability across systems:

### Project Identity
- **Primary:** Project UUID (assigned by provisioning service during site creation)
- **Correlation:** Maps 1:1 to SharePoint Hub site ID and Table Storage partition key
- **Lifetime:** Immutable; created during Phase 1 provisioning, never reassigned or reused
- **Format:** RFC 4122 UUID v4 (stored as string in SharePoint list, Table Storage, and AF state)
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

### Domain Record Identity
- **SharePoint List-Scoped:** Each domain (estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp) stores records as SharePoint list items.
- **Numeric Item ID:** SharePoint assigns numeric IDs per list (e.g., 1, 2, 3, ...). These are scoped to the list and project site.
- **Stability Wrapping:** To prevent external dependencies on SharePoint internal ID assignment, AF wraps these as domain-prefixed keys:
  - `lead-{itemId}` → Lead from Sales list
  - `est-{itemId}` → Estimating item (bid)
  - `sch-{itemId}` → Schedule milestone
  - `buyout-{itemId}` → Purchase order
  - `comp-{itemId}` → Compliance record
  - `contract-{itemId}` → Contract metadata
  - `risk-{itemId}` → Risk register entry
  - `scorecard-{itemId}` → Scorecard record
  - `pmp-{itemId}` → PMP index entry
- **Client Presentation:** UI and API responses use domain-prefixed keys; internal SharePoint item ID is never exposed to clients.

### User Identity
- **Primary:** Azure Entra ID User Principal Name (UPN; e.g., `alice@contoso.com`)
- **Authority:** Microsoft Graph / Entra ID (read-only)
- **RBAC:** Roles are derived from Entra ID group membership (e.g., "ProjectManagers", "Safety", "Estimating")
- **Audit Trail:** All writes are attributed by UPN; no synthetic user IDs
- **Phase 1 Caching:** UPN + group membership cached in Table Storage or Redis for performance; cache is non-authoritative

### External System Identity (Phase 4+)
- **Procore:** Work order IDs, crew worker IDs, daily reports
- **Sage:** Cost codes, GL accounts, purchase requisition numbers
- **Autodesk:** Revit element IDs, sheet numbers, model revision hashes
- **Strategy:** Maintain a federated identity mapping table in Table Storage (partition key: `federated-identity`, row key: `{externalSystem}:{externalId}:{hbIntelDomainKey}`)

---

## Write Safety Classes Explained

### Class A: Idempotent
**Definition:** Write operations are stateless; retries are safe because duplicate operations return the existing record.

**Guarantees:**
- Creating the same lead twice returns the same record (no duplicate).
- Creating a project with the same UUID returns the existing project.
- Updating an estimating item idempotently (PUT, not PATCH) replaces the entire item.

**Best for:** Creates, full replacements, stateless updates.

**Domains in Class A:** leads, project, schedule, risk, scorecard, contracts (basic), pmp (basic)

**AF Pattern:**
```typescript
// Example: Create or return existing lead
const lead = await leadRepo.createOrGet({
  salesName: 'Acme Tower',
  leadId: 'lead-123' // generated client-side or returned from prior attempt
});
// If called twice, both calls return the same record.
```

### Class B: Sequential
**Definition:** Write order and quantity matter; retries must check whether the prior operation succeeded before retrying.

**Guarantees:**
- Adding 5 bid items in order creates them with quantities 1, 2, 3, 4, 5 (not duplicates).
- Updating a PO quantity requires checking the current quantity first (no blind increments).
- Retrying a failed write requires a lookup to confirm the prior attempt failed.

**Best for:** Quantity-sensitive operations, ordered inserts, bulk appends.

**Domains in Class B:** estimating (quantity-sensitive bid items), buyout (PO quantity, line items)

**AF Pattern:**
```typescript
// Example: Add an estimating item with quantity
const item = await estimatingRepo.add({
  description: 'Concrete pour',
  quantity: 500, // lineal feet
  projectId
});
// Retry: Must check if the item was already added (by looking up by description+projectId)
// before adding again.
```

### Class C: Read-Mostly
**Definition:** Writes are rare or non-existent; reads are optimized; consistency windows are wider.

**Guarantees:**
- User identity reads are cached (eventual consistency, <5 min TTL).
- Role lookups may lag by seconds.
- Reference data (enumerations, classifications) is static per project.

**Best for:** Identity, reference data, configuration.

**Domains in Class C:** auth

**AF Pattern:**
```typescript
// Example: User identity is cached
const user = await authRepo.getUser('alice@contoso.com');
// May return cached data from prior lookup; consistency window is 5 minutes.
```

### Class D: Audit-Only
**Definition:** Append-only; never updated, overwritten, or deleted. Immutable by design.

**Guarantees:**
- Audit logs are immutable; they record every write with timestamp, UPN, and change delta.
- Compliance records are closed and never modified.
- Provisioning state transitions are recorded as append-only events.

**Best for:** Audit trails, immutable events, forensics.

**Domains in Class D:** compliance (after closure), provisioning state, audit log

**AF Pattern:**
```typescript
// Example: Append an audit log entry (never update)
await auditRepo.append({
  domain: 'estimating',
  itemId: 'est-123',
  action: 'quantity_updated',
  oldValue: 100,
  newValue: 150,
  upn: 'alice@contoso.com',
  timestamp: new Date()
});
// This entry is immutable; it is never modified or deleted.
```

---

## Source Conflicts and Tie-Breaking

### Conflict Scenario 1: SharePoint List vs Cache Divergence
**Situation:** A budget item quantity is cached in Redis as 100, but the SharePoint list shows 150.
**Resolution:** SharePoint is authoritative. AF invalidates the cache and reads from SharePoint.
**Policy:** Cache is a performance layer; it is never authoritative.

### Conflict Scenario 2: Provisional vs Final State
**Situation:** Provisioning service marks a project as "ready" in Table Storage, but the SharePoint hub site has not finished provisioning.
**Resolution:** Table Storage (provisioning state) is the AF authority; clients are told "provisioning in progress" until SharePoint hub site is live.
**Policy:** Operational state (Table Storage) drives the UI; document storage (SharePoint) is eventual consistency.

### Conflict Scenario 3: User Identity vs Cached Role
**Situation:** User "alice@contoso.com" was added to the "ProjectManagers" group in Entra ID 2 minutes ago, but the cached role in Table Storage still shows "Member".
**Resolution:** Table Storage cache is non-authoritative. For critical RBAC decisions, AF calls Graph API directly (every write). For read-heavy lookups, eventual consistency is acceptable.
**Policy:** Writes always verify roles against live Graph API. Reads may use cached role (eventual consistency, <5 min).

### Conflict Scenario 4: External System (Phase 4+) vs HB Intel Primary Data
**Situation:** A Procore crew worker ID is synced from Procore, but the "owner" field in HB Intel estimating is different.
**Resolution:** HB Intel SharePoint is authoritative. Procore is a federated source; disagreements are resolved by HB Intel business logic or manual reconciliation.
**Policy:** External systems are inputs; HB Intel domain data is source of truth.

---

## Implementation Notes for Phase 1 Adapters

### Adapter Responsibilities
1. **Read Consistency:** Adapt between HB Intel domain models and SharePoint list schema. Return domain-prefixed IDs, not raw SharePoint item IDs.
2. **Write Safety:** Implement retries appropriately:
   - **Class A (Idempotent):** Implement "get or create" logic; check for existing record before creating.
   - **Class B (Sequential):** Check prior operation success (e.g., via lookup) before retry.
   - **Class C (Read-Mostly):** Cache reads; refresh cache on write.
   - **Class D (Audit-Only):** Append operations are idempotent by definition; timestamp uniqueness is key.
3. **Error Handling:** Distinguish between transient (retry) and permanent (fail-fast) errors.
4. **Audit Trail:** Every write (create, update, delete) logs to audit table with UPN, domain, item ID, old/new values.

### Proxy Adapter (Phase 1 MVP)
The `@hbc/af-adapter-proxy` is the placeholder adapter that:
- Takes domain repository calls from AF.
- Routes to actual storage (SharePoint, Table Storage, or Graph).
- Uses PnPjs for SharePoint CRUD.
- Uses `@azure/data-tables` for Table Storage.
- Uses `@microsoft/microsoft-graph-client` (via MSAL OBO) for auth.
- Returns domain models to caller.

Stub adapters (Procore, Sage, Autodesk) exist but do not write in Phase 1.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-16 | Architecture | Initial draft; operationalizes P1-A1 decisions for adapter design |


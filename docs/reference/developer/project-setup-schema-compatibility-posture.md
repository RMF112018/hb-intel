# Project Setup Schema Compatibility Posture

> **Frozen:** Phase 6 Prompt 04 (2026-04-02)  
> **Authority:** Canonical reference — defines what schema shape production requires, what is tolerated, and what is blocked.  
> **Related:** [Request-record contract](project-setup-request-record-contract.md) | [Phase 6 audit](../../architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md)

## Production schema posture

The SharePoint `Projects` list uses a **permanently mixed schema**. This is not a temporary state awaiting migration — it is the canonical production posture.

SharePoint does not support renaming column internal names after creation. The 20 legacy `field_N` columns created by the original CSV import will retain their generic internal names indefinitely. All newer columns (P2-07, P9-G5-05, `viewerUPNs`, `addOns`, `Year`) use semantic domain property names as internal names.

**Production can continue safely on the current mixed schema shape.** No schema migration is required or planned.

---

## Required production fields

These SharePoint columns must exist in the `Projects` list for the system to function. Their absence would cause silent data loss or lookup failures.

| SP Internal Name | Domain Property | Category | Why Required |
|-----------------|----------------|----------|-------------|
| `field_1` | `requestId` / `projectId` | System key | Primary lookup key; upsert, get, and saga reconciliation all filter by this column |
| `field_2` | `projectNumber` | Business key | Uniqueness enforcement on `ReadyToProvision`; Title computation |
| `field_3` | `projectName` | Display | Title computation; required for meaningful display in all surfaces |
| `field_5` | `projectType` | Classification | Required submission field |
| `field_7` | `submittedBy` | Audit | Identifies the request submitter |
| `field_8` | `submittedAt` | Audit | Submission timestamp; timeline display |
| `field_9` | `state` | Lifecycle | Drives all workflow routing, tab filtering, and state machine transitions |
| `field_10` | `groupMembers` | Provisioning | Required for group creation in provisioning saga |

### Critical subset (blocking on read)

The mapper's `validateSpItem()` treats these 3 fields as critical — a missing value triggers a structured warning:
- `field_1` — system key
- `field_3` — project name
- `field_9` — lifecycle state

These are **warning-only, not blocking**. The mapper still produces a domain object with empty-string defaults rather than throwing. This is intentional: a corrupt or partially migrated row should be visible (for diagnosis) rather than silently dropped.

---

## Tolerated legacy shapes

### Number columns storing strings

Five SP Number columns store ISO 8601 date strings or text instead of numeric values:

| SP Internal Name | Domain Property | Stores |
|-----------------|----------------|--------|
| `field_8` | `submittedAt` | ISO 8601 timestamp |
| `field_15` | `startDate` | ISO 8601 date |
| `field_20` | `clarificationNote` | Free text |
| `field_21` | `completedBy` | UPN string |
| `field_22` | `completedAt` | ISO 8601 timestamp |

**Posture:** Permanently tolerated. The mapper uses `readStringFromNumber()` and `readOptionalStringFromNumber()` to handle the type coercion. Numeric `0` is treated as empty/undefined.

**Constraint:** OData numeric operations (`lt`, `gt`, `sum`, `avg`) must never target these columns. Filtering should use string equality only.

### Orphaned columns

| SP Internal Name | Status | Notes |
|-----------------|--------|-------|
| `field_17` | Orphaned | Unknown original purpose; not in field map; not read or written |
| `field_18` | Replaced | Superseded by `viewerUPNs` named column; may contain stale CSV-import data |
| `field_19` | Replaced | Superseded by `addOns` named column; may contain stale CSV-import data |

**Posture:** Tolerated indefinitely. These columns are not referenced by code. Their presence causes no harm. If external processes query them, they will get stale data.

### Missing P2-07 columns on legacy rows

Rows created before 2026-03-31 do not have values in P2-07 columns (structured location, team roles, clarification lifecycle). The mapper returns `undefined` for missing optional strings and `[]` for missing JSON arrays.

**Posture:** Permanently tolerated. No backfill is required for system correctness. Legacy rows display with empty fields where P2-07 data would appear.

### Missing P9-G5-05 OID columns on legacy rows

Rows created before OID column addition do not have `submittedByOid` or `completedByOid`. The mapper returns `undefined`.

**Posture:** Permanently tolerated. UPN-based identity fields (`submittedBy`, `completedBy`) remain the primary actor identifiers. OID fields supplement but do not replace them.

---

## Warning-only vs blocking mismatches

### Warning-only (logged, never blocks)

| Condition | Diagnostic |
|-----------|-----------|
| `field_1` missing or empty | `validateSpItem()` logs critical-field warning |
| `field_3` missing or empty | `validateSpItem()` logs critical-field warning |
| `field_9` missing or empty | `validateSpItem()` logs critical-field warning |
| `field_13` (estimatedValue) is non-numeric | `validateSpItem()` logs type-mismatch warning |
| `field_24` (retryCount) is non-numeric | `validateSpItem()` logs type-mismatch warning |
| `Year` is non-numeric | `validateSpItem()` logs type-mismatch warning |
| JSON array field contains malformed JSON | `safeParseJsonArray()` logs parse failure, returns `[]` |
| JSON array field exceeds 50,000 chars | P6-01 truncation guard logs warning on write |
| Optional field missing | No warning — expected on legacy rows |

### Blocking (system fails or data corrupts)

| Condition | Impact | Mitigation |
|-----------|--------|-----------|
| `Projects` list does not exist | All CRUD operations fail | Constructor validates env var; SP returns 404 |
| `field_1` column does not exist in SP schema | All OData filters fail; items cannot be found or upserted | `validateSchemaReadiness()` detects at startup |
| `field_9` column does not exist in SP schema | State-filtered queries fail | `validateSchemaReadiness()` detects at startup |

---

## Schema readiness validation

The contract module exports `validateSchemaReadiness()` — a non-blocking function that checks whether a raw SP item contains the minimum required fields.

**When to call:**
- On first successful list query (operational health check)
- During environment validation scripts
- In diagnostic endpoints

**Behavior:**
- Returns a structured result: `{ ready: boolean, present: string[], missing: string[], warnings: string[] }`
- Never throws
- `ready` is `true` only if all required production fields are present
- Missing optional fields (P2-07, P9-G5-05) are reported in `warnings`, not `missing`

---

## Migration work intentionally deferred

| Item | Reason |
|------|--------|
| Rename `field_N` to semantic names | SharePoint does not support internal name rename |
| Migrate Number columns to Text | Would require list recreation or column replacement; risk exceeds benefit |
| Backfill Year column for legacy rows | Gracefully handled by mapper defaults; no production impact |
| Add `approvedBy` / `approvedByOid` SP columns | Documented as transient; deferred to future phase if durable persistence is needed |
| Add `approvedAt` timestamp | Requires new domain field + SP column; not in Phase 6 scope |
| Clean up orphaned `field_17`/`field_18`/`field_19` | No harm from their presence; deletion risks breaking external references |

---

## Operational risk summary

| Risk | Severity | Mitigated By |
|------|----------|-------------|
| Schema drift (SP column removed or renamed by admin) | Medium | `validateSchemaReadiness()` + `validateSpItem()` diagnostics |
| Silent data loss on write (mapper omits field) | Low | Full 43-field `toListItem()` mapping; round-trip tests |
| JSON array truncation in SP | Low | P6-01 50K char ceiling guard (warning-only) |
| Identifier aliasing broken by future change | Medium | P6-02/P6-03 invariant comments + tests |
| Legacy rows missing P2-07 fields | None | Mapper defaults handle gracefully |

**Overall assessment:** Production can operate safely on the current schema shape. No blocking risks remain. All tolerable legacy behaviors are documented and tested.

# Phase 2 — Data-Contract Gap Summary

> Created: 2026-03-30
> Companion to: `Phase-2_Field-Map-Baseline.md`
>
> **Status: HISTORICAL (2026-03-31).** All gaps documented below have been resolved by P2-07 through P2-10. The production SharePoint schema was updated with 17 new columns, the field contract was extended to 43 fields, and the submit handler field-loss bug was fixed. This document is retained as historical context for the audit trail.

## Summary (original, superseded)

The SharePoint adapter (`project-requests-repository.ts`) correctly uses `field_N` internal names for the 26 columns that exist in the production Projects list. However, 16 domain properties in `IProjectSetupRequest` have **no corresponding SharePoint column** and are silently dropped on real persistence.

## Gap 1: Domain Properties Without SharePoint Columns (Critical)

**Impact:** Data collected by the wizard UI is preserved in UI Review mode (mock repo) but **lost** when persisted to the real SharePoint Projects list in production mode.

### Structured Location Fields (5 properties)

| Property | Added By | Purpose | Risk |
|----------|----------|---------|------|
| `projectStreetAddress` | W0-G4-T09 | Step 1 structured address | Lost on persist — only `projectLocation` (derived summary) survives |
| `projectCity` | W0-G4-T09 | Step 1 structured address | Lost on persist |
| `projectCounty` | W0-G4-T09 | Step 1 structured address | Lost on persist |
| `projectState` | W0-G4-T09 | Step 1 structured address | Lost on persist |
| `projectZip` | W0-G4-T09 | Step 1 structured address | Lost on persist |

**Mitigation:** The legacy `projectLocation` field (field_4) persists a derived summary. Structured fields are newer additions not yet reflected in the SP list schema.

### Team Assignment Fields (6 properties)

| Property | Added By | Purpose | Risk |
|----------|----------|---------|------|
| `projectExecutiveUpn` | W0-G4-T11 | Step 3 team assignment | Lost on persist — only `projectLeadId` and `groupMembers`/`groupLeaders` survive |
| `projectManagerUpn` | W0-G4-T11 | Step 3 team assignment | Lost on persist |
| `leadEstimatorUpn` | W0-G4-T11 | Step 3 team assignment | Lost on persist |
| `supportingEstimatorUpns` | W0-G4-T11 | Step 3 team assignment | Lost on persist |
| `additionalTeamMemberUpns` | W0-G4-T11 | Step 3 team assignment | Lost on persist |
| `timberscanApproverUpn` | W0-G4-T11 | Step 3 team assignment | Lost on persist |

**Mitigation:** These UPNs may be included in `groupMembers`/`groupLeaders` arrays, but the role-specific assignment metadata is lost.

### Classification Fields (2 properties)

| Property | Added By | Purpose | Risk |
|----------|----------|---------|------|
| `officeDivision` | W0-G4-T10 | Step 2 office/division | Lost on persist |
| `procoreProject` | W0-G4-T09 | Step 1 Procore flag | Lost on persist |

### Clarification Lifecycle Fields (3 properties)

| Property | Added By | Purpose | Risk |
|----------|----------|---------|------|
| `clarificationRequestedAt` | W0-G3-T02 | Clarification timing | Lost on persist — affects BIC due-date calculation |
| `requesterRetryUsed` | W0-G3-T02 | Retry eligibility | Lost on persist — affects retry gating |
| `clarificationItems` | W0-G3-T03 | Structured clarification records | Lost on persist — complex nested data |

## Gap 2: SP Type Mismatches (Medium Risk)

Five fields are stored as SP `Number` type but the domain model treats them as strings:

| SP Field | Display Name | Domain Type | SP Type | Issue |
|----------|-------------|-------------|---------|-------|
| `field_8` | SubmittedAt | `string` (ISO 8601) | Number | SP may return numeric value; `String()` conversion in `fromListItem` may produce unexpected results |
| `field_15` | StartDate | `string?` (ISO 8601) | Number | Same issue |
| `field_20` | ClarificationNote | `string?` | Number | SP may return `0` for empty; `String(0)` → `"0"` not `undefined` |
| `field_21` | CompletedBy | `string?` | Number | SP may return `0` for empty |
| `field_22` | CompletedAt | `string?` | Number | SP may return `0` for empty |

**Current mitigation:** `fromListItem()` uses `String(item.field_20 ?? '')` which handles `null`/`undefined` but may produce `"0"` from numeric zero.

## Gap 3: Setup Script Drift (Low Risk)

`scripts/create-projects-list.ts` defines a subset of the production schema (15 fields). It cannot recreate the production list accurately because:
- Missing 11 fields added post-initial-setup
- Uses display names for column creation (not `field_N`)
- Production list was created via CSV import, giving columns generic internal names

**Impact:** New environments cannot be set up from the script alone. Not a production risk for the existing list.

## Recommendations for Prompt 02

1. **Decide persistence strategy for unmapped domain properties:**
   - Option A: Add new columns to the SP list and extend the adapter
   - Option B: Serialize overflow properties into a single JSON column (e.g., `field_25` or a new named column)
   - Option C: Accept that some properties are frontend-only / session-scoped and do not need persistence

2. **Fix SP Number type handling** for string-valued fields to prevent `"0"` leaking into domain objects.

3. **Document which domain properties are intentionally transient** vs which need persistence but lack it.

4. **Consider whether `clarificationItems` (complex nested array) should be stored in SP** or in a separate storage mechanism (e.g., Azure Table Storage alongside provisioning status).

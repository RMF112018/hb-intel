# Gap 6 — Schema Contract Reconciliation Audit

**Date:** 2026-04-01
**Scope:** `additionalTeamMemberUpns`, `submittedByOid`, `completedByOid`
**Prompt:** P9-G6-05

## Summary

Three fields required reconciliation between the live SharePoint `Projects` list schema and the repo contract. This audit documents the evidence, decision, and implementation outcome for each.

## Field Decisions

### 1. `additionalTeamMemberUpns` — REMOVE (confirmed)

| Dimension | Finding |
|-----------|---------|
| **Live schema** | Not present |
| **Repo code** | Already removed in P9-G6-02 — zero references in `backend/functions/src/` |
| **Domain intent** | Superseded by `groupMembers`, which is the single authoritative field for standard read/write project team members |
| **Overlap check** | Overlapped with `groupMembers` (derived from `projectManagerUpn`, `leadEstimatorUpn`, `supportingEstimatorUpns`). No overlap with `groupLeaders` or `viewerUPNs` — those serve distinct roles. |
| **Decision** | **Path B — Remove.** Already completed. No further code action required. |
| **Doc references** | 23 files reference this field — all are historical audit/plan docs documenting the removal itself. No stale active-contract references remain. |

### 2. `submittedByOid` — KEEP

| Dimension | Finding |
|-----------|---------|
| **Live schema** | **Not present** — manual SP column creation required (Text, 255) |
| **Repo code** | Active across 9 files: contract, mapper, request handler, authorization middleware, provisioning handoff, table storage |
| **Domain intent** | Core to stable-identity ownership model (P9-G5-05). Captured from JWT `auth.claims.oid` at submission. Used in `checkOwnership()` for OID-first authorization with UPN fallback for pre-migration records. |
| **Risk if removed** | Would reintroduce UPN-only authorization posture — the exact problem P9-G5 was designed to eliminate |
| **Gap found** | Was missing from `PROJECTS_LIST_FIELD_MAP` — not included in `PROJECTS_LIST_SELECT_FIELDS`. Fixed in this reconciliation. |
| **Test coverage** | Request-lifecycle tests (OID role resolution C3, UPN fallback C6), authorization tests (`checkOwnership`), authz-release-gates, mapper round-trip tests (added in this reconciliation) |
| **Decision** | **Path A — Keep.** Added to field map. Mapper test fixtures updated. |

### 3. `completedByOid` — KEEP

| Dimension | Finding |
|-----------|---------|
| **Live schema** | **Not present** — manual SP column creation required (Text, 255) |
| **Repo code** | Active across 8 files: contract, mapper, state transition handler (captures from JWT on Completed state), table storage |
| **Domain intent** | Stable actor attribution for completion events. Consistent with the OID-based identity posture established by `submittedByOid`. |
| **Risk if removed** | Would create asymmetry in the identity model — submission has OID tracking but completion would not |
| **Gap found** | Same as `submittedByOid` — was missing from field map. Fixed in this reconciliation. |
| **Test coverage** | Request-lifecycle tests, mapper round-trip tests (added in this reconciliation) |
| **Decision** | **Path A — Keep.** Added to field map. Mapper test fixtures updated. |

## Impacted Files

| File | Change |
|------|--------|
| `backend/functions/src/services/projects-list-contract.ts` | Added `submittedByOid` and `completedByOid` to `PROJECTS_LIST_FIELD_MAP` |
| `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` | Added OID fields to fixtures, assertions, and select-fields count (41 → 43) |
| `docs/architecture/plans/MASTER/.../gap-6/Gap-6-Closeout-Summary-and-Execution-Plan.md` | Updated with reconciliation outcome and environment residuals |
| `docs/architecture/plans/MASTER/.../gap-6/Gap-6-Rebaseline-and-Target-Contract-Freeze.md` | Clarified OID field status |

## Required Manual SharePoint Admin Actions

| Column | Internal Name | Type | Required | Target List |
|--------|--------------|------|----------|-------------|
| `submittedByOid` | `submittedByOid` | Text (255) | No | Projects |
| `completedByOid` | `completedByOid` | Text (255) | No | Projects |

**Graceful degradation:** Until these columns are provisioned, OID fields will read as `undefined` on all rows. The `checkOwnership()` function falls back to case-insensitive UPN comparison when `submittedByOid` is absent, so authorization remains functional.

## Unresolved Items

None. All three fields have a clear and defensible final position. The only remaining action is SP admin column creation for the two OID fields, which is an environment residual tracked in the Gap 6 Closeout.

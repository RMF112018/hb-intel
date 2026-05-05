# 03 — Fixture Scenario Matrix

## Fixture Design Objective

Create deterministic, governance-heavy fixture scenarios that exercise Wave 16’s risk, policy, redaction, validation, HBI, and cross-surface seams without enabling live writes.

## Required Projects

| Fixture Project | Purpose |
| --- | --- |
| Known project / healthy | Baseline settings home and table render. |
| Known project / degraded | Warnings, missing config, stale override, validation issues. |
| Unknown project | Empty/degraded envelope with stable module identity. |
| Backend unavailable | Backend-unavailable envelope with no mutation paths. |

## Required Setting Categories

| Category | Required Examples |
| --- | --- |
| Security | secret reference, permission-sensitive setting, admin verification required |
| Integration | external launch policy, Procore mapping visibility, source-derived state |
| Workflow | approval-required setting, request-only setting, disabled due to role |
| ReadModel | backend mode, source status, degraded-state behavior |
| UX | table density, mobile behavior, user preference policy-gated |
| Operations | site health threshold, validation cadence, stale override |
| Feature Flags | global default, project override prohibited, enabled/disabled display |
| Module Flags | module visible, module hidden by policy, pending change request |
| HBI Policy | cite-only, refusal required, no-authority setting |

## Required Scenario Rows

| Scenario ID | Scenario | Required Behavior |
| --- | --- | --- |
| W16-FIX-001 | Healthy inherited default | Effective source `HBCentralDefault`; validation `Valid`; no approval. |
| W16-FIX-002 | Approved project override | Effective source `ApprovedProjectOverride`; audit preview shows approval lineage. |
| W16-FIX-003 | Expired override | Effective source falls back; expired override surfaced as warning/stale action candidate. |
| W16-FIX-004 | Future-dated override | Current effective value unchanged; future value visible in detail drawer. |
| W16-FIX-005 | Blocked policy override | Validation `Blocked`; change request disabled or approval-routed. |
| W16-FIX-006 | Missing required setting | Validation `MissingRequired`; Priority Action candidate generated. |
| W16-FIX-007 | Secret reference | Display `Secret reference configured`; no raw value; HBI refuses reveal requests. |
| W16-FIX-008 | Unauthorized role | `canView=false` or value redacted; disabled reason explains permissions. |
| W16-FIX-009 | Admin verification required | Change request can be started by allowed role but requires admin verification. |
| W16-FIX-010 | External system source-derived | External Systems owns source; Wave 16 displays posture only. |
| W16-FIX-011 | Backend unavailable | Stable skeleton with warnings; no enabled mutation actions. |
| W16-FIX-012 | Partial/degraded source | Category counts and table rows show degraded state and source warnings. |
| W16-FIX-013 | HBI allowed explanation | HBI cites policy/audit/validation source lineage. |
| W16-FIX-014 | HBI refusal | HBI refuses secret reveal, bypass approval, or mutate setting request. |
| W16-FIX-015 | Pending approval handoff | Change request references Wave 14 approval route but does not execute it. |

## Fixture Data Rules

- Use stable IDs.
- Use fixed timestamps.
- Do not use real secrets, real tenant URLs, or real external-system URLs.
- Use `.example.invalid` or clearly fake hostnames for URL examples.
- Preserve source lineage and redaction metadata.
- Include row-level disabled reasons.
- Include category and summary counts derived from row fixtures where possible.
- Ensure all fixture values are safe for unit tests and snapshots.

# Phase 2 — Normalization Rules: Domain ↔ SharePoint Type Conversion

> Created: 2026-03-30
> Governs: `projects-list-contract.ts` field map serialization

## Purpose

The SharePoint Projects list was created via CSV import. Some column types do not match their domain semantics (e.g., string dates stored as SP Number columns). These rules define how the mapping layer normalizes values in each direction.

## General Rules

| Rule | Direction | Behavior |
|------|-----------|----------|
| Missing field on read | SP → Domain | Use documented default (see per-field table) |
| `null` on read | SP → Domain | Convert to `undefined` for optional fields; use default for required fields |
| `undefined` domain value on write | Domain → SP | Write `''` for strings, `null` for numbers, `'[]'` for JSON arrays |
| Empty string on read | SP → Domain | Convert to `undefined` for optional fields |
| Numeric `0` on read for string fields | SP → Domain | Convert to `undefined` (field_20, field_21, field_22 are SP Number but store strings) |

## Per-Type Rules

### Strings (Text, Choice)

| Direction | Rule |
|-----------|------|
| Write | `value ?? ''` — never write `null` or `undefined` to SP text columns |
| Read | `(value as string) ?? ''` for required; `(value as string) \|\| undefined` for optional |

### Numbers

| Direction | Rule |
|-----------|------|
| Write | `value ?? null` — SP Number columns accept `null` for empty |
| Read | `typeof value === 'number' ? value : <default>` — reject non-numeric reads |
| Default | `0` for `retryCount`; `undefined` for `estimatedValue`, `year` |

### JSON Arrays (MultiLineText columns)

| Direction | Rule |
|-----------|------|
| Write | `JSON.stringify(value ?? [])` — always write valid JSON |
| Read | `safeParseJsonArray(value)` — returns `[]` on parse failure; filters non-string elements |

Affected fields: `field_10` (groupMembers), `field_11` (groupLeaders), `field_18` (viewerUPNs), `field_19` (addOns)

### Dates (stored as SP Number)

| Direction | Rule |
|-----------|------|
| Write | Pass ISO 8601 string directly — SP stores it as-is in the Number column |
| Read | `String(value ?? '')` — convert SP return to string; filter falsy `'0'` to `undefined` for optional fields |

Affected fields: `field_8` (submittedAt), `field_15` (startDate), `field_22` (completedAt)

### String-in-Number Columns

Some fields store string content (UPNs, notes) in SP Number columns due to CSV import artifact.

| Direction | Rule |
|-----------|------|
| Write | Pass string directly |
| Read | `String(value ?? '')` then `\|\| undefined` — SP may return numeric `0` for empty; `String(0)` → `"0"` must be filtered |

Affected fields: `field_20` (clarificationNote), `field_21` (completedBy)

### URLs

| Direction | Rule |
|-----------|------|
| Write | `value ?? ''` |
| Read | `(value as string) \|\| undefined` |

### Booleans

No SharePoint columns store boolean values in the current schema. The domain property `requesterRetryUsed` is **not mapped** to any SP column.

### Enums / State Values

| Direction | Rule |
|-----------|------|
| Write | Pass string value directly (SP Choice column validates) |
| Read | Cast to union type with fallback default |
| Defaults | `'Submitted'` for `state`, `'Pursuit'` for `projectStage` |

### Computed Fields

| Field | Rule |
|-------|------|
| `Title` | Write-only. Computed as `"{projectNumber ?? 'TBD'} — {projectName}"`. Never read back into domain. |

## Unmapped Domain Properties

These properties exist in `IProjectSetupRequest` but have no SP column. The mapping layer must NOT attempt to read or write them to SharePoint. They are preserved only in the mock repository (UI Review mode).

See `Phase-2_Data-Contract-Gaps.md` for the full list and impact analysis.

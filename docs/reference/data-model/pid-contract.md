# PID Field Contract — G2 Workflow Lists

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; data model audience; PID relational column specification for all Wave 0 Group 2 workflow-family lists.

**Source:** W0-G2-T01 — Shared List Schema Standards and PID Contract (§1)
**Consumers:** T02–T06 (workflow-family schemas), T07 (provisioning saga), T09 (integration tests), Wave 1 app teams

---

## PID Field Specification

| Property | Value |
|----------|-------|
| **InternalName** | `pid` |
| **DisplayName** | Project ID |
| **Type** | Text (Single Line) |
| **Required** | `true` |
| **MaxLength** | 50 |
| **Indexed** | `true` |
| **DefaultValue** | `status.projectNumber` at provisioning time (e.g., `"25-001-01"`) |

---

## Alignment Rationale

The existing codebase uses two project identifier concepts:

| Field | Type | Example | Where Used |
|-------|------|---------|-----------|
| `projectId` | UUID string | `"d4e9b2a1-f3c7-4e08-a891-bb23456cd789"` | Provisioning saga, Azure Table Storage, SignalR group key |
| `projectNumber` | Formatted string | `"25-001-01"` | Display, SharePoint site URL, Entra ID group names |

**`pid` stores the `projectNumber` value**, not the `projectId` UUID. This decision was locked by G2 interview recommendation:

- Human-readable and recognizable by project teams
- Aligns with SharePoint site URL naming convention (which also uses `projectNumber`)
- Enables cross-list queries that a developer or power user can construct manually
- Does not require a separate lookup service to resolve a UUID to a project

---

## Default Value Mechanism

SharePoint list columns support a default value set at provisioning time via the REST API (`DefaultValue` property on the field schema). The provisioning saga sets `pid`'s default to `status.projectNumber` when creating each G2 list.

**Implementation:** The `IFieldDefinition.defaultValue` property supports a `{{projectNumber}}` placeholder that `createDataLists` resolves at runtime using the provided context parameter.

```typescript
// In list definition:
{ internalName: 'pid', displayName: 'Project ID', type: 'Text',
  required: true, indexed: true, defaultValue: '{{projectNumber}}' }

// At provisioning time:
await service.createDataLists(siteUrl, g2Lists, { projectNumber: status.projectNumber });
```

---

## Indexing Requirement

Every G2 list's `pid` column **must** be indexed at list creation time. Without indexing, cross-list queries by `pid` will produce throttling errors on lists exceeding the SharePoint 5,000-item list view threshold.

The `IFieldDefinition.indexed` property triggers post-creation index application via `list.fields.getByInternalNameOrTitle(name).update({ Indexed: true })`.

---

## Scope Boundary

- **G2 lists only.** The 8 core G1 lists (`HB_INTEL_LIST_DEFINITIONS`) do **not** receive a `pid` field. G2 does not modify the core list schema.
- Every G2 workflow-family list (T02–T06) **must** include `pid` as a required indexed field.

---

## Validation Reference

T09 test cases covering `pid` contract compliance:

| Test Case | Validates |
|-----------|----------|
| TC-PID-01 | `pid` default value mechanism works via PnPjs `DefaultValue` property |
| TC-PID-02 | `pid` column is indexed on every G2 list after provisioning |
| TC-PID-03 | `pid` value matches `status.projectNumber` on provisioned list items |
| TC-PID-04 | Cross-list query by `pid` returns items from all G2 lists for a given project |

---

*End of PID Field Contract v1.0*

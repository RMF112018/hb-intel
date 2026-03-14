# G2 Validation Rules Reference

> **Doc Classification:** Canonical Current-State — Reference quadrant; provisioning audience; consolidated T08 validation rules for T09 test consumption.

**Source:** W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules
**Consumers:** T09 (integration tests), operational monitoring, Wave 1 onboarding

---

## 1. Structural Validation Checklist

### 1.1 PID Contract (per workflow list)

| Check | Rule | Enforcement |
|-------|------|-------------|
| PID field exists | Every G2 workflow list has `internalName: 'pid'` | `validatePidContract()` |
| PID type | `type: 'Text'` | `validatePidContract()` |
| PID required | `required: true` | `validatePidContract()` |
| PID indexed | `indexed: true` | `validatePidContract()` |
| PID default | `defaultValue` contains `{{projectNumber}}` | `validatePidContract()` |

### 1.2 Parent/Child Lookups

| Check | Rule | Enforcement |
|-------|------|-------------|
| Parent exists | `parentListTitle` matches an existing list title | `validateParentChildLookups()` |
| Lookup field exists | At least one Lookup field with matching `lookupListTitle` | `validateParentChildLookups()` |
| Ordering | Parent `provisioningOrder` < child `provisioningOrder` | `validateParentChildLookups()` |

### 1.3 List Completeness

| Check | Rule | Enforcement |
|-------|------|-------------|
| Non-empty title/description | Both must be non-empty strings | `validateListCompleteness()` |
| Template value | `template: 100` (custom list) | `validateListCompleteness()` |
| Field count | At least one field per list | `validateListCompleteness()` |
| No duplicate internalNames | Unique within each list | `validateListCompleteness()` |
| Valid field types | Must be one of the 9 supported types | `validateListCompleteness()` |

### 1.4 Cross-Set Title Uniqueness

| Check | Rule | Enforcement |
|-------|------|-------------|
| No collisions | Core (8) + Workflow (26) = 34 unique titles | `validateNoDuplicateTitles()` |

### 1.5 Department Configuration

| Check | Rule | Enforcement |
|-------|------|-------------|
| Key alignment | Libraries and folder trees share the same department keys | `validateDepartmentConfig()` |
| Library name match | Tree `libraryName` exists in department library list | `validateDepartmentConfig()` |
| Folder paths well-formed | Non-empty, no leading/trailing slashes | `validateDepartmentConfig()` |
| Parent-first ordering | Parent folder appears before child in array | `validateDepartmentConfig()` |

### 1.6 Seeded File Manifest

| Check | Rule | Enforcement |
|-------|------|-------------|
| All entries have non-empty fields | fileName, targetLibrary, assetPath | Template validation test |
| Disk presence report | `validateManifestAssets()` checks `fs.existsSync` | `validateManifestAssets()` |

---

## 2. Idempotency Scenarios

### Scenario A — First-time provisioning (happy path)

All steps execute normally. Lists are created, files are uploaded, folders are provisioned. Expected: `status: 'Completed'`, no `idempotentSkip`.

### Scenario B — Re-run after partial failure

Steps 1–2 completed; Step 3 failed mid-upload. Re-run detects:
- `siteExists` → returns existing URL (Step 1 skip)
- `documentLibraryExists` → returns true (Step 2 skip)
- `fileExists` → returns true for already-uploaded files (Step 3 partial skip)
- Lists: `listExists` → true for created lists (Step 4 partial skip)

### Scenario C — Re-run after full completion

All idempotency guards trigger. Every step returns `idempotentSkip: true`. No mutations occur.

### Scenario D — Re-run with configuration changes

New template entries added to manifest between runs. Previously uploaded files are skipped; new entries are uploaded. Lists: existing lists skipped, new lists created.

---

## 3. Migration / Coexistence Posture

| Rule | Description |
|------|-------------|
| No sync | G2 does not synchronize data between existing project sites and newly provisioned ones |
| Empty lists acceptable | Workflow lists are created empty — population is Wave 1 app scope |
| No overwrite | `uploadTemplateFile` never overwrites existing files (T08 §3.4) |
| No destructive migration | No ALTER/DROP operations on existing lists or libraries |

---

## 4. Readiness Gates

### Pilot Readiness (Wave 0 completion)

- All 34 lists create successfully on a test site
- All 18 template file entries are accounted for (present or gracefully skipped)
- Department folder trees create successfully for both departments
- Idempotency scenarios A–D pass
- Missing-asset metadata is surfaced in Step 3 result

### Broader Rollout (Wave 1 prerequisite)

- All 18 template asset files present on disk (zero missing in `validateManifestAssets`)
- PID contract validated against live SharePoint list schemas
- Cross-list query by `pid` confirmed functional

---

*End of G2 Validation Rules Reference v1.0*

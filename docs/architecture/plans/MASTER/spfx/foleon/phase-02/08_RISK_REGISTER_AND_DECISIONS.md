# Risk Register and Open Decisions

## Critical Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Public SharePoint query reintroduces person field `$select` 400 | High | Keep public projection scalar-safe; test exclusions. |
| Schema fields added to source but not tenant | High | Controlled tenant schema migration runbook and validation. |
| Backend DTO omits new fields causing silent data loss | High | Backend and frontend contracts updated in same wave. |
| Multiple active records per lane | Medium/High | Manager warnings and backend validation. |
| Two iframes load on mobile | Medium | Collapsed mobile behavior. |
| Preview hides real schema/query defects | High | Preview only for successful empty/no active data, never errors. |
| Tenant persisted `expectedPackageVersion` mismatch | Medium | Update runbook/property pane after package deploy. |
| Legacy Highlights route conflicts with new reader modules | Medium | Keep legacy temporarily, document migration, do not delete until pages are migrated. |

## Open Decisions

### 1. Keep or hide legacy Highlights toolbox entry?

Recommendation: keep for one release, mark as legacy, hide later after tenant migration.

### 2. Route model

Recommendation: explicit routes `projectSpotlight` and `companyPulse`.

### 3. Active record authority

Recommendation: combined model.

- Content Registry owns `ReaderKey` + `ActiveEdition`.
- Placements own homepage lane activation.
- Reader service resolves placement first, then active edition fallback only if explicitly allowed.

### 4. Archive UI

Recommendation: implement archive link/drawer in later wave if it threatens initial delivery. Initial implementation can route to Hub with lane filter.

### 5. Tenant schema migration tooling

Recommendation: do not rely only on Feature Framework upgrade. Provide controlled backend/PnP migration path for existing HBCentral lists.

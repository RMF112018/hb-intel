# 09 — Ownership and Governance Matrix

## Ownership model (recommended reading of current repo truth)

| Resource / data concern | Current authoritative owner | Steward / operator | Consumers | Evidence posture |
|---|---|---|---|---|
| Project setup request contract | Project Setup domain (`packages/models` + Project Setup host) | Estimating + workflow backend | Estimating, Accounting, Admin | Confirmed repo fact |
| Provisioning execution status | Project Setup host / provisioning domain | backend + admin ops | Estimating, Accounting, Admin | Confirmed repo fact |
| Admin generalized run/control contracts | Admin control-plane domain | Admin app / admin backend | Admin | Confirmed repo fact |
| HBCentral `Projects` list read model | SharePoint project registry layer | unclear at subset-document level | Project Sites | Confirmed repo fact + unclear ownership |
| Workflow-family list key contract (`pid`) | data-model reference + provisioning/list-definition governance | backend/provisioning team | future app/query layers | Confirmed authoritative doc |
| Provisioned site structure | provisioning/site-template governance | backend/provisioning team | project teams + Project Sites users | Confirmed authoritative doc |
| Entra group naming/membership model | provisioning identity layer | backend/identity ops | project teams / admin | Confirmed authoritative doc |
| Project Sites field mapping | Project Sites implementation | Project Sites app owner | Project Sites users | Confirmed repo fact |
| Protected API permission declaration | each SPFx app packaging boundary | release/package owner | target app | Confirmed repo fact |

## Ownership problems currently visible

### 1) `Projects` list projection ownership is not explicit enough
The subset docs and code make the read-side dependency clear, but they do not publish one focused answer to:
- who writes `ProjectId`, `ProjectNumber`, `ProjectName`, `Department`, `SiteUrl`, `Year`
- when those fields become valid
- whether Project Sites can assume they are synchronized with request/provisioning truth

### 2) Admin dual-backend posture needs an explicit governance statement
Admin currently spans:
- provisioning-domain oversight
- admin-native control-plane models and stores

That is workable, but only if the boundary is documented deliberately.

### 3) Identifier stewardship needs one subset-specific contract
`projectId`, `projectNumber`, and `pid` are each reasonable in isolation. The governance problem is the lack of one concise contract that ties them together for these four apps.

## Recommended governance rules

1. **Project Setup host owns request/provisioning truth.**
2. **Admin Control Plane host owns admin-native run/audit/evidence truth.**
3. **The HBCentral `Projects` list is a shared read model / registry projection for this subset, not the request/provisioning source of truth.**
4. **`projectNumber` is the authoritative human/business identifier once assigned.**
5. **`projectId` remains the authoritative system identifier for workflow/backend correlation.**
6. **`pid` remains a SharePoint workflow-list join key only.**
7. **Any field mirrored into the `Projects` list must have an explicit write-owner and freshness expectation.**

## Governance anti-patterns to avoid

- letting Project Sites become the implicit owner of project identity because it is the most visible reader
- letting Admin run models silently diverge from provisioning status semantics
- encoding packaging/auth requirements only in page code rather than manifest + release docs
- documenting these four apps only in broad current-state inventories without a focused subset map

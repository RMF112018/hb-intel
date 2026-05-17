# File Impact Matrix

The local agent must verify exact current filenames before editing. Expected touchpoints:

---

## A. Models

| File / Area | Expected Change |
|---|---|
| `packages/models/src/myWork/MyProjectLinksReadModel.ts` | Add custom link type and `customLinks` property |
| new custom-links model file if preferred by repo style | Add command request/result types |
| `packages/models/src/myWork/index.ts` | Export new types |
| fixtures under `packages/models/src/myWork/fixtures/` | Add custom-link sample data |
| model tests | Validate new read-model shape and command result enums |

---

## B. Backend descriptors / provisioning

| File / Area | Expected Change |
|---|---|
| `backend/functions/src/services/...custom-links descriptor...` | New list descriptor |
| `scripts/provision-my-projects-custom-links-list.ts` | New provisioner |
| custom-links verifier script or readiness extension | New read-only readiness check |
| docs/reference/sharepoint/list-schemas/... | New custom-links list schema doc |
| docs/how-to/administrator/... | New operator runbook |

---

## C. Backend repository, read model, commands

| File / Area | Expected Change |
|---|---|
| My Work project-links provider | Attach custom links to items |
| new custom-link repository/service | Graph-backed list read/write |
| new validation helper | Title/url/visibility validation |
| entitlement helper | Reuse My Projects assignment logic |
| route registration files | POST/PATCH/DELETE endpoints |
| route/provider tests | Authorization, join, failure posture |

---

## D. Frontend API/client

| File | Expected Change |
|---|---|
| `apps/my-dashboard/src/api/myWorkReadModelClient.ts` | Add command methods |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Implement POST/PATCH/DELETE client calls |
| fixture client | Return deterministic closed-set unsupported/fallback results |
| client factory tests | Preserve production/fixture behavior |

---

## E. Frontend My Projects UI

| File | Expected Change |
|---|---|
| `MyProjectsHomeCard.tsx` | Refresh after writes if card-level reload path used |
| `ProjectPortfolioTile.tsx` | Add resource disclosure |
| new `ProjectResourceDisclosure.tsx` | Recommended separated component |
| new `ProjectCustomLinkModal.tsx` | Add/edit modal |
| CSS modules | disclosure, modal, badges, row actions |
| My Projects UI tests | Disclosure, modal, visibility, manage controls |

---

## F. Documentation / validation

| File / Area | Expected Change |
|---|---|
| app README if My Projects behavior overview exists | Add custom resources description |
| diagnostics docs | Add custom-link source enrichment notes if surfaced |
| provisioning docs | Add list provisioning commands |
| final closeout docs | Evidence and operator notes |

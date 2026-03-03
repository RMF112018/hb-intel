# Domain Migration Runbook

## Overview

This runbook defines the incremental migration strategy for cutting over from legacy systems to HB Intel. Each domain follows the same checklist template, executed in the MVP priority order defined in Blueprint §6.

## MVP Priority Order

| Priority | Domain                   | Rationale                                                                    |
| -------- | ------------------------ | ---------------------------------------------------------------------------- |
| 1        | **Accounting**           | Triggers provisioning saga — highest business value, validates full pipeline |
| 2        | **Estimating**           | Receives provisioning status — validates cross-domain communication          |
| 3        | **Project Hub**          | Central dashboard — aggregates data from migrated domains                    |
| 4        | **Leadership**           | KPI dashboards — depends on underlying domain data                           |
| 5        | **Business Development** | Lead pipeline — least dependent on other domains                             |

## Per-Domain Migration Checklist

Copy this checklist for each domain and track progress:

```markdown
### [Domain Name] Migration

**Target:** apps/pwa route `/[domain-slug]` + SPFx webpart `@hbc/spfx-[domain]`
**Status:** Not Started | In Progress | Complete
**Start Date:** YYYY-MM-DD
**Completion Date:** YYYY-MM-DD

#### Implementation

- [ ] Port implementation — domain models, business logic, and UI components
- [ ] Adapter wiring — connect ports to proxy adapters (Procore, SharePoint, etc.)
- [ ] Query hooks tested — TanStack Query hooks with mock and proxy adapters verified

#### Verification

- [ ] Pages populated — all domain pages render with real or realistic mock data
- [ ] E2E tests — Playwright tests cover primary user flows
- [ ] SPFx test — iframe embedding in SharePoint verified (per ADR-0007)
- [ ] PWA verified — domain routes load correctly in PWA build

#### Cutover

- [ ] Legacy cutover — redirect users from legacy system to HB Intel
- [ ] Stakeholder sign-off — domain owner confirms feature parity
- [ ] Monitoring — error rates, performance metrics baselined
```

## Domain Details

### 1. Accounting

**Route:** `/accounting`
**SPFx Webpart:** `@hbc/spfx-accounting`
**Key integrations:** Procore commitments API, provisioning saga trigger
**Migration notes:**

- First domain to exercise the full provisioning saga (Backend Phase 7)
- Validates proxy adapter → Azure Functions → Procore pipeline
- Buyout schedule module provides the data model foundation

### 2. Estimating

**Route:** `/estimating`
**SPFx Webpart:** `@hbc/spfx-estimating`
**Key integrations:** Procore bid packages, provisioning status subscription
**Migration notes:**

- Subscribes to provisioning events via SignalR
- Validates cross-domain real-time communication
- Depends on Accounting provisioning being functional

### 3. Project Hub

**Route:** `/project-hub`
**SPFx Webpart:** `@hbc/spfx-project-hub`
**Key integrations:** Aggregates data from all migrated domains
**Migration notes:**

- Central dashboard showing project-level KPIs
- Data richness grows as more domains are migrated
- Can start with Accounting + Estimating data initially

### 4. Leadership

**Route:** `/leadership`
**SPFx Webpart:** `@hbc/spfx-leadership`
**Key integrations:** Cross-project KPI aggregation, chart components
**Migration notes:**

- Executive-level dashboards with drill-down capability
- Uses HbcChart (lazy-loaded) from ui-kit
- Depends on underlying domain data being available

### 5. Business Development

**Route:** `/business-development`
**SPFx Webpart:** `@hbc/spfx-business-development`
**Key integrations:** Lead pipeline, opportunity tracking
**Migration notes:**

- Least dependent on other domains
- Can be developed in parallel once the pipeline is proven with Accounting
- Procore project/company APIs for lead data

## SPFx Deployment Path

Per ADR-0007, SPFx deployment uses the iframe embedding approach during foundation:

1. Build the webpart: `pnpm --filter @hbc/spfx-[domain] build`
2. Deploy `dist/` to Vercel or Azure Static Web Apps
3. Embed in SharePoint via the Embed webpart
4. When TypeScript conflicts are resolved, switch to `.sppkg` packaging

## Rollback Strategy

Each domain migration is independently reversible:

1. **Feature flag** — each domain route can be disabled in the shell navigation config
2. **Legacy redirect** — restore the original URL mapping to the legacy system
3. **Data integrity** — HB Intel writes are idempotent; Procore remains the system of record
4. **Communication** — notify stakeholders of rollback via standard change management process

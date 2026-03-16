# P1-B2: Adapter Completion Backlog

**Doc ID:** P1-B2
**Phase:** Phase 1
**Status:** Draft
**Date:** 2026-03-16
**References:** P1-A1 (Phase 1 Scope), P1-A2 (Critical Path Definition)

## Purpose

This is the canonical, living tracker for adapter implementations across all phases of HB Intel. It tracks completion status by domain, identifies blocking dependencies, and defines the definition of done for each adapter type. All adapter work for Phase 1 and beyond flows through this backlog.

## Adapter Status Overview

| Adapter Type | Description | Current Status | Target Phase | HBC_ADAPTER_MODE Value | Backend Required |
|---|---|---|---|---|---|
| **mock** | In-memory, seed data, fully functional | ✅ Complete | All phases | `'mock'` | No (local only) |
| **proxy** | Calls Azure Functions via MSAL OBO | 🚧 Stub | Phase 1 | `'proxy'` | Yes (Phase 1 backend) |
| **sharepoint** | Direct PnPjs calls (SPFx-only surface) | 🚧 Stub | Phase 5 | `'sharepoint'` | No (PnPjs is library) |
| **api** | REST / Azure SQL direct calls | 🔵 Reserved | Phase 7+ | `'api'` | Yes (Phase 7+ backend) |

## Proxy Adapter: Domain Completion Matrix

**Phase 1 Critical Path Domains:** Project, Lead, Estimating (highest priority). All others Phase 2+.

| Domain | Port Interface | Phase 1 Target | Current Status | Azure Functions Endpoint | Blocking Dependencies | Notes |
|---|---|---|---|---|---|---|
| **Project** | `IProjectRepository` | ✅ Yes | Not Started | `/api/projects/{id}` | Backend endpoints (P1-BE-001) | Critical path |
| **Lead** | `ILeadRepository` | ✅ Yes | Not Started | `/api/leads/{id}` | Backend endpoints (P1-BE-001) | Critical path |
| **Estimating** | `IEstimatingRepository` | ✅ Yes | Not Started | `/api/estimating/{id}` | Backend endpoints (P1-BE-002) | Critical path |
| **Schedule** | `IScheduleRepository` | Phase 2 | Not Started | `/api/schedule/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Buyout** | `IBuyoutRepository` | Phase 2 | Not Started | `/api/buyout/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Compliance** | `IComplianceRepository` | Phase 2 | Not Started | `/api/compliance/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Contract** | `IContractRepository` | Phase 2 | Not Started | `/api/contract/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Risk** | `IRiskRepository` | Phase 2 | Not Started | `/api/risk/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Scorecard** | `IScorecardRepository` | Phase 2 | Not Started | `/api/scorecard/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **PMP** | `IPmpRepository` | Phase 2 | Not Started | `/api/pmp/{id}` | Backend endpoints (Phase 2) | Post-MVP |
| **Auth** | `IAuthRepository` | ✅ Yes | Not Started | (via MSAL) | MSAL OBO in backend | Special handling |

## SharePoint Adapter: Domain Completion Matrix

**Target Phase:** Phase 5 (Collaborative authoring on SharePoint). All domains Phase 5+.

| Domain | Port Interface | Phase 5 Target | Current Status | PnPjs Method | Blocking Dependencies | Notes |
|---|---|---|---|---|---|---|
| **Project** | `IProjectRepository` | ✅ Yes | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 MVP |
| **Lead** | `ILeadRepository` | ✅ Yes | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 MVP |
| **Estimating** | `IEstimatingRepository` | ✅ Yes | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 MVP |
| **Schedule** | `IScheduleRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Buyout** | `IBuyoutRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Compliance** | `IComplianceRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Contract** | `IContractRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Risk** | `IRiskRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Scorecard** | `IScorecardRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **PMP** | `IPmpRepository` | Phase 5 | Not Started | `sp.web.lists.getByTitle()` | Site provisioning (P5-SP-001) | Phase 5 |
| **Auth** | `IAuthRepository` | Phase 5 | Not Started | (AAD + ADAL) | Site provisioning (P5-SP-001) | Reuses MSAL |

## Factory Wiring Status

**Current File:** `packages/data-access/src/factory.ts`

| Change | Current State | Phase 1 Change | Phase 5 Change | Rationale |
|---|---|---|---|---|
| Mock adapter registration | Implemented | Keep as-is | Keep as-is | Default for dev/test |
| Proxy adapter import | Stub only | Implement all domains in matrix | N/A | Phase 1 critical path |
| SharePoint adapter import | Stub only | N/A | Implement all domains in matrix | Phase 5 target |
| `HBC_ADAPTER_MODE` read | Implemented | Add env validation guard (see P1-B3) | Add feature flag check | Prevent silent mock fallback |
| Domain-level overrides | Not present | Implement `HBC_ADAPTER_MODE_LEADS`, etc. | Keep | Gradual rollout support |

## Blocking Dependencies

### For Proxy Adapter (Phase 1)

**Azure Functions Backend Work (P1-BE):**
- `P1-BE-001`: REST endpoints for Project, Lead domains
  - `GET /api/projects/{id}`
  - `POST /api/projects` (create)
  - `GET /api/leads/{id}`
  - `POST /api/leads` (create)
- `P1-BE-002`: REST endpoints for Estimating domain
  - `GET /api/estimating/{id}`
  - `POST /api/estimating` (create)
- Must support MSAL OBO (OAuth 2.0 On-Behalf-Of flow) for token exchange
- Must return data shaped to match port interface contracts

**Auth Service (P1-AUTH):**
- MSAL backend service must be configured in Azure
- OBO flow must support all required scopes (resource-specific scopes per domain)
- Token caching strategy must be implemented

### For SharePoint Adapter (Phase 5)

**Site Provisioning (P5-SP-001):**
- Site collection or sub-site provisioning script must exist
- List schemas for all 10 domains must be provisioned
- PnPjs initialization must point to correct site URL

## Definition of Done per Adapter

### Mock Adapter
- ✅ All 11 domains implemented with in-memory storage
- ✅ CRUD operations (create, read, update, delete) working
- ✅ Seed data exports available (SEED_LEADS, SEED_PROJECTS, etc.)
- ✅ `resetAllMockStores()` function available for test isolation
- ✅ No external dependencies (in-memory only)

### Proxy Adapter (per domain)
- ⬜ Azure Functions endpoint exists and returns correctly-shaped data
- ⬜ Proxy adapter class implements `IXxxRepository` interface fully
- ⬜ MSAL OBO token exchange works in backend
- ⬜ Error handling for 404, 401, 500, network timeout
- ⬜ Integration test passes against test Azure Functions instance
- ⬜ Unit tests mock Azure Functions calls and verify adapter behavior
- ⬜ Documentation updated in proxy adapter README with domain details
- ⬜ `HBC_ADAPTER_MODE='proxy'` verified in CI environment

### SharePoint Adapter (per domain)
- ⬜ PnPjs initialized and pointing to correct site
- ⬜ SharePoint list for domain exists with correct schema
- ⬜ Adapter class implements `IXxxRepository` interface fully
- ⬜ CRUD operations tested against real SharePoint instance
- ⬜ Error handling for permission denied, list not found, SPO throttling
- ⬜ Integration test passes against test SharePoint site
- ⬜ Documentation updated in sharepoint adapter README with domain and list schema details

### API Adapter (Phase 7+)
- ⬜ Azure SQL schema exists for all domains
- ⬜ REST endpoints exist and return correctly-shaped data
- ⬜ Adapter class implements all `IXxxRepository` interfaces
- ⬜ Unit and integration tests pass
- ⬜ Documentation updated in api adapter README

## Update Cadence

This backlog is updated:
- **Weekly:** Domain status changes, blocking dependency resolution
- **Per Phase Start:** Phase target confirmation, new domain prioritization
- **Per Adapter Completion:** Domain removal from "Not Started" status
- **On Plan Change:** If P1-A1 or P1-A2 changes, reflect in this backlog immediately

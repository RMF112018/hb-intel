# White-Glove Development Guide

## Purpose

Developer-facing guide for working on the white-glove employee device deployment feature.

## Directory layout

### Backend services

```
backend/functions/src/services/
├── white-glove/                          # Run orchestration
│   ├── white-glove-run-service.ts        # Parent/child run service
│   ├── white-glove-result-envelope.ts    # SPFx result types
│   ├── white-glove-retry-semantics.ts    # Retry/compensation/repair rules
│   ├── index.ts                          # Barrel exports
│   └── __tests__/                        # Unit tests
├── device-management/
│   ├── microsoft/                        # Intune, Autopilot, identity
│   │   ├── microsoft-identity-service.ts
│   │   ├── microsoft-intune-service.ts
│   │   ├── microsoft-autopilot-service.ts
│   │   ├── microsoft-readiness-probes.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── apple/                            # ABM, ADE, MDM
│   │   ├── apple-abm-service.ts
│   │   ├── apple-ade-service.ts
│   │   ├── apple-mdm-service.ts
│   │   ├── apple-readiness-probes.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   └── ninjaone/                         # API, standardization, bundles
│       ├── ninjaone-api-service.ts
│       ├── ninjaone-standardization-service.ts
│       ├── ninjaone-bundle-mapping.ts
│       ├── ninjaone-readiness-probes.ts
│       ├── index.ts
│       └── __tests__/
└── connection-registry-service.ts        # Extended with WG connector classes
```

### API routes

```
backend/functions/src/functions/adminApi/
├── white-glove-routes.ts                 # 8 WG API endpoints
└── connection-routes.ts                  # Extended with history + policy endpoints
```

### Shared models

```
packages/models/src/admin-control-plane/
├── IWhiteGlove.ts                        # Run/checkpoint/evidence types
├── IWhiteGloveTemplates.ts              # Package templates + catalog
├── IWhiteGloveConnectorGovernance.ts    # Connector governance types
├── AdminEnums.ts                         # WhiteGloveDeployment domain
└── IAdminAdapter.ts                      # 7 new adapter categories
```

### Frontend pages

```
apps/admin/src/
├── pages/
│   ├── WhiteGloveConnectionsPage.tsx     # Connector config + health
│   ├── WhiteGloveReadinessPage.tsx       # Environment readiness
│   ├── WhiteGloveLaunchPage.tsx          # 5-step package launch
│   ├── WhiteGloveCheckpointPage.tsx      # Active checkpoint management
│   ├── WhiteGloveRunHistoryPage.tsx      # Run history list
│   ├── WhiteGloveRunDetailPage.tsx       # Run detail + recovery
│   └── WhiteGlovePackageStandardsPage.tsx # Template governance
├── hooks/
│   ├── useWhiteGloveConnections.ts
│   ├── useWhiteGloveReadiness.ts
│   ├── useWhiteGloveLaunch.ts
│   ├── useWhiteGloveCheckpoints.ts
│   ├── useWhiteGloveRunHistory.ts
│   ├── useWhiteGloveRunDetail.ts
│   └── useWhiteGloveTemplateGovernance.ts
└── router/
    ├── lane-registry.ts                  # 6 WG lanes (orders 9–14)
    └── routes.ts                         # 8 WG routes (7 lanes + detail sub-route)
```

## Service patterns

All adapter services follow the same pattern:
1. **Interface** — declares methods
2. **Real implementation** — stub that delegates to `IConnectionRegistryService` for readiness; real API calls TBD
3. **Mock implementation** — returns synthetic data for testing

Services are wired in `service-factory.ts` with real/mock switching based on adapter mode.

## Running tests

```bash
# All backend unit tests (includes WG tests)
cd backend/functions && npx vitest run --project unit

# Only WG run service tests
npx vitest run --project unit src/services/white-glove/__tests__/

# Only device management adapter tests
npx vitest run --project unit src/services/device-management/

# Admin app build (typecheck + vite)
pnpm --filter @hbc/spfx-admin run build

# Admin app lint
pnpm --filter @hbc/spfx-admin run lint

# Models build
pnpm --filter @hbc/models run build
```

## Adding a new adapter

1. Create service directory under `backend/functions/src/services/device-management/{adapter}/`
2. Implement interface + real stub + mock (follow Microsoft/Apple/NinjaOne pattern)
3. Add readiness probes returning `IWhiteGloveReadinessCheck[]`
4. Add `AdminAdapterCategory` enum value in `packages/models/src/admin-control-plane/IAdminAdapter.ts`
5. Register adapter descriptor in `backend/functions/src/services/admin-control-plane/adapters.ts`
6. Wire service in `backend/functions/src/hosts/admin-control-plane/service-factory.ts`
7. Re-export interface in `backend/functions/src/services/admin-control-plane/types.ts`
8. Update adapter count in `adapter-registry.test.ts`
9. Add unit tests under `__tests__/`
10. Rebuild models: `pnpm --filter @hbc/models run build`

## Key architecture rules

- SPFx never calls external APIs directly — all through backend
- Credentials never returned in API responses — `hasCredential` flag only
- Microsoft, Apple, NinjaOne are distinct adapters — no generic device adapter
- iPhone, iPad, macOS have distinct enrollment paths — no flattening
- NinjaOne is post-enrollment only — not an enrollment authority
- All run state changes are audited via `IAdminAuditService`

## Cross-references

- [Architecture Index](../../architecture/plans/MASTER/spfx/admin/white-glove/README.md)
- [Domain Model](../../reference/white-glove/white-glove-domain-model.md)
- [Connector Governance](../../reference/configuration/white-glove-connector-governance.md)

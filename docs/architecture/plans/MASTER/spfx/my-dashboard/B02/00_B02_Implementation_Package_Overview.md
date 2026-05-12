# 00 — B02 Implementation Package Overview

## Objective

Translate the closed B02 planning artifact into a repo-safe, implementation-ready Claude Code prompt package that creates the **My Dashboard runtime foundation** without prematurely implementing later My Dashboard product batches.

## Final verdict

**Proceed.** B02 is sufficiently closed to implement now.

The live repo contains the B02 planning artifact and the supporting reference patterns that B02 depends on, but the My Dashboard runtime/domain implementation itself remains absent. The correct package posture is therefore a focused runtime foundation sequence, not another round of plan-only refinement.

---

## B02 product/architecture decisions to treat as locked

| Area | Locked decision |
|---|---|
| SharePoint target | MyDashboard communication site home page, full-width section |
| SPFx package | standalone `hb-intel-my-dashboard.sppkg` |
| Solution/domain | new sibling `apps/my-dashboard` domain |
| Supported host | `SharePointWebPart` only for MVP |
| Full-width support | `supportsFullBleed: true` |
| Theme variants | `supportsThemeVariants: false` |
| Feature deployment | `skipFeatureDeployment: true`, `isDomainIsolated: false` |
| API permission | `hb-intel-api-production` / `access_as_user` |
| Runtime global | `__hbIntel_myDashboard` |
| Runtime marker | web-part GUID exposed as `runtimeMarkerId` |
| Config injection | reuse shared shell `FUNCTION_APP_URL`, `BACKEND_MODE`, `ALLOW_BACKEND_MODE_SWITCH`, `API_AUDIENCE` pattern |
| Auth bootstrap | use `createSpfxApiTokenProvider(...)` from `@hbc/auth/spfx` |
| Backend protection | future My Work routes must target existing `withAuth()` / `validateToken()` contract |

---

## Why B02 should be implemented as code now

The repo already proves every foundational pattern B02 requires:

- standalone SPFx domain/package posture exists in PCC and HB Homepage,
- audience-scoped SPFx token acquisition exists in Estimating and Accounting,
- production readiness and runtime config primitives exist in Estimating and Accounting,
- package-truth proof / runtime marker machinery exists in the packaging orchestrator,
- the protected backend middleware exists and is already the architecture contract B02 targets.

What is missing is the **My Dashboard implementation of those patterns**.

---

## What the local code agent should produce

By the end of the five prompts, repo truth should include:

```text
apps/my-dashboard/
├── config/package-solution.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── MyDashboardApp.tsx
    ├── mount.tsx
    ├── config/
    │   ├── runtimeConfig.ts
    │   └── productionReadiness.ts
    └── webparts/
        └── myDashboard/
            └── MyDashboardWebPart.manifest.json
```

and:

```text
tools/build-spfx-package.ts
```

updated with:

- My Dashboard domain registry entry,
- My Dashboard web-part runtime-marker constant,
- My Dashboard runtime marker registry mapping,
- My Dashboard critical runtime path set,
- My Dashboard critical runtime path mapping.

---

## Architectural restraint: do not outrun B02

The prompts deliberately **do not** instruct the agent to build:

- My Work shell/navigation UI,
- queue cards or Adobe Sign previews,
- My Work read-model data clients beyond minimal compatibility if compilation requires a seam,
- backend route handlers,
- OAuth/token storage services,
- hosted evidence specs.

B02 is the deployment/runtime foundation. Later batches should build on it.

---

## Package philosophy

The package resolves implementation work into five small, auditable prompts:

1. **Domain/package scaffold** — create the new app shell, package solution, manifest, build metadata.
2. **Runtime config** — implement config and production-readiness primitives using existing repo patterns.
3. **Mount/auth bootstrap** — wire SPFx context, token provider, runtime marker, and minimal app root.
4. **Packaging orchestration** — register My Dashboard in the authoritative .sppkg builder and proof model.
5. **Validation/closeout** — prove the foundation compiles, packages when toolchain allows, and does not overreach.

This keeps each prompt focused and creates clean commit boundaries if the local agent commits prompt-by-prompt.

# P0-D1 — Environment and Promotion Matrix

**Document ID:** P0-D1
**Workstream:** D — Release and Environment Control
**Milestone:** M0.4
**Deliverable:** Environment Topology + Promotion Criteria Matrix + Release-Control Gap List
**Status:** Draft
**Date:** 2026-03-16
**Governing Plans:**
- `docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`
- `docs/reference/developer/wave-1-ci-gates.md`
- ADR-0010: CI/CD Pipeline
- ADR-0011: Verification & Deployment Readiness

---

## 1. Purpose

This document defines the complete environment topology, deployment artifact matrix, and promotion criteria for HB Intel Phase 0 through production release. It establishes:

- **Environment roles and characteristics** — which environments exist, their purpose, trust level, and access model
- **Artifact placement rules** — which artifact types can deploy to which environments and under what conditions
- **Promotion gates** — specific criteria and CI/CD checks required to advance from one environment to the next
- **Release-control gaps** — known gaps in CI coverage, test automation, and environment qualification that must be closed before Phase 1 entry

This matrix is the authoritative reference for release planning, CI/CD workflow design, and environment readiness assessment.

---

## 2. Environment Topology

### 2.1 Summary Table

| Environment | Role | Trigger | Auth Mode | Persistent State | Access | CI/CD Involvement |
|---|---|---|---|---|---|---|
| **Local/Developer** | Development sandbox, local testing, design iteration | Manual (`pnpm dev` / turbo run) | Mock (VITE_AUTH_MODE=mock by default) | Developer machine only | Unrestricted | None |
| **CI (GitHub Actions)** | Validation gate, linting, unit test, build verification | PR to main + push to main | None (ephemeral, Azurite emulator for storage) | None (ephemeral) | GitHub Actions runner (ubuntu-latest) | Triggers ci.yml, cd.yml, spfx-build.yml path-filtered |
| **Staging** | Pre-production verification, E2E testing, smoke testing against real tenant | Auto-deploy after CI success on main | Configurable (initially mock via Vercel env; switches to msal when Azure AD configured) | Real Azure tenant + Vercel managed state | Dev team + QA + product | cd.yml (PWA, Functions) + spfx-deploy.yml (SPFx auto) + e2e.yml (manual) + smoke-tests.yml (daily) |
| **Production** | Released software serving business operations | v* semantic version tags + manual SPFx dispatch | msal (Azure AD integrated) | Real Azure tenant + Vercel managed state | End users + authorized operators | release.yml (gates E2E pass) + deploy-functions.yml (production slot) + spfx-deploy.yml (manual dispatch) |

### 2.2 Individual Environment Descriptions

#### 2.2.1 Local / Developer Environment

**Purpose:** Sandbox for active development, local iteration, design validation, and package-level testing before CI submission.

**Characteristics:**
- Runs on developer workstations via `pnpm dev` (PWA dev harness on port 3000) and `pnpm turbo run build`
- No persistent external state — all data ephemeral
- Mock authentication enabled by default (VITE_AUTH_MODE=mock)
- `apps/dev-harness` includes mock auth bypass for rapid iteration
- No Azure tenant access required for basic feature development
- Developers run linting, unit tests, and manual browser testing locally before committing

**Typical workflow:**
```
git checkout -b feature/foo
pnpm install
pnpm dev                  # PWA + dev-harness on localhost:3000
pnpm turbo run lint       # Check for syntax/style
pnpm turbo run check-types # TypeScript validation
pnpm turbo run test       # Unit tests (may be partial)
# ... iterate on code ...
git push -u origin feature/foo  # Triggers CI on PR
```

---

#### 2.2.2 CI (GitHub Actions) Environment

**Purpose:** Mandatory validation gate before any code reaches main branch; enforces code quality, type safety, and test requirements.

**Characteristics:**
- Triggered by: PR to main + push to main
- Ephemeral Ubuntu runners (ubuntu-latest)
- No persistent state — all test artifacts discarded after job completion
- Azurite storage emulator (for @hbc/functions and @hbc/provisioning testing without Azure account)
- Turbo remote caching enabled (TURBO_TOKEN + TURBO_TEAM secrets)
- No live Azure tenant access — smoke tests run separately in Staging

**Trigger path:** `ci.yml` runs immediately on PR or push; `cd.yml` runs after ci.yml success on main branch

**All 4 CI jobs must pass before merge:**

1. **`lint-and-typecheck`**
   - `pnpm turbo run lint` — all workspace packages
   - ADR-0095 stub-detection scan (`throw new Error` pattern grep) across all packages
   - `pnpm turbo run check-types` — TypeScript validation across all workspace
   - Failure blocks merge

2. **`unit-tests`**
   - @hbc/functions (with Azurite emulator)
   - @hbc/provisioning (with Azurite emulator)
   - Failure blocks merge

3. **`unit-tests-p1`**
   - @hbc/auth (90% coverage threshold enforced)
   - @hbc/shell (95% coverage threshold enforced)
   - @hbc/sharepoint-docs (95% coverage threshold enforced)
   - @hbc/bic-next-move (95% coverage threshold enforced)
   - @hbc/complexity (90% coverage threshold enforced)
   - **Note:** Only 5 of 20 Category C platform primitives have CI coverage (see GAP-D-01)
   - Failure blocks merge

4. **`unit-tests-apps`**
   - @hbc/spfx-admin (59 tests, must pass)
   - @hbc/spfx-estimating (must pass)
   - @hbc/spfx-accounting (must pass)
   - @hbc/pwa (must pass)
   - tools/check-no-role-branch.sh role-branch verification gate
   - **Note:** Only 3 of 11 SPFx apps have CI tests; remaining 8 have no CI gate (see GAP-D-02)
   - Failure blocks merge

---

#### 2.2.3 Staging Environment

**Purpose:** Pre-production validation environment where all code passes CI; serves real SharePoint tenant; used for E2E testing, smoke testing, and pre-release verification.

**Characteristics:**
- Auto-deployed after successful CI on main branch
- Real Azure tenant (dev/test instance)
- Real SharePoint tenant (targets prod features in sandbox sites for testing)
- PWA hosted on Vercel (staging slot)
- Azure Functions deployed to staging slot
- SPFx apps deployed to staging App Catalog
- Auth mode configurable via Vercel environment variables (initially mock; switches to msal when Azure AD configured)
- Developers + QA + product team access
- Persistent state (SharePoint sites, Azure storage, function state)

**Deployment paths:**
- **PWA:** cd.yml auto-deploys to Vercel staging after CI success
- **Azure Functions:** cd.yml auto-deploys to staging slot after CI success
- **SPFx apps:** spfx-deploy.yml auto-deploys to staging App Catalog after spfx-build.yml success
- E2E tests (e2e.yml) target staging URLs via secrets: STAGING_ESTIMATING_URL, STAGING_ACCOUNTING_URL
- Smoke tests (smoke-tests.yml) run daily at 6 AM UTC against real SharePoint tenant

**When to use:**
- Manual E2E test runs (Playwright against staging URLs)
- Smoke testing (daily automated + on-demand)
- Pre-release validation
- Configuration testing (auth mode switching, feature flags)

---

#### 2.2.4 Production Environment

**Purpose:** Live customer environment; released software serving business operations; highest trust and verification requirements.

**Characteristics:**
- Deployed **only** via explicit v* semantic version tags (no automatic promotion)
- Real Azure tenant (prod instance)
- Real SharePoint tenant (production sites)
- PWA hosted on Vercel production slot
- Azure Functions deployed to production slot
- SPFx apps deployed to production App Catalog (manual dispatch only)
- Auth mode: msal (Azure AD integrated)
- End-user facing; governed by release checklist

**Deployment criteria:**
- Triggered by: v* semantic version tags only
- E2E tests must pass against staging (enforced by release.yml)
- Azure Functions deploy-functions.yml production environment selection
- SPFx deploy: manual dispatch of spfx-deploy.yml with environment = production
- **No automatic production promotion** — all production deploys require explicit gate pass

---

## 3. Artifact Deployment Matrix

This matrix defines which artifact types can deploy to which environments and under what conditions.

| Artifact Type | Local | CI | Staging | Production | Notes |
|---|---|---|---|---|---|
| **PWA (Vercel app)** | Manual (pnpm dev) | None (CI validates only) | Auto (cd.yml after CI pass) | Auto (release.yml on v* tag) | Auth mode configurable via Vercel env vars |
| **Azure Functions** | Manual (local emulator or pnpm dev) | Azurite emulator only | Auto (cd.yml staging slot) | Manual (deploy-functions.yml prod environment selection) | Staging auto; prod requires manual gate |
| **SPFx Admin (@hbc/spfx-admin)** | Manual (npm run dev) | spfx-build.yml (validation only) | Auto (spfx-deploy.yml after build) | Manual dispatch (spfx-deploy.yml with env=production) | 59 CI tests; tested in SPFx iframe harness |
| **SPFx Estimating (@hbc/spfx-estimating)** | Manual | spfx-build.yml validation | Auto (spfx-deploy.yml) | Manual dispatch | CI tested; path filter: apps/estimating/** |
| **SPFx Accounting (@hbc/spfx-accounting)** | Manual | spfx-build.yml validation | Auto (spfx-deploy.yml) | Manual dispatch | CI tested; path filter: apps/accounting/** |
| **SPFx Other 8 apps** | Manual | spfx-build.yml validation (no CI tests) | Auto (spfx-deploy.yml) | Manual dispatch | **No CI unit tests** (see GAP-D-02); path filter covers all 11 apps in apps/** |
| **dev-harness (@hbc/dev-harness)** | Manual (pnpm dev, port 3000) | None (not in CI pipeline) | None | None | Local development sandbox only; not deployed to external envs |
| **Platform packages (@hbc/auth, @hbc/shell, etc.)** | Built locally via pnpm turbo run build | CI validates via unit-tests-p1 (5 packages) or no gate (15 packages) | Consumed by deployed apps | Consumed by released apps | Only 5 of 20 platform packages have CI coverage (see GAP-D-01) |

---

## 4. Promotion Criteria Matrix

This matrix defines the gates required to move artifacts from one environment to the next.

### 4.1 Local → CI (GitHub Actions)

| Trigger | Gate | Status | Notes |
|---|---|---|---|
| `git push origin feature/...` | Create pull request to main | Auto | CI jobs run automatically on PR creation |
| All 4 CI jobs pass | Approval ready | Manual | PR can be approved once all checks pass |
| Maintainer approval + all checks green | Merge to main | Manual | Requires at least one approval + all CI green |

**All 4 CI jobs must pass:**
- lint-and-typecheck
- unit-tests
- unit-tests-p1
- unit-tests-apps

---

### 4.2 CI → Staging (Automatic)

| Trigger | Gate | Status | Notes |
|---|---|---|---|
| Commit lands on main | Check CI pass (check-ci gate job) | Auto | cd.yml runs only if all ci.yml jobs pass |
| CI all green | cd.yml triggers | Auto | Concurrency: never cancels in-progress deploys |
| cd.yml success | PWA deployed to Vercel staging | Auto | |
| cd.yml success | Azure Functions deployed to staging slot | Auto | |
| spfx-build.yml success on main | spfx-deploy.yml staging step triggers | Auto | |
| spfx-deploy.yml success | SPFx apps deployed to staging App Catalog | Auto | |

**Summary:** Once all CI jobs pass and commit is on main, staging deployment is automatic. No manual gate.

---

### 4.3 Staging → Production (Explicit Gates)

| Trigger | Gate | Status | Notes |
|---|---|---|---|
| Create v* semantic version tag | Validate semver format (release.yml) | Auto | Must match v{major}.{minor}.{patch} pattern |
| Semver valid | Trigger e2e.yml against staging | Auto | Playwright tests against STAGING_ESTIMATING_URL, STAGING_ACCOUNTING_URL |
| E2E all tests pass | Deploy Azure Functions to production slot | Auto | release.yml → deploy-functions.yml production environment |
| Functions deploy success | Create GitHub release | Auto | |
| **SPFx production deploy** | Manual dispatch of spfx-deploy.yml | Manual | **No automatic SPFx production deploy** — requires explicit user action |

**Summary:**
- **PWA + Functions:** Automatic promotion on v* tag + E2E pass
- **SPFx:** Manual dispatch required for production; staging is automatic post-build

---

## 5. CI Gate Inventory

This section details all CI jobs that enforce release control.

| Job | Workflow | Trigger | Packages Covered | Coverage Threshold | Failure Impact | Notes |
|---|---|---|---|---|---|---|
| lint-and-typecheck | ci.yml | PR + main | ALL workspace packages | N/A (no threshold) | Blocks merge | Includes ADR-0095 stub detection scan |
| unit-tests | ci.yml | PR + main | @hbc/functions, @hbc/provisioning | N/A | Blocks merge | Uses Azurite emulator for storage testing |
| unit-tests-p1 | ci.yml | PR + main | @hbc/auth (90%), @hbc/shell (95%), @hbc/sharepoint-docs (95%), @hbc/bic-next-move (95%), @hbc/complexity (90%) | 90–95% | Blocks merge | Only 5 of 20 Category C packages have thresholds |
| unit-tests-apps | ci.yml | PR + main | @hbc/spfx-admin (59 tests), @hbc/spfx-estimating, @hbc/spfx-accounting, @hbc/pwa | N/A (zero-failure model) | Blocks merge | Includes check-no-role-branch.sh gate; no % threshold enforcement |
| spfx-build | spfx-build.yml | main + path filter (apps/**, packages/**) | All 11 SPFx apps | N/A (build only) | Blocks spfx-deploy | Builds all webparts; no unit tests for 8 apps |
| check-ci | cd.yml | Triggered after ci.yml on main | Validates all 4 ci.yml jobs passed | Required pass | Blocks staging deploy | Gate job enforcing CI prerequisite before CD |
| e2e | e2e.yml | Manual dispatch + v* tags | Playwright integration tests | N/A (all-pass model) | Blocks production deploy (v* tag path) | Requires STAGING_ESTIMATING_URL, STAGING_ACCOUNTING_URL secrets |
| smoke-tests | smoke-tests.yml | Daily 6 AM UTC + manual dispatch + PRs | @hbc/functions (smoke test suite) | N/A | Alert only (not blocking) | Requires Azure tenant secrets; real SharePoint tenant |
| security | security.yml | PRs + Monday 6 AM scheduled | Entire workspace (`pnpm audit --audit-level=high`) | N/A | Alert only (advisory) | Security scanning; not blocking release |

---

## 6. Release-Control Gap List

The following gaps in CI coverage, test automation, and environment qualification must be closed before Phase 1 entry.

| ID | Description | Severity | Phase 1 Blocker | Recommended Action | Target Phase |
|---|---|---|---|---|---|
| **GAP-D-01** | Only 5 of 20 Category C platform primitives have CI unit test coverage. Missing coverage: @hbc/theme, @hbc/adf-integration, @hbc/entity-factory, @hbc/insights, @hbc/ui-kit, @hbc/storage, @hbc/cache, @hbc/messaging, @hbc/orchestration, @hbc/workflow, @hbc/escalation, @hbc/reporting, @hbc/analytics, @hbc/config, and 6 others. | High | **YES** | Add unit tests to all 20 Category C packages; enforce coverage thresholds in unit-tests-p1 job. Update ci.yml workflow to include all 20 packages. | Phase 1 start |
| **GAP-D-02** | Only 3 of 11 SPFx apps have unit tests in CI (admin, estimating, accounting). Remaining 8 apps (bic-next-move, complexity, ideas, insights, reporting, escalation, workflow, orchestration) have no CI test gate and are built but not validated. | High | **YES** | Add unit tests to all 11 SPFx apps; add test step to unit-tests-apps job or create unit-tests-spfx-all job covering all 11 webparts. Enforce zero-failure requirement. | Phase 1 start |
| **GAP-D-03** | E2E tests require staging secret URLs (STAGING_ESTIMATING_URL, STAGING_ACCOUNTING_URL) to be configured in GitHub repository secrets. Without these, e2e.yml cannot run. | Medium | No | Configure STAGING_ESTIMATING_URL and STAGING_ACCOUNTING_URL in GitHub repository secrets pointing to deployed staging URLs after Vercel staging deploy is live. Update e2e.yml to validate secret presence. | M0.4 (concurrent with Vercel setup) |
| **GAP-D-04** | promote-ideas.yml is disabled (if: false); scripts/promote-ideas.mjs does not exist. Cannot auto-promote ideas from ideation to active plans in Phase 0. | Low | No | Either implement promote-ideas.mjs and enable workflow, or document manual promotion process in dev runbook. Defer to Phase 1 planning. | Phase 1 planning |
| **GAP-D-05** | No explicit coverage threshold enforcement for app-level tests. @hbc/spfx-admin, @hbc/spfx-estimating, @hbc/spfx-accounting, @hbc/pwa have zero-failure requirement but no percentage threshold (unlike platform packages which enforce 90–95%). | Medium | No | Define coverage thresholds for all 4 apps (recommend 80% for apps); add coverage reporting to unit-tests-apps job; enforce via CI gate if below threshold. Update ci.yml. | Phase 1 start |
| **GAP-D-06** | SPFx production deploy is manual-dispatch only (spfx-deploy.yml with environment = production requires human trigger). No automatic promotion path from staging to production for SPFx artifacts. Breaks release parity with PWA and Functions. | Medium | No | Document SPFx manual production dispatch as Phase 1 release SOP. Consider auto-promotion on v* tag in Phase 1 if manual process proves bottleneck. For now, enforce checklist discipline in release.yml gate. | Phase 1 release SOP |
| **GAP-D-07** | No automated Phase 1 readiness gate. Phase 1 entry criteria (GAP-D-01, GAP-D-02 closure, E2E + smoke test pass, staging soak) checked manually via P0-E1 (Phase 0 Completion Checklist) only. No CI workflow to prevent Phase 1 start before gates close. | High | **YES** | Create P0-E1-gate.yml workflow that runs on demand, validates closure of D-01, D-02, and checks pass/fail of e2e.yml and smoke-tests.yml in last 7 days. Add manual approval gate in release.yml blocking v1.0.0 tag creation until P0-E1 gate passes. | M0.4 end |
| **GAP-D-08** | No formal staging environment qualification step before production release. E2E gate exists but no broader staging readiness checklist is enforced (e.g., no performance baseline, no penetration test, no smoke-test-series pass). | Medium | No | Create P0-staging-readiness.md checklist in docs/reference/developer/; add pre-release verification section to release.yml or release-verification-checklist.md. Recommend 48-hour staging soak before v* tag. | Phase 1 release SOP |

---

## 7. Related Documents

- **Authority:**
  - `docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`
  - ADR-0010: CI/CD Pipeline (Phase 8 baseline)
  - ADR-0011: Verification & Deployment Readiness (Phase 9 baseline)
  - ADR-0095: Stub-detection enforcement

- **CI/CD Workflows (source of truth):**
  - `.github/workflows/ci.yml` — lint, typecheck, unit tests, stub detection
  - `.github/workflows/cd.yml` — PWA + Functions staging auto-deploy
  - `.github/workflows/deploy-functions.yml` — staging + production slot deploy
  - `.github/workflows/spfx-build.yml` — all 11 SPFx app builds
  - `.github/workflows/spfx-deploy.yml` — staging auto + production manual dispatch
  - `.github/workflows/release.yml` — semantic version gate + E2E gate + production gate
  - `.github/workflows/e2e.yml` — Playwright tests against staging URLs
  - `.github/workflows/smoke-tests.yml` — daily + on-demand smoke test against real tenant

- **Reference & Guidance:**
  - `docs/reference/developer/wave-1-ci-gates.md` — CI gate definitions
  - `docs/reference/developer/release-verification-checklist.md` — pre-merge and pre-release checklists
  - `.github/workflows/security.yml` — supply chain scanning (advisory, non-blocking)

---

## 8. Summary: Promotion Path for Phase 0 → Phase 1

| Stage | Condition | Owner | Gate |
|---|---|---|---|
| 1. CI all green | All 4 ci.yml jobs pass | GitHub Actions | Automatic (blocking) |
| 2. Staging auto-deploy | cd.yml, spfx-deploy staging steps succeed | GitHub Actions | Automatic (non-blocking if passed) |
| 3. Staging soak & smoke tests | smoke-tests.yml runs daily + passes (48 hours recommended) | QA + Dev | Manual review + e2e.yml pass |
| 4. E2E validation | e2e.yml passes against STAGING_ESTIMATING_URL, STAGING_ACCOUNTING_URL | QA | Manual trigger + pass (blocking v* tag) |
| 5. Phase 1 readiness gate (GAP-D-07) | P0-E1 gate (D-01, D-02 closed) + manual approval | Release engineering | Blocks v1.0.0 tag creation |
| 6. Production release | v* semantic version tag created | Release engineering | Automatic: E2E gate (PWA + Functions) + manual SPFx dispatch |

---

**Document End**

Approval chain: Phase 0 Engineering Lead → Release Engineering → Product

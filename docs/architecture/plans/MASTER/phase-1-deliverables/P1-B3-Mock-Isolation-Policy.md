# P1-B3: Mock Isolation Policy

**Doc ID:** P1-B3
**Phase:** Phase 1
**Status:** Draft
**Date:** 2026-03-16

## Purpose

Define when mock adapters are allowed versus when real adapters (proxy, sharepoint, api) are required. This policy prevents accidental use of in-memory test data in production and ensures environment-appropriate adapter configuration.

## Mock Adapter Usage Policy

### ALLOWED Contexts

**Local Development** (`NODE_ENV=development`)
- Developer machines running HB Intel locally
- Default adapter mode: `'mock'`
- Allows fast iteration without external service dependencies
- Developer may override to test proxy adapter locally

**Unit Tests**
- Tests in `**/__tests__/unit/` or `**/*.test.ts`
- Required to use mock adapters for isolation and speed
- Must call `resetAllMockStores()` in `beforeEach` hook
- Ensures predictable, repeatable test data (SEED_LEADS, SEED_PROJECTS, etc.)

**Integration Tests** (against mock)
- Tests in `**/__tests__/integration/` that test repository interface contracts
- May use mock adapters to verify adapter interface compliance
- Must call `resetAllMockStores()` between test cases
- Isolated from external services

**Demo / Sandbox Environments**
- Ephemeral environments spun up for product demos, POCs
- OK to use mock adapters if no customer data is involved
- Must be clearly labeled as "demo" in UI and logs

### REQUIRED Contexts

**CI Pipeline** (unit and integration tests)
- GitHub Actions or Azure Pipelines running test suite
- Must use `HBC_ADAPTER_MODE='mock'`
- No override allowed (prevents accidental real-service calls)
- All tests must pass using mock data

### PROHIBITED Contexts

**Staging Environment**
- MUST use `HBC_ADAPTER_MODE='proxy'` or another non-mock adapter
- Mock data in staging masks real bugs and user workflows
- Azure DevOps / GitHub Actions deployment gate blocks mock mode

**Production Environment**
- MUST use `HBC_ADAPTER_MODE='proxy'` or another non-mock adapter
- Mock adapters in production is a critical security and data integrity failure
- Immediate incident response required if mock detected

**Any Environment with Real SharePoint Data**
- If adapter mode is `'sharepoint'`, mock is prohibited
- Mock data will never match SharePoint; causes user confusion
- Deployment gate enforces this

## Environment → Adapter Mode Mapping

| Environment | HBC_ADAPTER_MODE | Override Allowed | Enforcement | Notes |
|---|---|---|---|---|
| **local** | `'mock'` | ✅ Yes (to test proxy) | None (dev's choice) | Developer override for testing |
| **CI** | `'mock'` | ❌ No | Code check in startup | Required for fast test runs |
| **staging** | `'proxy'` | ❌ No | Deployment gate blocks mock | Real data paths required |
| **production** | `'proxy'` | ❌ No | Deployment gate + startup guard | Non-negotiable |
| **demo** | `'mock'` | ✅ Yes (if no customer data) | None (staging-like setup otherwise) | Clear labeling required |

## Guard Rail Implementation

### TypeScript Adapter Mode Guard

**File:** `packages/data-access/src/config/adapter-mode-guard.ts`

```typescript
/**
 * Assert that HBC_ADAPTER_MODE is appropriate for the current environment.
 * Throws a fatal error if mock mode is used in staging or production.
 *
 * Called during application startup in backend and frontend initialization.
 */
export function assertAdapterModeForEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'mock';

  if ((nodeEnv === 'production' || nodeEnv === 'staging') && adapterMode === 'mock') {
    throw new Error(
      `[FATAL] HBC_ADAPTER_MODE='mock' is not permitted in ${nodeEnv}. ` +
      `Set HBC_ADAPTER_MODE='proxy' or another production adapter before starting.`
    );
  }
}

/**
 * Log the current adapter configuration for debugging.
 * Safe to call after assertAdapterModeForEnvironment() passes.
 */
export function logAdapterConfiguration(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'mock';
  console.log(`[Adapter Config] Environment: ${nodeEnv}, Adapter: ${adapterMode}`);
}
```

### Call Sites

**Backend Application Startup** (`packages/backend/functions/src/index.ts`)

```typescript
import { assertAdapterModeForEnvironment, logAdapterConfiguration } from '@hbc/data-access';

// First thing in main initialization
assertAdapterModeForEnvironment();
logAdapterConfiguration();

// ... rest of startup
```

**Frontend Application Startup** (`packages/app-shell/src/index.tsx`)

```typescript
import { assertAdapterModeForEnvironment, logAdapterConfiguration } from '@hbc/data-access';

// During app initialization before first repository call
assertAdapterModeForEnvironment();
logAdapterConfiguration();

// ... rest of app startup
```

### CI Verification Step

**GitHub Actions / Azure Pipelines:**

```yaml
- name: Verify Adapter Mode for Tests
  run: |
    if [ "$NODE_ENV" != "test" ] && [ "$NODE_ENV" != "development" ]; then
      echo "ERROR: NODE_ENV must be 'test' or 'development' for test runs"
      exit 1
    fi
    if [ -z "$HBC_ADAPTER_MODE" ] || [ "$HBC_ADAPTER_MODE" = "mock" ]; then
      echo "✓ Adapter mode is 'mock' (or unset, defaults to mock) - tests will run in isolation"
    else
      echo "WARNING: HBC_ADAPTER_MODE=$HBC_ADAPTER_MODE - tests may call external services"
    fi
```

### Deployment Gate (Azure DevOps / GitHub Actions)

**Pre-deployment Check:**

```typescript
// deployment-gate/src/validate-adapter-mode.ts
export async function validateAdapterModeForDeployment(
  environment: 'staging' | 'production',
  configFile: string
): Promise<void> {
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const adapterMode = config.HBC_ADAPTER_MODE ?? 'mock';

  if (adapterMode === 'mock') {
    throw new Error(
      `Deployment gate: HBC_ADAPTER_MODE='mock' is not allowed in ${environment}. ` +
      `Update deployment configuration to use 'proxy' or another real adapter.`
    );
  }

  console.log(`✓ Deployment validation passed: ${environment} will use adapter mode '${adapterMode}'`);
}
```

## Test Isolation Policy

### Unit Tests (All Domains)

**Requirement:** Mock adapters, with reset before each test.

```typescript
// example: projects.test.ts
import { resetAllMockStores } from '@hbc/data-access';
import { getRepository } from '@hbc/data-access';

describe('ProjectRepository', () => {
  beforeEach(() => {
    resetAllMockStores(); // Clear mock state
  });

  it('should create a project', async () => {
    const repo = getRepository('IProjectRepository');
    const project = await repo.create({ name: 'Test Project' });
    expect(project.id).toBeDefined();
  });

  it('should return different state after reset', async () => {
    const repo = getRepository('IProjectRepository');
    const beforeCount = (await repo.list()).length;

    resetAllMockStores();

    const afterCount = (await repo.list()).length;
    expect(afterCount).toBe(0); // Reset clears all data
  });
});
```

### Integration Tests (per adapter type)

**Against Mock Adapters (Phase 1 - pre-proxy completion):**
- Use `HBC_ADAPTER_MODE='mock'`
- Test repository interface contracts
- Verify adapter methods match interface signatures

**Against Real Adapters (Phase 1+):**
- Use `HBC_ADAPTER_MODE='proxy'` with test Azure Functions instance
- Verify end-to-end flow: app → adapter → backend → response
- Use different test database or isolated SharePoint test site

**Example:**

```typescript
// example: proxy-adapter.integration.test.ts
describe('ProxyAdapter Integration (Phase 1+)', () => {
  let repo: IProjectRepository;

  beforeAll(() => {
    process.env.HBC_ADAPTER_MODE = 'proxy';
    process.env.AZURE_FUNCTION_URL = 'https://test-functions.azurewebsites.net';
    repo = getRepository('IProjectRepository');
  });

  it('should call Azure Functions and return typed result', async () => {
    const project = await repo.getById('test-id');
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
  });
});
```

### E2E Tests (Staging)

- Use real adapter against staging backend
- `NODE_ENV='staging'`, `HBC_ADAPTER_MODE='proxy'`
- Test full user workflows with real data

## Feature Flag Integration: Domain-Level Overrides

### Gradual Proxy Rollout Strategy

Allow production rollout of proxy adapter on a per-domain basis without requiring all adapters to be complete.

**Environment Variables:**

```
HBC_ADAPTER_MODE='mock'                     # Global default (Phase 1 start)
HBC_ADAPTER_MODE_PROJECTS='proxy'           # Override for Projects domain
HBC_ADAPTER_MODE_LEADS='proxy'              # Override for Leads domain
HBC_ADAPTER_MODE_ESTIMATING='mock'          # Override back to mock if rollback needed
```

**Factory Implementation:**

```typescript
// packages/data-access/src/factory.ts
function getAdapterModeForDomain(domain: string): string {
  const domainKey = `HBC_ADAPTER_MODE_${domain.toUpperCase()}`;
  const domainOverride = process.env[domainKey];

  if (domainOverride) {
    console.log(`[Factory] Domain override found: ${domain} → ${domainOverride}`);
    return domainOverride;
  }

  const globalMode = process.env.HBC_ADAPTER_MODE ?? 'mock';
  console.log(`[Factory] Using global mode for ${domain}: ${globalMode}`);
  return globalMode;
}

// Usage in factory
function createProjectRepository(): IProjectRepository {
  const mode = getAdapterModeForDomain('projects');
  if (mode === 'proxy') return new ProxyProjectRepository(...);
  if (mode === 'mock') return new MockProjectRepository();
  throw new Error(`Unknown adapter mode: ${mode}`);
}
```

**Production Rollout Example (Phase 1 → Phase 2):**

1. Phase 1 complete: Projects and Leads proxies ready
2. Deploy with:
   ```
   HBC_ADAPTER_MODE='mock'
   HBC_ADAPTER_MODE_PROJECTS='proxy'
   HBC_ADAPTER_MODE_LEADS='proxy'
   ```
3. All other domains still use mock (safe fallback)
4. Monitor Projects and Leads error rates
5. Phase 2: Add more domains as proxies complete

## Review and Enforcement Owners

| Role | Responsibility |
|---|---|
| **Data Access Maintainer** | Owns `adapter-mode-guard.ts`, factory domain override logic, adapter README docs |
| **Backend Platform Owner** | Ensures Azure Functions endpoints respond correctly; sets up test instances |
| **DevOps / Release Engineer** | Owns deployment gate configuration; blocks staging/prod deployments with mock mode |
| **QA Lead** | Verifies CI test isolation; coordinates integration test strategy per adapter |
| **Product Manager** | Approves production rollout schedule and per-domain feature flag decisions |

## Appendix: Policy Enforcement Checklist

- [ ] `assertAdapterModeForEnvironment()` is called in backend startup
- [ ] `assertAdapterModeForEnvironment()` is called in frontend startup
- [ ] CI pipeline sets `NODE_ENV` and `HBC_ADAPTER_MODE` explicitly (no defaults)
- [ ] All unit tests call `resetAllMockStores()` in `beforeEach`
- [ ] Deployment gate validates adapter mode before staging/prod deployment
- [ ] Domain-level feature flag env vars are documented in deployment runbook
- [ ] Staging and production environments have `HBC_ADAPTER_MODE='proxy'` (or later adapter)
- [ ] Local development `.env` files are in `.gitignore` and not committed

# How To: Migrate BIC Aggregation to Server-Side

**Applies to:** `@hbc/bic-next-move` v1.x+
**Trigger:** Client-side fan-out performance becomes unacceptable (>~15 registered modules or
  observable throttling on slow connections in a team of 20+).

---

## Background

`useBicMyItems` currently uses client-side fan-out (D-06): it calls each registered module's
`queryFn` in parallel via `Promise.allSettled` and merges results in the browser.

This is controlled by `BIC_AGGREGATION_MODE` in `src/constants/manifest.ts`.
When set to `'server'`, `useBicMyItems` instead calls a single Azure Function endpoint
(`GET /api/bic/my-items`) that pre-aggregates results server-side.

The abstraction layer means **no module registration changes are required**.
Module authors continue to call `registerBicModule()` with their `queryFn`.
Only the aggregation path inside the package changes.

---

## Step 1: Build the Azure Function

Create `apps/azure-functions/src/functions/bicMyItems.ts`:

```typescript
import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
// Import each module's server-side query function
// (These are the server equivalents of the module queryFns registered client-side)
import { fetchBdScorecardBicItems } from '@hbc/bd-scorecard/server';
import { fetchEstimatingPursuitBicItems } from '@hbc/estimating/server';
// ... etc for all 10 manifest modules

export async function bicMyItems(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = request.query.get('userId');
  if (!userId) return { status: 400, body: 'userId required' };

  const results = await Promise.allSettled([
    fetchBdScorecardBicItems(userId),
    fetchEstimatingPursuitBicItems(userId),
    // ...
  ]);

  const items = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<any>).value);
  const failedModules = results
    .map((r, i) => r.status === 'rejected' ? manifestKeys[i] : null)
    .filter(Boolean);

  return { status: 200, jsonBody: { items, failedModules } };
}
```

---

## Step 2: Implement `executeServerAggregation`

In `src/registry/BicModuleRegistry.ts`, replace the stub:

```typescript
export async function executeServerAggregation(userId: string): Promise<IBicFanOutResult> {
  const response = await fetch(`/api/bic/my-items?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`BIC server aggregation failed: ${response.status}`);
  return response.json() as Promise<IBicFanOutResult>;
}
```

---

## Step 3: Flip the Feature Flag

In `src/constants/manifest.ts`, update:

```typescript
export const BIC_AGGREGATION_MODE: BicAggregationMode = 'server';
```

Or set via environment variable:
```
VITE_BIC_AGGREGATION_MODE=server
```

---

## Step 4: Verify

```bash
# Confirm single network call in My Work Feed (not N calls)
# Open browser DevTools > Network tab > filter by /api/bic
# Navigate to My Work Feed -- expect exactly 1 call to /api/bic/my-items

# Run E2E tests
pnpm exec playwright test e2e/bic-next-move.spec.ts

# Confirm client fan-out is no longer called
# (useBicMyItems should not call individual module proxy endpoints)
```

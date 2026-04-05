# Rollout Pattern Handoff — First-Class SPFx Loader Contract for Remaining hb-webparts

## 1. Final proof-case architecture

The `HbHeroBannerWebPart` proof case replaced the post-bundle shim loader model with a first-class SPFx loader contract. The architecture is:

- The build orchestrator (`tools/build-spfx-package.ts`) maintains an allowlist (`HB_WEBPARTS_PROOF_CASE_IDS`) of webpart manifest IDs that have been validated in the first-class model.
- When a single proof-case target is active, the real webpart manifest ID is written directly into `ShellWebPart.manifest.json` before `gulp bundle` — no neutral shell manifest ID.
- The compiled `entryModuleId` matches the webpart ID natively (`{webpartId}_1.0.0`), so SharePoint's `require()` resolves directly to the compiled shell asset.
- A proof-case-specific Vite entry (`mount-hero-proof-case.tsx`) isolates the bundle to only the target webpart's component tree.
- `ShellWebPart.ts` is unchanged — it loads the IIFE bundle via `SPComponentLoader` and calls `mount(el, context, config)`.

### Loader chain (no shims)

```
SharePoint require("{webpartId}_1.0.0")
  → scriptResources["{webpartId}_1.0.0"] → shell-web-part_{hash}.js
  → ShellWebPart.onInit() loads {domain}-app-{hash}.js via SPComponentLoader
  → globalThis.__hbIntel_hbWebparts.mount(el, context, config)
  → renders target component
```

## 2. Shim-era mechanisms eliminated

| Mechanism | Status |
|-----------|--------|
| Neutral shell manifest ID (`9a2f7f61-...`) | Bypassed when `targetManifests.length === 1` |
| Post-bundle manifest cloning (N manifests from 1 compiled base) | Bypassed — compiled manifest IS the final manifest |
| AMD shim modules (`define("targetId_1.0.0", ["baseId_1.0.0"], ...)`) | Not generated — `targetEntryModuleId === compiledEntryModuleId` |
| `shell-entry-{uuid}-{hash}.js` synthetic files | Not created |
| `entryModuleId` rewriting in `loaderConfig.scriptResources` | Not needed — compiled ID is already correct |

The shim infrastructure code remains in `build-spfx-package.ts` for the transition period. It activates only when `targetManifests.length > 1`, which will not occur until multiple webparts are added to the proof-case set simultaneously (not recommended — see section 6).

## 3. Preferred scale-out model

**One webpart at a time, using the existing proof-case allowlist.**

The current architecture supports two scale-out paths:

### Path A: Sequential single-webpart proof cases (recommended)

Add one webpart ID at a time to `HB_WEBPARTS_PROOF_CASE_IDS`. Each webpart gets its own proof-case entry, its own isolated bundle, and its own tenant validation cycle. This is the lowest-risk path because each migration is independently verifiable.

When all 10 webparts are proven:
- Replace individual proof-case entries with the restored full `mount.tsx` entry
- Remove `HB_WEBPARTS_PROOF_CASE_IDS` and `HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID`
- Remove the shim-generation code from `build-spfx-package.ts`
- The `packagingModel: 'multi'` path becomes a standard multi-manifest compile (no shims)

### Path B: Batch migration (not recommended yet)

Add multiple IDs to the allowlist at once. This re-activates the multi-manifest path with the neutral shell ID and shim generation. Only consider this after Path A has proven at least 3-4 webparts individually.

## 4. Per-webpart migration pattern

For each remaining webpart, repeat these steps:

### Step 1: Create isolated proof-case entry

Create `apps/hb-webparts/src/mount-{webpartName}-proof-case.tsx`:

```tsx
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ComponentName } from './webparts/{webpartDir}/ComponentName.js';

let root: Root | undefined;

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: { webPartId?: unknown; webPartProperties?: unknown },
): Promise<void> {
  void spfxContext;
  const webPartProperties = /* ... standard extraction ... */;
  // If the component needs identity data:
  // const identity = { displayName: spfxContext?.pageContext?.user?.displayName, ... };
  root = createRoot(el);
  root.render(createElement(ComponentName, { config: webPartProperties }));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
```

### Step 2: Update allowlist

In `tools/build-spfx-package.ts`, replace the current proof-case ID:

```typescript
const HB_WEBPARTS_PROOF_CASE_IDS = new Set([
  '{new-webpart-manifest-id}', // NewWebPartName
]);
```

### Step 3: Update build entry routing

In `tools/build-spfx-package.ts`, update the proof-case entry path:

```typescript
const proofCaseBuildEnv: Record<string, string> = isProofCase
  ? { HB_WEBPARTS_ENTRY: 'src/mount-{webpartName}-proof-case.tsx' }
  : {};
```

**Note:** The current implementation hardcodes `src/mount-hero-proof-case.tsx`. For the rollout, this should be generalized to derive the entry filename from the active proof-case webpart. A simple lookup map keyed by manifest ID is sufficient.

### Step 4: Build and inspect

```bash
rm -rf apps/hb-webparts/dist
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

Verify:
- 0 shim files
- `entryModuleId` matches the target webpart ID
- No neutral manifest
- Bundle contains only the target component tree

### Step 5: Tenant validate

Deploy `.sppkg`, add webpart from toolbox, confirm render, confirm no `require` failure.

### Step 6: Version bump and commit

Bump `apps/hb-webparts/config/package-solution.json` version (both `solution.version` and `features[0].version`).

## 5. File and build-system changes per webpart

| Change | File | Repeats per webpart |
|--------|------|---------------------|
| New proof-case entry | `apps/hb-webparts/src/mount-{name}-proof-case.tsx` | Yes |
| Update allowlist ID | `tools/build-spfx-package.ts` line 74-76 | Yes (replace) |
| Update entry path | `tools/build-spfx-package.ts` proof-case env | Yes (replace) |
| Version bump | `apps/hb-webparts/config/package-solution.json` | Yes |
| Completion note | `docs/architecture/plans/MASTER/spfx/webparts/phase-2/` | Optional |

No changes needed to: `ShellWebPart.ts`, `gulpfile.js`, `mount.tsx`, `vite.config.ts`, or any webpart manifest file.

## 6. Recommended migration order

### Tier 1 — Low risk (migrate first)

| Order | Webpart | ID | LOC | Notes |
|-------|---------|----|----|-------|
| 1 | PriorityActionsRail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | 54 | Stateless, no identity, simple rail |
| 2 | LeadershipMessage | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | 66 | Stateless, pure data display |
| 3 | CompanyPulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | 70 | Stateless, featured+secondary layout |
| 4 | PeopleCulture | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | 71 | Stateless, similar pattern to CompanyPulse |

### Tier 2 — Medium risk (migrate after tier 1 is stable)

| Order | Webpart | ID | LOC | Notes |
|-------|---------|----|----|-------|
| 5 | ToolLauncherWorkHub | `cb7060f5-b852-4600-b912-a5f6f7221ce2` | 71 | Custom icon resolution logic |
| 6 | ProjectPortfolioSpotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | 88 | Complex milestone/status rendering |
| 7 | PersonalizedWelcomeHeader | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | 48 | Small LOC but requires `HomepageIdentityInput` from `spfxContext` — proof-case entry must pass identity data through mount |

### Tier 3 — Higher risk (migrate last)

| Order | Webpart | ID | LOC | Notes |
|-------|---------|----|----|-------|
| 8 | SafetyFieldExcellence | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | 90 | Dense conditional badge rendering |
| 9 | SmartSearchWayfinding | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | 83 | Only component with React state (`useState`), client-side query filtering |

### Ordering rationale

- Tier 1 components are stateless, have no identity dependencies, and follow the same rail/card pattern — any one failure is easily debugged.
- PersonalizedWelcomeHeader is medium risk despite low LOC because it consumes `spfxContext.pageContext.user` through the mount entry — the proof-case entry template must be extended to pass identity data.
- SmartSearchWayfinding is last because it is the only component with React state, making it the furthest from a pure render-once proof case.

## 7. Issues that remain deferred

The following are **not** part of the loader-contract rollout and should remain deferred:

| Issue | Reason to defer |
|-------|-----------------|
| Restoring full `mount.tsx` as the single entry | Only after all 10 webparts are proven individually |
| Removing shim infrastructure from `build-spfx-package.ts` | Only after full rollout — the code is dormant but safe |
| Removing `HB_WEBPARTS_NEUTRAL_SHELL_MANIFEST_ID` constant | Same as above |
| Generalizing proof-case entry selection (entry filename lookup map) | Can be done at the start of tier 1 rollout or incrementally |
| Multi-webpart batch packaging (shipping all 10 in one `.sppkg` again) | Only after all are individually proven in first-class model |
| Homepage composition architecture (layout, ordering, slot management) | Separate concern — not a loader-contract issue |
| Secondary console noise unrelated to loader failures | Not blocking — address as separate cleanup |
| `@hbc/ui-kit` component maturity | Independent package concern |

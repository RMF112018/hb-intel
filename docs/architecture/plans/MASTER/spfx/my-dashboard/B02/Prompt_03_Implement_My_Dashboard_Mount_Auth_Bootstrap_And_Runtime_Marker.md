# Prompt 03 — Implement My Dashboard Mount, Auth Bootstrap, and Runtime Marker

## Role
Act as a focused SPFx runtime bootstrap agent. Execute only this prompt’s scope.

## Context
Prompt 01 should have created the My Dashboard app/package scaffold. Prompt 02 should have created runtime config/readiness modules. This prompt wires the actual app mount contract and global runtime marker required for SPFx package-truth validation.

## Read-first instruction
Do **not** re-read files that remain within your current context or memory unless exact current text is needed for patching or drift is suspected. Open only what is necessary for accurate edits.

## Objective
Create:

```text
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/mount.tsx
```

and implement:

- SPFx mount/unmount lifecycle,
- runtime config injection,
- SPFx auth bootstrap,
- protected API token-provider creation seam,
- global runtime marker contract.

## Required repo inspection before edits
Inspect the current versions of:

- `apps/estimating/src/mount.tsx`
- `apps/project-control-center/src/mount.tsx`
- `packages/auth/src/spfx/apiTokenProvider.ts`
- `packages/auth/src/spfx/index.ts`
- the Prompt 02 My Dashboard runtime config files.

## MyDashboardApp contract
Create a deliberately small React root component that:

- compiles,
- gives the new app a stable runtime host,
- avoids final shell/navigation decisions,
- avoids fake queue data,
- may receive `spfxContext` and/or `getApiToken` props only if useful for preserving the later provider seam,
- exposes a stable data attribute such as:
  ```text
  data-my-dashboard-app-root
  ```
  if doing so does not conflict with existing app conventions.

Keep the rendered content restrained. This is a runtime foundation, not the final user experience.

## mount.tsx requirements

### Mount signature
Implement an async mount contract compatible with the shell web part:

```ts
mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig): Promise<void>
```

### Mount config
The mount config should accept the runtime fields B02 requires:

```ts
functionAppUrl?: string;
backendMode?: 'production' | 'ui-review';
allowBackendModeSwitch?: boolean;
apiAudience?: string;
```

### Runtime config injection
Call `setRuntimeConfig(config)` before rendering when config is provided.

### SPFx auth bootstrap
When `spfxContext` exists:

1. resolve permission keys,
2. bootstrap SPFx auth,
3. resolve `apiAudience` from the My Dashboard runtime config,
4. create `getApiToken = createSpfxApiTokenProvider(spfxContext, apiAudience)` when audience exists.

### Token-provider seam
Pass `getApiToken` downward into `MyDashboardApp` or a minimal top-level app/provider seam. Do not call the token provider during mount unless a repo convention requires it; B02 only establishes the capability seam.

### Runtime marker contract
Generate/use the same My Dashboard web-part GUID that Prompt 01 placed in the manifest. Expose it as:

```ts
runtimeMarkerId
```

and publish:

```ts
globalThis.__hbIntel_myDashboard = { mount, unmount, runtimeMarkerId };
```

Mirror to `window` defensively when the repo precedent does so.

### Lifecycle stability
Use a mount/unmount/root pattern that is safe across repeat SharePoint render calls. Project Control Center’s mounted-instance pattern is a suitable precedent if it fits cleanly.

## Prohibited scope
Do not:

- call Adobe APIs,
- call backend routes in mount,
- create My Work shell/router/navigation,
- create final queue UI,
- add property-pane settings,
- register the packaging orchestrator yet.

## Validation
Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard build
```

If tests are present, run them too.

Also run:

```bash
rg -n "__hbIntel_myDashboard|runtimeMarkerId|createSpfxApiTokenProvider|bootstrapSpfxAuth|resolveSpfxPermissions" apps/my-dashboard/src
```

## Required closeout
Return:

1. files created/modified,
2. mount/auth/bootstrap behavior implemented,
3. manifest GUID used as runtime marker ID,
4. build/typecheck results,
5. scope confirmation that no later-batch UI/backend/provider work was implemented.

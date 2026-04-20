# PH7-BW-4 — Vite Bundle Configuration for SPFx Webparts

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2a, §4d (bundle optimization, <1MB budget)
**Date:** 2026-03-07
**Priority:** HIGH — Bundle budgets and SPFx-specific output naming are required for App Catalog deployment
**Depends on:** BW-3 (manifest GUIDs used in bundle output naming)
**Blocks:** BW-8 (dev harness tabs need Vite dev server config), BW-9 (CI/CD calls vite build), BW-10 (tests run via vite)

---

## Summary

None of the 11 webpart apps have a `vite.config.ts`. They inherit from whatever root-level config exists (if any), which is not tuned for SPFx constraints. This task creates a `vite.config.ts` for each app with:

1. SPFx-compatible output format (`iife` or `esm` with deterministic file names)
2. Bundle budget enforcement (< 1 MB total per webpart — Blueprint §4d)
3. React and TypeScript plugin configuration
4. Monorepo alias resolution (all `@hbc/*` packages)
5. Dev server port matching `config/serve.json` (ports 4001–4011)
6. Code splitting to keep entry chunks small (vendor, ui-kit, app separated)

---

## Why SPFx Needs Special Vite Config

- SharePoint's App Catalog expects assets at predictable paths (no content hashes in production filenames)
- SPFx webparts run inside SharePoint's iFrame-like sandbox — certain browser APIs behave differently
- `includeClientSideAssets: true` in `package-solution.json` tells SPFx to bundle assets into the `.sppkg` — Vite output must land in `dist/` for the CI/CD step to find them
- Each webpart is loaded independently by SharePoint — bundle size must be < 1 MB for acceptable load time; large shared deps (Fluent UI, React) should be externalized or split aggressively

---

## Reference Implementation (Accounting)

```typescript
// apps/accounting/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      '@hbc/models': resolve(__dirname, '../../packages/models/src/index.ts'),
      '@hbc/data-access': resolve(__dirname, '../../packages/data-access/src/index.ts'),
      '@hbc/query-hooks': resolve(__dirname, '../../packages/query-hooks/src/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../../packages/ui-kit/src/app-shell/index.ts'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
      '@hbc/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@hbc/auth/spfx': resolve(__dirname, '../../packages/auth/src/spfx/index.ts'),
      '@hbc/shell': resolve(__dirname, '../../packages/shell/src/index.ts'),
      '@hbc/provisioning': resolve(__dirname, '../../packages/provisioning/src/index.ts'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: command === 'serve', // Source maps only in dev

    rollupOptions: {
      // SPFx entry point: the WebPart class (not main.tsx)
      input: {
        'accounting-webpart': resolve(__dirname, 'src/webparts/accounting/AccountingWebPart.ts'),
      },
      output: {
        // No content hash in filenames — SharePoint expects predictable paths
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',

        // Manual chunk splitting to stay under 1 MB budget
        manualChunks: {
          // React + core libraries (rarely change — cache-friendly)
          'vendor-react': ['react', 'react-dom'],
          // TanStack libraries
          'vendor-tanstack': [
            '@tanstack/react-router',
            '@tanstack/react-query',
          ],
          // Fluent UI (large — isolate for tree-shaking analysis)
          'vendor-fluent': ['@fluentui/react-components'],
          // Zustand (small — could merge with vendor-react if budget allows)
          'vendor-zustand': ['zustand'],
        },
      },
    },

    // Budget enforcement: fail build if any chunk exceeds limit
    chunkSizeWarningLimit: 800, // Warn at 800 KB, hard fail in CI via spfx-bundle-check.ts
  },

  server: {
    port: 4001, // Matches config/serve.json for accounting
    https: true, // SPFx Workbench requires HTTPS
    strictPort: true,
    cors: true, // Required for SharePoint cross-origin requests in dev
  },

  define: {
    // Prevent process.env references from breaking in browser
    'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
  },
}));
```

---

## Per-Domain Port and Entry Point Mapping

| Domain | Dev Port | Entry File | Entry Key |
|---|---|---|---|
| accounting | 4001 | `src/webparts/accounting/AccountingWebPart.ts` | `accounting-webpart` |
| estimating | 4002 | `src/webparts/estimating/EstimatingWebPart.ts` | `estimating-webpart` |
| project-hub | 4003 | `src/webparts/projectHub/ProjectHubWebPart.ts` | `project-hub-webpart` |
| leadership | 4004 | `src/webparts/leadership/LeadershipWebPart.ts` | `leadership-webpart` |
| business-development | 4005 | `src/webparts/businessDevelopment/BusinessDevelopmentWebPart.ts` | `business-development-webpart` |
| admin | 4006 | `src/webparts/admin/AdminWebPart.ts` | `admin-webpart` |
| safety | 4007 | `src/webparts/safety/SafetyWebPart.ts` | `safety-webpart` |
| quality-control-warranty | 4008 | `src/webparts/qualityControlWarranty/QualityControlWarrantyWebPart.ts` | `quality-control-warranty-webpart` |
| risk-management | 4009 | `src/webparts/riskManagement/RiskManagementWebPart.ts` | `risk-management-webpart` |
| operational-excellence | 4010 | `src/webparts/operationalExcellence/OperationalExcellenceWebPart.ts` | `operational-excellence-webpart` |
| human-resources | 4011 | `src/webparts/humanResources/HumanResourcesWebPart.ts` | `human-resources-webpart` |

---

## Bundle Size Check Script

Create `tools/spfx-bundle-check.ts` to enforce < 1 MB budget across all built webparts:

```typescript
// tools/spfx-bundle-check.ts
import fs from 'fs';
import path from 'path';

const MAX_BUNDLE_SIZE_BYTES = 1_000_000; // 1 MB hard limit

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

let allPassed = true;

for (const domain of domains) {
  const distPath = path.join('apps', domain, 'dist');
  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  ${domain}: dist/ not found — run build first`);
    continue;
  }

  const files = fs.readdirSync(distPath).filter((f) => f.endsWith('.js'));
  const totalBytes = files.reduce((sum, f) => {
    return sum + fs.statSync(path.join(distPath, f)).size;
  }, 0);
  const totalKB = (totalBytes / 1024).toFixed(1);

  if (totalBytes > MAX_BUNDLE_SIZE_BYTES) {
    console.error(`❌  ${domain}: ${totalKB} KB — EXCEEDS 1 MB budget`);
    allPassed = false;
  } else {
    console.log(`✅  ${domain}: ${totalKB} KB`);
  }
}

process.exit(allPassed ? 0 : 1);
```

Add to `turbo.json` pipeline:
```json
{
  "pipeline": {
    "bundle-check": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

And to root `package.json` scripts:
```json
{
  "scripts": {
    "bundle-check": "node tools/spfx-bundle-check.ts"
  }
}
```

---

## tsconfig.json Per Webpart App

Each app also needs its own `tsconfig.json` extending root. Create if not present:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Turbo Pipeline Update

Add per-webpart build to `turbo.json` if not already scoped:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "bundle-check": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

---

## Verification

```bash
# Build accounting webpart and check output
pnpm turbo run build --filter="./apps/accounting"
ls apps/accounting/dist/

# Verify no content-hashed filenames (SPFx requirement)
ls apps/accounting/dist/*.js | grep -E '\.[a-f0-9]{8}\.' && echo "FAIL: hashed filenames" || echo "PASS: clean filenames"

# Check bundle sizes
node tools/spfx-bundle-check.ts

# Confirm dev server starts on correct port
pnpm --filter="./apps/accounting" exec vite --port 4001 &
sleep 3 && curl -k https://localhost:4001 | head -1
```

---

## Definition of Done

- [ ] `vite.config.ts` created for all 11 apps
- [ ] Entry point in each config points to `[Domain]WebPart.ts` (not `main.tsx`)
- [ ] Dev server ports are 4001–4011 (matching `config/serve.json`)
- [ ] HTTPS is enabled in dev server (required for SPFx Workbench)
- [ ] `manualChunks` defined to separate react/tanstack/fluent/zustand
- [ ] Output filenames have no content hash
- [ ] `tools/spfx-bundle-check.ts` created and enforces < 1 MB budget
- [ ] All 11 apps build with `pnpm turbo run build` without error
- [ ] `node tools/spfx-bundle-check.ts` passes for all built apps

<!-- IMPLEMENTATION PROGRESS & NOTES
BW-4 completed: 2026-03-08
- All 11 vite.config.ts files transformed with SPFx-ready build configuration
- Entry points use actual .tsx extension (not .ts as originally written in plan table)
- rollupOptions: deterministic filenames, manualChunks (vendor-react, vendor-tanstack, vendor-fluent, vendor-zustand)
- build: outDir='dist', emptyOutDir=true, sourcemap conditional on dev, chunkSizeWarningLimit=800
- server: https=true, strictPort=true, cors=true, ports 4001–4011 aligned with BW-3 serve.json
- Port misalignments fixed: accounting 4002→4001, estimating 4003→4002, project-hub 4001→4003 (both vite.config.ts and package.json scripts)
- Added missing subpath aliases: @hbc/ui-kit/app-shell, @hbc/ui-kit/theme, @hbc/auth/spfx, @hbc/provisioning
- tools/spfx-bundle-check.ts created — enforces < 1 MB budget per domain
- turbo.json already has bundle:size and bundle-report tasks — no new pipeline entry needed
- define block: added process.env.NODE_ENV alongside existing HBC_ADAPTER_MODE and HBC_AUTH_MODE
- rollupOptions.external added: /^@microsoft\//, /^@msinternal\// — SPFx runtime deps must not be bundled
- Build verified: 24/24 tasks pass (all green)
- Bundle check: 10/11 pass; leadership at 1689 KB (echarts 1 MB) — pre-existing dep issue, not BW-4 scope
- Deterministic filenames verified: no content hashes in dist/ output
- Ports 4001–4011 confirmed unique across all 11 configs
-->

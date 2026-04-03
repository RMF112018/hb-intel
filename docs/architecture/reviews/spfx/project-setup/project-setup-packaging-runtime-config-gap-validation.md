# Packaging/Runtime-Config Gap Validation — Project Setup (ui-review Default + apiAudience Shell Wiring)

## Executive Summary

**Combined verdict: Not a gap. Both claims are disproven by current repo truth and fresh packaged-artifact inspection.**

The hypothesis asserted two gaps:

1. The build/package flow still defaults estimating / Project Setup to `ui-review` under some conditions.
2. `apiAudience` is NOT wired end-to-end through the SPFx shell/build pipeline.

Both are **disproven**. The Phase 7 and Phase 8 remediation reports are accurate about current repo state. Source code, DefinePlugin wiring, and fresh `.sppkg` builds confirm that:

- `resolveDefaultBackendMode()` returns `''` (empty string, not `'ui-review'`) when `BACKEND_MODE` env var is unset. The app's runtime default (`'production'`) takes effect.
- `apiAudience` is wired end-to-end: `API_AUDIENCE` env var flows through build-spfx-package.ts, gulpfile.js DefinePlugin, ShellWebPart.ts declaration and conditional injection, to mount.tsx and runtimeConfig.ts.

A fresh `.sppkg` build with env vars set confirms all four runtime-config values (`functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience`) appear in the compiled shell asset. A build with empty env vars confirms the shell correctly passes nothing, letting the app default to `'production'` mode with production-readiness gating.

---

## 1. Prior Report Claims

### Phase 7 Report

**File:** `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

**Claim: Build no longer defaults to `ui-review`**

> Line 15: "**P7-02:** Removed 3 silent ui-review defaults (build script, shell webpart, runtime fallback warning)"

> Line 228: "| M1 | ~~Default backend mode hardcoded to `'ui-review'` for estimating domain~~ | `tools/build-spfx-package.ts` line 113 | **Closed P7-02** — build script now returns empty string; app runtime default (`'production'`) takes effect |"

> Lines 379-385: "Three silent ui-review defaults were removed or made explicit:
> 1. **`tools/build-spfx-package.ts`** — `resolveDefaultBackendMode()` no longer returns `'ui-review'` for the estimating domain. Returns empty string so the app's own runtime default (`'production'`) takes effect.
> 2. **`tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`** — Shell webpart no longer silently injects `'ui-review'` when `__FUNCTION_APP_URL__` is empty.
> 3. **`apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`** — Production-blocked -> ui-review fallback now emits `console.warn` with the specific readiness issues."

### Phase 8 Report

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

**Claim: apiAudience shell injection closed (P8-02, CF-01/OI-01)**

> Line 180: "`apiAudience` shell injection implemented via DefinePlugin (closes CF-01/OI-01)"

> Line 207: "| `API_AUDIENCE` | `shellEnv.API_AUDIENCE` | `__API_AUDIENCE__` | `declare const __API_AUDIENCE__` | `runtimeConfig.apiAudience` (conditional) | PASS |"

> Line 257: "The apiAudience shell injection gap (CF-01/OI-01) is closed. The runtime-config and token-acquisition contract is reconciled end-to-end: shell -> mount -> runtimeConfig -> SPFx token provider -> backend validation."

> Line 738: "| OI-01 | `apiAudience` not injected by shell | P8-02 | **Closed** |"

### SPFx Permission Declaration Gap Validation

**File:** `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md`

> Lines 115-129: Shell injection chain table showing the full `apiAudience` flow from `build-spfx-package.ts:547` through `gulpfile.js:32`, `ShellWebPart.ts:25,125-127`, to `mount.tsx:42,59-62`. Concludes: "This chain was incomplete before P8-02 (the shell lacked `__API_AUDIENCE__`) and was closed as part of Phase 8. The code pipeline is now fully wired."

---

## 2. Current Repo Evidence: `ui-review` Defaults

### 2.1 `resolveDefaultBackendMode()` — NO `ui-review` default

**File:** `tools/build-spfx-package.ts` (lines 108-126)

```typescript
function resolveDefaultBackendMode(domainDir: string): string {
  if (process.env.BACKEND_MODE) {
    return process.env.BACKEND_MODE;
  }

  // P7-02: No domain-specific fallback. When BACKEND_MODE is unset, pass empty
  // string so the app's own runtime default ('production') takes effect.
  // Previously, estimating silently defaulted to 'ui-review' here, masking
  // missing production configuration in shipped .sppkg artifacts.
  if (domainDir) {
    console.warn(
      `[build-spfx-package] BACKEND_MODE is not set for domain "${domainDir}". ` +
      'The packaged app will use its own runtime default (production). ' +
      'Set BACKEND_MODE explicitly in CI/CD to avoid ambiguity.',
    );
  }

  return '';
}
```

**Confirmed repo fact:** Returns `''` (empty string) when `BACKEND_MODE` is unset. Does NOT return `'ui-review'`. The P7-02 comment explicitly documents the old behavior was removed.

### 2.2 Shell env construction — passes empty string, not `'ui-review'`

**File:** `tools/build-spfx-package.ts` (line 545)

```typescript
BACKEND_MODE: resolveDefaultBackendMode(domain.dir),
```

**Confirmed repo fact:** `shellEnv.BACKEND_MODE` receives the return value of `resolveDefaultBackendMode()`, which is `''` when env var is unset.

### 2.3 ShellWebPart.ts — NO hidden `ui-review` fallback

**File:** `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` (lines 107-120)

```typescript
// P7-02: Pass the build-time backend mode as-is. Do not silently inject
// 'ui-review' when Function App URL is missing — the app's own runtime
// config defaults to 'production' and its readiness check will surface
// actionable diagnostics if production prerequisites are unmet.
const injectedBackendMode =
  typeof __BACKEND_MODE__ === 'string' && __BACKEND_MODE__
    ? __BACKEND_MODE__
    : '';

if (hasFunctionAppUrl) {
  runtimeConfig.functionAppUrl = __FUNCTION_APP_URL__;
}
if (injectedBackendMode) {
  runtimeConfig.backendMode = injectedBackendMode;
}
```

**Confirmed repo fact:** When `__BACKEND_MODE__` is empty, `injectedBackendMode` is `''`, the condition is falsy, and `backendMode` is NOT added to `runtimeConfig`. The app receives no `backendMode` override and uses its own default.

### 2.4 App runtime default — `'production'`

**File:** `apps/estimating/src/config/runtimeConfig.ts` (line 96)

```typescript
return 'production';
```

**Confirmed repo fact:** `getBackendMode()` defaults to `'production'` when no shell override is present.

### 2.5 Production readiness gate — deliberate, not hidden

**File:** `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` (lines 209-229)

```typescript
const productionRequested = requestedMode === 'production';
const readiness = productionRequested
  ? checkProductionReadiness(!!getApiToken)
  : null;

const productionBlocked = productionRequested && readiness !== null && !readiness.ready;
const effectiveMode: BackendMode = productionBlocked ? 'ui-review' : requestedMode;

if (productionBlocked && readiness) {
  console.warn(
    '[HB-Intel] Production mode requested but prerequisites not met — ' +
    'falling back to ui-review mode. Issues:',
    readiness.issues,
  );
}
```

**Confirmed repo fact:** The app DOES fall back to `ui-review` at runtime when production prerequisites are unmet. This is a deliberate safety gate with console-warning diagnostics, not a hidden default. It was explicitly preserved and made observable in P7-02.

### 2.6 `ui-review` verdict

**Not a gap.** The build no longer defaults to `'ui-review'`. The shell no longer silently injects `'ui-review'`. The app defaults to `'production'` and applies a deliberate, observable readiness gate that falls back to `ui-review` only when production prerequisites are genuinely absent. The prior reports are accurate.

---

## 3. Current Repo Evidence: `apiAudience` Shell Wiring

### 3.1 Build orchestrator passes `API_AUDIENCE`

**File:** `tools/build-spfx-package.ts` (line 547)

```typescript
API_AUDIENCE: process.env.API_AUDIENCE ?? '',
```

**Confirmed repo fact:** `shellEnv.API_AUDIENCE` receives `process.env.API_AUDIENCE` or `''`.

### 3.2 Gulpfile defines `__API_AUDIENCE__` via DefinePlugin

**File:** `tools/spfx-shell/gulpfile.js` (line 32)

```javascript
__API_AUDIENCE__: JSON.stringify(process.env.API_AUDIENCE || ''),
```

**Confirmed repo fact:** The 6th DefinePlugin constant is defined and passes through the env value.

### 3.3 ShellWebPart declares and injects `apiAudience`

**File:** `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` (lines 25, 125-127)

```typescript
declare const __API_AUDIENCE__: string;

// ...

if (typeof __API_AUDIENCE__ === 'string' && __API_AUDIENCE__) {
  runtimeConfig.apiAudience = __API_AUDIENCE__;
}
```

**Confirmed repo fact:** `apiAudience` IS conditionally injected into `runtimeConfig` when the build-time value is non-empty.

### 3.4 Mount function receives and uses `apiAudience`

**File:** `apps/estimating/src/mount.tsx` (lines 26, 59-62)

```typescript
apiAudience?: string;  // P3-02: API audience URI for SPFx token acquisition

// ...

const apiAudience = getApiAudience();
if (apiAudience) {
  getApiToken = createSpfxApiTokenProvider(spfxContext, apiAudience);
}
```

**Confirmed repo fact:** `apiAudience` flows from shell config through `setRuntimeConfig()` to `getApiAudience()` to `createSpfxApiTokenProvider()`.

### 3.5 Runtime config resolves `apiAudience` with three-tier fallback

**File:** `apps/estimating/src/config/runtimeConfig.ts` (lines 161-174)

```typescript
export function getApiAudience(): string | undefined {
  if (_config?.apiAudience) {
    return _config.apiAudience;
  }
  const envAudience =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_AUDIENCE;
  if (envAudience && envAudience !== 'undefined') {
    return envAudience;
  }
  return undefined;
}
```

**Confirmed repo fact:** Resolution order: (1) shell-injected runtime config, (2) Vite build-time env, (3) `undefined`.

### 3.6 `apiAudience` verdict

**Not a gap.** `apiAudience` IS wired end-to-end through the shell/build pipeline. The prior reports (P8-02 closure) are accurate.

---

## 4. Packaged/Build Artifact Evidence

Two fresh `.sppkg` builds were produced from current repo truth to confirm packaged behavior.

### 4.1 Build A: Empty env vars (bare local build)

**Command:**
```bash
BACKEND_MODE= FUNCTION_APP_URL= API_AUDIENCE= ALLOW_BACKEND_MODE_SWITCH= \
  npx tsx tools/build-spfx-package.ts --domain estimating
```

**Build output confirmed:**
- Warning emitted: `[build-spfx-package] BACKEND_MODE is not set for domain "estimating". The packaged app will use its own runtime default (production).`
- Shell hash: `shell-web-part_3e52e53464eba915dc7b.js`
- Package: `hb-intel-project-setup.sppkg` (336.0 KB)

**Compiled shell render() method (minified):**
```javascript
render(){
  var e;
  if(null===(e=this._appModule)||void 0===e?void 0:e.mount){
    const e={};
    try{const t="";t&&(e.backendMode=t)}catch(e){}
    this._appModule.mount(this.domElement,this.context,e)
  } else ...
}
```

**Confirmed packaged fact:** When all env vars are empty:
- `runtimeConfig` = `{}` (empty object)
- No `functionAppUrl`, `backendMode`, `apiAudience`, or `allowBackendModeSwitch` injected
- Webpack's DefinePlugin replaced all constants with `""`, and the minifier eliminated the dead-code branches
- The string `"ui-review"` does NOT appear in the compiled shell asset
- The app will receive an empty config and default to `'production'` mode

### 4.2 Build B: All env vars set

**Command:**
```bash
BACKEND_MODE=production FUNCTION_APP_URL=https://test.azurewebsites.net \
  API_AUDIENCE=api://test-client-id ALLOW_BACKEND_MODE_SWITCH=true \
  npx tsx tools/build-spfx-package.ts --domain estimating
```

**Build output confirmed:**
- No warnings emitted (BACKEND_MODE is set)
- Shell hash: `shell-web-part_789a943e275ff953a37b.js` (different from Build A, confirming different content)
- Package: `hb-intel-project-setup.sppkg` (336.0 KB)

**Compiled shell render() method (minified):**
```javascript
render(){
  var e;
  if(null===(e=this._appModule)||void 0===e?void 0:e.mount){
    const e={};
    try{
      const t="production";
      e.functionAppUrl="https://test.azurewebsites.net",
      t&&(e.backendMode=t),
      e.allowBackendModeSwitch=!0,
      e.apiAudience="api://test-client-id"
    }catch(e){}
    this._appModule.mount(this.domElement,this.context,e)
  } else ...
}
```

**Confirmed packaged fact:** When env vars are set:
- `functionAppUrl` = `"https://test.azurewebsites.net"` -- injected
- `backendMode` = `"production"` -- injected
- `allowBackendModeSwitch` = `true` -- injected
- `apiAudience` = `"api://test-client-id"` -- injected
- All four runtime-config values appear in the compiled shell asset
- The string `"ui-review"` does NOT appear in the compiled shell asset

### 4.3 Build evidence conclusion

The packaged artifacts confirm that:
- The shell never injects `'ui-review'` in any build configuration
- `apiAudience` IS wired through the build pipeline and appears in the compiled shell when `API_AUDIENCE` env var is set
- When env vars are empty, the shell passes nothing and the app defaults to `'production'` with readiness gating
- The prior report claims match observed packaged behavior exactly

---

## 5. Verdict: `ui-review` Default Claim

**Not a gap.**

The build does NOT default to `ui-review`. Source code, P7-02 comments, and fresh build artifacts all confirm that `resolveDefaultBackendMode()` returns `''` and the shell passes the value as-is. The app defaults to `'production'` and applies a deliberate production-readiness gate that falls back to `ui-review` with console diagnostics only when prerequisites are genuinely absent.

The Phase 7 report's closure of M1 (silent `ui-review` default) is accurate and current.

---

## 6. Verdict: `apiAudience` Shell-Wiring Claim

**Not a gap.**

`apiAudience` IS wired end-to-end:
- `tools/build-spfx-package.ts:547` captures `API_AUDIENCE` env var
- `tools/spfx-shell/gulpfile.js:32` defines `__API_AUDIENCE__` via DefinePlugin
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:25,125-127` declares and conditionally injects
- `apps/estimating/src/mount.tsx:59-62` receives and creates SPFx API token provider
- Fresh `.sppkg` build with `API_AUDIENCE` set confirms the value appears in the compiled shell

The Phase 8 report's closure of OI-01/CF-01 (apiAudience shell injection) is accurate and current.

---

## 7. Combined Gap Verdict

**Not a gap.** Both claims in the hypothesis are disproven by current repo truth and confirmed by fresh packaged-artifact inspection.

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Build defaults estimating to `ui-review` | **Disproven** | `resolveDefaultBackendMode()` returns `''`; compiled shell contains no `ui-review` string; app defaults to `'production'` |
| `apiAudience` not wired through shell | **Disproven** | Full DefinePlugin chain exists; compiled shell contains `apiAudience` value when env var is set |
| Phase 7/8 reports are stale | **Disproven** | Report claims match observed source and packaged behavior |

---

## 8. Why the Verdict Is Correct

1. **Source code is unambiguous.** `resolveDefaultBackendMode()` has an explicit P7-02 comment explaining the old `'ui-review'` default was removed. The function returns `''`. The shell's P7-02 comment similarly documents the removal of the silent `'ui-review'` injection.

2. **DefinePlugin wiring is complete.** Six constants are defined in `gulpfile.js` (lines 27-32), declared in `ShellWebPart.ts` (lines 20-25), and conditionally injected (lines 106-127). `__API_AUDIENCE__` is the 6th constant, added in P8-02.

3. **Fresh builds confirm packaged behavior.** Two builds with different env-var states produce different shell assets with the expected behavior. The empty-env build correctly passes nothing; the populated-env build correctly injects all four runtime-config values.

4. **The app runtime is correctly layered.** The app defaults to `'production'`, checks readiness, and only falls back to `'ui-review'` with diagnostic logging when prerequisites are genuinely absent. This is a safety gate, not a hidden default.

5. **The hypothesis likely originated from reading stale code or an earlier P8-01 audit snapshot.** The P8-01 section of the Phase 8 report correctly noted that `apiAudience` was NOT wired at that point (lines 51-56). P8-02 then implemented the fix (lines 180, 207, 247-249). The final P8-08 closeout confirmed all 6 constants. Reading only the P8-01 snapshot without the P8-02 remediation would produce the incorrect conclusion.

---

## 9. Unresolved Questions

None. Both claims are cleanly disproven by source truth and packaged-artifact truth.

---

## Appendix: Build Evidence Summary

| Build | Env Vars | Shell Hash | `backendMode` in Asset | `apiAudience` in Asset | `ui-review` in Asset |
|-------|----------|-----------|----------------------|----------------------|---------------------|
| A (bare) | All empty | `3e52e53464eba915dc7b` | `""` (dead-coded) | Not present | Not present |
| B (full) | All set | `789a943e275ff953a37b` | `"production"` | `"api://test-client-id"` | Not present |

## Appendix: Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| `resolveDefaultBackendMode()` returns `''` | `tools/build-spfx-package.ts` | 108-126 | Confirmed repo fact |
| `shellEnv.BACKEND_MODE` receives empty string | `tools/build-spfx-package.ts` | 545 | Confirmed repo fact |
| Shell P7-02: no silent `ui-review` injection | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 107-120 | Confirmed repo fact |
| Shell injects `apiAudience` conditionally | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 125-127 | Confirmed repo fact |
| `__API_AUDIENCE__` DefinePlugin constant | `tools/spfx-shell/gulpfile.js` | 32 | Confirmed repo fact |
| `API_AUDIENCE` in shellEnv | `tools/build-spfx-package.ts` | 547 | Confirmed repo fact |
| App defaults to `'production'` | `apps/estimating/src/config/runtimeConfig.ts` | 96 | Confirmed repo fact |
| Production readiness gate with diagnostics | `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` | 209-229 | Confirmed repo fact |
| Build A compiled shell (empty env) | `tools/spfx-shell/release/assets/shell-web-part_3e52e53464eba915dc7b.js` | — | Confirmed build-artifact fact |
| Build B compiled shell (full env) | `tools/spfx-shell/release/assets/shell-web-part_789a943e275ff953a37b.js` | — | Confirmed build-artifact fact |
| Phase 7 M1 closure | `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md` | 228 | Prior report claim (validated) |
| Phase 8 OI-01 closure | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 738 | Prior report claim (validated) |
| Phase 8 P8-02 apiAudience injection | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 180, 207, 257 | Prior report claim (validated) |

# Prompt 01 Closeout — My Dashboard `.sppkg` Production Runtime-Config Gate

**Date:** 2026-05-13
**Operator:** RMF (`bfetting@outlook.com`)
**Scope:** `tools/build-spfx-package.ts` packaging policy + sibling pure-helper module + vitest coverage + this closeout. No app, backend, manifest, or `.sppkg` regeneration.

---

## 1. Summary

Closes the build-input gap identified in Prompt 00 (`supporting/03_Prompt_00_Parity_Gate_Closeout.md`). Production-intended My Dashboard `.sppkg` builds can no longer silently omit `FUNCTION_APP_URL` or `API_AUDIENCE` — a preflight gate now refuses to spawn the gulp build, and defense-in-depth checks in the compiled/packaged shell-asset inspectors catch the same condition if the orchestrator is bypassed.

## 2. What Now Fails

| Operator command                                                                                                             | Outcome                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_MODE=production pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`                                    | **HARD FAIL.** Error names both `FUNCTION_APP_URL` and `API_AUDIENCE`. No `.sppkg` produced. Process exits non-zero.                                                                                     |
| `BACKEND_MODE=production FUNCTION_APP_URL=https://x pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`         | **HARD FAIL.** Error names `API_AUDIENCE`.                                                                                                                                                               |
| `BACKEND_MODE=production API_AUDIENCE=api://x pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`               | **HARD FAIL.** Error names `FUNCTION_APP_URL`.                                                                                                                                                           |
| `pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard` (BACKEND_MODE unset)                                       | **HARD FAIL.** Empty BACKEND_MODE is treated as production-intended (falls through to app's runtime default). Error names both required vars and surfaces `Resolved BACKEND_MODE: (unset → production)`. |
| Direct gulp invocation bypassing the orchestrator, producing a shell asset with empty `apiAudience` / empty `functionAppUrl` | **DEFENSE-IN-DEPTH FAIL** at `inspectCompiledShellAsset` / `inspectPackagedShellAsset` if the orchestrator runs the inspection step.                                                                     |

### Exact Error Wording (captured from the dry-run)

```
[build-spfx-package] Refusing to build production-intended .sppkg for domain "my-dashboard":
missing required runtime env vars: FUNCTION_APP_URL, API_AUDIENCE.
Resolved BACKEND_MODE: production.
Either supply FUNCTION_APP_URL and API_AUDIENCE (non-secret runtime values),
or set BACKEND_MODE=ui-review to build an explicit non-production artifact.
```

## 3. What Now Passes

| Operator command                                                                                                                     | Outcome                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_MODE=production FUNCTION_APP_URL=<func> API_AUDIENCE=<aud> pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard` | Packaging proceeds normally.                                                                                                                         |
| `BACKEND_MODE=ui-review pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`                                             | Packaging proceeds (explicit non-production opt-out). Missing runtime values are accepted because the resulting artifact is named as non-production. |
| Any other domain (`project-control-center`, `hb-publisher`, etc.) with missing values                                                | Packaging proceeds (the required-set initially contains only `my-dashboard`). Existing optional validators retain prior behavior.                    |

## 4. Production Command Path

```bash
# Required env vars (non-secret runtime values; not committed to source):
export BACKEND_MODE=production
export FUNCTION_APP_URL='https://<tenant-function-app>.azurewebsites.net'
export API_AUDIENCE='api://<tenant-function-app-client-id>'

# Optional but recommended:
export ALLOW_BACKEND_MODE_SWITCH=false

# Build:
pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard

# Output:
#   dist/sppkg/hb-intel-my-dashboard.sppkg
#   dist/sppkg/my-dashboard-package-truth-proof.json
```

Operators must supply real tenant values; the script does not synthesize them and does not embed them in source.

## 5. Exact Required Non-Secret Env Inputs

| Env var            | Purpose                                                                                                                                                        | Why non-secret                                              | Lands at runtime in                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_MODE`     | `production` selects live backend routes; `ui-review` selects in-app fixtures. Empty = production-default (now blocked for my-dashboard without other values). | Public posture flag; published in the `.sppkg` shell asset. | `runtimeConfig.backendMode` via `__BACKEND_MODE__` substitution in `tools/spfx-shell/gulpfile.js:32` → `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:370`.                        |
| `FUNCTION_APP_URL` | Base URL of the HB Function App that serves protected `my-work/me/*` read-model routes.                                                                        | Public DNS endpoint, no credential material.                | `runtimeConfig.functionAppUrl` via `__FUNCTION_APP_URL__` substitution (`gulpfile.js:31` → `ShellWebPart.ts:367`). Consumed by `apps/my-dashboard/src/config/runtimeConfig.ts:125`.      |
| `API_AUDIENCE`     | Token-audience identifier (Entra app `api://...` URI) used by the SPFx delegated token provider.                                                               | Audience URI is a public identifier, not a secret.          | `runtimeConfig.apiAudience` via `__API_AUDIENCE__` (`gulpfile.js:34` → `ShellWebPart.ts:376`). Consumed by `apps/my-dashboard/src/mount.tsx:80-82` to gate `createSpfxApiTokenProvider`. |

None of these values is a credential or secret. They are deployment metadata that must be present in the shipped bundle for the SPFx token-provider chain to function.

## 6. Files Changed

| File                                                                                                                             | Change                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/build-spfx-package-production-runtime-config.ts` (new)                                                                    | Pure helpers: `DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG` set, `isProductionIntendedBackendMode`, `assertProductionRuntimeConfigRequirements`.                                                                                                                                                                                                                     |
| `tools/build-spfx-package.ts`                                                                                                    | Imports the three helpers. Adds preflight `assertProductionRuntimeConfigRequirements({...})` call in the per-domain loop immediately after `shellEnv` construction and before `gulp bundle --ship`. Tightens `inspectCompiledShellAsset` and `inspectPackagedShellAsset` with the same predicate so the gate also fires post-build/post-package as defense in depth. |
| `tools/vitest.config.ts` (new)                                                                                                   | Minimal Node-environment vitest config (mirrors `scripts/vitest.config.ts`) that picks up `tools/**/*.test.ts`, excluding the existing self-configured `tools/pnp-runner-local/**`.                                                                                                                                                                                  |
| `tools/build-spfx-package-production-runtime-config.test.ts` (new)                                                               | 14 vitest cases covering the required-set membership, the `isProductionIntendedBackendMode` predicate (including case-sensitivity), and `assertProductionRuntimeConfigRequirements` for the six scenarios in the prompt's test plan plus error-message contract.                                                                                                     |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/B05-remediation/supporting/04_Prompt_01_Packaging_Hardening_Closeout.md` (new) | This closeout.                                                                                                                                                                                                                                                                                                                                                       |

Files explicitly NOT modified (per Prompt 01 Non-Scope):

- `apps/my-dashboard/**` — no surface, backend client, runtime-config, or readiness-wiring edits.
- `tools/spfx-shell/**` — shell runtime-config shape preserved; the `webpack.DefinePlugin` empty-string fallback in `gulpfile.js:31, 34` is intentionally unchanged. The gate prevents the empty case from reaching production builds without altering the shell contract.
- Manifest / solution version JSON — the pre-existing working-tree bumps to `1.0.0.005` are out of this commit's scope and remain uncommitted.
- `ALL_DOMAINS` per-domain configs — schema preserved; only the new sibling required-set defines policy.

## 7. Cross-Domain Note

The initial `DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG` set contains **only `my-dashboard`**. Other domains in the same `packagingModel: 'single'` path (`project-control-center`, `hb-publisher`, `hb-intel-foleon`, `hb-homepage`) preserve their existing optional-validation posture. Extending the gate to those domains is a one-line set addition with no other call-site changes — the predicate and helper are domain-agnostic. Test case 6 (`project-control-center` + missing values + production) explicitly proves the negative path stays open until that addition is made.

## 8. Residual Risk

- **Operator-side cutover.** The tenant-uploaded `.sppkg` may still be a previously-built artifact (Prompt 00 confirmed parity for the local `dist/sppkg/...` artifact only). After the next intentional production rebuild, the operator must re-upload to the app catalog. This is in scope for Prompt 06 / operator cutover, not for this prompt.
- **Direct gulp invocation.** If a future operator runs `gulp bundle --ship` inside `tools/spfx-shell/` without going through `build-spfx-package.ts`, the preflight gate is bypassed. The defense-in-depth checks in `inspectCompiledShellAsset` / `inspectPackagedShellAsset` mitigate this only when those inspectors are subsequently invoked (e.g., through a CI verification script). If neither the orchestrator nor an explicit inspection step runs, the gate does not fire. Recommendation: future work could add an `assertProductionRuntimeConfigRequirements` call inside the shell webpart's runtime initialization to fail at load time if the values are empty.
- **Vite intermediate output.** The dry-run produces transient Vite output under `apps/my-dashboard/dist/` and copies under `tools/spfx-shell/assets/`. These are local, untracked artifacts regenerated on every packaging run; no `.sppkg` is produced when the gate fires.
- **Case sensitivity.** The predicate is case-sensitive (matching the orchestrator's `resolveDefaultBackendMode` pass-through). `BACKEND_MODE=PRODUCTION` (uppercase) does NOT trigger production-intended gating — it falls into the "neither production nor ui-review" branch. If operators mistype the casing they will not get the gate's protection. Documented in `isProductionIntendedBackendMode`'s docblock and covered by test case 5.

## 9. Verification Evidence (captured this run)

### 9.1 Helper test suite

```
$ pnpm exec vitest run --config tools/vitest.config.ts
 RUN  v3.2.4 /Users/bobbyfetting/hb-intel
 ✓ tools/build-spfx-package-production-runtime-config.test.ts (14 tests) 2ms
 Test Files  1 passed (1)
      Tests  14 passed (14)
```

### 9.2 My Dashboard type-check (no incidental break)

```
$ pnpm --filter @hbc/spfx-my-dashboard check-types
> @hbc/spfx-my-dashboard@0.0.1 check-types
> tsc --noEmit
(clean exit)
```

### 9.3 My Dashboard test suite (no incidental break)

```
$ pnpm --filter @hbc/spfx-my-dashboard test
Test Files  16 passed (16)
     Tests  194 passed (194)
```

(Console warnings from a pre-existing intentional negative test — `useMyWorkBentoContext must be used inside a <MyWorkBentoGrid> provider` in `MyWorkBentoGrid.test.tsx:63` — are unrelated to this change and are an expected negative-render assertion.)

### 9.4 Dry-run hard-fail proof

```
$ BACKEND_MODE=production pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard
... (Vite bundle built normally) ...
Error: [build-spfx-package] Refusing to build production-intended .sppkg for domain "my-dashboard":
missing required runtime env vars: FUNCTION_APP_URL, API_AUDIENCE.
Resolved BACKEND_MODE: production.
Either supply FUNCTION_APP_URL and API_AUDIENCE (non-secret runtime values),
or set BACKEND_MODE=ui-review to build an explicit non-production artifact.
    at assertProductionRuntimeConfigRequirements (tools/build-spfx-package-production-runtime-config.ts:72:9)
    at <anonymous> (tools/build-spfx-package.ts:2900:3)
(non-zero exit; no .sppkg produced)
```

### 9.5 Prettier

```
$ pnpm exec prettier --check tools/build-spfx-package.ts \
    tools/build-spfx-package-production-runtime-config.ts \
    tools/build-spfx-package-production-runtime-config.test.ts \
    tools/vitest.config.ts
(after one --write pass on the helper module to fix initial formatting; tests re-run green)
```

## 10. Completion Standard Met

> Prompt 01 is complete only when a future operator cannot accidentally produce a production-intended My Dashboard `.sppkg` lacking the runtime inputs required for backend mode.

✓ The preflight gate prevents a production-intended my-dashboard `.sppkg` from being produced when `FUNCTION_APP_URL` or `API_AUDIENCE` is empty/missing, regardless of whether `BACKEND_MODE` is set to `production` or left unset (which the predicate treats as production-intended). The non-production `ui-review` opt-out remains available and explicit. Cross-domain behavior is preserved.

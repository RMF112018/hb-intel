# 04 — Packaged-Shell Injection Evidence (Operational Summary)

**Status:** Complete
**Full review:** [accounting-runtime-config-injection-and-packaged-shell-hardening.md](../../../../reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md)

## Injection Parity Verdict

**Full parity confirmed.** The Accounting injection mechanism is identical to Estimating (Project Setup). All four runtime config values flow through the same unified path with no gaps.

## Injection Chain

```
CI/CD env vars → build-spfx-package.ts → gulpfile.js DefinePlugin → ShellWebPart.render() → mount() → runtimeConfig.ts
```

## Runtime Config Values

| Value | DefinePlugin Constant | runtimeConfig Getter | Default |
|-------|----------------------|---------------------|---------|
| Function App URL | `__FUNCTION_APP_URL__` | `getFunctionAppUrl()` | ConfigError in production |
| Backend mode | `__BACKEND_MODE__` | `getBackendMode()` | `'production'` |
| Backend mode switch | `__ALLOW_BACKEND_MODE_SWITCH__` | `getAllowBackendModeSwitch()` | `false` |
| API audience | `__API_AUDIENCE__` | `getApiAudience()` | `undefined` |

## ALLOW_BACKEND_MODE_SWITCH Decision

Supported in the injection chain but **not expected in Accounting production builds**. Accounting does not implement a reviewer-mode backend adapter (unlike Estimating's localStorage-backed `ui-review` adapter). This is intentional, not a gap.

## Test Protection

- `shellInjectionChain.test.ts` — validates the full injection chain across all 5 source files
- `runtimeConfig.test.ts` — validates config storage, resolution, and error handling (22 tests)
- `bundleContract.test.ts` — validates IIFE output and global contract (18 tests)

## What Later Prompts Can Assume

1. Injection parity is confirmed — no remediation needed.
2. All four runtime config values flow end-to-end through the unified mechanism.
3. The app defaults to `'production'` mode with readiness gating when env vars are not set.
4. `ALLOW_BACKEND_MODE_SWITCH` is intentionally unsupported in Accounting production — not a gap.
5. Full `.sppkg` artifact inspection requires CI/CD build with production env vars.

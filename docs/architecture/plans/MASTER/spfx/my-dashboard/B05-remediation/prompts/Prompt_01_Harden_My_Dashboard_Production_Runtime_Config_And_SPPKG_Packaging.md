# Prompt 01 — Harden My Dashboard Production Runtime Config and `.sppkg` Packaging

## Objective

Remediate the packaging/runtime-config weakness that allows a My Dashboard production artifact to be built without usable backend runtime values, resulting in an authenticated SharePoint user still being unable to acquire an API token provider or reach protected backend read-model routes.

## Why this exists now

The audit found that:

- My Dashboard mount logic only creates the SPFx API token provider if `apiAudience` is available at runtime.
- Backend client creation also requires a usable Function App base URL.
- The packaging shell injects `__FUNCTION_APP_URL__`, `__API_AUDIENCE__`, and `__BACKEND_MODE__` via build-time environment variables.
- If those values are absent, empty strings are emitted and may be optimized away, producing an `.sppkg` that renders but cannot operate in true backend mode.

## Current repo-truth condition to verify

Inspect the current truth in:

```text
apps/my-dashboard/src/mount.tsx
apps/my-dashboard/src/config/runtimeConfig.ts
apps/my-dashboard/src/config/productionReadiness.ts
tools/build-spfx-package.ts
tools/spfx-shell/gulpfile.js
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
```

Confirm whether:
- production mode is still defaulted in app runtime,
- packaging still permits empty `FUNCTION_APP_URL` or `API_AUDIENCE`,
- My Dashboard package truth proof already validates or fails on these fields,
- any recent work has partially closed this issue.

## Required future state

For the `my-dashboard` domain:

1. A production-intended `.sppkg` build must not silently omit required backend runtime values.
2. The packaging flow must clearly distinguish:
   - intentional non-production/ui-review builds,
   - production builds that require live runtime config.
3. Missing production-critical values must either:
   - fail the packaging run, or
   - produce an explicit hard gate that prevents misclassification as a production package.

The recommended closure is:

> **Fail packaging for My Dashboard when the emitted backend mode is production and either `FUNCTION_APP_URL` or `API_AUDIENCE` is missing.**

## Required implementation scope

Implement the smallest robust change that closes this.

Likely touch points:
- `tools/build-spfx-package.ts`
- possibly package-truth proof logic for `my-dashboard`
- test coverage for packaging/preflight if such tests already exist
- supporting docs/runbook closeout if the repo maintains one for My Dashboard package builds

## Must preserve

- Existing non-secret nature of `FUNCTION_APP_URL` and `API_AUDIENCE`
- No secrets in SPFx bundle
- Existing shell runtime config shape
- Existing ability to package explicitly non-production/ui-review artifacts when that posture is intentional and named as such
- Existing packaging model for other domains unless a shared helper change requires careful cross-domain compatibility

## Required tests / proof

Add or update proof for:

1. Production My Dashboard packaging fails or hard-gates when:
   - `FUNCTION_APP_URL` absent
   - `API_AUDIENCE` absent
2. Production My Dashboard packaging proceeds when required values are supplied.
3. Package-truth evidence captures whether those values were present as non-secret runtime markers or equivalent governed proof.
4. Existing package orchestration for non-My-Dashboard domains is not broken.

## Validation commands

Use the relevant repo scripts, including at minimum:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

If the packaging change touches shared toolchain testable logic, run the appropriate additional repo tests.

## Deliverables

1. Code changes implementing the packaging/config gate.
2. Tests/proofs.
3. A closeout note documenting:
   - what now fails,
   - what now passes,
   - the command path for a production package,
   - exact required non-secret env inputs.

## Non-scope

- Do not wire React surfaces yet.
- Do not modify backend OAuth routes.
- Do not “fix” the UI by suppressing non-ready cards.
- Do not hardcode tenant-specific values into source.

## Completion standard

Prompt 01 is complete only when a future operator cannot accidentally produce a production-intended My Dashboard `.sppkg` lacking the runtime inputs required for backend mode.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

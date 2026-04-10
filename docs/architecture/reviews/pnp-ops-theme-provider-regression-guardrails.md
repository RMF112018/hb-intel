# PnP Ops Theme Provider Regression Guardrails

## Existing Coverage Audit

Before Prompt-02, `apps/hb-webparts/src/homepage/__tests__/mountDispatch.test.ts` proved:

- `mount/unmount` API is published on `globalThis`.
- `mount.tsx` references expected webpart IDs.
- `mount.tsx` includes structural source text for `HbcThemeProvider` and `forceTheme: 'light'`.

What it did **not** prove:

- The live PnP mount branch (`webPartId=9e2dd84a-a121-4fb3-a964-f43a94abf9fd`) actually passes a provider-wrapped React tree to `root.render(...)`.
- The no-ID fallback branch (`ReferenceHomepageComposition`) actually renders through the provider wrapper at runtime.

## Guardrails Added

Prompt-02 extends `mountDispatch.test.ts` with deterministic mount-path execution checks by mocking `react-dom/client` `createRoot` and asserting render input shape.

New checks:

1. **PnP branch runtime guardrail**
   - Calls `mount(..., { webPartId: '9e2dd84a-a121-4fb3-a964-f43a94abf9fd' })`.
   - Asserts `root.render(...)` receives top-level `HbcThemeProvider`.
   - Asserts `forceTheme` is `light`.
   - Asserts provider child is the `PnpOps` element.

2. **No-ID fallback runtime guardrail**
   - Calls `mount(..., {})`.
   - Asserts `root.render(...)` receives top-level `HbcThemeProvider`.
   - Asserts `forceTheme` is `light`.
   - Asserts provider child is `ReferenceHomepageComposition`.

## Failure Mode Now Caught

If a future change removes provider wrapping in either the PnP branch or no-ID composition branch, tests fail before deployment and prevent the missing-theme-provider crash category from reaching SharePoint runtime.

## Remaining Unproven Areas

- These tests validate mount-tree wiring, not live tenant execution.
- They do not prove browser/tenant factors (CSP, script host behavior, deployment propagation) and should be paired with packaging + tenant smoke steps in later prompts.

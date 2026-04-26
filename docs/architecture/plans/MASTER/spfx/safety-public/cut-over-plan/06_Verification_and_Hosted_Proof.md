# 06 — Verification and Hosted Proof

## Required Runtime Proof Object

Add a runtime proof object for hosted inspection:

```ts
declare global {
  interface Window {
    __hbIntel_safetyFieldExcellenceRuntimeProof?: {
      generatedAt: string;
      sourceMode: "curated-only" | "dynamic-preview" | "dynamic-with-curated-fallback" | "dynamic-only";
      dataSource: "curated" | "dynamic" | "preview-fallback" | "curated-fallback";
      backendFunctionAppUrlConfigured: boolean;
      currentEndpointConfigured: boolean;
      publishedHighlightId?: string;
      reportingPeriodId?: string;
      publishStatus?: string;
      freshUntil?: string;
      isStale?: boolean;
      dataConfidence?: "high" | "medium" | "low";
      primaryProjectNumber?: string;
      secondaryCount: number;
      fallbackReason?: string;
      packageVersion?: string;
      expectedPackageVersion?: string;
    };
  }
}
```

## Hosted Browser Proof

Run in browser console:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Expected healthy dynamic proof:

```json
{
  "sourceMode": "dynamic-with-curated-fallback",
  "dataSource": "dynamic",
  "backendFunctionAppUrlConfigured": true,
  "currentEndpointConfigured": true,
  "publishStatus": "published",
  "isStale": false
}
```

## Backend Proof

Required:

- Function App health route passes.
- Safety Field Excellence current endpoint returns 200.
- Published highlight endpoint returns one fresh published artifact.
- Candidate generation dry-run returns candidate count.
- Timer/manual invocation proof captured.
- No raw workbook JSON returned from homepage endpoint.

## SPFx Package Proof

Required:

- package version bump
- manifest expected version updated
- `.sppkg` generated after source changes
- package contains Safety Field Excellence dynamic adapter strings
- package contains expected source-mode strings
- package proof commands captured
- hosted runtime expectedPackageVersion matches packageVersion

## UI/UX Proof

Required:

- checklist completed
- scorecard completed
- minimum 48/56 target
- hosted screenshot in standard mode
- hosted screenshot in compact/two-up mode
- handheld/narrow screenshot or Playwright proof
- no horizontal overflow
- no dead CTAs
- preview fallback screenshot
- stale/error state proof

## Source Mode Proof Matrix

| Mode | Required proof |
|---|---|
| curated-only | Existing behavior unchanged |
| dynamic-preview | Dynamic payload fetched but public surface remains curated unless diagnostics enabled |
| dynamic-with-curated-fallback | Dynamic published artifact renders; fallback works when endpoint fails |
| dynamic-only | Preview/no-data state renders when no published data exists |

## Acceptance Gate

Do not close the cutover unless all are true:

- backend rollup works
- published highlight exists
- homepage reads published artifact
- runtime proof confirms dynamic source
- preview fallback works
- scorecard target met
- package truth equals runtime truth
- rollback path documented

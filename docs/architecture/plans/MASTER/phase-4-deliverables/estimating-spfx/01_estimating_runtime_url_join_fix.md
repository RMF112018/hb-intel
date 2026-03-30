# Prompt 01 — Fix the confirmed runtime asset URL defect

## Objective

You are working in the HB Intel repo.

Resolve the confirmed runtime failure in the Estimating SharePoint web part where SharePoint loads a malformed asset URL and the web part fails with a `requirejs` script error.

The current production symptom is:

- SharePoint attempts to load:
  - `<sharepoint-tenant-url>/sites/appcatalog/ClientSideAssets/d01a9600-a68a-4afe-83a5-514339f47dbbestimating-app.js`
- The correct URL shape should be:
  - `<sharepoint-tenant-url>/sites/appcatalog/ClientSideAssets/d01a9600-a68a-4afe-83a5-514339f47dbb/estimating-app.js`

This prompt is **not** exploratory. The malformed URL is already proven and must be fixed first.

## Critical constraints

- Estimating is **web part only**.
- Do **not** implement `SharePointFullPage`.
- Preserve the existing shell pattern unless a narrowly scoped fix is required.
- Do **not** re-read files that are still within your current context or memory unless needed to verify a contradiction, inspect exact code, or capture evidence.

## Known current-state evidence

You should assume the following has already been established and use it as the starting point:

1. The uploaded `.sppkg` contains `ClientSideAssets/estimating-app.js`.
2. The shell loader currently constructs the runtime bundle URL by concatenating a base URL with `__APP_BUNDLE_NAME__`.
3. The runtime error shows the resulting URL is malformed because the base path and file name are joined without a `/`.
4. The relevant shell file is:
   - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

## Required work

### 1. Prove the exact defect from repo truth

Inspect only the minimum files needed to confirm the current implementation:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- any adjacent shell config file only if needed

Confirm in your report:

- how `bundleUrl` is currently built
- why that logic can produce the malformed URL seen in production
- why this defect would surface specifically as a SharePoint/RequireJS script-load failure

### 2. Implement the fix

Patch the shell loader so bundle URL construction is safe and deterministic.

The fix must:

- normalize the base URL
- ensure exactly one `/` between the base path and `__APP_BUNDLE_NAME__`
- avoid double slashes where possible
- remain compatible with whatever `internalModuleBaseUrls[0]` SharePoint returns at runtime

Use a robust URL-building pattern rather than plain string concatenation.

### 3. Add defensive diagnostics

Add narrow runtime diagnostics in the shell loader that are acceptable for staging/debug validation and can remain non-noisy in production.

At minimum, log or expose enough evidence to prove:

- the raw base URL received from the manifest loader config
- the normalized base URL
- the final bundle URL being requested

Keep the diagnostics concise and local to this runtime seam.

### 4. Validate locally by code inspection

Prove in your output that after the change:

- the malformed URL shape can no longer occur from the current join logic
- the final runtime path would resolve to `.../{solution-guid}/estimating-app.js`

## Required deliverables

1. The code changes
2. A concise implementation note explaining:
   - root cause
   - exact fix
   - why the fix is correct
3. A short evidence section quoting the exact before/after URL construction behavior
4. A git diff summary

## Acceptance criteria

Do not close this prompt until all are true:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` no longer uses unsafe base-path + filename concatenation
- runtime URL join is normalized and deterministic
- the expected final asset URL shape includes the missing slash
- the change is limited to the runtime seam and does not alter the locked host model

## Output format

Return:

1. `Objective achieved`
2. `Files changed`
3. `Root cause proven`
4. `Patch summary`
5. `Acceptance evidence`
6. `Risks / follow-on work`
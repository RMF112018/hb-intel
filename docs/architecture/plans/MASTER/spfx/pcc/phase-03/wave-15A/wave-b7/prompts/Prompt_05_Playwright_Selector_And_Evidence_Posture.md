# Updated Prompt 05 — Playwright Shell Active-Panel Evidence Posture

## Objective

Improve PCC live Playwright surface-smoke evidence so it records shell active-panel ownership introduced by Phase 2 / Prompt 01 without breaking tenant-hosted smoke coverage when the deployed `.sppkg` lags local source.

This prompt is evidence-posture work, not functional app work. It must preserve the existing live smoke pass/fail behavior while expanding the typed result and sanitized evidence output to show whether the active-panel marker is owned by shell `main[role="tabpanel"]` or still only appears on card-level compatibility markers.

## Current Repo-Truth Summary

Current source state to confirm before editing:

- `e2e/pcc-live/pcc-live.page-object.ts`
  - `ROOT_MARKERS.panel` is currently the broad selector `[data-pcc-active-surface-panel]`.
  - `PccLiveSurfaceSmokeResult` currently includes `activePanelFound`, `gridCount`, `cardCount`, and `tabActive`, but does not include active-panel count, owner tag, role, id, or shell-main ownership fields.
  - `assertSurfaceActive` currently counts `surface.expectedActivePanelSelector`, derives `activePanelFound` from `panelCount > 0`, and sets `passed = tabActive && panelCount > 0 && gridCount > 0 && cardCount > 0`.
- `e2e/pcc-live/pcc-live.surfaces.ts`
  - `expectedActivePanelSelector` is currently broad, for example `[data-pcc-active-surface-panel="project-home"]`.
  - This broad selector must remain as the compatibility selector so tenant-lagged packages still produce useful smoke evidence.
- `e2e/pcc-live/pcc-live.surface-smoke.spec.ts`
  - The registry test currently expects each `expectedActivePanelSelector` to equal the broad compatibility selector.
  - The evidence-writer sanitizer test currently supplies only the older surface result shape.
- `e2e/pcc-live/pcc-live.evidence-writer.ts`
  - JSON currently serializes `surfaces` wholesale after warning sanitization.
  - Markdown currently includes columns: `Surface`, `Passed`, `Panel`, `Tab Active`, `Grid Count`, `Card Count`, `Warning`.
  - Markdown does not include active-panel count, owner tag, owner role, owner id, or shell-main status.
- `e2e/pcc-live/pcc-live.env.ts` and `pcc-live.env.spec.ts`
  - Defaults for site URL, page URL, storage state, evidence output root, and expected package version are already handled.
  - Do not revisit default env behavior in this prompt unless a direct type failure requires a narrow import/test update.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

Keep this prompt narrow.

Do not:

- edit application source under `apps/project-control-center/src/**`;
- edit layout primitives, surfaces, shell, hero, or model files;
- edit package dependencies, lockfile, manifests, or package-solution files;
- edit live env defaults unless type failures prove a narrow update is required;
- weaken existing navigation smoke checks;
- make shell-main ownership a hard pass/fail gate for live tenant smoke;
- commit traces, videos, raw Playwright reports, storage state, screenshots, or auth artifacts;
- include auth/storage/token paths in evidence;
- claim hosted evidence success unless an actual live Playwright run writes curated artifacts.

## Required Repo-Truth Checks Before Editing

### 1. Confirm local baseline

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If relevant files are dirty, stop and report before editing.

Relevant files include:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.env.spec.ts
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

### 2. Confirm Playwright surface smoke posture

Inspect:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
```

Confirm:

- current surface smoke only requires broad active-panel presence/count;
- current smoke does not distinguish shell `main` from card-level marker;
- evidence output does not include owner tag/role/id/shell-main status;
- tenant deployment may lag local source, so shell-main status must be recorded as evidence/warning, not a hard pass/fail requirement.

### 3. Search for existing result shape usages

Run:

```bash
rg -n "PccLiveSurfaceSmokeResult|activePanelFound|activePanelCount|activePanelOwnerTagName|activePanelIsShellMain|activePanelRole|activePanelId" e2e/pcc-live docs/architecture/evidence docs/architecture/plans --glob '!**/node_modules/**'
```

Classify results into:

- current TypeScript source;
- writer/sanitizer tests;
- generated/committed evidence;
- documentation/package prompts.

Do not edit generated evidence or prior prompt packages unless the current prompt explicitly requires it. This prompt should update source/tests, not historical evidence.

## Expected Files

Expected source/test files:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
```

Optional only if type/import tests require it:

```text
e2e/pcc-live/pcc-live.env.spec.ts
```

Expected production app files: **none**.

Do not edit:

```text
apps/project-control-center/src/**/*
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
playwright-report/**/*
test-results/**/*
**/.auth/**/*
**/.e2e-auth/**/*
**/*storage-state*
```

## Implementation Requirements

### 1. Preserve broad compatibility selector

In `pcc-live.surfaces.ts`, keep:

```ts
expectedActivePanelSelector: string;
```

as the broad compatibility selector:

```ts
`[data-pcc-active-surface-panel="${surface.id}"]`
```

Add a shell-specific selector field:

```ts
expectedShellActivePanelSelector: string;
```

Each surface must define it as:

```ts
`main[role="tabpanel"][data-pcc-active-surface-panel="${surface.id}"]`
```

Update `PccLiveSurfaceDefinition` accordingly.

In the registry test, assert both:

```ts
expect(surface.expectedActivePanelSelector).toBe(
  `[data-pcc-active-surface-panel="${surface.id}"]`,
);
expect(surface.expectedShellActivePanelSelector).toBe(
  `main[role="tabpanel"][data-pcc-active-surface-panel="${surface.id}"]`,
);
```

Do not replace the broad selector with the shell selector. The broad selector is still needed for backwards-compatible tenant smoke evidence.

### 2. Expand typed surface smoke result

In `pcc-live.page-object.ts`, extend `PccLiveSurfaceSmokeResult` exactly with:

```ts
activePanelCount: number;
activePanelOwnerTagName: string | null;
activePanelRole: string | null;
activePanelId: string | null;
activePanelIsShellMain: boolean;
shellActivePanelFound: boolean;
shellActivePanelCount: number;
```

Keep existing fields:

```ts
activePanelFound: boolean;
gridCount: number;
cardCount: number;
tabActive: boolean;
warning?: string;
```

### 3. Record owner metadata without hard-failing shell-main status

In `assertSurfaceActive`, after navigation and tab-active calculation:

1. Count the broad compatibility selector:
   ```ts
   const activePanelCount = await this.page.locator(surface.expectedActivePanelSelector).count();
   ```

2. Count the shell-specific selector:
   ```ts
   const shellActivePanelCount = await this.page.locator(
     surface.expectedShellActivePanelSelector,
   ).count();
   ```

3. Resolve the first broad active-panel element and collect:
   - `activePanelOwnerTagName`
   - `activePanelRole`
   - `activePanelId`
   - `activePanelIsShellMain`

Preferred helper:

```ts
private async inspectActivePanelOwner(
  surface: PccLiveSurfaceDefinition,
): Promise<{
  readonly activePanelCount: number;
  readonly activePanelOwnerTagName: string | null;
  readonly activePanelRole: string | null;
  readonly activePanelId: string | null;
  readonly activePanelIsShellMain: boolean;
  readonly shellActivePanelCount: number;
}> {
  const broadPanels = this.page.locator(surface.expectedActivePanelSelector);
  const shellPanels = this.page.locator(surface.expectedShellActivePanelSelector);
  const activePanelCount = await broadPanels.count();
  const shellActivePanelCount = await shellPanels.count();

  if (activePanelCount === 0) {
    return {
      activePanelCount,
      shellActivePanelCount,
      activePanelOwnerTagName: null,
      activePanelRole: null,
      activePanelId: null,
      activePanelIsShellMain: false,
    };
  }

  const first = broadPanels.first();
  const owner = await first.evaluate((node) => ({
    tagName: node instanceof HTMLElement ? node.tagName : node.nodeName,
    role: node instanceof HTMLElement ? node.getAttribute('role') : null,
    id: node instanceof HTMLElement ? node.getAttribute('id') : null,
  }));

  const activePanelIsShellMain =
    owner.tagName.toUpperCase() === 'MAIN' &&
    owner.role === 'tabpanel' &&
    owner.id === 'pcc-active-surface-panel';

  return {
    activePanelCount,
    shellActivePanelCount,
    activePanelOwnerTagName: owner.tagName,
    activePanelRole: owner.role,
    activePanelId: owner.id,
    activePanelIsShellMain,
  };
}
```

The exact helper structure may vary, but output fields must match.

### 4. Preserve existing pass/fail semantics

Keep `passed` based on the current compatibility smoke conditions:

```ts
const passed = tabActive && activePanelCount > 0 && gridCount > 0 && cardCount > 0;
```

Do **not** require:

```ts
activePanelIsShellMain === true
shellActivePanelCount === 1
```

for `passed`.

This is intentional because tenant-hosted packages can lag local source. Shell-main ownership should be evidence, not a hard live-smoke blocker, until the deployed tenant package is known to include the Phase 2 shell change.

### 5. Add non-blocking warnings for shell-main posture

Add warning text only when compatibility smoke otherwise passes but shell ownership evidence is not ideal.

Required warning behavior:

- If `passed` is false, keep the existing failure warning structure, but include active-panel count and shell-main evidence fields.
- If `passed` is true and `activePanelIsShellMain` is false, set warning similar to:
  ```text
  Surface {id} passed compatibility smoke but active panel owner is {tag}/{role}/{id}; shell main ownership not observed. Tenant package may lag Phase 2.
  ```
- If `passed` is true and `shellActivePanelCount !== 1`, set warning similar to:
  ```text
  Surface {id} passed compatibility smoke but shell active-panel count is {shellActivePanelCount}; expected 1 for Phase 2 shell ownership.
  ```
- If `passed` is true and `activePanelIsShellMain === true` and `shellActivePanelCount === 1`, `warning` may remain undefined.

If both shell ownership checks fail, combine the warning into one concise message. Do not include URLs, auth paths, storage-state paths, cookies, tokens, raw locator internals, or screenshot/report paths in warnings.

### 6. Update catch/failure result shape

The `catch` return in `assertSurfaceActive` must include all new fields with safe defaults:

```ts
activePanelCount: 0,
activePanelOwnerTagName: null,
activePanelRole: null,
activePanelId: null,
activePanelIsShellMain: false,
shellActivePanelFound: false,
shellActivePanelCount: 0,
```

### 7. Update evidence writer JSON and Markdown

In `pcc-live.evidence-writer.ts`:

- JSON output will include the new fields automatically if surfaces are sanitized by spreading the result. Confirm this remains true.
- Markdown must add owner/shell columns to the surface results table.

Update Markdown table columns to include:

```text
Active Panel Count
Owner
Shell Main
Shell Count
```

Recommended table:

```text
| Surface | Passed | Panel | Active Panel Count | Owner | Shell Main | Shell Count | Tab Active | Grid Count | Card Count | Warning |
```

Owner should be compact and safe, for example:

```ts
const owner = [
  surface.activePanelOwnerTagName ?? 'none',
  surface.activePanelRole ? `role=${surface.activePanelRole}` : undefined,
  surface.activePanelId ? `id=${surface.activePanelId}` : undefined,
]
  .filter(Boolean)
  .join(' ');
```

Because owner tag/role/id are controlled DOM metadata, they can be rendered directly. Keep `surface.warning` sanitized as today.

### 8. Update evidence writer sanitizer test

In `pcc-live.surface-smoke.spec.ts`, update the `PCC smoke evidence writer preserves sanitized output policy` test input surface object to include all new fields.

Use a shell-main positive fixture, for example:

```ts
activePanelCount: 2,
activePanelOwnerTagName: 'MAIN',
activePanelRole: 'tabpanel',
activePanelId: 'pcc-active-surface-panel',
activePanelIsShellMain: true,
shellActivePanelFound: true,
shellActivePanelCount: 1,
```

Add assertions that both JSON and Markdown include the new safe evidence terms, for example:

```ts
expect(jsonText).toContain('"activePanelCount": 2');
expect(jsonText).toContain('"activePanelOwnerTagName": "MAIN"');
expect(jsonText).toContain('"activePanelRole": "tabpanel"');
expect(jsonText).toContain('"activePanelId": "pcc-active-surface-panel"');
expect(jsonText).toContain('"activePanelIsShellMain": true');
expect(jsonText).toContain('"shellActivePanelCount": 1');

expect(markdownText).toContain('Active Panel Count');
expect(markdownText).toContain('Shell Main');
expect(markdownText).toContain('MAIN role=tabpanel id=pcc-active-surface-panel');
```

Keep all existing forbidden-string assertions.

### 9. Add page-object unit coverage through Playwright test where practical

Add at least one non-live test in `pcc-live.surface-smoke.spec.ts` or a new focused Playwright spec if needed to verify the result shape against controlled DOM.

Preferred new test in `pcc-live.surface-smoke.spec.ts`:

```ts
test('PCC surface smoke records shell active-panel ownership without making it a hard gate', async ({
  page,
}) => {
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="project-home" data-pcc-tab-active="false">Project Home</button>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="documents" data-pcc-tab-active="false">Documents</button>
    </div>
    <main id="pcc-active-surface-panel" role="tabpanel" data-pcc-active-surface-panel="documents">
      <div data-pcc-bento-grid>
        <article data-pcc-card data-pcc-active-surface-panel="documents">Documents command</article>
        <article data-pcc-card>Detail</article>
      </div>
    </main>
    <script>
      document.querySelector('[data-pcc-tab-id="documents"]').addEventListener('click', () => {
        const tab = document.querySelector('[data-pcc-tab-id="documents"]');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-pcc-tab-active', 'true');
      });
    </script>
  `);

  const po = new PccLivePageObject(page);
  const result = await po.assertSurfaceActive(PCC_LIVE_SURFACE_REGISTRY.documents);

  expect(result.passed).toBe(true);
  expect(result.activePanelFound).toBe(true);
  expect(result.activePanelCount).toBe(2);
  expect(result.activePanelOwnerTagName).toBe('MAIN');
  expect(result.activePanelRole).toBe('tabpanel');
  expect(result.activePanelId).toBe('pcc-active-surface-panel');
  expect(result.activePanelIsShellMain).toBe(true);
  expect(result.shellActivePanelFound).toBe(true);
  expect(result.shellActivePanelCount).toBe(1);
  expect(result.warning).toBeUndefined();
});
```

Add a second non-live test for tenant-lag/card-owner compatibility:

```ts
test('PCC surface smoke records non-shell active-panel ownership as warning without failing compatibility smoke', async ({
  page,
}) => {
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="documents" data-pcc-tab-active="false">Documents</button>
    </div>
    <div data-pcc-bento-grid>
      <article data-pcc-card data-pcc-active-surface-panel="documents">Documents command</article>
      <article data-pcc-card>Detail</article>
    </div>
    <script>
      document.querySelector('[data-pcc-tab-id="documents"]').addEventListener('click', () => {
        const tab = document.querySelector('[data-pcc-tab-id="documents"]');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-pcc-tab-active', 'true');
      });
    </script>
  `);

  const po = new PccLivePageObject(page);
  const result = await po.assertSurfaceActive(PCC_LIVE_SURFACE_REGISTRY.documents);

  expect(result.passed).toBe(true);
  expect(result.activePanelFound).toBe(true);
  expect(result.activePanelCount).toBe(1);
  expect(result.activePanelOwnerTagName).toBe('ARTICLE');
  expect(result.activePanelIsShellMain).toBe(false);
  expect(result.shellActivePanelFound).toBe(false);
  expect(result.shellActivePanelCount).toBe(0);
  expect(result.warning).toContain('passed compatibility smoke');
  expect(result.warning).toContain('shell main ownership not observed');
});
```

If importing `PCC_LIVE_SURFACE_REGISTRY` is needed, update imports in `pcc-live.surface-smoke.spec.ts`.

These are not live tenant tests; they use `page.setContent` and should run without env/auth.

### 10. Do not run or require live tenant smoke unless env/auth are ready

The required validation can list live Playwright and optionally run it only when the local environment is ready.

Do not claim live evidence artifacts exist unless the command actually ran and wrote `pcc-live-surface-smoke.json` / `.md`.

## Required Tests

At minimum, final tests must prove:

- registry definitions include both broad compatibility and shell-main selectors;
- page-object result includes active-panel count/owner/shell fields;
- shell-main ownership is recorded when present;
- card-owned/tenant-lag ownership produces a warning but does not fail compatibility smoke;
- evidence writer JSON and Markdown include the new fields;
- sanitizer still removes unsafe artifacts, tokens, auth/storage/session terms, raw reports, screenshots/videos/traces/HARs;
- existing live smoke registry/root/navigation tests are not weakened.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.page-object.ts e2e/pcc-live/pcc-live.surfaces.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts e2e/pcc-live/pcc-live.evidence-writer.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Notes:

- The Playwright surface-smoke spec includes non-live tests that should run without env/auth; live tests should self-skip when env/auth are missing.
- If the environment is not ready and the live tests self-skip, report the self-skip status honestly.
- If running the full surface-smoke spec is impossible locally, run `--list`, `check-types`, full package test, Prettier, and `git diff --check`, then report why the Playwright run was not executed.
- Do not run `pnpm install`, `pnpm add`, or any command that intentionally changes the lockfile.

If Prettier fails only on touched files, run `prettier --write` only on touched files, then rerun:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec prettier --check <touched-files-only>
git diff --check
```

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Implementation Plan

## Evidence Schema / Markdown Plan

## Soft-Gate Tenant-Lag Plan

## Test / Validation Plan

## Package / Lockfile / Manifest Posture

## Risks / Open Items
```

## Required Following-Execution Response Format

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## What Changed

## Evidence Schema / Markdown Proof

## Soft-Gate Tenant-Lag Proof

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 05

Prompt 05 is complete only when:

- broad compatibility active-panel selector remains in the surface registry;
- shell-specific active-panel selector is added to the surface registry;
- `PccLiveSurfaceSmokeResult` includes active-panel count, owner tag, owner role, owner id, `activePanelIsShellMain`, `shellActivePanelFound`, and `shellActivePanelCount`;
- live smoke `passed` logic remains compatibility-based and does not hard-fail solely because shell-main ownership is absent;
- non-shell/card-owned marker posture produces a warning that tenant package may lag Phase 2;
- JSON and Markdown evidence output include the new owner/shell fields;
- sanitizer tests still prevent unsafe auth/storage/token/raw-artifact leakage;
- non-live Playwright tests prove both shell-main ownership recording and tenant-lag soft warning behavior;
- no app production files are edited;
- no package/lockfile/manifest/package-solution drift occurs.

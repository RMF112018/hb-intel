# 4C — UI Design Completion Plan Sprint E
### HB Intel · @hbc/ui-kit · Path to 100% Completion
**Version:** 1.0  
**Date:** March 6, 2026  
**Repository:** github.com/RMF112018/hb-intel  
**Audit Basis:** Agent 2 QA/QC Report (audit-report-2.js) + Agent 4 Independent Validation (HB-Intel-UIKit-Agent4-Validation-Report.docx)  
**Reference Plans:** PH4-UI-Design-Plan V2.1 · PH4B-UI-Design-Plan V1.2

---

## 5. Sprint Execution Plan

The work is organized into five focused sprints, sequenced by dependency order and risk priority. HIGH severity items are addressed first. Total estimated developer effort is noted for planning purposes.

---

### Sprint 4C-E: Verification, Testing & Documentation Audit

**Priority:** REQUIRED — closes the loop on testing coverage and confirms 100% completion  
**Estimated effort:** 2–4 hours

#### Task E-01 — Verify Touch Row Height in HbcDataTable (R-14)

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx` + Storybook or Playwright test  
**Finding:** F-14 in Agent 2 (NOTE: this is the test coverage gap item, not the HbcInput.md F-14 — they share a number due to the refuted finding; this is the density/touch item from R-14)  
**Remediation ID:** R-14

**Context:** `useAdaptiveDensity` should return a 56px row height when the device is in Touch density tier. There is no existing assertion verifying this in Storybook or Playwright tests.

**Implementation:**

1. In the `HbcDataTable` Storybook story file, add a Touch density story:
   ```ts
   export const TouchDensity: Story = {
     args: { density: 'touch', ...defaultArgs },
     play: async ({ canvas }) => {
       const rows = canvas.getAllByRole('row');
       const dataRow = rows[1]; // first data row
       expect(dataRow).toHaveStyle({ minHeight: '56px' });
     }
   };
   ```
2. Alternatively, add a Playwright assertion:
   ```ts
   test('DataTable Touch density row height', async ({ page }) => {
     await page.goto('/iframe.html?id=hbcdatatable--touch-density');
     const row = page.locator('tr[data-testid="row-touch-height"]').first();
     const height = await row.evaluate(el => getComputedStyle(el).minHeight);
     expect(parseInt(height)).toBeGreaterThanOrEqual(56);
   });
   ```
3. Add `data-testid="row-touch-height"` to data row `<tr>` elements when density is Touch tier

**Acceptance criteria:**
- Touch tier rows are confirmed at ≥56px height via automated assertion
- Test passes in CI

#### Task E-02 — Confirm HbcEmptyState and HbcErrorBoundary Documentation (AF-04)

**Scope:** `docs/reference/ui-kit/`

1. Verify `HbcEmptyState.md` and `HbcErrorBoundary.md` exist in `docs/reference/ui-kit/`
2. If absent, create each from the standard component reference template used by `HbcButton.md`, covering: overview, props table, usage examples, accessibility notes
3. Update the component inventory in any internal tracking documents to give each component an explicit standalone row

**Acceptance criteria:**
- Both `HbcEmptyState.md` and `HbcErrorBoundary.md` are present and complete
- Docs folder count is ≥50 files

#### Task E-03 — Final Full Lint & Build Verification

After all code changes are complete, perform a full monorepo validation:

```bash
# Full lint run
pnpm turbo lint

# TypeScript type check
pnpm turbo type-check

# Build all packages
pnpm turbo build

# Run all tests
pnpm turbo test

# Storybook build verification
pnpm --filter @hbc/ui-kit build-storybook
```

**Acceptance criteria:**
- Zero lint errors (no-direct-fluent-import, enforce-hbc-tokens, all 11 rules)
- Zero TypeScript errors
- All packages build successfully
- All existing tests pass
- Storybook builds without warnings

#### Task E-04 — Storybook Accessibility Audit Sweep

For each component that received code changes in Sprints 4C-A through 4C-D, run the Storybook A11y addon:

- `HbcCommandPalette` — verify focus trap, dialog semantics, AI shimmer aria attributes
- `HbcDataTable` — verify table headers WCAG compliance, Field Mode shimmer
- `HbcStatusBadge` — verify high-contrast rendering
- `HbcConnectivityBar` — verify action button contrast
- `HbcAppShell` — regression check

**Acceptance criteria:**
- Zero critical or serious violations reported by Axe in any modified component's stories
- Warnings reviewed and documented (not necessarily fixed, but acknowledged)

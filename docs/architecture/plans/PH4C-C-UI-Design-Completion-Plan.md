# 4C — UI Design Completion Plan Sprint C
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

### Sprint 4C-C: Code Quality, Integration & ESLint Compliance

**Priority:** MEDIUM — required for integration correctness and code quality gate  
**Estimated effort:** 4–8 hours (variable — ESLint triage duration depends on violation count)

#### Task C-01 — Wire `useSavedViews` Internally into `HbcDataTable` (F-07)

**File:** `packages/ui-kit/src/HbcDataTable/hooks/useSavedViews.ts` and `packages/ui-kit/src/HbcDataTable/index.tsx`  
*(Note: Correct hook path is `.../HbcDataTable/hooks/useSavedViews.ts`, not `.../HbcDataTable/useSavedViews.ts`)*  
**Finding:** F-07 (LOW)  
**Remediation ID:** R-10 (path corrected)

**Context:** Currently, consumers of `HbcDataTable` must import and invoke `useSavedViews` separately and pass the resulting state through props. This creates an inconsistent integration pattern — some consumers will wire it correctly, others will not, leading to divergent table behavior across the application.

**Implementation:**

1. Add an optional `savedViewsConfig` prop to `HbcDataTable`'s props interface:
   ```ts
   interface HbcDataTableProps {
     // ... existing props
     savedViewsConfig?: {
       tableId: string;
       userId: string;
       onViewSaved?: (view: SavedView) => void;
       onViewDeleted?: (viewId: string) => void;
     };
   }
   ```
2. Inside `HbcDataTable`, conditionally invoke `useSavedViews` when `savedViewsConfig` is provided:
   ```ts
   const savedViews = savedViewsConfig
     ? useSavedViews(savedViewsConfig)
     : null;
   ```
3. Wire the saved views state into the table toolbar/column chooser as appropriate
4. Expose a controlled override pattern — if consumers pass both `savedViewsConfig` and their own `savedViews` state prop, the external prop takes precedence
5. Update `HbcDataTable.md` reference doc to document the `savedViewsConfig` prop

**Acceptance criteria:**
- `HbcDataTable` renders correctly without `savedViewsConfig` (backward-compatible)
- When `savedViewsConfig` is provided, saved view actions appear in the table UI
- Consumers can optionally override saved views behavior via controlled props
- Storybook story added or updated to demonstrate `savedViewsConfig` usage

#### Task C-02 — ESLint Fluent Import Audit Across apps/ (F-12)

**Scope:** All 14 `apps/` directories  
**Finding:** F-12 (MEDIUM)  
**Remediation ID:** R-06

**Context:** The `no-direct-fluent-import` ESLint rule is confirmed active at error level in `packages/eslint-plugin-hbc`. What is unknown is whether `// eslint-disable-next-line` suppressions or `/* eslint-disable */` blocks exist in `apps/` that mask genuine violations. A live linting run is required to surface any remaining gaps.

**Implementation steps:**

1. From the monorepo root, run:
   ```bash
   pnpm turbo lint -- --rule '@hb-intel/hbc/no-direct-fluent-import: error'
   ```
2. Capture all output to a triage file:
   ```bash
   pnpm turbo lint 2>&1 | grep "no-direct-fluent-import" > fluent-import-violations.txt
   ```
3. For each violation, determine disposition:
   - **Legitimate exception** (e.g., Storybook stories, test files, one-off utility): Add `// eslint-disable-next-line @hb-intel/hbc/no-direct-fluent-import -- [reason] tracked in #ISSUE_NUMBER`
   - **Actual violation** (component or page consuming Fluent directly instead of via `@hbc/ui-kit`): Replace with the equivalent `@hbc/ui-kit` component or create a new wrapper component in `@hbc/ui-kit` if one doesn't exist
4. Re-run lint after all changes and confirm zero unexplained violations
5. Document any new `@hbc/ui-kit` components created as part of this audit in a changelog entry

**Acceptance criteria:**
- `pnpm turbo lint` produces zero `no-direct-fluent-import` errors without inline suppressions
- Any remaining inline suppressions are accompanied by a comment with business justification and a tracking issue number
- No new direct Fluent imports introduced in `apps/` without going through `@hbc/ui-kit`

---

### Sprint 4C-D: UX Consistency & Polish

**Priority:** LOW — improves UX consistency and accessibility robustness  
**Estimated effort:** 2–3 hours

#### Task D-01 — Add WCAG Table Headers Attribute to DataTable (F-06)

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx`  
**Finding:** F-06 (LOW)  
**Remediation ID:** R-09

**Context:** WCAG 2.2 AA (Success Criterion 1.3.1 — Info and Relationships) requires that data cells in a table are programmatically associated with their column headers. The `headers` attribute links a `<td>` to the `id` of its corresponding `<th>`. Without this, screen readers cannot announce the column context when reading table cell content.

**Implementation:**

1. Ensure each column header `<th>` has a unique `id` attribute derived from the column definition (e.g., `id={`col-${column.key}`}`)
2. Add `headers` attribute to each `<td>` referencing its column header:
   ```tsx
   <td
     key={cell.columnKey}
     headers={`col-${cell.columnKey}`}
     ...
   >
   ```
3. Alternatively, if the table already uses `aria-labelledby` on rows, verify coverage is sufficient for screen readers to announce column context
4. Run Storybook Axe accessibility audit on `HbcDataTable` stories to confirm no remaining WCAG 1.3.1 violations

**Acceptance criteria:**
- Each `<td>` element has a `headers` attribute referencing the correct `<th>` `id`
- Storybook A11y addon reports no table-related violations
- No regression in table rendering or keyboard navigation

#### Task D-02 — Fix StatusBadge High-Contrast Mode (F-08)

**File:** `packages/ui-kit/src/HbcStatusBadge/index.tsx`  
**Finding:** F-08 (LOW)  
**Remediation ID:** R-11

**Context:** Windows high-contrast mode ignores inline CSS styles (`style={{...}}` in React), which means `style={{ backgroundColor: '...' }}` overrides on a Fluent `Badge` component will be stripped, potentially rendering the badge invisible or incorrectly styled for users on high-contrast accessibility themes.

**Implementation:**

Choose one of two approaches:

**Option A — Use `makeStyles` with Fluent tokens:**
1. Import `makeStyles` and `tokens` from `@fluentui/react-components`
2. Define badge background using `tokens.colorBrandBackground`:
   ```ts
   const useStyles = makeStyles({
     statusBadge: {
       backgroundColor: tokens.colorBrandBackground,
     }
   });
   ```
3. Apply the className instead of inline style

**Option B — Use Fluent Badge `appearance` prop:**
1. Evaluate whether the existing `color='brand'` prop satisfies the visual requirement without an override
2. If status color differentiation is needed, use Fluent's `color` and `appearance` combination through the official API rather than inline style

**Acceptance criteria:**
- `HbcStatusBadge` renders correctly in normal mode
- Badge is visible and correctly styled in Windows High Contrast Black mode
- Badge is visible and correctly styled in Windows High Contrast White mode
- No inline `style` attribute on the Fluent `Badge` component

#### Task D-03 — Add Shimmer Skeleton to CommandPalette AI Response Panel (F-10)

**File:** `packages/ui-kit/src/HbcCommandPalette/index.tsx`  
**Finding:** F-10 (LOW)  
**Remediation ID:** R-12

**Context:** The AI response panel currently renders `<div className={styles.emptyState}>Thinking...</div>` during the loading state (`aiLoading === true`). The shimmer CSS infrastructure (`shimmerBar`, `shimmerRow` animation classes) exists in `HbcDataTable` but is not available in `HbcCommandPalette`. Consistency across the kit requires a shimmer skeleton during all loading states.

**Implementation:**

1. Extract the shimmer animation CSS into a shared utility — either a dedicated `shimmer.ts` / `shimmer.css` module in `packages/ui-kit/src/shared/` or export it from `HbcDataTable` as a named export
2. Import the shared shimmer styles (or replicate the keyframe animation) in `HbcCommandPalette`
3. Replace the plain "Thinking..." text render:
   ```tsx
   // BEFORE
   {aiLoading && (
     <div className={styles.emptyState}>Thinking...</div>
   )}
   
   // AFTER
   {aiLoading && (
     <div className={styles.aiLoadingContainer} aria-busy="true" aria-label="Loading AI response">
       <div className={styles.shimmerRow} style={{ width: '90%' }} />
       <div className={styles.shimmerRow} style={{ width: '75%' }} />
       <div className={styles.shimmerRow} style={{ width: '60%' }} />
     </div>
   )}
   ```
4. Ensure the shimmer animation respects `prefers-reduced-motion` media query by disabling the animation when motion is reduced:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .shimmerRow { animation: none; background: var(--hbc-surface-2); }
   }
   ```

**Acceptance criteria:**
- AI loading state displays three animated shimmer rows instead of plain text
- Shimmer style is visually consistent with the shimmer used in `HbcDataTable`
- `aria-busy="true"` and `aria-label` are present for screen reader users
- Animation respects `prefers-reduced-motion`
- Storybook story updated to demonstrate AI loading state

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

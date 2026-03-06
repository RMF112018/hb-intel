# 4C — UI Design Completion Plan Sprint D
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
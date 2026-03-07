# Phase 4C Task 1 – Accessibility Focus Management & WCAG Headers

**Version:** 1.0 (Focus Trap Integration + WCAG 1.3.1 Table Headers)
**Purpose:** This document defines the complete implementation steps to add the `useFocusTrap` hook to HbcCommandPalette (addressing WCAG 2.4.3 + 2.1.2 focus management violations) and to add WCAG 1.3.1-compliant `headers` attributes to all `<td>` elements in HbcDataTable with proper column id mapping and edge-case handling.
**Audience:** Implementation agents, accessibility engineers, QA specialists
**Implementation Objective:** Deliver full focus management and table accessibility compliance across two core UI components with comprehensive Storybook testing, Axe sweep validation, and production-ready documentation.

---

## Prerequisites

This task has **no hard prerequisites** — it may begin immediately or after PH4C.7, depending on implementation sequence.

**Verification of independent status:**
```bash
# No prerequisite checks needed for PH4C.1
# This task can execute independently
echo "PH4C.1 is independent and ready to start"
```

---

## 4C.1 Accessibility Focus Management & WCAG Headers Implementation

### Task 4C.1a: HbcCommandPalette useFocusTrap Hook Integration (WCAG 2.4.3 + 2.1.2)

**Context:** The HbcCommandPalette component has a dialog that correctly implements `role="dialog"`, `aria-modal="true"`, and Escape/Enter/Arrow key handling. However, it does not import the existing `useFocusTrap` hook from `packages/ui-kit/src/hooks/useFocusTrap.ts`, causing keyboard focus to escape the dialog via Tab/Shift+Tab navigation. This violates WCAG 2.4.3 (Focus Order) and WCAG 2.1.2 (Keyboard accessible). The hook exists but is not integrated. (D-PH4C-10)

#### 4C.1.1 Audit the useFocusTrap Hook API

1. Open `packages/ui-kit/src/hooks/useFocusTrap.ts`
2. Read the complete hook implementation to understand:
   - Hook signature and input parameters (especially the `isActive` boolean)
   - Return value type (typically a React ref or array of refs)
   - Hook dependencies and memoization
   - Any environment guards (e.g., `typeof window`)
3. Check if the hook has TypeScript types exported in the hooks barrel (`packages/ui-kit/src/hooks/index.ts`)
4. Document the hook's behavior: what it does when `isActive: true` and how it handles focus trap cleanup

**Expected output:** You understand the hook's exact signature and behavior, ready to integrate.

#### 4C.1.2 Check for useMergedRefs Availability

1. Search `packages/ui-kit/src/hooks/` for a `useMergedRefs` hook (alternative names: `useComposeRefs`, `useCombinedRefs`, `useForwardedRef`)
2. If found, check its signature and export in the hooks barrel
3. If not found, prepare to use the callback ref pattern instead (see step 4C.1.5)

**Expected output:** You know whether useMergedRefs is available or must use callback pattern.

#### 4C.1.3 Import useFocusTrap in HbcCommandPalette

1. Open `packages/ui-kit/src/HbcCommandPalette/index.tsx`
2. Locate the existing imports section (top of file)
3. Add import statement:
   ```typescript
   // D-PH4C-10: Focus trap integration for WCAG 2.4.3 + 2.1.2 compliance
   import { useFocusTrap } from '../../hooks/useFocusTrap';
   ```
4. Verify the relative path resolves correctly (should point to `packages/ui-kit/src/hooks/useFocusTrap.ts`)

**Expected output:** useFocusTrap is imported and available in the component.

#### 4C.1.4 Call useFocusTrap Hook in HbcCommandPalette

1. Locate the component's main render function or the effect hooks section
2. Call the hook immediately after other hooks (following React rules of hooks):
   ```typescript
   // D-PH4C-10: Activate focus trap when dialog is open
   const focusTrapRef = useFocusTrap({ isActive: isOpen });
   ```
3. Ensure `isOpen` is a boolean state variable that reflects whether the dialog is open (verify against existing component code)
4. The hook returns a ref that must be merged with the existing `dialogRef` (see next step)

**Expected output:** Hook is called and `focusTrapRef` is available for use.

#### 4C.1.5 Merge Refs Using useMergedRefs or Callback Pattern

**Option A: If useMergedRefs exists** (D-PH4C-10)

1. Import useMergedRefs:
   ```typescript
   import { useMergedRefs } from '../../hooks/useMergedRefs';
   ```
2. Merge refs in the component:
   ```typescript
   const mergedRef = useMergedRefs(dialogRef, focusTrapRef);
   ```
3. Apply the merged ref to the dialog container (next step)

**Option B: If useMergedRefs does not exist** (fallback, D-PH4C-10)

1. Use a callback ref instead:
   ```typescript
   const mergedRef = useCallback((node: HTMLDivElement | null) => {
     // Assign to dialogRef
     if (typeof dialogRef === 'function') {
       dialogRef(node);
     } else if (dialogRef) {
       dialogRef.current = node;
     }
     // Assign to focusTrapRef
     if (typeof focusTrapRef === 'function') {
       focusTrapRef(node);
     } else if (focusTrapRef) {
       focusTrapRef.current = node;
     }
   }, [dialogRef, focusTrapRef]);
   ```
2. Apply mergedRef to the dialog container (next step)

**Expected output:** A merged ref that assigns to both dialogRef and focusTrapRef.

#### 4C.1.6 Apply Merged Ref to Dialog Container

1. Locate the outermost `<div>` element that has `role="dialog"` and `aria-modal="true"` in HbcCommandPalette
2. Replace the existing `ref={dialogRef}` with `ref={mergedRef}` (using the merged ref from 4C.1.5):
   ```typescript
   <div
     ref={mergedRef}
     role="dialog"
     aria-modal="true"
     className={dialogClasses}
     // ... other attributes
   >
     {/* dialog content */}
   </div>
   ```
3. Verify no other ref assignments exist on this element
4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** Dialog container has merged ref assigned; build succeeds.

#### 4C.1.7 Test Focus Trap in React Strict Mode

1. Open `packages/ui-kit/src/HbcCommandPalette/HbcCommandPalette.stories.tsx` (Storybook story file)
2. Ensure the story renders the component with `isOpen={true}` (or equivalent prop)
3. Run Storybook locally: `pnpm turbo run dev --filter=dev-harness`
4. Navigate to the HbcCommandPalette story
5. Click into the dialog and verify:
   - Tab key cycles through focusable elements inside the dialog only
   - Shift+Tab cycles backward through elements, wrapping at start
   - Focus does not escape to elements outside the dialog
   - Escape key closes the dialog (existing behavior, should remain)
6. Test in both light and dark themes (Field Mode)

**Expected output:** Focus trap works correctly; Tab/Shift+Tab do not escape dialog.

#### 4C.1.8 Add/Update Storybook Story with Keyboard Navigation Play Function

1. Open or create `packages/ui-kit/src/HbcCommandPalette/HbcCommandPalette.stories.tsx`
2. Add a play function to the default story that tests keyboard navigation:
   ```typescript
   import { userEvent, within } from '@storybook/test';

   export const Default = {
     args: {
       isOpen: true,
       // ... other props
     },
     play: async ({ canvasElement }) => {
       const canvas = within(canvasElement);
       const dialog = canvas.getByRole('dialog');

       // Focus enters dialog
       dialog.focus();

       // Simulate Tab key press - focus should stay within dialog
       await userEvent.tab();
       // Verify focus is still within dialog (not on page background)
       expect(document.activeElement).toBeInTheDocument();
       expect(dialog).toContainElement(document.activeElement);
     },
   };
   ```
3. Build Storybook: `pnpm turbo run build:storybook --filter=dev-harness`
4. Verify the play function executes without errors in Storybook

**Expected output:** Storybook story includes keyboard navigation play test.

#### 4C.1.9 Run Axe Accessibility Sweep on HbcCommandPalette

1. Install or use the existing Storybook Axe integration (check `package.json` for `@axe-core/react` or `@storybook/addon-a11y`)
2. Open Storybook locally and navigate to HbcCommandPalette story
3. Open the Accessibility tab (A11y addon in Storybook)
4. Run Axe scan on the dialog open state
5. Verify zero violations for:
   - WCAG 2.4.3 (Focus Order)
   - WCAG 2.1.2 (Keyboard)
   - WCAG 2.4.7 (Focus Visible)
6. Note: If Escape/Enter key handling produces violations, document and create a tracking issue

**Expected output:** Axe sweep on HbcCommandPalette shows zero WCAG 2.4.3/2.1.2 violations.

#### 4C.1.10 Document Focus Trap Integration in Reference Guide

1. Create or update `docs/reference/ui-kit/accessibility-patterns.md` with a section on focus trapping:
   ```markdown
   ## Focus Trapping Pattern (WCAG 2.4.3 + 2.1.2)

   ### When to Use
   - Modal dialogs, popovers, off-canvas menus where focus must not escape
   - Components with `role="dialog"` or `role="alertdialog"`

   ### Implementation
   Use `useFocusTrap` hook from `@hbc/ui-kit/hooks`:

   \`\`\`typescript
   import { useFocusTrap } from '@hbc/ui-kit';

   export function MyDialog({ isOpen }) {
     const focusTrapRef = useFocusTrap({ isActive: isOpen });
     return (
       <div role="dialog" ref={focusTrapRef}>
         {/* content */}
       </div>
     );
   }
   \`\`\`

   ### Verification
   - Test with keyboard Tab/Shift+Tab
   - Verify focus stays within dialog
   - Run Storybook Axe sweep: zero WCAG 2.4.3 violations
   ```

**Expected output:** Reference guide section on focus trapping is documented.

---

### Task 4C.1b: HbcDataTable WCAG 1.3.1 Headers Attribute Implementation

**Context:** HbcDataTable uses `<th>` column headers and `<td>` data cells, but the `<td>` elements lack `headers` attributes (mapping to column `<th id="...">` elements). This violates WCAG 1.3.1 (Info and Relationships). Adding `headers` attributes explicitly associates each cell with its column header, improving screen reader accessibility and data table semantics. (D-PH4C-10)

#### 4C.1.11 Understand HbcDataTable Column Definition Structure

1. Open `packages/ui-kit/src/HbcDataTable/index.tsx`
2. Locate the column definition structure (usually a TypeScript interface or array of column objects)
3. Understand:
   - How column headers are defined (JSX, strings, or objects)
   - Whether columns have unique identifiers (id, key, accessor)
   - Whether there are grouped columns (nested column hierarchy)
   - How rows are rendered (`<tr>` loop, `<td>` elements)
4. Check if column definitions already include an `id` or `key` property; if not, plan to add unique identifiers

**Expected output:** You understand the column structure and row rendering logic.

#### 4C.1.12 Add Unique IDs to All `<th>` Header Elements

1. Locate all `<th>` elements in the HbcDataTable header row(s)
2. For each `<th>`, add a unique `id` attribute:
   ```typescript
   // Example: mapping columnDefinition to a <th>
   columnDefinitions.map((column, index) => (
     <th key={column.id || index} id={`col-${column.id || index}`}>
       {column.headerName}
     </th>
   ))
   ```
3. Ensure IDs are:
   - Unique within the table
   - Stable (not generated randomly on each render)
   - Prefixed to avoid collisions with other tables on the page (e.g., `table-1-col-firstName`)
4. For grouped/multi-level headers, add IDs to all levels
5. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** All `<th>` elements have unique, stable ids.

#### 4C.1.13 Add Headers Attribute to All `<td>` Elements

1. Locate all `<td>` elements in the HbcDataTable body rows
2. For each `<td>`, determine which column it belongs to (usually via index or column key)
3. Add the `headers` attribute, mapping to the corresponding `<th>` id:
   ```typescript
   // Example: rendering a row
   row.cells.map((cellValue, cellIndex) => {
     const columnId = `col-${columnDefinitions[cellIndex].id || cellIndex}`;
     return (
       <td key={cellIndex} headers={columnId}>
         {cellValue}
       </td>
     );
   })
   ```
4. Ensure headers attribute value exactly matches the `<th>` id
5. For multiple header associations (e.g., grouped columns), use space-separated ids:
   ```typescript
   headers={`col-group-1 col-firstName`}
   ```
6. Build: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** All `<td>` elements have `headers` attribute mapping to corresponding `<th>` ids.

#### 4C.1.14 Handle Edge Cases: colspan, Grouped Columns, Row Headers

1. **colspan handling:**
   - If a `<th>` or `<td>` spans multiple columns, the `id`/`headers` must still reference all affected columns
   - Example: a cell with `colspan="2"` should reference both column ids: `headers="col-1 col-2"`

2. **Row headers (if present):**
   - If the first cell in each row is a row header (`<th scope="row">`), add an `id` to it
   - Other cells in that row should reference the row header id as well: `headers="row-id col-id"`

3. **Grouped/hierarchical columns:**
   - For multi-level headers, add ids to both the group header and individual column headers
   - `<td>` should reference all levels: `headers="group-id col-id"`

4. Add code comments documenting edge-case handling:
   ```typescript
   // D-PH4C-10: WCAG 1.3.1 edge-case handling
   // - colspan: td.headers references all spanned columns
   // - row headers: headers includes both row + column id
   // - grouped columns: headers includes group + column id
   ```

**Expected output:** Edge cases are handled with clear comments explaining the approach.

#### 4C.1.15 Run Storybook Axe Sweep for WCAG 1.3.1 Validation

1. Open Storybook to the HbcDataTable story
2. Render a table with multiple columns and rows
3. Open the Accessibility (A11y) tab
4. Run Axe scan
5. Verify zero violations for:
   - WCAG 1.3.1 (Info and Relationships) — specifically the "Table missing headers" error
   - WCAG 1.3.1 (Table header association)
6. Test with a screen reader (if available):
   - Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
   - Confirm that table cells are announced with their header associations
7. If violations remain, document the violation details and create a tracking issue

**Expected output:** Axe sweep shows zero WCAG 1.3.1 violations; screen reader announces table structure correctly.

#### 4C.1.16 Verify No Regression in Keyboard Navigation

1. Test HbcDataTable keyboard navigation (existing, not new):
   - Arrow keys navigate between cells (if implemented)
   - Tab key moves through focusable cells
   - No focus traps or unexpected behavior
2. Run full test suite: `pnpm turbo run test --filter=@hbc/ui-kit`
3. Manually test in Storybook with keyboard-only navigation
4. Ensure sort, filter, and other interactive features still work

**Expected output:** Keyboard navigation is unchanged; all interactive features work.

---

## Success Criteria Checklist

### Focus Trap (HbcCommandPalette)
- [ ] useFocusTrap hook imported in HbcCommandPalette
- [ ] Hook called with `isActive: isOpen` prop
- [ ] Refs merged using useMergedRefs or callback pattern
- [ ] Merged ref applied to dialog container
- [ ] Tab/Shift+Tab navigation tested; focus stays within dialog
- [ ] Storybook story includes keyboard navigation play function
- [ ] Axe sweep shows zero WCAG 2.4.3/2.1.2 violations
- [ ] Build succeeds: `pnpm turbo run build --filter=@hbc/ui-kit`

### WCAG Headers (HbcDataTable)
- [ ] All `<th>` elements have unique, stable `id` attributes
- [ ] All `<td>` elements have `headers` attribute mapping to `<th>` ids
- [ ] Edge cases (colspan, grouped columns, row headers) handled
- [ ] Axe sweep shows zero WCAG 1.3.1 violations
- [ ] Screen reader correctly announces table structure
- [ ] Keyboard navigation unchanged; no regressions
- [ ] Tests pass: `pnpm turbo run test --filter=@hbc/ui-kit`

### Documentation
- [ ] Accessibility patterns reference guide created/updated
- [ ] Focus trap pattern documented with code example
- [ ] WCAG 1.3.1 headers pattern documented

---

## Verification Commands

```bash
# Build verification
pnpm turbo run build --filter=@hbc/ui-kit

# Type-check verification
pnpm turbo run check-types --filter=@hbc/ui-kit

# Test verification (should pass all tests)
pnpm turbo run test --filter=@hbc/ui-kit

# Lint verification
pnpm turbo run lint --filter=@hbc/ui-kit

# Verify useFocusTrap import is present
grep -n "import.*useFocusTrap" packages/ui-kit/src/HbcCommandPalette/index.tsx

# Verify headers attributes exist on td elements
grep -n "headers=" packages/ui-kit/src/HbcDataTable/index.tsx | head -5

# Verify unique th ids exist
grep -n 'id="col-' packages/ui-kit/src/HbcDataTable/index.tsx | head -5

# Run Storybook build (if available)
pnpm turbo run build:storybook --filter=dev-harness
```

**Expected outputs:**
- All build, type-check, lint commands exit with code 0
- All tests pass
- useFocusTrap import is visible in grep output
- headers attributes are visible in td elements
- th id attributes are visible in grep output

---

## PH4C.1 Progress Notes

Track progress of each implementation step below. Update status as work progresses.

### Task 4C.1a: HbcCommandPalette useFocusTrap Integration

- 4C.1.1 [PENDING] — Audit useFocusTrap hook API and signature
- 4C.1.2 [PENDING] — Check useMergedRefs availability
- 4C.1.3 [PENDING] — Import useFocusTrap in HbcCommandPalette
- 4C.1.4 [PENDING] — Call useFocusTrap hook with isActive prop
- 4C.1.5 [PENDING] — Merge refs (useMergedRefs or callback pattern)
- 4C.1.6 [PENDING] — Apply merged ref to dialog container
- 4C.1.7 [PENDING] — Test focus trap in React Strict Mode
- 4C.1.8 [PENDING] — Add Storybook keyboard navigation play function
- 4C.1.9 [PENDING] — Run Axe sweep on HbcCommandPalette
- 4C.1.10 [PENDING] — Document focus trap pattern in reference guide

### Task 4C.1b: HbcDataTable WCAG 1.3.1 Headers Implementation

- 4C.1.11 [PENDING] — Understand column definition structure
- 4C.1.12 [PENDING] — Add unique IDs to `<th>` header elements
- 4C.1.13 [PENDING] — Add headers attributes to all `<td>` elements
- 4C.1.14 [PENDING] — Handle edge cases (colspan, grouped columns, row headers)
- 4C.1.15 [PENDING] — Run Axe sweep for WCAG 1.3.1 validation
- 4C.1.16 [PENDING] — Verify no regression in keyboard navigation

---

## Verification Evidence Template

### Focus Trap Testing Evidence

| Test | Command | Expected | Result | Date |
|------|---------|----------|--------|------|
| useFocusTrap import | `grep "useFocusTrap" packages/ui-kit/src/HbcCommandPalette/index.tsx` | Import found | [PENDING] | — |
| Build verification | `pnpm turbo run build --filter=@hbc/ui-kit` | Exit 0 | [PENDING] | — |
| Type-check | `pnpm turbo run check-types --filter=@hbc/ui-kit` | Exit 0 | [PENDING] | — |
| Tests pass | `pnpm turbo run test --filter=@hbc/ui-kit` | Exit 0, tests pass | [PENDING] | — |
| Focus trap behavior | Manual Storybook test with Tab/Shift+Tab | Focus stays in dialog | [PENDING] | — |
| Axe sweep | Storybook A11y addon | Zero WCAG 2.4.3/2.1.2 violations | [PENDING] | — |

### Headers Attribute Testing Evidence

| Test | Command | Expected | Result | Date |
|------|---------|----------|--------|------|
| th id attributes | `grep 'id="col-' packages/ui-kit/src/HbcDataTable/index.tsx` | IDs present | [PENDING] | — |
| td headers attributes | `grep "headers=" packages/ui-kit/src/HbcDataTable/index.tsx` | Headers found | [PENDING] | — |
| Axe sweep | Storybook A11y addon | Zero WCAG 1.3.1 violations | [PENDING] | — |
| Screen reader test | Manual VoiceOver/NVDA test | Table structure announced | [PENDING] | — |
| No regression | `pnpm turbo run test --filter=@hbc/ui-kit` | Tests pass | [PENDING] | — |

---

**End of PH4C.1 – Accessibility Focus Management & WCAG Headers**

<!-- IMPLEMENTATION PROGRESS & NOTES
PH4C.1 task file created: 2026-03-07
Two major focus areas:
1. HbcCommandPalette useFocusTrap integration (D-PH4C-10, WCAG 2.4.3 + 2.1.2)
2. HbcDataTable headers attributes (D-PH4C-10, WCAG 1.3.1)
Status: READY FOR IMPLEMENTATION
Prerequisites: None (independent task)
Next: Execute 4C.1.1–4C.1.16 in sequence
Expected duration: 3–4 hours
-->

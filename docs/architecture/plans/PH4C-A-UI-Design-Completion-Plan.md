# 4C — UI Design Completion Plan
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

### Sprint 4C-A: Critical Accessibility & Focus Management

**Priority:** MUST SHIP — blocks WCAG 2.2 AA certification  
**Estimated effort:** 2–4 hours  
**Target completion:** Before any production release

#### Task A-01 — Add `useFocusTrap` to `HbcCommandPalette`

**File:** `packages/ui-kit/src/HbcCommandPalette/index.tsx`  
**Finding:** F-09 (HIGH)  
**Remediation ID:** R-01

**Context:** The component already has a `dialogRef` (`React.useRef<HTMLDivElement>`), `role="dialog"`, `aria-modal="true"`, and manual keyboard handling for Escape/Enter/Arrow keys via `handleKeyDown`. The sole gap is that Tab/Shift+Tab key events are not trapped — focus can escape the dialog to the page behind it. The `useFocusTrap` hook already exists in the kit at `packages/ui-kit/src/hooks/useFocusTrap.ts` and is exported from the hooks barrel.

**Implementation steps:**

1. Open `packages/ui-kit/src/HbcCommandPalette/index.tsx`
2. Add the following import at the top of the file alongside existing hook imports:
   ```ts
   import { useFocusTrap } from '../../hooks/useFocusTrap';
   ```
3. In the component body, call the hook and attach its ref to the dialog container:
   ```ts
   const focusTrapRef = useFocusTrap({ isActive: isOpen });
   ```
4. Apply the ref to the outermost dialog container div. The `dialogRef` currently attached to this element must be merged with `focusTrapRef`. Use a ref callback or `useMergedRefs` if available in the kit:
   ```tsx
   <div
     ref={(node) => {
       dialogRef.current = node;
       if (typeof focusTrapRef === 'function') focusTrapRef(node);
       else if (focusTrapRef) focusTrapRef.current = node;
     }}
     role="dialog"
     aria-modal="true"
     ...
   >
   ```
   If `useMergedRefs` is available in the hooks barrel, prefer:
   ```tsx
   const mergedRef = useMergedRefs(dialogRef, focusTrapRef);
   <div ref={mergedRef} role="dialog" aria-modal="true" ...>
   ```
5. Ensure the focus trap is only active when `isOpen === true` and is properly cleaned up on unmount.

**Acceptance criteria:**
- Tab key pressed while CommandPalette is open cycles focus only within the dialog boundary
- Shift+Tab pressed from the first focusable element wraps to the last
- Focus trap disengages when CommandPalette is closed (Escape key or overlay click)
- Existing Escape/Enter/Arrow key behaviors are unaffected
- Manual keyboard test: Open palette → Tab through all focusable elements → confirm focus does not reach page content behind the overlay
- Storybook A11y addon reports no violations in `HbcCommandPalette` stories

---
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

### Sprint 4C-B: Theme Token Hardcoding Elimination

**Priority:** HIGH — blocks Field Mode (dark theme) correctness  
**Estimated effort:** 3–5 hours  
**Target completion:** Same sprint as 4C-A or immediately after

These items share a common root cause: inline JS `makeStyles` objects that reference imported JS token constants (`HBC_SURFACE_LIGHT[...]`) rather than CSS custom properties (`var(--hbc-...)`). The fix pattern is identical across all three DataTable items.

#### Task B-01 — Fix DataTable Shimmer Overlay Token (F-03)

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx`  
**Finding:** F-03 (MEDIUM)  
**Remediation ID:** R-02

**Implementation:**

1. Locate `shimmerContainer` in the `useStyles()` call (approximately line 150)
2. Replace:
   ```ts
   backgroundColor: 'rgba(255,255,255,0.85)',
   ```
   With:
   ```ts
   backgroundColor: 'var(--hbc-surface-2-alpha)',
   ```
3. In the theme CSS injection for `hbcLightTheme` (likely `packages/ui-kit/src/theme.ts` or a theme CSS file), define:
   ```css
   --hbc-surface-2-alpha: rgba(255, 255, 255, 0.85);
   ```
4. In the theme CSS injection for `hbcFieldTheme`, define an appropriate dark equivalent, e.g.:
   ```css
   --hbc-surface-2-alpha: rgba(20, 20, 20, 0.85);
   ```
5. Add a `[data-field-mode='true']` override in the DataTable component CSS if the theme injection does not automatically cascade to deeply nested components:
   ```css
   [data-field-mode='true'] .shimmerContainer {
     background: var(--hbc-field-surface-2-alpha);
   }
   ```

**Acceptance criteria:**
- Shimmer overlay renders correctly in light theme (white wash)
- Shimmer overlay renders correctly in Field Mode (dark wash, no white flash)
- No hardcoded `rgba(255,255,255` values remain in `HbcDataTable/index.tsx`

#### Task B-02 — Fix DataTable Stale/Fresh Border Tokens (F-04)

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx`  
**Finding:** F-04 (MEDIUM)  
**Remediation ID:** R-03 (partial)

**Implementation:**

1. Locate `wrapperStale` and `wrapperFresh` style definitions
2. Replace both occurrences of:
   ```ts
   borderColor: HBC_SURFACE_LIGHT['border-default'],
   ```
   With:
   ```ts
   borderColor: 'var(--hbc-border-default)',
   ```
3. Verify `--hbc-border-default` is defined in both `hbcLightTheme` and `hbcFieldTheme` CSS token injections. Expected light value: `#D1D5DB`. Define an appropriate field/dark value.

**Acceptance criteria:**
- In light theme: stale/fresh row borders render as `#D1D5DB` (or equivalent light border)
- In Field Mode: borders adopt the field theme border color without a page reload
- Runtime theme switch (via theme toggle if implemented) updates border color immediately

#### Task B-03 — Fix DataTable Responsibility Row Background Token (F-05)

**File:** `packages/ui-kit/src/HbcDataTable/index.tsx`  
**Finding:** F-05 (LOW — downgraded)  
**Remediation ID:** R-03 (partial)

**Context:** The Field Mode branch (`trResponsibilityField` using `HBC_SURFACE_FIELD['responsibility-bg']`) already exists and is correctly applied when `isFieldMode` is true. The gap is the non-Field Mode `trResponsibility` style, which uses a hardcoded JS token reference that won't respond to runtime theme switching outside the field mode toggle.

**Implementation:**

1. Locate `trResponsibility` style definition
2. Replace:
   ```ts
   backgroundColor: HBC_SURFACE_LIGHT['responsibility-bg'],
   ```
   With:
   ```ts
   backgroundColor: 'var(--hbc-responsibility-bg)',
   ```
3. Define `--hbc-responsibility-bg` in both `hbcLightTheme` and `hbcFieldTheme` CSS injections

**Acceptance criteria:**
- Responsibility rows render correct background in both light and field themes
- `isFieldMode ? trResponsibilityField : trResponsibility` branch logic remains intact
- No `HBC_SURFACE_LIGHT` direct references remain in `HbcDataTable/index.tsx`

#### Task B-04 — Fix ConnectivityBar Action Button Hardcoded Colors (F-02)

**File:** `packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx`  
*(Note: NOT at `packages/ui-kit/src/HbcConnectivityBar.tsx` — Agent 2 path was wrong)*  
**Finding:** F-02 (LOW)  
**Remediation ID:** R-08 (path corrected)

**Implementation:**

1. Locate `actionButton` style in `useStyles()`
2. Replace:
   ```ts
   color: '#FFFFFF',
   border: 'rgba(255,255,255,0.55)',
   ```
   With one of:
   - `color: HBC_HEADER_TEXT` (if this token maps to white-on-dark)
   - `color: 'var(--hbc-text-on-dark)'`
   - Or the appropriate semantic token from `tokens.ts` for text rendered on the HBC blue header background

3. Verify token is defined in the token system and resolves to the correct white value

**Acceptance criteria:**
- Action button text/icon renders white on HBC blue header
- No hardcoded `#FFFFFF` or `rgba(255,255,255` in `HbcConnectivityBar.tsx`
- Passes Storybook visual regression (if configured)

#### Task B-05 — Resolve Deprecated Tokens in tokens.ts (F-01)

**File:** `packages/ui-kit/src/tokens.ts`  
**Finding:** F-01 (LOW)  
**Remediation ID:** R-07

**Context:** Three deprecated tokens exist in `HbcSemanticTokens` interface: `hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`. Agent 4 confirms they already have `@deprecated` JSDoc annotations. The remediation must go further — either removal or a documented consumer migration timeline.

**Decision point (choose one approach before implementation):**

**Option A — Remove deprecated tokens:**
1. Search all `apps/` and `packages/` for usages of `hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`
2. If zero consumer usages found, delete the fields from `HbcSemanticTokens` interface and their implementations
3. Add a changelog entry noting the breaking change and migration alternative

**Option B — Add migration guide and set removal timeline:**
1. Update TSDoc on each deprecated field to include:
   ```ts
   /**
    * @deprecated since v2.1 — use `var(--hbc-surface-elevated)` CSS variable instead.
    * Scheduled for removal in v3.0.
    */
   ```
2. Create `docs/reference/ui-kit/token-migration-guide.md` documenting the migration path for each deprecated token
3. Add a lint rule or warning to surface usage of deprecated tokens at build time

**Acceptance criteria (either option):**
- No deprecated tokens in `HbcSemanticTokens` without either removal or explicit versioned removal timeline
- If removed: no broken consumers in monorepo
- If kept: TSDoc includes replacement token/CSS variable name and target removal version

---
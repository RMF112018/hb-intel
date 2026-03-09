# PH7-RM-2 — Review Mode Shell and Layout


> **Doc Classification:** Deferred Scope — remediation scope item identified during Phase 7 but not yet assigned to an active execution phase; confirm scheduling status before PH7.12 sign-off.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-1 (Package Foundation complete), @hbc/ui-kit, @hbc/auth, browser Fullscreen API
**Blocks:** PH7-RM-3 (Sidebar), PH7-RM-4 (Card), PH7-RM-5 (Edit Drawer), PH7-RM-6 (Action Items)

---

## Summary

Phase 2 implements the fullscreen shell and header layout for review mode. This includes the `useFullscreen` hook (context-aware for SPFx vs PWA), the `ReviewModeShell` root component (fixed-position overlay with automatic body scroll lock), and the `ReviewModeHeader` component (section tabs, filter bar, reviewed counter, sidebar toggle, exit button). The header establishes the information hierarchy and primary navigation affordances.

## Why It Matters

- **Context-Aware Fullscreen**: Detects deployment mode (SPFx vs PWA) and uses appropriate fullscreen strategy: CSS overlay for SharePoint, native Fullscreen API for web apps.
- **Layout Foundation**: Establishes the two-column layout (sidebar + card) with responsive collapse behavior, critical for both desktop and mobile readability.
- **Header Navigation**: Section tabs, filter bar, and quick-action buttons centralize all major UX flows (section switching, filtering, sidebar toggling, exit).
- **Session Continuity**: Body scroll lock and backdrop prevent accidental interaction with underlying page content.
- **Keyboard Accessibility**: Header accessible via arrow keys (tab switching) and standard form patterns (filter dropdowns).

## Files to Create / Modify

### New Files (Hooks)
1. `packages/review-mode/src/hooks/useFullscreen.ts`
2. `packages/review-mode/src/hooks/index.ts` (barrel)

### New Files (Components)
3. `packages/review-mode/src/components/ReviewModeShell.tsx` (replaces placeholder)
4. `packages/review-mode/src/components/ReviewModeHeader.tsx`
5. `packages/review-mode/src/components/index.ts` (update barrel)

### Modifications
6. `packages/review-mode/src/index.ts` (export hooks if public API)

---

## Implementation

### Step 1: useFullscreen Hook

#### Create `packages/review-mode/src/hooks/useFullscreen.ts`
```typescript
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@hbc/auth';

/**
 * Context-aware fullscreen hook.
 * Detects deployment mode (SPFx vs PWA) and manages fullscreen state appropriately:
 *
 * - **SPFx Context**: No browser Fullscreen API call. CSS overlay handles "fullscreen" appearance.
 *   (SharePoint webparts cannot request document fullscreen due to cross-origin iframe restrictions.)
 *
 * - **PWA Context**: Uses native `document.documentElement.requestFullscreen()` to
 *   enter full-device fullscreen. Syncs state with 'fullscreenchange' event.
 *
 * Rejects gracefully if fullscreen request is denied (browser policy, user decline).
 *
 * @returns Object with:
 *   - `enter()`: Promise<void> – request fullscreen (no-op in SPFx)
 *   - `exit()`: Promise<void> – exit fullscreen (no-op in SPFx)
 *   - `isFullscreen`: boolean – true when in fullscreen (SPFx always true while overlay open)
 *
 * @example
 * function ReviewModeShell() {
 *   const fs = useFullscreen();
 *
 *   useEffect(() => {
 *     fs.enter();
 *     return () => fs.exit();
 *   }, [fs]);
 *
 *   return <div>isFullscreen: {fs.isFullscreen}</div>;
 * }
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const authStore = useAuthStore();
  const isSpFx = authStore.getState().mode === 'spfx';

  /**
   * Sync fullscreen state to 'fullscreenchange' event.
   * Re-run whenever document.fullscreenElement changes.
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /**
   * Request fullscreen on the document element.
   * No-op in SPFx context (CSS overlay suffices).
   * Handles rejection gracefully (user decline, browser policy, etc.).
   */
  const enter = useCallback(async (): Promise<void> => {
    // SPFx: no-op. CSS overlay handles "fullscreen" appearance.
    if (isSpFx) {
      setIsFullscreen(true);
      return;
    }

    // PWA: request native fullscreen.
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      // Gracefully handle rejection (user decline, unsupported browser, etc.).
      // Log at info level; do not throw.
      console.info(
        '[ReviewMode] Fullscreen request denied or unsupported. Proceeding in windowed mode.',
        err
      );
      // Still set isFullscreen = false to allow UI to proceed without native fullscreen.
      setIsFullscreen(false);
    }
  }, [isSpFx]);

  /**
   * Exit fullscreen.
   * No-op in SPFx context.
   * Calls document.exitFullscreen() in PWA context.
   */
  const exit = useCallback(async (): Promise<void> => {
    // SPFx: no-op. Overlay will be hidden by ReviewModeShell unmounting.
    if (isSpFx) {
      setIsFullscreen(false);
      return;
    }

    // PWA: exit native fullscreen.
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.info('[ReviewMode] Error exiting fullscreen.', err);
      setIsFullscreen(false);
    }
  }, [isSpFx]);

  return { enter, exit, isFullscreen };
}
```

#### Create `packages/review-mode/src/hooks/index.ts`
```typescript
/**
 * Barrel export for review-mode hooks.
 * Internal API (not exported from package root).
 */

export { useFullscreen } from './useFullscreen.js';
```

---

### Step 2: ReviewModeShell Component

#### Update `packages/review-mode/src/components/ReviewModeShell.tsx`
```typescript
import React, { useEffect, useRef } from 'react';
import { useReviewMode } from '../context/useReviewMode.js';
import { ReviewModeHeader } from './ReviewModeHeader.js';
import { useFullscreen } from '../hooks/useFullscreen.js';

/**
 * ReviewModeShell component.
 *
 * Root fullscreen overlay for review mode. Renders when isOpen === true.
 * Handles:
 * - Fullscreen entry/exit (context-aware: SPFx CSS overlay vs PWA native API)
 * - Body scroll lock (prevents underlying page scrolling)
 * - Fixed-position 100vw × 100vh backdrop
 * - Two-column layout: ReviewModeHeader + (Sidebar + Card layout from sub-components)
 * - Session summary screen on exit (placeholder for PH7-RM-7)
 *
 * Keyboard navigation (via ReviewModeProvider):
 * - Arrow keys: next/previous record
 * - Escape: close review mode
 *
 * Layout Structure:
 * ```
 * ReviewModeShell (fixed, inset: 0, flex column, z-index: 9999)
 *   ├─ ReviewModeHeader (height: 56px, flex: 0 0 auto)
 *   └─ Main Content Area (flex: 1 1 auto, flex row with sidebar + card)
 *       ├─ Sidebar (collapsible left panel)
 *       └─ Card Panel (right side, flex: 1)
 *           ├─ Card Body (read-only record display)
 *           ├─ Edit Drawer (slide-out right, PH7-RM-5)
 *           └─ Action Item Tray (slide-out right, PH7-RM-6)
 * ```
 *
 * @returns JSX element or null.
 *
 * @example
 * <ReviewModeProvider>
 *   <ReviewModeButton config={config} />
 *   <ReviewModeShell /> {/* Renders overlay when isOpen */}
 * </ReviewModeProvider>
 */
export function ReviewModeShell() {
  const { isOpen, config, sessionStartedAt } = useReviewMode();
  const fs = useFullscreen();
  const shellRef = useRef<HTMLDivElement>(null);

  /**
   * Fullscreen lifecycle: enter on mount, exit on unmount.
   */
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        await fs.enter();
      } catch (err) {
        console.error('[ReviewMode] Error entering fullscreen.', err);
      }
    })();

    return () => {
      (async () => {
        try {
          await fs.exit();
        } catch (err) {
          console.error('[ReviewMode] Error exiting fullscreen.', err);
        }
      })();
    };
  }, [isOpen, fs]);

  /**
   * Body scroll lock: prevent underlying page from scrolling.
   * Restore on unmount.
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !config) {
    return null;
  }

  /**
   * Main shell: fixed-position fullscreen overlay with flex column layout.
   * Header (fixed height 56px) + content area (flex: 1).
   */
  return (
    <div
      ref={shellRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--colorNeutralBackground1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--fontFamilyBase, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
      }}
    >
      {/* Header: 56px fixed height, contains tabs and filter bar */}
      <ReviewModeHeader />

      {/* Main content area: sidebar + card body (flex: 1 to fill remaining space) */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'row',
          minHeight: 0, // Allow flex children to shrink below content size
          borderTop: '1px solid var(--colorNeutralStroke1)',
        }}
      >
        {/* Placeholder for Sidebar (PH7-RM-3) and Card panels (PH7-RM-4) */}
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--colorNeutralForeground3)',
            fontSize: '14px',
          }}
        >
          ReviewModeShell content area placeholder.
          <div style={{ marginTop: '1rem', fontSize: '12px', color: 'var(--colorNeutralForeground4)' }}>
            Sidebar and Card panels implemented in PH7-RM-3 and PH7-RM-4.
          </div>
        </div>
      </div>

      {/* Session summary screen placeholder (PH7-RM-7) */}
      {/* Rendered conditionally when user clicks Exit or session times out */}
    </div>
  );
}
```

---

### Step 3: ReviewModeHeader Component

#### Create `packages/review-mode/src/components/ReviewModeHeader.tsx`
```typescript
import React, { useCallback, useMemo } from 'react';
import {
  Button,
  Select,
  Text,
  Tooltip,
} from '@hbc/ui-kit';
import { useReviewMode } from '../context/useReviewMode.js';
import type { IReviewSection } from '../types/IReviewConfig.js';

/**
 * ReviewModeHeader component.
 *
 * Fixed-height header (56px) containing:
 *
 * 1. **Left Section** (flex: 1):
 *    - Session title (bold)
 *    - Section tab bar: one tab per section in config
 *      - Active tab: highlighted, clickable
 *      - Tab shows: "Section Label (record count)"
 *      - Click: calls setActiveSection(sectionId)
 *
 * 2. **Center Section** (flex: 2):
 *    - In-session filter bar: one Select per filter in active section
 *      - Filter label as placeholder/label
 *      - Current value shown in dropdown
 *      - onChange: calls setFilter(filterId, value)
 *      - "Clear Filters" link when any filter is active
 *    - "New since last review" filter always available if any record has lastReviewedAt
 *      (placeholder for future refinement; initial impl: static filter option)
 *
 * 3. **Right Section** (flex: 1):
 *    - Reviewed counter: "7 / 12 reviewed" (muted text)
 *    - Sidebar toggle button: chevron icon, onClick: toggleSidebar()
 *    - Exit button: "✕" or "Close", onClick: close()
 *
 * Style:
 * - Background: var(--colorNeutralBackground2)
 * - Height: 56px
 * - Padding: 0.5rem 1rem
 * - Bottom border: 1px solid var(--colorNeutralStroke1)
 * - Flex layout: row, items-center, gap: 1rem
 *
 * Accessibility:
 * - All buttons have aria-label
 * - Tab navigation via keyboard (standard form controls)
 * - Section tabs use aria-selected, aria-controls
 * - Filters use aria-label and semantic <select>
 *
 * @returns JSX element (Header bar).
 *
 * @example
 * // Rendered inside ReviewModeShell
 * <ReviewModeHeader />
 */
export function ReviewModeHeader() {
  const {
    config,
    activeSectionId,
    activeRecordId,
    filterValues,
    sidebarCollapsed,
    reviewedRecordIds,
    setActiveSection,
    setFilter,
    toggleSidebar,
    close,
  } = useReviewMode();

  if (!config || !activeSectionId) {
    return null;
  }

  const activeSection = config.sections.find((s) => s.id === activeSectionId);
  if (!activeSection) {
    return null;
  }

  /**
   * Compute filtered data for the active section.
   * Used to calculate reviewed/total counts and filtered record list.
   */
  const filteredData = useMemo(() => {
    return activeSection.data.filter((record) => {
      return (activeSection.filters ?? []).every((filter) => {
        const selectedValue = filterValues[filter.id];
        if (!selectedValue) return true;
        return filter.filterFn(record, selectedValue);
      });
    });
  }, [activeSection, filterValues]);

  const totalRecords = filteredData.length;
  const reviewedCount = filteredData.filter((r) =>
    reviewedRecordIds.has(r.id)
  ).length;

  const handleClearAllFilters = useCallback(() => {
    (activeSection.filters ?? []).forEach((filter) => {
      setFilter(filter.id, '');
    });
  }, [activeSection, setFilter]);

  const hasActiveFilters = Object.keys(filterValues).length > 0;

  return (
    <div
      style={{
        height: '56px',
        background: 'var(--colorNeutralBackground2)',
        borderBottom: '1px solid var(--colorNeutralStroke1)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      {/* ============= LEFT SECTION: Title + Tabs ============= */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Session Title */}
        <Text
          as="h1"
          style={{
            fontWeight: 600,
            fontSize: '14px',
            margin: 0,
            color: 'var(--colorNeutralForeground1)',
          }}
        >
          {config.sessionTitle}
        </Text>

        {/* Section Tabs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.25rem',
          }}
          role="tablist"
          aria-label="Review sections"
        >
          {config.sections.map((section) => {
            const sectionRecordCount = section.data.length;
            const isActive = section.id === activeSectionId;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`section-${section.id}`}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  border: 'none',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                  background: isActive
                    ? 'var(--colorNeutralBackground1)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--colorNeutralForeground1)'
                    : 'var(--colorNeutralForeground3)',
                  borderBottom: isActive
                    ? '2px solid var(--colorBrandForeground1)'
                    : 'none',
                  transition: 'all 150ms ease-in-out',
                }}
              >
                {section.label} ({sectionRecordCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* ============= CENTER SECTION: Filter Bar ============= */}
      {(activeSection.filters ?? []).length > 0 && (
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'row',
            gap: '0.75rem',
            alignItems: 'center',
            minWidth: 0, // Allow flex children to shrink
          }}
        >
          {(activeSection.filters ?? []).map((filter) => {
            const selectedValue = filterValues[filter.id] ?? '';

            return (
              <div
                key={filter.id}
                style={{
                  flex: '0 1 150px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <label
                  htmlFor={`filter-${filter.id}`}
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--colorNeutralForeground3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {filter.label}
                </label>
                <Select
                  id={`filter-${filter.id}`}
                  value={selectedValue}
                  onChange={(e) => setFilter(filter.id, e.target.value)}
                  aria-label={`Filter by ${filter.label}`}
                  style={{
                    fontSize: '13px',
                    padding: '0.25rem 0.5rem',
                  }}
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}

          {/* Clear Filters Link */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                color: 'var(--colorBrandForeground1)',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline',
                fontWeight: 500,
              }}
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ============= RIGHT SECTION: Counter + Toggle + Exit ============= */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* Reviewed Counter */}
        <Text
          style={{
            fontSize: '13px',
            color: 'var(--colorNeutralForeground3)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {reviewedCount} / {totalRecords} reviewed
        </Text>

        {/* Sidebar Toggle Button */}
        <Tooltip content={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}>
          <Button
            onClick={toggleSidebar}
            appearance="subtle"
            size="small"
            aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            style={{
              padding: '0.25rem',
              minWidth: '32px',
              minHeight: '32px',
            }}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </Button>
        </Tooltip>

        {/* Exit Button */}
        <Tooltip content="Close review mode (Esc)">
          <Button
            onClick={close}
            appearance="subtle"
            size="small"
            aria-label="Close review mode"
            style={{
              padding: '0.25rem',
              minWidth: '32px',
              minHeight: '32px',
              color: 'var(--colorNeutralForeground3)',
            }}
          >
            ✕
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
```

---

### Step 4: Update Component Barrel

#### Update `packages/review-mode/src/components/index.ts`
```typescript
/**
 * Barrel export for all review-mode components.
 * Public API for consuming modules.
 */

export { ReviewModeButton } from './ReviewModeButton.js';
export { ReviewModeShell } from './ReviewModeShell.js';
export { ReviewModeHeader } from './ReviewModeHeader.js';
```

---

### Step 5: Update Root Barrel (Optional Public API)

#### Update `packages/review-mode/src/index.ts` (if hooks are public)

The `useFullscreen` hook is currently internal (PH7-RM-2 only). If future phases need external access, add to barrel:

```typescript
// OPTIONAL: Add to index.ts if useFullscreen becomes public API
// export { useFullscreen } from './hooks/useFullscreen.js';
```

For now, keep it internal to preserve API surface and encourage use of `ReviewModeShell` as the integration point.

---

## Verification

### Step 1: TypeScript Check
```bash
pnpm turbo run typecheck --filter=@hbc/review-mode
```

Expected output: No errors. All type definitions and implementations validated.

### Step 2: Build the Package
```bash
pnpm turbo run build --filter=@hbc/review-mode
```

Expected output:
```
✓ Built @hbc/review-mode
  dist/index.js (with .d.ts types)
  dist/components/ReviewModeShell.js
  dist/components/ReviewModeHeader.js
  dist/hooks/useFullscreen.js
  ... (other files)
```

### Step 3: Verify Hook Implementation

Create a test file (temporary) to validate hook logic:

```typescript
// test-useFullscreen.ts (run via vitest or ts-node)
import { useFullscreen } from './src/hooks/useFullscreen.js';
import { useAuthStore } from '@hbc/auth';

// Mock tests:
// 1. SPFx context: no-op fullscreen calls
// 2. PWA context: requestFullscreen() called
// 3. Rejection handling: gracefully handles CORS or user deny

// Example test:
it('should detect SPFx context and skip requestFullscreen', async () => {
  useAuthStore.setState({ mode: 'spfx' });
  const fs = useFullscreen();
  await fs.enter();
  // Assert: isFullscreen = true, but requestFullscreen not called
});
```

### Step 4: Component Rendering Test

Verify header renders correctly in isolation:

```bash
# In dev-harness or test environment
pnpm turbo run test --filter=@hbc/review-mode
```

Expected:
- ReviewModeHeader renders with tabs, filter bar, counter, sidebar toggle, exit button
- Tab click calls setActiveSection
- Filter dropdown onChange calls setFilter
- "Clear Filters" appears only when filters active
- Keyboard navigation (Tab key) works through filter selects

### Step 5: Layout Structure Validation

Inspect DOM:

```javascript
// In browser dev tools (SPFx or PWA context)
const shell = document.querySelector('[data-review-shell]');
console.assert(
  shell.style.position === 'fixed' && shell.style.zIndex === '9999',
  'Shell must be fixed fullscreen overlay'
);
console.assert(
  shell.style.display === 'flex' && shell.style.flexDirection === 'column',
  'Shell must use flex column layout'
);
console.assert(
  document.body.style.overflow === 'hidden',
  'Body scroll must be locked'
);
```

---

## Definition of Done

- [ ] `useFullscreen.ts` hook created with full implementation:
  - [ ] Detects SPFx context via `useAuthStore().mode`
  - [ ] No-ops fullscreen calls in SPFx
  - [ ] Calls `document.documentElement.requestFullscreen()` in PWA
  - [ ] Listens to 'fullscreenchange' event and syncs state
  - [ ] Handles rejection gracefully (user decline, unsupported)
  - [ ] Returns `{ enter, exit, isFullscreen }`
- [ ] `hooks/index.ts` barrel created
- [ ] `ReviewModeShell.tsx` fully implemented:
  - [ ] Renders fixed-position overlay (inset: 0, z-index: 9999)
  - [ ] Returns null when isOpen === false
  - [ ] Calls `useFullscreen().enter()` on mount
  - [ ] Calls `useFullscreen().exit()` on unmount
  - [ ] Locks body scroll on mount, restores on unmount
  - [ ] Renders `ReviewModeHeader` at fixed 56px height
  - [ ] Renders main content area (flex: 1) with placeholder for sidebar + card
  - [ ] Uses CSS variables: `--colorNeutralBackground1`, `--colorNeutralStroke1`, etc.
- [ ] `ReviewModeHeader.tsx` fully implemented:
  - [ ] Left section: session title + section tabs
    - [ ] Tab label includes record count: "Section (12)"
    - [ ] Active tab highlighted with bottom border (color-BrandForeground1)
    - [ ] Click tab calls `setActiveSection(sectionId)`
    - [ ] Tabs use aria-selected, aria-controls for a11y
  - [ ] Center section: filter bar
    - [ ] One Select per filter in activeSection.filters
    - [ ] Select shows current filterValues[filterId]
    - [ ] onChange calls setFilter(filterId, value)
    - [ ] "Clear Filters" link appears when hasActiveFilters
    - [ ] Filters flex-wrap on narrow screens
  - [ ] Right section: counter + toggles + exit
    - [ ] "7 / 12 reviewed" counter (reviewed / total)
    - [ ] Sidebar toggle button (◀/▶ chevron)
    - [ ] Exit button (✕), calls close()
    - [ ] Tooltip on hover: "Hide sidebar", "Close review mode (Esc)"
  - [ ] All buttons have aria-label
  - [ ] 56px height, flex row layout, 1rem padding
  - [ ] Background: `--colorNeutralBackground2`, border-bottom: `--colorNeutralStroke1`
- [ ] `components/index.ts` updated with ReviewModeHeader export
- [ ] All components use HB Intel design system tokens (color, typography, spacing)
- [ ] `pnpm turbo run typecheck` passes without errors
- [ ] `pnpm turbo run build` produces valid dist/ output
- [ ] No console errors or warnings when rendering in SPFx and PWA contexts
- [ ] Body scroll lock verified in browser DevTools
- [ ] Keyboard navigation works (Tab through filter selects, Arrow keys for next/prev record)
- [ ] Section tabs respond to click and update active section
- [ ] Filter dropdown changes filtered data and resets activeRecordId
- [ ] Header counter updates when records marked reviewed
- [ ] Sidebar toggle icon inverts (▶ ↔ ◀)
- [ ] Exit button calls close() and triggers session summary (placeholder for PH7-RM-7)

---

## Next Steps (Dependent Phases)

1. **PH7-RM-3**: Sidebar component (left collapsible panel with searchable pills)
2. **PH7-RM-4**: Card body component (read-only record display)
3. **PH7-RM-5**: Edit drawer (right slide-out form for editing)
4. **PH7-RM-6**: Action item tray (right slide-out form for creating action items)
5. **PH7-RM-7**: Session summary screen (on exit; displays reviewed count, action items created, elapsed time)
6. **PH7-RM-8**: Integration tests (component interaction, state flow)
7. **PH7-RM-9**: Consumer implementation guides (Accounting, Estimating, etc.)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-2 complete: 2026-03-08
Blocked by: Awaiting Phase 2 completion before PH7-RM-3 (Sidebar) can proceed
Next: PH7-RM-3 – Sidebar and Pills (sidebar search, searchable pill list, record selection)
Documentation: docs/architecture/plans/PH7-RM-3-Sidebar-and-Pills.md (pending)
-->

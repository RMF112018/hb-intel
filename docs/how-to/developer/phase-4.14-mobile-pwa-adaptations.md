# Phase 4.14 — Mobile & PWA Adaptations (Developer Guide)

**Phase:** 4.14 | **Sub-phase:** 4.14.4 Field Mode Implementation
**References:** PH4.14-UI-Design-Plan.md, Blueprint §1d

## Field Mode (Dark Theme)

### How It Works

Field Mode provides a high-contrast dark theme optimized for outdoor/jobsite use. The system consists of:

| Layer | File | Role |
|-------|------|------|
| Hook | `src/HbcAppShell/hooks/useFieldMode.ts` | Manages state, localStorage, OS preference, `data-theme` attr, `<meta theme-color>` |
| Themes | `src/theme/theme.ts` | `hbcLightTheme` and `hbcFieldTheme` — Fluent v9 themes with HBC semantic tokens |
| Tokens | `src/theme/tokens.ts` | `HBC_SURFACE_LIGHT` and `HBC_SURFACE_FIELD` surface/text/border maps |
| Shell | `src/HbcAppShell/HbcAppShell.tsx` | Wraps children in `FluentProvider` with dynamic theme |
| Menu | `src/HbcAppShell/HbcUserMenu.tsx` | Theme-aware dropdown via `isFieldMode` prop |

### Adding Theme-Aware Components

When building new components inside `HbcAppShell`:

1. **Fluent v9 components** automatically receive theme tokens from the `FluentProvider` — no extra work needed.

2. **Custom components** that use Griffel static styles can reference `HBC_SURFACE_LIGHT` / `HBC_SURFACE_FIELD` tokens and switch via the `isFieldMode` prop or `data-theme` CSS attribute selector:

```css
[data-theme="field"] .my-component {
  background: var(--hbc-surface-1, #1A2332);
}
```

3. **Inline style conditionals** work for one-off overrides:

```tsx
style={{
  backgroundColor: isFieldMode ? HBC_SURFACE_FIELD['surface-1'] : '#FFFFFF',
}}
```

### Meta Theme-Color

The `useFieldMode` hook automatically manages `<meta name="theme-color">`:
- Light mode: `#FFFFFF`
- Field mode: `#0F1419`

This ensures the mobile browser chrome matches the app surface on iOS Safari and Android Chrome.

### Storybook

- The Storybook toolbar has a theme switcher (paintbrush icon) for Light / Field Mode
- Dedicated stories at `Shell/FieldMode` demonstrate both themes with the full app shell
- The `preview.tsx` decorator wraps all stories in `FluentProvider` with the selected theme

### Testing

```bash
pnpm turbo run build --filter=@hbc/ui-kit   # Zero TS errors
pnpm turbo run lint --filter=@hbc/ui-kit     # Zero new warnings
```

Verify in Storybook:
1. Field Mode story renders dark surfaces with correct text colors
2. Light Mode story renders without regression
3. User menu dropdown adapts background/text on theme switch
4. `<meta name="theme-color">` updates in DOM on toggle

---

## Responsive Behavior & Bottom Navigation (Phase 4.14.5)

### Breakpoint Reference

| Breakpoint | Hook | Threshold | Usage |
|------------|------|-----------|-------|
| Mobile | `useIsMobile()` | `max-width: 767px` | Full-screen modals, full-screen command palette, single-column layouts |
| Tablet | `useIsTablet()` | `max-width: 1023px` | Bottom nav activation, sidebar hidden, content full-width |
| Desktop | (default) | `>=1024px` | Icon-rail sidebar visible, standard 3-region layout |

### HbcBottomNav Component

`HbcBottomNav` is a fixed bottom navigation bar that renders on viewports below 1024px. It derives its items from the sidebar configuration passed to `HbcAppShell`.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `items` | `SidebarItem[]` | Full sidebar items array. First 4 become primary slots; rest go to "More" sheet |
| `activeId` | `string` | Currently active navigation item ID |
| `onNavigate` | `(id: string) => void` | Callback when a nav item is tapped |

**Key details:**
- Height: 56px with `#1E1E1E` background
- Active state: `#F37021` icon fill and label
- Includes `padding-bottom: env(safe-area-inset-bottom)` for iOS standalone PWA
- Z-index: 300 (from `Z_INDEX.bottomNav`)
- Hidden when Focus Mode is active (`data-focus-mode="true"`)

**Integration in HbcAppShell:**

The `HbcAppShell` component integrates the bottom nav automatically. When `useIsTablet()` returns `true`, the sidebar is hidden and `HbcBottomNav` renders at the bottom. Items are derived from `sidebarGroups` — no separate bottom nav configuration is needed.

```tsx
// HbcAppShell handles this internally — no consumer changes required.
// The sidebarGroups prop drives both sidebar (desktop) and bottom nav (tablet/mobile).
<HbcAppShell sidebarGroups={groups} onNavigate={handleNav}>
  {children}
</HbcAppShell>
```

### useIsTablet Hook

Detects tablet-and-below viewports using `window.matchMedia('(max-width: 1023px)')`.

```tsx
import { useIsTablet } from '@hbc/ui-kit';

function MyComponent() {
  const isTablet = useIsTablet();
  // isTablet === true when viewport <= 1023px
}
```

This hook is separate from `useIsMobile` (<=767px) because different components adapt at different breakpoints. The bottom nav activates at the tablet threshold, while modals and command palette go full-screen at the mobile threshold.

### HbcModal — Full-Screen Mobile Adaptation

On mobile viewports (<768px), `HbcModal` renders as a full-screen overlay with a slide-up animation instead of the centered dialog.

**Changes from desktop behavior:**
- Width/height: 100vw x 100vh (full viewport)
- Animation: `slideInFromBottom` keyframe (shared with bottom nav and command palette)
- Close button: 44px touch target in the top-right corner (replaces the smaller desktop close icon)
- No backdrop blur (full-screen covers entire viewport)

No prop changes are needed — the modal detects mobile via `useIsMobile()` internally.

### HbcCommandPalette — Full-Screen Mobile Adaptation

On mobile viewports (<768px), `HbcCommandPalette` renders as a full-screen overlay sliding up from the bottom.

**Changes from desktop behavior:**
- Width/height: 100vw x 100vh (full viewport)
- Animation: `slideInFromBottom` keyframe
- Close: Visible X button replaces the desktop "ESC to close" hint (ESC is unavailable on mobile)
- Input: Auto-focused with larger touch target

No prop changes are needed — the palette detects mobile via `useIsMobile()` internally.

### slideInFromBottom Animation

A shared keyframe used by `HbcBottomNav`, `HbcModal` (mobile), and `HbcCommandPalette` (mobile):

```ts
// Defined in src/theme/animations.ts
const slideInFromBottom = {
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
};
// Duration: 250ms, easing: cubic-bezier(0.4, 0, 0.2, 1)
```

Respects `prefers-reduced-motion: reduce` — animation is disabled when the user prefers reduced motion.

### Testing

```bash
pnpm turbo run build --filter=@hbc/ui-kit   # Zero TS errors
pnpm turbo run lint --filter=@hbc/ui-kit     # Zero new warnings
```

Verify in Storybook:
1. Bottom nav appears when viewport is resized below 1024px
2. Sidebar hides and bottom nav shows simultaneously
3. "More" button opens a sheet with overflow navigation items
4. Modal renders full-screen on mobile viewport
5. Command palette renders full-screen on mobile viewport
6. Focus Mode hides the bottom nav
7. iOS safe area padding is visible in device simulation

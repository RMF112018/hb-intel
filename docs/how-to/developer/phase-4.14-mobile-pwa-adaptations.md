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
